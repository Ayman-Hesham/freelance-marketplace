import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {

  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      api: 'ok'
    }
  });
}));

export const healthRouter = router; 