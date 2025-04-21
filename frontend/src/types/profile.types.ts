export interface ProfileFormData {
    name?: string;
    bio?: string;
    avatar?: File | null;
    portfolio?: File | null;
}

export interface ErrorResponse {
    message: string;
    status?: number;
    code?: string;
    timestamp?: string;
}

export interface UpdatedUser {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    portfolio: string;
}

export interface FileDownloadSuccess {
    downloadUrl: string;
    filename: string;
  }

export type FileDownloadResponse = FileDownloadSuccess | ErrorResponse

export type UpdateProfileResponse = UpdatedUser | ErrorResponse