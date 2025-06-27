import axios from "axios";
import { UpdateProfileResponse, FileDownloadResponse } from "../types/profile.types";
import { handleApiError } from '../utils/api.error.handler';

const apiClient = axios.create({
    baseURL: 'http://freelance-marketplace.my/api',
    withCredentials: true,
});

export const updateProfile = async (formData: FormData): Promise<UpdateProfileResponse> => {
    try {
        const response = await apiClient.put('/users/update-profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};


export const logoutUser = async (): Promise<{success?: boolean, message?: string}> => {
    try {
        await apiClient.post('/auth/logout');
        return { success: true };
    } catch (err) {
        return handleApiError(err);
    }
};

export const getFileDownloadUrl = async (key: string): Promise<FileDownloadResponse> => {
    try {
        const response = await apiClient.get(`/users/file/${encodeURIComponent(key)}`, {
            headers: {
                Accept: 'application/json',
            },
        });
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};