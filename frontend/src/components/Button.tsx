import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        'px-6 py-3 rounded-lg transition flex items-center justify-center gap-2 group',
        variant === 'primary' 
          ? 'bg-primary-500 text-white hover:bg-primary-600' 
          : 'bg-secondary-500 text-white hover:bg-secondary-600',
        className
      )}
      {...props}
    >
      {children}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}