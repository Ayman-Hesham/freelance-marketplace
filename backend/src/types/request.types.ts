import { Request } from 'express';

interface User {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface UpdateProfileRequest extends Request {
  files?: {
    [fieldname: string]: Express.Multer.File[];
  };
  body: {
    name?: string;
    bio?: string;
    avatar?: string; 
    portfolio?: string;
  };
}