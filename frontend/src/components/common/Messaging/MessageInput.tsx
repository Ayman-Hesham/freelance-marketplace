import { Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useMessage } from '../../../hooks/useMessage';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  conversationId: string;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, conversationId, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { startTyping, stopTyping } = useMessage();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = () => {
    startTyping(conversationId);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(conversationId);
    };
  }, [conversationId, stopTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSendMessage(message);
    setMessage('');
    stopTyping(conversationId);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 rounded-b-lg">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={disabled}
          placeholder={disabled ? "Reconnecting..." : "Type a message..."}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}