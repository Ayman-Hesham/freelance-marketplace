import _React from 'react';
import { Avatar } from './Avatar';

interface JobCardProps {
  title: string;
  posterName: string;
  deliveryTime: number;
  budget: number;
  posterAvatar?: string;
}

export const JobCard = ({ title, posterName, deliveryTime, budget, posterAvatar }: JobCardProps) => {
  return (
    <div className="bg-grey rounded-lg shadow-md p-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <Avatar 
            src={posterAvatar}
            fallbackText={posterName.split(' ').map(n => n[0]).join('')}
            alt={posterName}
            className="mb-2"
          />
          <span className="text-sm text-gray-600">{posterName}</span>
        </div>
        <div className="flex-1 pl-4 border-l border-gray-200">
          <h3 className="text-lg font-semibold text-brand-primary-500 mb-3">
            {title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Delivery time: {deliveryTime} days</span>
            <span className="text-secondary-500 font-semibold">
              Budget: ${budget}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}