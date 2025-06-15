import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMessage } from './useMessage';
import { useAuth } from './useAuth';
import { useLocation } from 'react-router-dom';

export function useMessageNotifications() {
  const { socket } = useMessage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const isOnMessagesPage = location.pathname === '/messages';

  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (message: any) => {
      if (message.senderId.id !== user.id && !isOnMessagesPage) {
        queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      }
    };

    const handleUnreadCountUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('unread-count-updated', handleUnreadCountUpdated);
    socket.on('messages-read', handleUnreadCountUpdated);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('unread-count-updated', handleUnreadCountUpdated);
      socket.off('messages-read', handleUnreadCountUpdated);
    };
  }, [socket, user, isOnMessagesPage, queryClient]);
}