import { Conversation } from '../../../types/conversation.types';
import { Avatar } from '../Avatar';
import { formatMessageDate } from '../../../utils/date.utils';
import { useAuth } from '../../../context/AuthContext';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  const { user } = useAuth();
  
  const otherUser = conversation.clientId.id === user?.id 
    ? conversation.freelancerId 
    : conversation.clientId;

  const lastMessage = conversation.lastMessage?.[0];
  
  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar 
            src={otherUser.avatar}
            alt={otherUser.name}
            fallbackText={otherUser.name.substring(0, 2).toUpperCase()}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate">{otherUser.name}</h3>
            <span className="text-xs text-gray-500">
              {lastMessage?.createdAt && formatMessageDate(lastMessage.createdAt)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">
              {lastMessage?.content || ''}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}