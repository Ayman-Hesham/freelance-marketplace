import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X, Trash2, Save } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { User } from '../../types/auth.types';
import { ProfileFormData } from '../../types/profile.types';
import { useAuth } from '../../hooks/useAuth';
import { PulseLoader } from 'react-spinners';

interface EditProfileModalProps {
  user: User | null;
  onClose: (wasUpdated?: boolean) => void;
  userRole: 'client' | 'freelancer';
}

export function EditProfileModal({ user, onClose, userRole }: EditProfileModalProps) {
  const { updateUser, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioFileName, setPortfolioFileName] = useState<string | null>(
    user?.portfolio ? decodeURIComponent(user.portfolio.split('__').pop()?.split('?')[0] || '') : null
  );

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    }
  });


  const onFormSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      if (data.name !== user?.name && data.name) {
        formData.append('name', data.name);
      }
      
      if (data.bio !== user?.bio && data.bio) {
        formData.append('bio', data.bio);
      }
      
      if (avatarPreview !== user?.avatar) {
        const avatarFile = avatarInputRef.current?.files?.[0];
        if (avatarFile) {
          formData.append('avatar', avatarFile);
        } else if (avatarPreview === null) {
          formData.append('avatar', 'null');
        }
      }

      if (portfolioFile) {
        formData.append('portfolio', portfolioFile);
      } else if (portfolioFileName === null && user?.portfolio) {
        formData.append('portfolio', 'null');
      }

      await updateUser(formData);
      setIsSubmitting(false);
      onClose(true);
    } catch (error) {
      console.error('Update error:', error);
      setIsSubmitting(false);
    }
  };

  const validateFileType = (file: File, allowedTypes: string[], errorMessage: string): boolean => {
    if (!allowedTypes.includes(file.type)) {
      alert(errorMessage);
      return false;
    }
    return true;
  };

  const validateFileSize = (file: File, maxSize: number, errorMessage: string): boolean => {
    if (file.size > maxSize) {
      alert(errorMessage);
      return false;
    }
    return true;
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!validateFileType(file, allowedTypes, 'Please select a valid image file (JPG or PNG)')) {
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.onerror = () => {
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handlePortfolioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 16 * 1024 * 1024;
      
      if (!validateFileSize(file, maxSize, 'File size must be less than 16MB')) {
        event.target.value = '';
        return;
      }

      setPortfolioFile(file);
      setPortfolioFileName(file.name);
    }
  };

  const handleDeletePortfolio = () => {
    setPortfolioFile(null);
    setPortfolioFileName(null);
    if (portfolioInputRef.current) {
      portfolioInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full">
        <button 
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <Avatar
                src={avatarPreview || undefined}
                alt={user?.name || ''}
                fallbackText={user?.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
                size="large"
                className="w-32 h-32 mb-4"
              />
              
              <div className="flex flex-col gap-2 w-full">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
                  disabled={isSubmitting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Avatar
                </button>
                
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Avatar
                  </button>
                )}
                
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  accept="image/jpeg, image/png"
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="col-span-2 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 3, message: "Name must be at least 3 characters" },
                    maxLength: { value: 15, message: "Name must be less than 15 characters" }
                  })}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.bio ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32`}
                  {...register("bio", {
                    maxLength: { value: 1000, message: "Bio must be less than 1000 characters" }
                  })}
                  disabled={isSubmitting}
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>
              
              {userRole === 'freelancer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio
                  </label>
                  <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2">
                    <span className="text-gray-800 text-sm truncate mr-2">
                      {portfolioFileName || 'No file selected'}
                    </span>
                    <div className="flex items-center gap-2">
                      {portfolioFileName && (
                        <button
                          type="button"
                          onClick={handleDeletePortfolio}
                          className="text-red-500 hover:text-red-700"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => portfolioInputRef.current?.click()}
                        className="text-blue-500 hover:text-blue-700"
                        disabled={isSubmitting}
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={portfolioInputRef}
                    onChange={handlePortfolioChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum file size: 16MB
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting || isLoading ? (
                <PulseLoader
                  color="#222E50"
                  size={10}
                />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 