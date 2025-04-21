import { Request } from 'express';
import { Multer } from 'multer';
import { IUser } from './model.types';

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
    avatar?: string; // For handling deletion ('null' string)
    portfolio?: string; // For handling deletion ('null' string)
  };
}