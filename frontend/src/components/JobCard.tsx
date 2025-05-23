import _React from 'react';
import { Avatar } from './Avatar';
import { useNavigate, useLocation } from 'react-router-dom';

interface JobCardProps {
  id?: string;
  title?: string;
  deliveryTime?: number;
  budget?: number;
  clientId?: string;
  status?: string;
  hasApplications?: boolean;
  portfolio?: string;
  poster: {
    id: string;
    name?: string;
    avatarUrl?: string;
  }
  onDelete?: () => void;
}

export const JobCard = ({ 
  id,
  title, 
  deliveryTime, 
  budget, 
  clientId, 
  status, 
  poster, 
  hasApplications,
  portfolio,
  onDelete 
}: JobCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const inJobDetailsPage = location.pathname === `/jobs/${id}`;
  const fromAllJobsPage = location.state?.from === '/jobs';
  const inApplicationsPage = location.pathname === '/my-applications';
  const notInClientJobsPage = !clientId && poster;
  const inJobApplicationsPage = location.pathname.includes(`/applications/by-job/`);
  const inApplicationDetailsPage = location.pathname === `/applications/${id}`;

  const handleClick = (e: React.MouseEvent) => {
    if (inJobApplicationsPage && (e.target as HTMLElement).tagName !== 'A') {
      navigate(`/applications/${id}`, {
        state: { from: location.pathname }
      })
    } else if (inJobDetailsPage || (e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'A') {
      return;
    } else {
      navigate(`/jobs/${id}`, {
        state: { from: location.pathname }
      })
    }
  };

  return (
    <div 
      className={`bg-grey rounded-lg shadow-md p-4 ${
        !inJobDetailsPage && !inApplicationDetailsPage ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-4 items-center">
        {notInClientJobsPage && (
          <div className="flex flex-col items-center w-[120px]">
            <Avatar 
              src={poster?.avatarUrl}
              fallbackText={poster?.name?.split(' ').map(n => n[0]).join('') || ''}
              alt={poster?.name}
              className="mb-2 w-12 h-12"
            />
            <span className="text-sm text-gray-600 truncate w-full text-center">
              {poster?.name}
            </span>
          </div>
        )}
        {inJobApplicationsPage ? (
          <div className={`flex-1 min-w-0 pl-4 border-l border-gray-300`}>
            <a 
              href={portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {decodeURIComponent(portfolio?.split('__').pop()?.split('?')[0] || '')}
              </a>
          </div>
        ) : (
          <div className={`flex-1 min-w-0 ${!clientId ? 'pl-4 border-l border-gray-300' : ''}`}>
            <h3 className="text-lg font-semibold text-brand-primary-500 mb-3 truncate">
              {title}
            </h3>
            <div className="flex items-center gap-8">
              <div>Delivery time: {deliveryTime} days</div>
              {status && (!fromAllJobsPage || inApplicationsPage) && (
                <div>
                  Status: {status}
                </div>
              )}
              <span>
                Budget: ${budget}
              </span>
            </div>
          </div>
        )}
        {clientId && !inJobDetailsPage && !inJobApplicationsPage && (
          <div className="flex items-center">
            {hasApplications ? (
              <button 
                onClick={() => navigate(`/applications/by-job/${id}`)}
                className="px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
              >
                Applications
              </button>
            ) : (
              <button 
                onClick={onDelete}
                className="px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}