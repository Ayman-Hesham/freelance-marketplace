export interface RegistrationForm {
    name: string;
    email: string;
    password: string;
    role: 'client' | 'freelancer';
}

export interface LoginForm {
    email: string;
    password: string;
}

export interface SuccessResponse {
    message: string;
}
  
export interface ErrorResponse {
    message: string;
    status?: number;
    code?: string;
    timestamp?: string;
}

export type RegisterResponse = SuccessResponse | ErrorResponse;

export type LoginResponse = User | ErrorResponse

export interface User {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    portfolio?: string;
    role?: 'client' | 'freelancer';
}

export interface AvatarProps {
    src?: string;
    alt?: string;
    fallbackText?: string;
    className?: string;
    size?: 'default' | 'large';
}



