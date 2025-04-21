import _React, { useState, useEffect, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import { EditProfileModal } from '../../components/EditProfileModal';
import { getFileDownloadUrl } from '../../services/UserService';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import PulseLoader from 'react-spinners/PulseLoader';


export const FreelancerProfile = () => {
  const { user, logout, isLoading } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    async function loadAvatarUrl() {
      if (user?.avatar) {
          try {
            const response = await getFileDownloadUrl(user.avatar);
            if ('downloadUrl' in response) {
              setAvatarUrl(response.downloadUrl);
            }
          } catch (error) {
            console.error('Failed to load avatar URL:', error);
            setAvatarUrl(undefined);
          }
      }
    }
    loadAvatarUrl();
  }, [user?.avatar]);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = useCallback((wasUpdated = false) => {
    setIsEditModalOpen(false);
    if (wasUpdated) {
      setTimeout(() => {
        toast.success('Profile updated successfully');
      }, 100);
    }
  }, []);

  const handlePortfolioDownload = async () => {
    try {
      const response = await getFileDownloadUrl(user?.portfolio || '');
      if (!('downloadUrl' in response)) {
        throw new Error('Invalid response format');
      }

      window.open(response.downloadUrl, '_blank');
    } catch (error) {
      alert('Failed to open portfolio');
      console.error('Portfolio error:', error);
    }
  };

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      <div className="mt-24 p-4 flex justify-center">
        <div className="rounded-lg p-8 w-full max-w-4xl border border-gray-300">
          {/* Profile Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary-500">Profile</h1>
            <button 
              className="flex items-center text-blue-600"
              onClick={handleEditClick}
            >
              <Pencil className='h-5 w-5 mr-1' />
              Edit
            </button>
          </div>
          
          {/* Profile Section */}
          <div className="flex items-center mb-6">
            <Avatar
              src={avatarUrl}
              alt={user?.name}
              fallbackText={user?.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
              size="large"
            />
            <div className="ml-4">
              <h2 className="text-xl font-medium">{user?.name}</h2>
            </div>
          </div>

          <div className="border-t border-gray-300 my-6"></div>

          {/* Bio Section */}
          <div className="mb-6">
            <h2 className="font-medium mb-2 text-gray-700">Bio</h2>
            <div className="border border-gray-300 p-4 rounded-md">
              <p className="text-gray-800">{user?.bio}</p>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="mb-12">
            <h2 className="font-medium mb-2 text-gray-700">Portfolio</h2>
            <div className="border border-gray-300 p-4 rounded-md">
              {user?.portfolio ? (
                <div className="flex items-center">
                  <button 
                    onClick={handlePortfolioDownload}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {user.portfolio.split('__').pop()}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">No file uploaded</span>
                </div>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-300 pt-6">
          <button 
              className="mx-auto block bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={logout}
              disabled={isLoading}
            >
              {isLoading ? (
                <PulseLoader
                  color="#ffffff"
                  size={10}
                />
              ) : (
                'Logout'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal 
          user={user}
          onClose={handleCloseModal}
          initialAvatarUrl={avatarUrl}
          userRole="freelancer"
        />
      )}
    </>
  )
}
