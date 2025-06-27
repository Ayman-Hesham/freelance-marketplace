import axios from "axios";
import { RegistrationForm, LoginForm, RegisterResponse, LoginResponse } from '../types/auth.types';
import { handleApiError } from '../utils/api.error.handler';

const apiClient = axios.create({
    baseURL: 'http://freelance-marketplace.my/api',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true
  });

export const createUser = async (query: RegistrationForm): Promise<RegisterResponse> =>  {
    try{
        const response = await apiClient.post('/users', query);
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};

export const loginUser = async (query: LoginForm): Promise<LoginResponse> => {
    try{
        const response = await apiClient.post('/auth/login', query);
        return response.data;
    } catch (err) {
        return handleApiError(err);
    }
};


