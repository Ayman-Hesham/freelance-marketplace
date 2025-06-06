import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Message from '../models/message.model';
import Conversation from '../models/conversation.model';

// Online users tracking
const onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>
const userSockets = new Map<string, string>(); // socketId -> userId

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
    
    // Track online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);
    userSockets.set(socket.id, userId);
    
    // Join user's personal room
    socket.join(userId);
    
    // Emit user online status to relevant conversations
    socket.broadcast.emit('user-online', { userId });
    
    // Send current online users to the newly connected user
    const allOnlineUsers = Array.from(onlineUsers.keys());
    socket.emit('online-users', allOnlineUsers);

    socket.on('join-conversation', async (conversationId: string) => {
      try {
        // Verify user has access to this conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          $or: [
            { clientId: userId },
            { freelancerId: userId }
          ]
        });

        if (conversation) {
          socket.join(`conversation-${conversationId}`);
          
          // Mark messages as read
          await Message.updateMany(
            { 
              conversationId, 
              senderId: { $ne: userId },
              read: false 
            },
            { read: true }
          );

          // Notify other participants that messages were read
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
        const { conversationId, content, tempId } = data;
        const userId = socket.data.userId;

        // Validate conversation access
        const conversation = await Conversation.findOne({
          _id: conversationId,
          $or: [
            { clientId: userId },
            { freelancerId: userId }
          ]
        });

        if (!conversation) {
          socket.emit('message-error', { 
            tempId,
            error: 'Conversation not found or access denied' 
          });
          return;
        }

        // Create message in database
        const message = await Message.create({
          conversationId,
          senderId: userId,
          content
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          $push: { messages: message._id },
          lastMessageAt: new Date()
        });

        // Populate sender info
        const populatedMessage = await message.populate('senderId', 'id name avatar');
        const messageToSend = populatedMessage.toJSON();

        // Emit to conversation room AND sender
        socket.to(`conversation-${conversationId}`).emit('receive-message', messageToSend);
        socket.emit('receive-message', messageToSend);

      } catch (error) {
        socket.emit('message-error', { 
          tempId: data.tempId,
          error: 'Failed to send message' 
        });
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

    socket.on('disconnect', () => {
      // Remove from online tracking
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId)!.delete(socket.id);
        if (onlineUsers.get(userId)!.size === 0) {
          onlineUsers.delete(userId);
          // Emit user offline status
          socket.broadcast.emit('user-offline', { userId });
        }
      }
      userSockets.delete(socket.id);
    });
  });

  return io;
}

// Helper function to check if user is online
export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

// Helper function to get all online users
export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers.keys());
}