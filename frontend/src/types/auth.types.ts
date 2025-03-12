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


export interface User {
    id: string;
    name: string;
    profilePicture?: string;
    role: 'client' | 'freelancer';
  }

export type LoginResponse = User | ErrorResponse

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    success: string | null;
    login: (loginData: LoginForm) => Promise<void>;
    register: (userData: RegistrationForm) => Promise<string | null>;
    logout: () => Promise<void>;
    clearToast: () => void;
  }