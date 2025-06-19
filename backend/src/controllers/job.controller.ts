import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { ErrorWithStatus } from '../types/error.types';
import Job from '../models/job.model';
import { getSignedDownloadUrl } from '../services/s3.service';
import Application from '../models/application.model';
import { IApplication } from '../types/model.types';
import mongoose from 'mongoose';

export const createJob = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, budget, deliveryTime } = req.body;

    const clientId = req.user?.id;

    const job = await Job.create({ title, description, budget, deliveryTime, clientId });

    if (!job) {
        const error: ErrorWithStatus = new Error('Failed to create job');
        error.status = 500;
        throw error;
    }

    res.status(201).json(job);
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const isApplication = req.query.isApplication === 'true';

    const job = await Job.findById(id).populate('clientId', 'name avatar')
    .populate('applications', 'freelancerId status deliveredWork correctionMessage');

    if (!job) {
        const error: ErrorWithStatus = new Error('Job not found');
        error.status = 404;
        throw error;
    }

    let avatarUrl = null;
    if (job.clientId && (job.clientId as any).avatar !== null) {
        avatarUrl = await getSignedDownloadUrl((job.clientId as any).avatar);
    }

    let hasApplied = null;
    let application = (job.applications as IApplication[]).find(app => app.freelancerId.toString() === req.user?.id);
    if (isApplication){
        if (application) {
            hasApplied = true;
        }
    } else {
        const FINAL_STATUSES = ['Pending Approval', 'Correction', 'Completed'] as const;
        application = (job.applications as IApplication[]).find(app => FINAL_STATUSES.includes(app.status as any));
    }

    const applicationStatus = application?.status;
    
    let deliverable = null;
    if ((job.status === 'Pending Approval' || job.status === 'Completed') && application?.deliveredWork) {
        deliverable = await getSignedDownloadUrl(application?.deliveredWork!);
    }

    const id_ = isApplication ? application?._id : job._id;

    res.status(200).json({
        id: id_,
        title: job.title,
        description: job.description,
        budget: job.budget,
        deliveryTime: job.deliveryTime,
        freelancerId: job.freelancerId,
        status: applicationStatus ? applicationStatus : job.status,
        hasApplications: job.applications.length > 0,
        hasApplied: hasApplied,
        deliverable: deliverable,
        correctionMessage: application?.correctionMessage,
        blockMessage: job.blockMessage,
        poster: {
            id: (job.clientId as any).id,
            name: (job.clientId as any).name,
            avatarUrl
        }
    });
});

export const getJobsByClientId = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id || req.user?.id;

    if (!id) {
        const error: ErrorWithStatus = new Error('Job ID not provided');
        error.status = 400;
        throw error;
    }

    const jobs = await Job.find({clientId: id})
        .populate('applications', 'freelancerId')
        .sort({ createdAt: -1 });

    if (!jobs.length) {
        res.status(200).json({
            jobs: [],
            total: 0
        });
        return;
    }

    res.status(200).json({
        jobs: jobs.map((job) => ({
            id: job._id,
            title: job.title,
            description: job.description,
            budget: job.budget,
            deliveryTime: job.deliveryTime,
            status: job.status,
            hasApplications: job.applications.length > 0,
            poster: {
                id: (job.clientId as any)._id,
            }
        })),
        total: jobs.length,
    });
});

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
    const jobs = await Job.find({ status: 'Open' })
        .sort({ createdAt: -1 })
        .populate('clientId', 'name avatar');

    if (!jobs.length) {
        res.status(200).json({
            jobs: [],
            total: 0
        });
        return;
    }

    const jobsWithSignedUrls = await Promise.all(jobs.map(async (job) => {
        let avatarUrl = null;
        if (job.clientId && (job.clientId as any).avatar) {
            avatarUrl = await getSignedDownloadUrl((job.clientId as any).avatar);
        }

        return {
            id: job._id,
            title: job.title,
            description: job.description,
            budget: job.budget,
            deliveryTime: job.deliveryTime,
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

export const filterJobs = asyncHandler(async (req: Request, res: Response) => {
    const { budget, deliveryTime } = req.query;

    const query: any = { status: 'Open' };
    
    if (!budget && !deliveryTime) {
        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .populate('clientId', 'name avatar');

        if (!jobs.length) {
            res.status(200).json({
                jobs: [],
                total: 0
            });
            return;
        }

        const jobsWithSignedUrls = await Promise.all(jobs.map(async (job) => {
            let avatarUrl = null;
            if (job.clientId && (job.clientId as any).avatar) {
                avatarUrl = await getSignedDownloadUrl((job.clientId as any).avatar);
            }

            return {
                id: job._id,
                title: job.title,
                description: job.description,
                budget: job.budget,
                deliveryTime: job.deliveryTime,
                status: job.status,
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
        return;
    }
    
    if (budget && Number(budget) > 0) {
        query.budget = { $lte: Number(budget) };
    }
    
    if (deliveryTime && Number(deliveryTime) > 0) {
        query.deliveryTime = { $lte: Number(deliveryTime) };
    }

    const jobs = await Job.find(query)
        .sort({ createdAt: -1 })
        .populate('clientId', 'name avatar');

    if (!jobs.length) {
        res.status(200).json({
            jobs: [],
            total: 0
        });
        return;
    }

    const jobsWithSignedUrls = await Promise.all(jobs.map(async (job) => {
        let avatarUrl = null;
        if (job.clientId && (job.clientId as any).avatar) {
            avatarUrl = await getSignedDownloadUrl((job.clientId as any).avatar);
        }

        return {
            id: job._id,
            title: job.title,
            description: job.description,
            budget: job.budget,
            deliveryTime: job.deliveryTime,
            status: job.status,
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

export const searchJobs = asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.query;

    const jobs = await Job.find(
        { 
            $text: { $search: query as string },
            status: 'Open' 
        },
        { score: { $meta: "textScore" } }
    ).sort({ 
        score: { $meta: "textScore" },
        createdAt: -1
    }).populate('clientId', 'name avatar');
    
    if (!jobs.length) {
        res.status(200).json({
            jobs: [],
            total: 0
        });
        return;
    }

    const jobsWithSignedUrls = await Promise.all(jobs.map(async (job) => {
        let avatarUrl = null;
        if (job.clientId && (job.clientId as any).avatar) {
            avatarUrl = await getSignedDownloadUrl((job.clientId as any).avatar);
        }

        return {
            id: job._id,
            title: job.title,
            description: job.description,
            budget: job.budget,
            deliveryTime: job.deliveryTime,
            status: job.status,
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

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;

    const job = await Job.findByIdAndDelete(id);
    
    if (!job) {
        const error: ErrorWithStatus = new Error('Job not found');
        error.status = 404;
        throw error;
    }

    res.status(200).json({ message: 'Job deleted successfully' });
})

export const blockJob = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { message } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const job = await Job.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            { status: 'Blocked by Admin', blockMessage: message },
            { session, new: true }
        );

        if (!job) {
            const error: ErrorWithStatus = new Error('Job not found');
            error.status = 404;
            throw error;
        }

        const applications = await Application.find({ jobId: job._id }).session(session);   

        for (const application of applications) {
            application.status = 'Not Selected';
            await application.save({ session });
        }

        await session.commitTransaction();
        res.status(200).json({ message: 'Job blocked successfully' });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
})
