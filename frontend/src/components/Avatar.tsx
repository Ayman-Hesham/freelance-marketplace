import * as RadixAvatar from '@radix-ui/react-avatar';
import { AvatarProps } from '../types/auth.types';

export function Avatar({ 
  src, 
  alt = 'Avatar', 
  fallbackText = 'US', 
  className = '',
  size = 'default'
}: AvatarProps) {
  const sizeClasses = {
    default: 'w-12 h-12',
    large: 'w-32 h-32',   
  };

  const sizeClass = sizeClasses[size];
  
  return (
    <RadixAvatar.Root 
      className={`${sizeClass} rounded-full flex items-center justify-center overflow-hidden bg-gray-300 ${className}`}
    >
      <RadixAvatar.Image 
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
      />
      <RadixAvatar.Fallback 
        className="text-white bg-primary-500 w-full h-full flex items-center justify-center font-medium"
        delayMs={600}
      >
        {fallbackText}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}