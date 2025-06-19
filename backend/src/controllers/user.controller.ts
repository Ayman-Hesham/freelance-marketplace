import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { ErrorWithStatus } from '../types/error.types';
import { uploadToS3, deleteFromS3, getSignedDownloadUrl } from '../services/s3.service';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import '../types/request.types';
import { processAvatar } from '../services/image.service';

require('dotenv').config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024, 
  }
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 }
]);

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

    if (user.avatar) {
      const avatarUrl = await getSignedDownloadUrl(user.avatar);
      user.avatar = avatarUrl;
    }

    if (user.portfolio) {
      const portfolioUrl = await getSignedDownloadUrl(user.portfolio);
      user.portfolio = portfolioUrl;
    }
      
    res.status(200).json({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        portfolio: user.portfolio,
        role: user.role
      })
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return; 
  }

  res.status(200).json({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    portfolio: user.portfolio,
    role: user.role
  });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.status(200).json({ message: 'Logged out successfully' });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id || req.user?.id;
    
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

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const handleMulterUpload = () => {
    return new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  };

  await handleMulterUpload();
  
  const { name, bio } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const avatarFile = files?.avatar?.[0];
  const portfolioFile = files?.portfolio?.[0];
  const isAvatarDeleted = req.body.avatar === 'null';
  const isPortfolioDeleted = req.body.portfolio === 'null';
  
  const user = await User.findById(req.user?.id);
  if (!user) {
    const error: ErrorWithStatus = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (name !== undefined && name !== null) {
    const sanitizedName = name.trim();
    if (sanitizedName.length < 3 || sanitizedName.length > 15) {
      const error: ErrorWithStatus = new Error('Name must be between 3 and 15 characters');
      error.status = 400;
      throw error;
    }
    user.name = sanitizedName;
  }

  if (bio !== undefined) {
    if (bio === null) {
      user.bio = null;
    } else {
      if (bio.length > 500) {
        const error: ErrorWithStatus = new Error('Bio must be less than 500 characters');
        error.status = 400;
        throw error;
      }
      user.bio = bio.trim();
    }
  }

  if (avatarFile || isAvatarDeleted) {
    if (user.avatar) {
      await deleteFromS3(user.avatar);
    }
    
    if (avatarFile) {
      try {
        const processedAvatar = await processAvatar(avatarFile.buffer);
        const key = `avatars/${req.user?.id}/${uuidv4()}.webp`;
        await uploadToS3(processedAvatar, key, 'image/webp');
        user.avatar = key;
      } catch (error) {
        const err: ErrorWithStatus = new Error(
          error instanceof Error ? error.message : 'Failed to process avatar image'
        );
        err.status = 400;
        throw err;
      }
    } else {
      user.avatar = null;
    }
  }

  if (portfolioFile || isPortfolioDeleted) {
    if (user.portfolio) {
      await deleteFromS3(user.portfolio);
    }
    
    if (portfolioFile) {
      const key = `portfolios/${req.user?.id}/${uuidv4()}__${portfolioFile.originalname}`;
      await uploadToS3(portfolioFile.buffer, key, portfolioFile.mimetype);
      user.portfolio = key;
    } else {
      user.portfolio = null;
    }
  }

  await user.save();

  let avatarUrl = null;
  let portfolioUrl = null;

  if (user.avatar) {
    avatarUrl = await getSignedDownloadUrl(user.avatar);
  }

  if (user.portfolio) {
    portfolioUrl = await getSignedDownloadUrl(user.portfolio);
  }
  
  res.status(200).json({
    id: user.id,
    name: user.name,
    avatar: avatarUrl,
    bio: user.bio,
    portfolio: portfolioUrl
  });
});

