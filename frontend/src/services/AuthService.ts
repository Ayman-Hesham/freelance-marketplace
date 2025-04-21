import axios from "axios";
import { RegistrationForm, LoginForm, RegisterResponse, LoginResponse } from '../types/auth.types';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
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

export const loginUser = async (query: LoginForm): Promise<LoginResponse> => {
    try{
        const response = await apiClient.post('/auth/login', query);
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

export const getCurrentUser = async (): Promise<LoginResponse> => {
    try{
        const response = await apiClient.get('/users/current');
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

