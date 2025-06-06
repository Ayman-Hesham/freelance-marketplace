import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

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
}

const MessageContext = createContext<MessageContextType | null>(null);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { user } = useAuth();

  const connectSocket = useCallback(() => {
    if (!user || socket?.connected) return;

    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      timeout: 20000,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      console.log('Connected to socket server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from socket server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
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
  }, [user, reconnectAttempts]);

  useEffect(() => {
    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [connectSocket]);

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
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected'));
        return;
      }

      const tempId = Date.now().toString();
      
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000);

      const messageHandler = (message: any) => {
        if (message.content === content && message.conversationId === conversationId) {
          clearTimeout(timeout);
          socket.off('receive-message', messageHandler);
          socket.off('message-error', errorHandler);
          resolve();
        }
      };

      const errorHandler = (error: any) => {
        if (error.tempId === tempId) {
          clearTimeout(timeout);
          socket.off('receive-message', messageHandler);
          socket.off('message-error', errorHandler);
          reject(new Error(error.error));
        }
      };

      socket.on('receive-message', messageHandler);
      socket.on('message-error', errorHandler);

      socket.emit('send-message', {
        conversationId,
        content,
        tempId
      });
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
      stopTyping
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};