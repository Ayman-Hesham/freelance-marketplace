export interface RegistrationForm {
    name: string;
    email: string;
    password: string;
    userType: 'client' | 'freelancer';
}

export interface SuccessResponse {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  
export type ErrorResponse = string;

export type RegisterationResponse = SuccessResponse | ErrorResponse;

export interface LoginForm {
    email: string;
    password: string;
}

