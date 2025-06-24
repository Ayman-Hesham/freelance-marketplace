import { ErrorResponse } from "./auth.types";
import { Job } from "./job.types";

export interface Application {
    id: string;
    coverLetter: string;
    portfolio: string;
    status?: string;
    poster: {
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

export type ApplicationsByFreelancerIdResponse = {
    jobs: Job[];
    total: number;
    currentPage: number;
    totalPages: number;
} | ErrorResponse

export interface ApplicationsResponse {
    applications: Application[];
    total: number;
    currentPage: number;
    totalPages: number;
} 

export type ApplicationByJobIdResponse = ApplicationsResponse | ErrorResponse

export type AcceptApplicationResponse = {
    message: string;
} | ErrorResponse

export type LastApplicationResponse = {
    coverLetter: string;
    portfolio: string;
    message: string;
} | ErrorResponse

export type SubmitDeliverableResponse = {
    message: string;
} | ErrorResponse

export type RequestCorrectionResponse = {
    message: string;
} | ErrorResponse

export type AcceptDeliverableResponse = {
    message: string;
} | ErrorResponse