import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactElement<typeof LucideIcon>;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <div className="text-secondary-500 mb-6 flex justify-center">{icon}</div>
      <h3 className="text-2xl font-semibold text-white mb-4 text-center">{title}</h3>
      <p className="text-gray-300 text-center leading-relaxed">{description}</p>
    </div>
  );
}