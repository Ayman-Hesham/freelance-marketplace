import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { ErrorWithStatus } from '../types/error.types';
import Job from '../models/job.model';

export const createJob = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, category, budget, deliveryDate } = req.body;

    const job = await Job.create({ title, description, category, budget, deliveryDate });

    res.status(201).json(job);
});

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
    const jobs = await Job.find();

    if (!jobs) {
        const error: ErrorWithStatus = new Error('No jobs found');
        error.status = 404;
        throw error;
    }

    res.status(200).json(jobs);
});
