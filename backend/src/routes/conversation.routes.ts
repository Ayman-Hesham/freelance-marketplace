import { Router } from 'express';
import { getConversations, getConversationByJobId } from '../controllers/conversation.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, getConversations);
router.get('/job/:jobId', protect, getConversationByJobId);

export const conversationRouter = router;
