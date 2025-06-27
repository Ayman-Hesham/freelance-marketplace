import axios from 'axios';
import { handleApiError } from '../utils/api.error.handler';
import { getConversationsResponse } from '../types/conversation.types';

const apiClient = axios.create({
    baseURL: 'http://freelance-marketplace.my/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const getConversations = async (): Promise<getConversationsResponse> => {
    try {
        const response = await apiClient.get(`/conversations`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
