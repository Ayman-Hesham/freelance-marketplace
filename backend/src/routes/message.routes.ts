import { Router } from 'express';
import { getMessages } from '../controllers/message.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/:conversationId', protect, getMessages);

export const messageRouter = router;
