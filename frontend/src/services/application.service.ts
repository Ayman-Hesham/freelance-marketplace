import axios from 'axios';
import { AcceptApplicationResponse, 
        ApplicationByJobIdResponse, 
        ApplicationsByFreelancerIdResponse, 
        CreateApplicationResponse, 
        LastApplicationResponse, 
        RequestCorrectionResponse, 
        SubmitDeliverableResponse,
        AcceptDeliverableResponse } from '../types/application.types';
import { handleApiError } from '../utils/api.error.handler';

const apiClient = axios.create({
    baseURL: 'https://freelance-marketplace.my/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const createApplication = async (formData: FormData): Promise<CreateApplicationResponse> => {
    try {
        const response = await apiClient.post('/applications', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const getApplicationsByFreelancerId = async (freelancerId: string, page: number = 1): Promise<ApplicationsByFreelancerIdResponse> => {
    try {
        const response = await apiClient.get(`/applications/by-freelancer/${freelancerId}?page=${page}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const getApplicationsByJobId = async (jobId: string, page: number = 1): Promise<ApplicationByJobIdResponse> => {
    try {
        const response = await apiClient.get(`/applications/by-job/${jobId}?page=${page}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const acceptApplication = async (applicationId: string): Promise<AcceptApplicationResponse> => {
    try {
        const response = await apiClient.put(`/applications/${applicationId}/accept`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const getLastApplication = async (freelancerId: string): Promise<LastApplicationResponse> => {
    try {
        const response = await apiClient.get(`/applications/last/${freelancerId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const submitDeliverable = async (jobId: string, formData: FormData): Promise<SubmitDeliverableResponse> => {
    try {
        const response = await apiClient.put(`/applications/${jobId}/submit-deliverable`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const requestCorrection = async (jobId: string, message: string): Promise<RequestCorrectionResponse> => {
    try {
        const response = await apiClient.put(`/applications/${jobId}/request-correction`, { message });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const acceptDeliverable = async (jobId: string): Promise<AcceptDeliverableResponse> => {
    try {
        const response = await apiClient.put(`/applications/${jobId}/accept-deliverable`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};