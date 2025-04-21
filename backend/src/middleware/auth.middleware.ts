import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorWithStatus } from '../types/error.types';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies or headers
    const token = req.cookies.auth_token || 
                  (req.headers.authorization?.startsWith('Bearer') ? 
                    req.headers.authorization.split(' ')[1] : null);

    if (!token) {
      const error: ErrorWithStatus = new Error('Not authorized, no token provided');
      error.status = 401;
      throw error;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    // Add user data to request - now we can access it directly
    req.user = {
      id: decoded.id
    };
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      const typedError: ErrorWithStatus = error;
      typedError.status = 401;
      next(typedError);
    } else {
      const newError: ErrorWithStatus = new Error('Not authorized');
      newError.status = 401;
      next(newError);
    }
  }
};

