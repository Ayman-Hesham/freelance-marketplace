import asyncHandler from 'express-async-handler';
import Conversation from '../models/conversation.model';
import { ErrorWithStatus } from '../types/error.types';
import { Request, Response } from 'express';
import { getSignedDownloadUrl } from '../services/s3.service';
import Message from '../models/message.model';

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const conversations = await Conversation.find({
    $or: [
      { clientId: userId },
      { freelancerId: userId }
    ],
    status: 'active'
  })
  .populate('clientId', 'name avatar')
  .populate('freelancerId', 'name avatar') 
  .populate('jobId', 'title')
  .sort({ lastMessageAt: -1 });

  const conversationsWithData = await Promise.all(
    conversations.map(async (conv) => {
      let unreadCount = conv.unreadCount?.get(userId!) || 0;
      
      if (!conv.unreadCount?.has(userId!)) {
        unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: userId },
          read: false
        });

        await Conversation.findByIdAndUpdate(conv._id, {
          $set: { [`unreadCount.${userId}`]: unreadCount }
        });
      }

      const lastMessage = await Message.findOne({ conversationId: conv._id })
        .sort({ createdAt: -1 })
        .select('content createdAt');

      const conversationObj = conv.toJSON();
      
      const clientId = conversationObj.clientId as any;
      const freelancerId = conversationObj.freelancerId as any;
      
      const isUserClient = clientId.id === userId;
      const otherUser = isUserClient ? freelancerId : clientId;
      
      if (otherUser?.avatar) {
        const signedUrl = await getSignedDownloadUrl(otherUser.avatar);
        if (isUserClient) {
          freelancerId.avatar = signedUrl;
        } else {
          clientId.avatar = signedUrl;
        }
      }

      const unreadCountObj: { [key: string]: number } = {};
      if (conv.unreadCount) {
        for (const [key, value] of conv.unreadCount) {
          unreadCountObj[key] = value;
        }
      }

      return {
        ...conversationObj,
        unreadCount: unreadCountObj,
        lastMessage: lastMessage ? [lastMessage.toJSON()] : []
      };
    })
  );

  res.json(conversationsWithData);
});

export const getConversationByJobId = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const userId = req.user?.id;

  const conversation = await Conversation.findOne({
    jobId,
    $or: [
      { clientId: userId },
      { freelancerId: userId }
    ]
  });

  if (!conversation) {
    const error: ErrorWithStatus = new Error('Conversation not found');
    error.status = 404;
    throw error;
  }

  const conversationObj = conversation.toJSON();
  const unreadCountObj: { [key: string]: number } = {};
  if (conversation.unreadCount) {
    for (const [key, value] of conversation.unreadCount) {
      unreadCountObj[key] = value;
    }
  }
  conversationObj.unreadCount = unreadCountObj;

  res.json(conversationObj);
});