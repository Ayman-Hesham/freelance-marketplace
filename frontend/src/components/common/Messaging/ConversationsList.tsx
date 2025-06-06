import { Conversation } from '../../../types/conversation.types';
import { ConversationItem } from './ConversationItem';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  className?: string;
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  className = ''
}: ConversationsListProps) {
  return (
    <div className={`divide-y divide-gray-100 overflow-y-auto ${className}`}>
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedConversationId === conversation.id}
          onSelect={onSelectConversation}
        />
      ))}
    </div>
  );
}