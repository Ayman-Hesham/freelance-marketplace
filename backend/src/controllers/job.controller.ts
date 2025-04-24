import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { ErrorWithStatus } from '../types/error.types';
import Job from '../models/job.model';
import { getSignedDownloadUrl } from '../services/s3.service';

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

    const job = await Job.findById(id);

    if (!job) {
        const error: ErrorWithStatus = new Error('Job not found');
        error.status = 404;
        throw error;
    }

    res.status(200).json({
        title: job.title,
        description: job.description,
        budget: job.budget,
        deliveryTime: job.deliveryTime,
        status: job.status
    });
});

export const getJobsByClientId = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id || req.user?.id;

    if (!id) {
        const error: ErrorWithStatus = new Error('Job ID not provided');
        error.status = 400;
        throw error;
    }

    const jobs = await Job.find({clientId: id}).sort({ createdAt: -1 });

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
            status: job.status
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

export const filterJobs = asyncHandler(async (req: Request, res: Response) => {
    const { budget, deliveryTime } = req.query;

    const query: any = { status: 'Open' };
    
    if (budget) {
        query.budget = { $lte: Number(budget) };
    }
    
    if (deliveryTime) {
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

    const searchQuery = { 
        status: 'Open',
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    };

    const jobs = await Job.find(searchQuery)
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
