import { useEffect, useRef, useState } from 'react';
import { useMessage } from '../../hooks/useMessage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatHeader } from '../../components/common/Messaging/ChatHeader';
import { MessagesList } from '../../components/common/Messaging/MessagesList';
import { MessageInput } from '../../components/common/Messaging/MessageInput';
import { EmptyState } from '../../components/common/Messaging/EmptyState';
import { ConversationsList } from '../../components/common/Messaging/ConversationsList';
import { Conversation, getConversationsResponse } from '../../types/conversation.types';
import { getConversations } from '../../services/conversation.service';
import { useAuth } from '../../hooks/useAuth';
import { getMessages } from '../../services/message.service';
import { Message } from '../../types/message.types';
import { useUnreadCount } from '../../hooks/useUnreadCount';

export const MessagesPage = () => {
  const { 
    socket, 
    isConnected, 
    onlineUsers, 
    typingUsers,
    joinConversation, 
    leaveConversation, 
    sendMessage: sendSocketMessage,
    setCurrentConversationId
  } = useMessage();
  
  const { resetUnreadCount } = useUnreadCount();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: conversations } = useQuery<getConversationsResponse>({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const response = await getConversations();
      if ('message' in response) {
        return [];
      }
      return response;
    }
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedConversation?.id || 'none'],
    queryFn: async () => {
      if (!selectedConversation?.id) {
        return null;
      }
      const response = await getMessages(selectedConversation.id);
      return response;
    },
    enabled: !!selectedConversation?.id,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true
  });

  useEffect(() => {
    setCurrentConversationId(selectedConversation?.id || null);
    
    return () => {
      setCurrentConversationId(null);
    };
  }, [selectedConversation, setCurrentConversationId]);

  useEffect(() => {
    if (socket && selectedConversation) {
      socket.emit('mark-messages-read', { conversationId: selectedConversation.id });
      resetUnreadCount();
    }
  }, [socket, selectedConversation, resetUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: Message) => {
      queryClient.setQueryData(
        ['messages', message.conversationId],
        (oldMessages: Message[] = []) => {
          if (oldMessages?.some(m => m.id === message.id)) return oldMessages;
          return [...(oldMessages || []), message];
        }
      );

      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });

      setTimeout(() => {
        scrollToBottom();
      }, 100);

      resetUnreadCount();
    };

    const handleMessageSent = (data: { messageId: string, message: Message }) => {
      const { messageId, message } = data;
      
      queryClient.setQueryData(
        ['messages', message.conversationId],
        (oldMessages: Message[] = []) => 
          oldMessages?.map(msg => msg.id === messageId ? message : msg) || []
      );

      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });

      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('message-sent', handleMessageSent);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('message-sent', handleMessageSent);
    };
  }, [socket, queryClient, user, resetUnreadCount]);

  useEffect(() => {
    if (selectedConversation) {
      joinConversation(selectedConversation.id);
    }

    return () => {
      if (selectedConversation) {
        leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation, joinConversation, leaveConversation]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user) return;

    const conversationId = selectedConversation.id;
    const messageId = `temp-${Date.now()}`;
    
    const optimisticMessage = {
      id: messageId,
      conversationId,
      senderId: {
        id: user.id,
        name: user.name,
        avatar: user.avatar || ''
      },
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      read: true,
      status: 'sending'
    };

    queryClient.setQueryData(
      ['messages', conversationId],
      (old: Message[] = []) => [...old, optimisticMessage]
    );

    try {
      await sendSocketMessage(conversationId, content);
      
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: Message[] = []) => old.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    } catch (error) {
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: Message[] = []) => old.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
    }
  };

  const otherUser = selectedConversation 
    ? (selectedConversation.clientId.id === user?.id 
        ? selectedConversation.freelancerId 
        : selectedConversation.clientId)
    : null;

  const isOtherUserOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
  const isOtherUserTyping = selectedConversation 
    ? typingUsers.get(selectedConversation.id)?.has(otherUser?.id || '') || false
    : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-100 px-4 md:px-8 py-4 -mt-4">
      {!isConnected && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Disconnected - Attempting to reconnect...
        </div>
      )}
      
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex gap-6 h-full">
          <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {!conversations || 'message' in conversations || (Array.isArray(conversations) && conversations.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                <p className="text-lg font-medium">No conversations yet</p>
              </div>
            ) : (
              <ConversationsList
                conversations={conversations as Conversation[]}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={setSelectedConversation}
                className="h-full"
              />
            )}
          </div>
          
          <div className="flex-1 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                <ChatHeader
                  name={otherUser?.name || ''}
                  avatar={otherUser?.avatar}
                  online={isOtherUserOnline}
                  typing={isOtherUserTyping}
                />
                <MessagesList
                  messages={Array.isArray(messages) ? messages : []}
                  messagesEndRef={messagesEndRef}
                />
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  conversationId={selectedConversation.id}
                  disabled={!isConnected}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}