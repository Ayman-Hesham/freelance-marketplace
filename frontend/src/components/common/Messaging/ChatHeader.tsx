import { Avatar } from '../Avatar';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  online?: boolean;
  typing?: boolean;
}

export const ChatHeader = ({ name, avatar, online, typing }: ChatHeaderProps) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between rounded-t-lg">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar 
            src={avatar}
            alt={name}
            fallbackText={name.substring(0, 2).toUpperCase()}
            size="default"
          />
          {online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">
            {typing ? 'Typing...' : online ? 'Online' : 'Last seen recently'}
          </p>
        </div>
      </div>
    </div>
  );
}