import axios from 'axios';
import { handleApiError } from '../utils/api.error.handler';
import { getMessagesResponse } from '../types/message.types';

const apiClient = axios.create({
    baseURL: 'https://freelance-marketplace.my/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const getMessages = async (conversationId: string): Promise<getMessagesResponse> => {
    try {
        const response = await apiClient.get(`/messages/${conversationId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
