import { ErrorResponse } from "./auth.types";

export interface Job {
    id?: string;
    title: string;
    description: string;
    budget: number;
    deliveryTime: number;
    status: string;
    hasApplications?: boolean;
    hasApplied?: boolean;
    poster: {
        id: string;
        name: string;
        avatarUrl: string;
    }
}

export interface JobResponse {
    jobs: Job[];
    total: number;
}

export interface CreateJobRequest {
    title: string;
    description: string;
    budget: number;
    deliveryTime: number;
}

export interface FilterJobsRequest {
    deliveryTime: number;
    budget: number;
}

export type GetJobsResponse = JobResponse | ErrorResponse

export type GetJobByIdResponse = Job | ErrorResponse

export type CreateJobResponse = Job | ErrorResponse

export type DeleteJobResponse = {
    message: string;
} | ErrorResponse


