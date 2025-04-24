import axios from 'axios';
import { GetJobsResponse, GetJobByIdResponse, CreateJobRequest, CreateJobResponse, FilterJobsRequest } from '../types/job.types';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const getJobs = async (): Promise<GetJobsResponse> => {
    try {
        const response = await apiClient.get('/jobs');
        return response.data;
    } catch (err) {
        if(axios.isAxiosError(err)){
            return {
                message: err.response?.data?.message || err.message,
                status: err.response?.status,
                code: err.code,
                timestamp: new Date().toISOString()
            }
        } else {
            console.log("Unexpected error ", err)
            return {
                message: "Unexpected error"
            }
        }
    }
};


export const getJobById = async (id: string): Promise<GetJobByIdResponse> => {
    try {
        const response = await apiClient.get(`/jobs/${id}`);
        return response.data;
    } catch (err) {
        if(axios.isAxiosError(err)){
            return {
                message: err.response?.data?.message || err.message,
                status: err.response?.status,
                code: err.code,
                timestamp: new Date().toISOString()
            }
        } else {
            console.log("Unexpected error ", err)
            return {
                message: "Unexpected error" 
            }
        }
    }
};

export const getJobsByClientId = async (clientId: string): Promise<GetJobsResponse> => {
    try{
        const response = await apiClient.get(`/jobs/client/${clientId}`);
        return response.data;
    } catch (err) {
        if(axios.isAxiosError(err)){
            return {
                message: err.response?.data?.message || err.message,
                status: err.response?.status,
                code: err.code,
                timestamp: new Date().toISOString()
            }
        } else {
            console.log("Unexpected error ", err)
            return {
                message: "Unexpected error"
            }
        }
    }
};

export const createJob = async (request: CreateJobRequest): Promise<CreateJobResponse> => {
    try {
        const response = await apiClient.post('/jobs', request);
        return response.data;
    } catch (err) {
        if(axios.isAxiosError(err)){
            return {
                message: err.response?.data?.message || err.message,
                status: err.response?.status,
                code: err.code,
                timestamp: new Date().toISOString()
            }
        } else {
            console.log("Unexpected error ", err)
            return {
                message: "Unexpected error"
            }
        }
    }
};

export const filterJobs = async (request: FilterJobsRequest): Promise<GetJobsResponse> => {
    try {
        const params = new URLSearchParams();
        if (request.budget) params.append('budget', request.budget.toString());
        if (request.deliveryTime) params.append('deliveryTime', request.deliveryTime.toString());

        const response = await apiClient.get(`/jobs/filter?${params.toString()}`);
        return response.data;
    } catch (err) {
        if(axios.isAxiosError(err)){
            return {
                message: err.response?.data?.message || err.message,
                status: err.response?.status,
                code: err.code,
                timestamp: new Date().toISOString()
            }
        } else {
            console.log("Unexpected error ", err)
            return {
                message: "Unexpected error"
            }
        }
    }
}

export const searchJobs = async (query: string): Promise<GetJobsResponse> => {
    try {
        const response = await apiClient.get(`/jobs/search?query=${query}`);
        return response.data;
    }
    catch (err) {
        if(axios.isAxiosError(err)){
            return {
                message: err.response?.data?.message || err.message,
                status: err.response?.status,   
                code: err.code,
                timestamp: new Date().toISOString()
            }
        } else {
            console.log("Unexpected error ", err)
            return {
                message: "Unexpected error"
            }
        }
    }
}
