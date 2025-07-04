import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { ErrorWithStatus } from '../types/error.types';
import Application from '../models/application.model';
import { getSignedDownloadUrl, uploadToS3, deleteFromS3 } from '../services/s3.service';
import Job from '../models/job.model';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import mongoose from 'mongoose';
import Conversation from '../models/conversation.model';
import { rankApplications } from '../services/LLM.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024, 
  }
}).fields([
  { name: 'portfolio', maxCount: 1 },
  { name: 'deliverable', maxCount: 1 }
]);

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
    const handleMulterUpload = () => {
        return new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    };

    await handleMulterUpload();

    const { jobId, coverLetter } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const portfolioFile = files?.portfolio?.[0];

    if (!jobId) {
        const error: ErrorWithStatus = new Error('Job ID is required');
        error.status = 400;
        throw error;
    }

    const freelancerId = req.user?.id;

    let portfolioKey = null;
    if (portfolioFile) {
        portfolioKey = `applications/${freelancerId}/${uuidv4()}__${portfolioFile.originalname}`;
        await uploadToS3(portfolioFile.buffer, portfolioKey, portfolioFile.mimetype);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const application = await Application.create([{ 
            jobId, 
            freelancerId, 
            coverLetter,
            portfolio: portfolioKey,
        }], { session });

        await Job.findByIdAndUpdate(
            jobId,
            { $push: { applications: application[0]._id } },
            { session }
        );

        await session.commitTransaction();
        
        res.status(201).json(application);
    } catch (error) {
        await session.abortTransaction();
        if (portfolioKey) {
            await deleteFromS3(portfolioKey);
        }
        throw error;
    } finally {
        session.endSession();
    }
});

export const getApplicationsByFreelancerId = asyncHandler(async (req: Request, res: Response) => {
    const freelancerId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 6; // Keep consistent with other endpoints
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
        Application.find({ freelancerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('jobId'),
        Application.countDocuments({ freelancerId })
    ]);

    if (!applications.length) {
        res.status(200).json({
            jobs: [],
            total: 0,
            currentPage: page,
            totalPages: 0
        });
        return;
    }

    const jobs = await Job.find({ _id: { $in: applications.map((application) => application.jobId) } })
        .populate('clientId', 'name avatar');

    const jobsWithSignedUrls = await Promise.all(jobs.map(async (job) => {
        let avatarUrl = null;
        if (job.clientId && (job.clientId as any).avatar) {
            avatarUrl = await getSignedDownloadUrl((job.clientId as any).avatar);
        }

        let applicationStatus = null;
        if (freelancerId) {
            const application = await Application.findOne({ jobId: job._id, freelancerId });
            applicationStatus = application?.status;
        }

        return {
            id: job._id,
            title: job.title,
            description: job.description,
            budget: job.budget,
            deliveryTime: job.deliveryTime,
            status: applicationStatus,
            poster: {
                id: (job.clientId as any)._id,
                name: (job.clientId as any).name,
                avatarUrl
            }
        };
    }));

    res.status(200).json({
        jobs: jobsWithSignedUrls,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
    });
});

export const getApplicationsByJobId = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error: ErrorWithStatus = new Error('Invalid job ID format');
        error.status = 400;
        throw error;
    }

    const job = await Job.findById(new mongoose.Types.ObjectId(id));
    if (!job) {
        const error: ErrorWithStatus = new Error('Job not found');
        error.status = 404;
        throw error;
    }

    const [applications, total] = await Promise.all([
        Application.find({ jobId: new mongoose.Types.ObjectId(id) })
            .populate('freelancerId', 'name avatar')
            .skip(skip)
            .limit(limit)
            .lean(),
        Application.countDocuments({ jobId: new mongoose.Types.ObjectId(id) })
    ]);

    if (!applications || applications.length === 0) {
        res.status(200).json({
            applications: [],
            total: 0,
            currentPage: page,
            totalPages: 0
        });
        return;
    }

    const applicationsWithUrls = await Promise.all(applications.map(async (application) => {
        let avatarUrl = null;
        if ((application.freelancerId as any).avatar) {
            avatarUrl = await getSignedDownloadUrl((application.freelancerId as any).avatar);
        }

        let portfolioUrl = null;
        if (application.portfolio) {
            portfolioUrl = await getSignedDownloadUrl(application.portfolio);
        }

        return {
            id: application._id,
            portfolio: portfolioUrl,
            coverLetter: application.coverLetter,
            poster: {
                id: (application.freelancerId as any)._id,
                name: (application.freelancerId as any).name,
                avatarUrl
            }
        };
    }));

    if (applications.length === 1) {
        res.status(200).json({
            applications: applicationsWithUrls,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
        return;
    }

    try {
        const rankingInput = applications.map(app => ({
            id: app._id.toString(),
            coverLetter: app.coverLetter
        }));

        const rankingResult = await rankApplications(job.description, rankingInput);
        
        const rankedApplications = applicationsWithUrls.map(app => {
            const rank = rankingResult.ranking.find(r => r.id === app.id.toString())?.rank || Infinity;
            return {
                ...app,
                rank
            };
        }).sort((a, b) => a.rank - b.rank);

        res.status(200).json({
            applications: rankedApplications,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error ranking applications:', error);
        const rankingError: ErrorWithStatus = new Error('Failed to rank applications');
        rankingError.status = 500;
        throw rankingError;
    }
});

export const acceptApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const application = await Application.findById(id).session(session);

        if (!application) {
            const error: ErrorWithStatus = new Error('Application not found');
            error.status = 404;
            throw error;
        }

        application.status = 'In-Progress';
        await application.save({ session });

        await Application.updateMany(
            { 
                jobId: application.jobId,
                _id: { $ne: id }
            },
            { status: 'Not Selected' },
            { session }
        );

        const job = await Job.findByIdAndUpdate(
            application.jobId,
            { 
                status: 'In-Progress',
                freelancerId: application.freelancerId 
            },
            { 
                session,
                new: true
            }
        );

        if (!job) {
            const error: ErrorWithStatus = new Error('Job not found');
            error.status = 404;
            throw error;
        }

        await Conversation.create([{
            jobId: new mongoose.Types.ObjectId(application.jobId.toString()),
            clientId: new mongoose.Types.ObjectId(job.clientId.toString()),
            freelancerId: new mongoose.Types.ObjectId(application.freelancerId.toString())
        }], { session });

        await session.commitTransaction();
        res.status(200).json({
            message: 'Application and job status updated successfully'
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
});

export const getLastApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error: ErrorWithStatus = new Error('Invalid user ID format');
        error.status = 400;
        throw error;
    }

    const lastApplication = await Application.findOne({ 
        freelancerId: id 
    })
    .select('coverLetter portfolio')
    .sort({ createdAt: -1 });

    if (!lastApplication) {
        res.status(200).json({
            message: "You haven't submitted any applications yet."
        });
        return;
    }

    let portfolioUrl = null;
    if (lastApplication.portfolio) {
        portfolioUrl = await getSignedDownloadUrl(lastApplication.portfolio);
    }

    res.status(200).json({
        coverLetter: lastApplication.coverLetter,
        portfolio: portfolioUrl
    });
});

export const submitDeliverable = asyncHandler(async (req: Request, res: Response) => {
    const handleMulterUpload = () => {
        return new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    };

    await handleMulterUpload();

    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const deliverableFile = files?.deliverable?.[0];

    if (!deliverableFile) {
        const error: ErrorWithStatus = new Error('Deliverable file is required');
        error.status = 400;
        throw error;
    }

    const freelancerId = req.user?.id;

    let deliverableKey = null;
    if (deliverableFile) {
        deliverableKey = `deliverables/${freelancerId}/${uuidv4()}__${deliverableFile.originalname}`;
        await uploadToS3(deliverableFile.buffer, deliverableKey, deliverableFile.mimetype);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const job = await Job.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            { 
                status: 'Pending Approval',
            },
            {  
                session,
                new: true
            }
        );

        if (!job) {
            const error: ErrorWithStatus = new Error('Job not found');
            error.status = 404;
            throw error;
        }

        const application = await Application.findOne({ jobId: job._id, freelancerId }).session(session);

        if(!application) {
            const error: ErrorWithStatus = new Error('Application not found');
            error.status = 404;
            throw error;
        }

        application.deliveredWork = deliverableKey!;
        application.status = 'Pending Approval';
        await application.save({ session });

        await session.commitTransaction();
        res.status(200).json({ message: 'Deliverable submitted successfully' });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
});

export const requestCorrection = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { message } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const job = await Job.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            { status: 'Correction' },
            { session, new: true }
        );

        if (!job) {
            const error: ErrorWithStatus = new Error('Job not found');
            error.status = 404;
            throw error;
        }

        const application = await Application.findOne({ jobId: job._id, status: { $in: ['Pending Approval', 'Correction'] } }).session(session);

        if (!application) {
            const error: ErrorWithStatus = new Error('Application not found');
            error.status = 404;
            throw error;
        }

        application.correctionMessage = message;
        application.status = 'Correction';
        await application.save({ session });

        await session.commitTransaction();
        res.status(200).json({ message: 'Correction requested successfully' });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
});

export const acceptDeliverable = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; 

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const application = await Application.findById(
            new mongoose.Types.ObjectId(id)
        ).session(session);

        if (!application) {
            const error: ErrorWithStatus = new Error('Application not found');
            error.status = 404;
            throw error;
        }

        const job = await Job.findByIdAndUpdate(
            application.jobId,
            { status: 'Completed' },
            { session, new: true }
        );

        if (!job) {
            const error: ErrorWithStatus = new Error('Job not found');
            error.status = 404;
            throw error;
        }

        application.status = 'Completed';
        await application.save({ session });

        const conversation = await Conversation.findOne({ jobId: job._id }).session(session);

        if (!conversation) {
            const error: ErrorWithStatus = new Error('Conversation not found');
            error.status = 404;
            throw error;
        }

        conversation.status = 'closed';
        await conversation.save({ session });

        await session.commitTransaction();
        res.status(200).json({ message: 'Deliverable accepted successfully' });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
});