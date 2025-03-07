import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { AuthenticatedRequest } from '../types/request.types';
import { ObjectId } from 'mongodb';

require('dotenv').config();

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    const sanitizedName = name.trim().replace(/\s+/g, '');
    
    if (sanitizedName.length < 3 || sanitizedName.length > 15) {
        res.status(400);
        throw new Error('Name must be between 3 and 15 characters long');
    }

    const sanitizedPassword = password.trim().replace(/\s+/g, '');

    if (sanitizedPassword.length < 8 || sanitizedPassword.length > 20) {
        res.status(400);
        throw new Error('Password must be between 8 and 20 characters long');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password at controller level
    const salt = await bcrypt.genSalt(10);  
    const hashedPassword = await bcrypt.hash(sanitizedPassword, salt);

    const user = await User.create({ 
        name: sanitizedName, 
        email, 
        password: hashedPassword, 
        role 
    });

    if (user) {
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    }
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        res.status(400);
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.status(400);
        throw new Error('Invalid password');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.status(200).json({ 
        token: token,
        role: user.role 
    });
});

export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.status(200).json(user);
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    
    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await user.deleteOne();
    
    res.status(200).json({ message: 'User deleted successfully' });
});

export const updatePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide current password and new password');
    }
    
    // Include password in the select
    const user = await User.findById(req.user?.id).select('+password');
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }
    
    // Hash the new password at controller level
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
});

