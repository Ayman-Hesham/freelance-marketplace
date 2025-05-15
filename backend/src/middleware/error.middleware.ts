import { Request, Response, NextFunction } from 'express';
import { ErrorWithStatus } from '../types/error.types';

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  console.error(`Route: ${req.method} ${req.originalUrl}`);
  console.error(`Request body:`, req.body);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    code: err.code,
    timestamp: new Date().toISOString()
  });
};

export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      status: 404,
      timestamp: new Date().toISOString()
    }
  });
}; 