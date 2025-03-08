import axios from "axios";
import { RegistrationForm, LoginForm, RegisterationResponse, LoginResponse, LoginSuccess } from '../types/auth.types';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const createUser = async (query: RegistrationForm): Promise<RegisterationResponse> =>  {
    try{
        const response = await apiClient.post('/users', query);
        return response.data;
    } catch (err) {
        if(axios.isAxiosError(err)){
            console.log(err.message);
            return {
                error: {
                    message: err.message
                }
            }
        } else {
            console.log("Unexpected error ", err)
            return {
                error: {
                    message: "Unexpected error"
                }
            }
        }
    }
}

export const loginUser = async (query: LoginForm): Promise<LoginResponse> => {
    try{
        const response = await apiClient.post<LoginSuccess>('/auth/login', query);
        return response.data;
    } catch (err) {
        if(axios.isAxiosError(err)){
            console.log(err.message);
            return {
                error: {
                    message: err.message
                }
            }
        } else {
            console.log("Unexpected error ", err)
            return {
                error: {
                    message: "Unexpected error"
                }
            }
        }
    }
}
