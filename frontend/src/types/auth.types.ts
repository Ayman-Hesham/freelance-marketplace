export interface RegistrationForm {
    name: string;
    email: string;
    password: string;
    role: 'client' | 'freelancer';
}

export interface SuccessResponse {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  
export interface ErrorResponse {
    error: {
        message: string;
        status?: number;
        code?: string;
        timestamp?: string;
      }
}

export type RegisterationResponse = SuccessResponse | ErrorResponse;

export interface LoginForm {
    email: string;
    password: string;
}

export interface UserProfile {
    name: string;
    profilePicture: string;
    bio: string;
    portfolio: BufferSource | null;
}

export interface LoginSuccess {
    token: string;
    role: string;
    user: UserProfile;
}


export type LoginResponse = LoginSuccess | ErrorResponse

