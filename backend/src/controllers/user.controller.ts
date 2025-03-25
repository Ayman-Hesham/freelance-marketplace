import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { AuthenticatedRequest } from '../types/request.types';
import { ErrorWithStatus } from '../types/error.types';

require('dotenv').config();

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        const error: ErrorWithStatus = new Error('Please fill in all fields');
        error.status = 400
        throw error
    }

    const sanitizedName = name.trim();
    
    if (sanitizedName.length < 3 || sanitizedName.length > 15) {
        const error: ErrorWithStatus = new Error('Name must be between 3 and 15 characters long');
        error.status = 400
        throw error
    }

    const sanitizedPassword = password.trim().replace(/\s+/g, '');

    if (sanitizedPassword.length < 8 || sanitizedPassword.length > 20) {
        const error: ErrorWithStatus = new Error('Password must be between 8 and 20 characters long');
        error.status = 400
        throw error
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        const error: ErrorWithStatus = new Error('User already exists')
        error.status = 400
        throw error
    }

    const salt = await bcrypt.genSalt(10);  
    const hashedPassword = await bcrypt.hash(sanitizedPassword, salt);

    const user = await User.create({ 
        name: sanitizedName, 
        email, 
        password: hashedPassword, 
        role 
    });

    if (user) {
        res.status(201).json({message: `Account created successfully`});
    }
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        const error: ErrorWithStatus = new Error('Please provide email and password');
        error.status = 400
        throw error
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        const error: ErrorWithStatus = new Error('User not found');
        error.status = 400
        throw error
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        const error: ErrorWithStatus = new Error('Invalid password');
        error.status = 400
        throw error
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.cookie("auth_token", token, {
        httpOnly: true,      
        sameSite: "strict", 
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

    res.status(200).json({
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture,
        role: user.role
      })
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;
    console.log(token);
    
    if (!token) {
        res.status(401).json({ message: "Not authorized, no token provided" });
        return;
      }
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        const user = await User.findById(decoded.id).select("-password");
  
        if (!user) {
          res.status(401).json({ message: "User not found" });
          return; 
        }
  
        res.status(200).json({
            id: user.id,
            name: user.name,
            profilePicture: user.profilePicture,
            role: user.role
          })
      } catch (error) {
        next(error); 
      }
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.status(200).json({ message: 'Logged out successfully' });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    
    if (!userId) {
        const error: ErrorWithStatus = new Error('User ID is required')
        error.status = 400
        throw error
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
        const error: ErrorWithStatus = new Error('User not found')
        error.status = 404
        throw error
    }

    await user.deleteOne();
    
    res.status(200).json({ message: 'User deleted successfully' });
});


export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, profilePicture, bio, portfolio } = req.body;
    
});

