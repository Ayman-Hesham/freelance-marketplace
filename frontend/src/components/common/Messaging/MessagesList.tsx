import { useAuth } from '../../../context/AuthContext';
import { Message } from '../../../types/message.types';
import { formatMessageDate } from '../../../utils/date.utils';

interface MessagesListProps {
    messages: Message[];
    messagesEndRef: React.RefObject<HTMLDivElement>;
  }
 
export const MessagesList = ({ messages, messagesEndRef }: MessagesListProps) => {
  const { user } = useAuth();
  
  const getMessageStatusIndicator = (message: Message) => {
    switch (message.status) {
      case 'sending':
        return <span className="text-gray-400 text-xs">Sending...</span>;
      case 'failed':
        return <span className="text-red-500 text-xs">Failed to send</span>;
      case 'sent':
        return <span className="text-gray-400 text-xs">Sent</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.senderId.id === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            message.senderId.id === user?.id
              ? 'bg-primary-500 text-white'
              : 'bg-white text-black border border-gray-600'
          }`}>
            <p className="text-sm">{message.content}</p>
            <div className="flex items-center justify-end gap-2 mt-1">
              {getMessageStatusIndicator(message)}
              <p className={`text-xs ${
                message.senderId.id === user?.id ? 'text-white' : 'text-gray-500'
              }`}>
                {formatMessageDate(message.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}