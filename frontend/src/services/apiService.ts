import axios from "axios";
import { RegistrationForm, LoginForm, SuccessResponse, RegisterationResponse } from '../types/auth.types';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const createUser = async (query: RegistrationForm): Promise<RegisterationResponse> =>  {
    try{
        const response = await apiClient.post<SuccessResponse>('/users', query);
        return response.data;
    } catch (err) {
        if(axios.isAxiosError(err)){
            const errorMessage = err.response?.data?.message || err.message;
            console.log(errorMessage);
            return errorMessage;
        } else {
            console.log("Unexpected error ", err)
            return "Unexpected error"
        }
    }
}

export const loginUser = async (query: LoginForm) => {
    try{
        const response = await apiClient.post('/auth/login', query);
        return response;
    } catch (err) {
        if(axios.isAxiosError(err)){
            console.log(err.message)
            return err.message
        } else {
            console.log("Unexpected error ", err)
            return "Unexpected error"
        }
    }
}