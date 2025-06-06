import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes'
import { jobRouter } from './job.routes'
import { applicationRouter } from './application.routes';
import { conversationRouter } from './conversation.routes';
import { messageRouter } from './message.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/jobs', jobRouter);
router.use('/applications', applicationRouter);
router.use('/conversations', conversationRouter);
router.use('/messages', messageRouter);

export default router; 