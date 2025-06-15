import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConversations } from '../services/conversation.service';
import { useAuth } from './useAuth';
import { useLocation } from 'react-router-dom';

export function useUnreadCount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const isOnMessagesPage = location.pathname === '/messages';

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      if (isOnMessagesPage) return 0;
      
      const conversations = await getConversations();
      if ('message' in conversations) return 0;
      
      return conversations.reduce((total, conv) => 
        total + (conv.unreadCount?.[user?.id || ''] || 0), 0
      );
    },
    enabled: !!user,
    staleTime: 0, 
    gcTime: 0  
  });

  const incrementUnreadCount = () => {
    queryClient.setQueryData(['unreadCount'], (old: number = 0) => old + 1);
  };

  const resetUnreadCount = () => {
    queryClient.setQueryData(['unreadCount'], 0);
  };

  return { unreadCount, incrementUnreadCount, resetUnreadCount };
}