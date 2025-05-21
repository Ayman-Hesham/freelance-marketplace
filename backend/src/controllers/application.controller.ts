import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { ErrorWithStatus } from '../types/error.types';
import Application from '../models/application.model';
import { getSignedDownloadUrl, uploadToS3, deleteFromS3 } from '../services/s3.service';
import Job from '../models/job.model';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { IApplication, IJob } from '../types/model.types';
import mongoose from 'mongoose';

// Add multer configuration at the top of the file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB limit
  }
}).fields([
  { name: 'portfolio', maxCount: 1 }
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

    const job = await Job.findById(jobId)
        .populate('applications');
    
    if (!job) {
        const error: ErrorWithStatus = new Error('Job not found');
        error.status = 404;
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

    const applications = await Application.find({ freelancerId })
    .sort({ createdAt: -1 })
    .populate('jobId')

    if (!applications) {
        const error: ErrorWithStatus = new Error('No applications found');
        error.status = 404;
        throw error;
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
        total: jobs.length,
    });
});

export const getApplicationsByJobId = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;

    const applications = await Application.find({ jobId })
        .sort({ createdAt: 1 })
        .populate('freelancerId', 'name avatar')
        .lean()

    if (!applications || applications.length === 0) {
        const error: ErrorWithStatus = new Error('No applications found');
        error.status = 404;
        throw error;
    }

    const applicationsWithUrls = await Promise.all(applications.map(async (application) => {
        let avatarUrl = null;
        if ((application.freelancerId as any).avatar) {
            avatarUrl = await getSignedDownloadUrl((application.freelancerId as any).avatar);
        }

        let portfolioUrl = null;
        portfolioUrl = await getSignedDownloadUrl(application.portfolio);

        return {
            id: application._id,
            portfolio: portfolioUrl,
            coverLetter: application.coverLetter,
            freelancer: {
                id: (application.freelancerId as any)._id,
                name: (application.freelancerId as any).name,
                avatarUrl
            }
        };
    }));

    res.status(200).json(applicationsWithUrls);
});

