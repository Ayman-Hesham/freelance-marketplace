import { ErrorResponse } from "./auth.types";
import { Job } from "./job.types";

export interface Application {
    id?: string;
    jobId: string;
    freelancerId: string;
    coverLetter: string;
    portfolio: string;
    status: string;
    freelancer?: {
        id: string;
        name: string;
        avatarUrl: string;
    }
}

export type CreateApplicationRequest = {
    jobId: string;
    coverLetter: string;
    portfolio: File;
}

export type CreateApplicationResponse = Application | ErrorResponse

export type ApplicationsByIdResponse = {
    jobs: Job[];
    total: number;
} | ErrorResponse
