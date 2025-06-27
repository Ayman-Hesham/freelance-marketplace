import React from 'react';
import { Search, FileText, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { useMessageNotifications } from '../../hooks/useMessageNotifications';

type Props = {}

export const Navbar = (_props: Props) => {
 const {user, logout} = useAuth();
 const { unreadCount } = useUnreadCount();
 useMessageNotifications();
 
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

 const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === 'Enter' && searchQuery.trim()) {
     navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
   }
 };

 const handleLogout = async () => {
   await logout();
   navigate('/'); 
 };

 const MessageIcon = () => (
   <Link to='/messages' data-tooltip-id="tooltip" data-tooltip-content="Messages">
     <div className="relative">
       <button className="text-white hover:text-secondary-500 transition">
         <MessageSquare className="w-6 h-6" />
       </button>
       {unreadCount > 0 && !window.location.pathname.includes('/messages') && (
         <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
           {unreadCount > 99 ? '99+' : unreadCount}
         </span>
       )}
     </div>
   </Link>
 );

  return (
    <nav className="bg-primary-500 py-3">
      <div className={`max-w-6xl mx-auto flex items-center justify-between gap-8 ${user?.role === 'admin' ? 'px-24' : 'px-6'}`}>
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

          {user?.role === 'admin' ? (
            <div className="flex items-center gap-8 mx-4">
              <button 
                onClick={handleLogout}
                className="text-white hover:text-secondary-500 transition"
                data-tooltip-id="tooltip"
                data-tooltip-content="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          ) : user?.role === 'client' ? (
            <div className="flex items-center gap-8 mx-4">
              <Link to='/my-jobs' data-tooltip-id="tooltip" data-tooltip-content="My Jobs">
                <button className="text-white hover:text-secondary-500 transition">
                  <FileText className="w-6 h-6" />
                </button>
              </Link>

              <MessageIcon />

              <Link to='/client-profile' data-tooltip-id="tooltip" data-tooltip-content="Profile">
                <button className="text-white hover:text-secondary-500 transition">
                  <User className="w-6 h-6" />
                </button>
              </Link>
            </div>
          ) : ( user?.role === 'freelancer' && (
            <div className="flex items-center gap-8 mx-4">
              <Link to='/my-applications' data-tooltip-id="tooltip" data-tooltip-content="My Applications">
                <button className="text-white hover:text-secondary-500 transition">
                  <FileText className="w-6 h-6" />
                </button>
              </Link>

              <MessageIcon />

              <Link to='/freelancer-profile' data-tooltip-id="tooltip" data-tooltip-content="Profile">
                <button className="text-white hover:text-secondary-500 transition">
                  <User className="w-6 h-6" />
                </button>
              </Link>
            </div>
          ))}
      </div>
      <Tooltip id="tooltip" place="bottom" />
    </nav>
  );
}
