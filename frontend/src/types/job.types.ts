import { ErrorResponse } from "./auth.types";

export interface Job {
    id: string;
    title: string;
    description: string;
    budget: number;
    deliveryTime: number;
    status: string;
    hasApplications?: boolean;
    hasApplied?: boolean;
    deliverable?: string;
    correctionMessage?: string;
    freelancerId?: string;
    blockMessage?: string;
    poster: {
        id: string;
        name?: string;
        avatarUrl?: string;
    }
}

export interface JobResponse {
    jobs: Job[];
    total: number;
    currentPage: number;
    totalPages: number;
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
    page: number;
}

export type GetJobsResponse = JobResponse | ErrorResponse

export type GetJobByIdResponse = Job | ErrorResponse

export type CreateJobResponse = Job | ErrorResponse

export type DeleteJobResponse = {
    message: string;
} | ErrorResponse

export type BlockJobResponse = {
    message: string;
} | ErrorResponse

