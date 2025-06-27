import React, { createContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface MessageContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, Set<string>>; 
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  unreadCount: number;
  setCurrentConversationId: (id: string | null) => void;
  currentConversationId: string | null;
  handleLogout: () => void;
}

export const MessageContext = createContext<MessageContextType | null>(null);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  const connectSocket = useCallback(() => {
    if (!user || socket?.connected) return;

    try {
      const newSocket = io('https://freelance-marketplace.my/api', {
        transports: ['websocket'],
        timeout: 20000,
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to socket server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from socket server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        // Don't throw error - just log it
      });

      newSocket.on('online-users', (users: string[]) => {
        setOnlineUsers(new Set(users));
      });

      newSocket.on('user-online', ({ userId }) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('user-offline', ({ userId }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      newSocket.on('user-typing', ({ userId, conversationId }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (!newMap.has(conversationId)) {
            newMap.set(conversationId, new Set());
          }
          newMap.get(conversationId)!.add(userId);
          return newMap;
        });
      });

      newSocket.on('user-stop-typing', ({ userId, conversationId }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (newMap.has(conversationId)) {
            newMap.get(conversationId)!.delete(userId);
            if (newMap.get(conversationId)!.size === 0) {
              newMap.delete(conversationId);
            }
          }
          return newMap;
        });
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      // Don't throw - let the app continue to work without socket
    }
  }, [user]); // Remove reconnectAttempts from dependencies

  useEffect(() => {
    if (user) {
      connectSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user]); // Simplified dependencies

  const joinConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('join-conversation', conversationId);
    }
  }, [socket, isConnected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-conversation', conversationId);
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback(async (conversationId: string, content: string): Promise<void> => {
    if (!socket || !isConnected) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      const messageId = `temp-${Date.now()}`;
      
      const handleSuccess = (data: { messageId: string }) => {
        if (data.messageId === messageId) {
          socket.off('message-sent', handleSuccess);
          socket.off('message-error', handleError);
          resolve();
        }
      };

      const handleError = (error: { messageId: string }) => {
        if (error.messageId === messageId) {
          socket.off('message-sent', handleSuccess);
          socket.off('message-error', handleError);
          reject(new Error('Failed to send message'));
        }
      };

      socket.on('message-sent', handleSuccess);
      socket.on('message-error', handleError);

      socket.emit('send-message', {
        conversationId,
        content,
        messageId
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        socket.off('message-sent', handleSuccess);
        socket.off('message-error', handleError);
        reject(new Error('Message send timeout'));
      }, 10000);
    });
  }, [socket, isConnected]);

  const startTyping = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-start', { conversationId });
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { conversationId });
    }
  }, [socket, isConnected]);

  // Add logout handler
  const handleLogout = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('logout');
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers(new Set());
      setTypingUsers(new Map());
      setUnreadCount(0);
      setCurrentConversationId(null);
    }
  }, [socket, isConnected]);

  // Add this effect to handle auth state changes
  useEffect(() => {
    if (!user) {
      handleLogout();
    }
  }, [user, handleLogout]);

  // Update currentConversationId when viewing messages
  useEffect(() => {
    const isOnMessagesPage = window.location.pathname === '/messages';
    if (!isOnMessagesPage) {
      setCurrentConversationId(null);
    }
  }, []);

  return (
    <MessageContext.Provider value={{
      socket,
      isConnected,
      onlineUsers,
      typingUsers,
      joinConversation,
      leaveConversation,
      sendMessage,
      startTyping,
      stopTyping,
      unreadCount,
      setCurrentConversationId,
      currentConversationId,
      handleLogout,
    }}>
      {children}
    </MessageContext.Provider>
  );
};
