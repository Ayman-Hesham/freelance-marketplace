import _React from 'react';
import { User } from 'lucide-react';

interface JobCardProps {
  title: string;
  posterName: string;
  deliveryTime: number;
  budget: number;
}

export function JobCard({ title, posterName, deliveryTime, budget }: JobCardProps) {
  return (
    <div className="bg-grey rounded-lg shadow-md p-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="bg-gray-200 rounded-full p-3 mb-2">
            <User className="w-6 h-6 text-gray-500" />
          </div>
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