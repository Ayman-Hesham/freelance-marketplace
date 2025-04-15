import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X, Trash2, Save } from 'lucide-react';
import { Avatar } from '../Avatar';
import { User } from '../../types/auth.types';

interface EditProfileModalProps {
  user: User | null;
  onClose: () => void;
  onSubmit: (data: ProfileFormData) => void;
}

export interface ProfileFormData {
  name: string;
  bio: string;
  avatar?: File | null;
  portfolio?: File | null;
}

export function EditProfileModal({ user, onClose, onSubmit }: EditProfileModalProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profilePicture || null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioFileName, setPortfolioFileName] = useState<string | null>(
    user?.portfolio ? 'project-documentation.pdf' : null
  );
  
  const { 
    register, 
    handleSubmit,
    formState: { errors } 
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    }
  });

  const handleDeleteAvatar = () => {
    // Add API call to delete avatar
    console.log('Delete avatar');
    setAvatarPreview(null);
  };

  const handleChangeAvatar = () => {
    avatarInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image/jpeg|image/png')) {
        alert('Please select a valid image file (JPG or PNG)');
        return;
      }

      // Handle file upload - add API call here
      console.log('Upload file:', file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid document file (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX)');
        return;
      }

      setPortfolioFile(file);
      setPortfolioFileName(file.name);
      console.log('Selected portfolio file:', file);
    }
  };

  const handleDeletePortfolio = () => {
    setPortfolioFile(null);
    setPortfolioFileName(null);
    console.log('Delete portfolio file');
  };

  const onFormSubmit = (data: ProfileFormData) => {
    // Add avatar and portfolio to form data
    const formData: ProfileFormData = {
      ...data
    };
    
    // Only include these fields if they've changed
    if (avatarPreview !== user?.profilePicture) {
      formData.avatar = avatarInputRef.current?.files?.[0] || null;
    }
    
    if (portfolioFile) {
      formData.portfolio = portfolioFile;
    } else if (portfolioFileName === null && user?.portfolio) {
      // This means user has deleted their portfolio
      formData.portfolio = null;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 mb-4">
                <Avatar
                  src={avatarPreview || undefined}
                  alt={user?.name}
                  fallbackText={user?.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
                  size="large"
                  className="w-full h-full"
                />
              </div>
              
              <div className="flex flex-col gap-2 w-full">
                <button
                  type="button"
                  onClick={handleChangeAvatar}
                  className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Avatar
                </button>
                
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
                  disabled={!avatarPreview}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Avatar
                </button>
                
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png"
                  className="hidden"
                />
              </div>
            </div>
            
            {/* Profile Form */}
            <div className="col-span-2 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.name
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-primary-300"
                  } focus:outline-none focus:ring-2 focus:border-transparent`}
                  placeholder="John Doe"
                  {...register("name", {
                    required: "Name is required",
                    validate: (value) =>
                      value.replace(/\s+/g, "").length >= 3 ||
                      "Name must be at least 3 characters excluding spaces",
                    maxLength: {
                      value: 15,
                      message:
                        "Name must be less than 15 characters excluding spaces",
                    },
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.bio
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-primary-300"
                  } focus:outline-none focus:ring-2 focus:border-transparent resize-none max-h-60`}
                  placeholder="Tell us about yourself"
                  {...register("bio", {
                    required: "Bio is required",
                    minLength: {
                      value: 10,
                      message: "Bio must be at least 10 characters"
                    },
                    maxLength: {
                      value: 500,
                      message: "Bio must be less than 500 characters"
                    }
                  })}
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.bio.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2">
                    <span className="text-gray-800 text-sm truncate mr-2 max-w-[80%]">
                      {portfolioFileName || 'No file selected'}
                    </span>
                    <div className="flex items-center">
                      {portfolioFileName && (
                        <button
                          type="button"
                          onClick={handleDeletePortfolio}
                          className="text-red-500 hover:text-red-700 mr-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <label className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center">
                        <Upload className='h-5 w-5 mr-1' />
                        <span className="text-sm">Browse</span>
                        <input 
                          type="file"
                          ref={portfolioInputRef}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                          onChange={handlePortfolioChange}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Accepted file types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md mr-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 