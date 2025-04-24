import React from 'react';
import { Search, FileText, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';


type Props = {}

export const Navbar = (_props: Props) => {
 const {user} = useAuth();
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

 const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === 'Enter' && searchQuery.trim()) {
     navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
   }
 };

  return (
    <nav className="bg-primary-500 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-6">
        <Link to='/jobs' data-tooltip-id="tooltip" data-tooltip-content="Jobs list">
          <span className="text-secondary-500 text-xl font-semibold whitespace-nowrap mx-4">
            Freelance Marketplace
          </span>
        </Link>
        
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search jobs..."
              className="w-full px-4 py-2 rounded-lg pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

          {user?.role === 'client' ? (
            <div className="flex items-center gap-8 mx-4">
              <Link to='/my-jobs' data-tooltip-id="tooltip" data-tooltip-content="My Jobs">
                <button className="text-white hover:text-secondary-500 transition">
                  <FileText className="w-6 h-6" />
                </button>
              </Link>

              <Link to='/' data-tooltip-id="tooltip" data-tooltip-content="Messages">
                <button className="text-white hover:text-secondary-500 transition">
                  <MessageSquare className="w-6 h-6" />
                </button>
              </Link>

              <Link to='/client-profile' data-tooltip-id="tooltip" data-tooltip-content="Profile">
                <button className="text-white hover:text-secondary-500 transition">
                  <User className="w-6 h-6" />
                </button>
              </Link>
            </div>
          ):(
            <div className="flex items-center gap-8 mx-4">
              <Link to='/' data-tooltip-id="tooltip" data-tooltip-content="My Applications">
                <button className="text-white hover:text-secondary-500 transition">
                  <FileText className="w-6 h-6" />
                </button>
              </Link>

              <Link to='/' data-tooltip-id="tooltip" data-tooltip-content="Messages">
                <button className="text-white hover:text-secondary-500 transition">
                  <MessageSquare className="w-6 h-6" />
                </button>
              </Link>

              <Link to='/freelancer-profile' data-tooltip-id="tooltip" data-tooltip-content="Profile">
                <button className="text-white hover:text-secondary-500 transition">
                  <User className="w-6 h-6" />
                </button>
              </Link>
            </div>
          )}
      </div>
      <Tooltip id="tooltip" place="bottom" />
    </nav>
  );
}