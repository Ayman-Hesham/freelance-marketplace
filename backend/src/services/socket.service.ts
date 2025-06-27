import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Message from '../models/message.model';
import Conversation from '../models/conversation.model';

const onlineUsers = new Map<string, Set<string>>();
const userSockets = new Map<string, string>();

export function initializeSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.headers.cookie
      ?.split(';')
      ?.find(cookie => cookie.trim().startsWith('auth_token='))
      ?.split('=')[1];
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);
    userSockets.set(socket.id, userId);
    
    socket.join(userId);
    
    socket.broadcast.emit('user-online', { userId });
    
    const allOnlineUsers = Array.from(onlineUsers.keys());
    socket.emit('online-users', allOnlineUsers);

    socket.on('join-conversation', async (conversationId: string) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          $or: [
            { clientId: userId },
            { freelancerId: userId }
          ]
        });

        if (conversation) {
          socket.join(`conversation-${conversationId}`);
          
          await Message.updateMany(
            { 
              conversationId, 
              senderId: { $ne: userId },
              read: false 
            },
            { read: true }
          );

          await Conversation.findByIdAndUpdate(conversationId, {
            $set: { [`unreadCount.${userId}`]: 0 }
          });

          socket.to(`conversation-${conversationId}`).emit('messages-read', {
            conversationId,
            readBy: userId
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation-${conversationId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { conversationId, content, messageId } = data;
        const userId = socket.data.userId;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          $or: [{ clientId: userId }, { freelancerId: userId }]
        });

        if (!conversation) {
          socket.emit('message-error', { messageId });
          return;
        }

        const message = await Message.create({
          conversationId,
          senderId: userId,
          content,
          read: false
        });

        const recipientId = conversation.clientId.toString() === userId 
          ? conversation.freelancerId.toString()
          : conversation.clientId.toString();

        await Conversation.findByIdAndUpdate(conversationId, {
          $push: { messages: message._id },
          lastMessageAt: new Date(),
          $inc: { [`unreadCount.${recipientId}`]: 1 }
        });

        const populatedMessage = await message.populate('senderId', 'id name avatar');
        const messageToSend = populatedMessage.toJSON();

        socket.emit('message-sent', { 
          messageId, 
          message: messageToSend 
        });
        socket.to(`conversation-${conversationId}`).emit('receive-message', messageToSend);
        socket.to(recipientId).emit('unread-count-updated');

      } catch (error) {
        socket.emit('message-error', { messageId: data.messageId });
      }
    });

    socket.on('typing-start', (data) => {
      socket.to(`conversation-${data.conversationId}`).emit('user-typing', {
        userId,
        conversationId: data.conversationId
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(`conversation-${data.conversationId}`).emit('user-stop-typing', {
        userId,
        conversationId: data.conversationId
      });
    });

    socket.on('mark-messages-read', async ({ conversationId }) => {
      try {
        const userId = socket.data.userId;

        await Conversation.findByIdAndUpdate(conversationId, {
          $set: { [`unreadCount.${userId}`]: 0 }
        });

        await Message.updateMany(
          { 
            conversationId,
            senderId: { $ne: userId },
            read: false 
          },
          { read: true }
        );

        io.to(`conversation-${conversationId}`).emit('messages-read', {
          conversationId,
          readBy: userId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('logout', () => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId)!.delete(socket.id);
        if (onlineUsers.get(userId)!.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user-offline', { userId });
        }
      }
      userSockets.delete(socket.id);
      
      socket.disconnect(true);
    });

    socket.on('disconnect', () => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId)!.delete(socket.id);
        if (onlineUsers.get(userId)!.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user-offline', { userId });
        }
      }
      userSockets.delete(socket.id);
    });
  });

  return io;
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers.keys());
}