import axios from "axios";
import { UpdateProfileResponse, FileDownloadResponse } from "../types/profile.types";
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
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


export const logoutUser = async (): Promise<{success?: boolean, message?: string}> => {
    try {
        await apiClient.post('/auth/logout');
        return { success: true };
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return {
                message: err.response?.data?.message || err.message
            };
        } else {
            return {
                message: "Unexpected error"
            };
        }
    }
}

export const getFileDownloadUrl = async (key: string): Promise<FileDownloadResponse> => {
    try {
        const response = await apiClient.get(`/users/file/${encodeURIComponent(key)}`, {
            headers: {
                Accept: 'application/json',
            },
        });
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return {
                message: err.response?.data?.message || err.message,
                status: err.response?.status,
                code: err.code,
                timestamp: new Date().toISOString()
            }
        } else {
            console.log("Unexpected error ", err);
            return {
                message: "Unexpected error"
            }
        }
    }
}