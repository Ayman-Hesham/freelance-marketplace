export interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  timestamp?: string;
} 