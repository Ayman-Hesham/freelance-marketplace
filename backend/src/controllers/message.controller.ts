import asyncHandler from 'express-async-handler';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import { Request, Response } from 'express';
import { ErrorWithStatus } from '../types/error.types';

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const userId = req.user?.id;

  if (!conversationId || conversationId === 'undefined') {
    const error: ErrorWithStatus = new Error('Invalid conversation ID');
    error.status = 400;
    throw error;
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    $or: [
      { clientId: userId },
      { freelancerId: userId }
    ]
  });

  if (!conversation) {
    const error: ErrorWithStatus = new Error('Conversation not found or access denied');
    error.status = 404;
    throw error;
  }

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .populate('senderId', 'id name avatar');

  res.json(messages);
});