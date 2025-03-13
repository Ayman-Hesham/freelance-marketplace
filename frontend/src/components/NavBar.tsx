import _React from 'react';
import { Search, FileText, MessageSquare, User } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-primary-500 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-6">
        <span className="text-secondary-500 text-xl font-semibold whitespace-nowrap mx-4">
          Freelance Marketplace
        </span>
        
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full px-4 py-2 rounded-lg pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center gap-8 mx-4">
          <button className="text-white hover:text-secondary-500 transition">
            <FileText className="w-6 h-6" />
          </button>
          <button className="text-white hover:text-secondary-500 transition">
            <MessageSquare className="w-6 h-6" />
          </button>
          <button className="text-white hover:text-secondary-500 transition">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}