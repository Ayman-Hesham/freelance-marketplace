export interface ErrorWithStatus extends Error {
  code?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  timestamp?: string;
} 