import axios from 'axios';
import { GetJobsResponse, 
        GetJobByIdResponse, 
        CreateJobRequest, 
        CreateJobResponse, 
        FilterJobsRequest, 
        DeleteJobResponse,
        BlockJobResponse } from '../types/job.types';
import { handleApiError } from '../utils/api.error.handler';

const apiClient = axios.create({
    baseURL: 'https://freelance-marketplace.my/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const getJobs = async (page: number = 1): Promise<GetJobsResponse> => {
    try {
        const response = await apiClient.get(`/jobs?page=${page}`);
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};


export const getJobById = async (id: string, isFromFreelancerApplications?: boolean): Promise<GetJobByIdResponse> => {
    try {
        const response = await apiClient.get(`/jobs/${id}?isApplication=${isFromFreelancerApplications}`);
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};

export const getJobsByClientId = async (clientId: string, page: number = 1): Promise<GetJobsResponse> => {
    try {
        const response = await apiClient.get(`/jobs/by-client/${clientId}?page=${page}`);
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};

export const createJob = async (request: CreateJobRequest): Promise<CreateJobResponse> => {
    try {
        const response = await apiClient.post('/jobs', request);
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};

export const filterJobs = async (request: FilterJobsRequest): Promise<GetJobsResponse> => {
    try {
        const params = new URLSearchParams();
        if (request.budget) params.append('budget', request.budget.toString());
        if (request.deliveryTime) params.append('deliveryTime', request.deliveryTime.toString());
        if (request.page) params.append('page', request.page.toString());

        const response = await apiClient.get(`/jobs/filter?${params.toString()}`);
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};

export const searchJobs = async (query: string): Promise<GetJobsResponse> => {
    try {
        const response = await apiClient.get(`/jobs/search?query=${query}`);
        return response.data;
    }
    catch (err) {
        return handleApiError(err);
    }
};

export const deleteJob = async (id: string): Promise<DeleteJobResponse> => {
    try {
        const response = await apiClient.delete(`/jobs/${id}`);
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};

export const blockJob = async (id: string, message: string): Promise<BlockJobResponse> => {
    try {
        const response = await apiClient.put(`/jobs/block/${id}`, { message });
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};