import axios from 'axios';
import { ApplicationsByIdResponse, CreateApplicationResponse } from '../types/application.types';
import { handleApiError } from '../utils/api.error.handler';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
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

export const getApplicationsByFreelancerId = async (freelancerId: string): Promise<ApplicationsByIdResponse> => {
    try {
        const response = await apiClient.get(`/applications/by-freelancer/${freelancerId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const getApplicationsByJobId = async (jobId: string): Promise<ApplicationsByIdResponse> => {
    try {
        const response = await apiClient.get(`/applications/by-job/${jobId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
