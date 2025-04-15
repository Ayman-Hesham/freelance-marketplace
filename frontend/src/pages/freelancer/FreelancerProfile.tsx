import _React, { useState } from 'react';
import { Navbar } from '../../components/NavBar';
import { Pencil } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import { EditProfileModal, ProfileFormData } from '../../components/profile/EditProfileModal';

type Props = {}

export const FreelancerProfile = (_props: Props) => {
  const { user, logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bio, setBio] = useState(user?.bio || 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.');
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture);
  const [hasPortfolio, setHasPortfolio] = useState<boolean>(!!user?.portfolio);
  
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleUpdateProfile = (data: ProfileFormData) => {
    console.log('Update profile with data:', data);
    
    // Update local state with new values
    if (data.name) {
      // This would need API integration to fully update the user object
      console.log('New name:', data.name);
    }
    
    setBio(data.bio);
    
    if (data.avatar !== undefined) {
      if (data.avatar === null) {
        // User deleted their avatar
        setAvatarUrl(undefined);
      } else {
        // Handle file upload first (with API) then update UI
        // For now, we're just simulating a URL for the new image
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setAvatarUrl(reader.result);
          }
        };
        reader.readAsDataURL(data.avatar);
      }
    }
    
    if (data.portfolio !== undefined) {
      // Update portfolio status
      setHasPortfolio(data.portfolio !== null);
      
      if (data.portfolio) {
        // Handle portfolio file upload (with API)
        console.log('New portfolio file:', data.portfolio.name);
      }
    }
    
    handleCloseModal();
  };

  return (
    <>
      <Navbar />
      <div className="mt-24 p-4 flex justify-center">
        <div className="bg-gray-200 rounded-lg p-8 w-full max-w-4xl">
          {/* Profile Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
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
            <div className="bg-white p-4 rounded-md">
              <p className="text-gray-800">{bio}</p>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="mb-6">
            <h2 className="font-medium mb-2 text-gray-700">Portfolio</h2>
            <div className="bg-white p-4 rounded-md">
              {hasPortfolio ? (
                <div className="flex items-center">
                  <span className="text-gray-700 mr-2">Portfolio:</span>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      // Replace this with actual download logic when integrated with backend
                      console.log('Downloading portfolio file');
                      // Example download implementation (when API is ready):
                      // const link = document.createElement('a');
                      // link.href = URL_TO_PORTFOLIO_FILE;
                      // link.download = 'project-documentation.pdf';
                      // document.body.appendChild(link);
                      // link.click();
                      // document.body.removeChild(link);
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    project-documentation.pdf
                  </a>
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
              className="mx-auto block bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-2 rounded-md transition-colors"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal 
          user={user}
          onClose={handleCloseModal}
          onSubmit={handleUpdateProfile}
        />
      )}
    </>
  )
}
