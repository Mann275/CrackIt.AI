import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { darkMode } = useTheme();
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [profileTab, setProfileTab] = useState('general');
  const [generalInfo, setGeneralInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [photoURL, setPhotoURL] = useState(
    user?.photoURL || 'https://placehold.co/200x200/1e40af/ffffff?text=User'
  );
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleTabChange = (tab) => {
    setProfileTab(tab);
    setMessage({ text: '', type: '' });
  };

  const handleGeneralInfoChange = (e) => {
    setGeneralInfo({
      ...generalInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoURL(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGeneralInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name: generalInfo.name });
      setMessage({ 
        text: 'Profile updated successfully!', 
        type: 'success' 
      });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMessage({ 
        text: err.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ 
        text: 'New passwords do not match', 
        type: 'error' 
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage({ 
        text: 'Password must be at least 8 characters long', 
        type: 'error' 
      });
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setMessage({ 
        text: 'Password changed successfully!', 
        type: 'success' 
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setMessage({ 
        text: err.message || 'Failed to change password', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadedImage) {
      setMessage({ 
        text: 'Please select an image to upload', 
        type: 'error' 
      });
      return;
    }
    
    setLoading(true);
    
    // This is a placeholder for actual photo upload functionality
    // In a real implementation, you would upload to a server/cloud storage
    setTimeout(() => {
      try {
        // Simulating successful upload
        setMessage({ 
          text: 'Profile photo updated successfully!', 
          type: 'success' 
        });
        // In a real implementation, you would update the user's photoURL in the database
      } catch (err) {
        setMessage({ 
          text: 'Failed to update profile photo', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
              : darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                profileTab === 'general' 
                  ? darkMode ? 'bg-gray-700 border-b-2 border-blue-500' : 'bg-gray-50 border-b-2 border-blue-500' 
                  : ''
              }`}
              onClick={() => handleTabChange('general')}
            >
              General
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                profileTab === 'password' 
                  ? darkMode ? 'bg-gray-700 border-b-2 border-blue-500' : 'bg-gray-50 border-b-2 border-blue-500' 
                  : ''
              }`}
              onClick={() => handleTabChange('password')}
            >
              Password
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                profileTab === 'photo' 
                  ? darkMode ? 'bg-gray-700 border-b-2 border-blue-500' : 'bg-gray-50 border-b-2 border-blue-500' 
                  : ''
              }`}
              onClick={() => handleTabChange('photo')}
            >
              Profile Photo
            </button>
          </div>
          
          {/* General Settings */}
          {profileTab === 'general' && (
            <div className="p-6">
              <form onSubmit={handleGeneralInfoSubmit}>
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={generalInfo.name}
                    onChange={handleGeneralInfoChange}
                    className={`w-full px-4 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={generalInfo.email}
                    onChange={handleGeneralInfoChange}
                    className={`w-full px-4 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-400' 
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    } border focus:outline-none`}
                    disabled
                  />
                  <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Email cannot be changed for security reasons
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-md font-medium ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Password Settings */}
          {profileTab === 'password' && (
            <div className="p-6">
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-6">
                  <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    minLength={8}
                  />
                  <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Password must be at least 8 characters long
                  </p>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-md font-medium ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Changing Password...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Profile Photo */}
          {profileTab === 'photo' && (
            <div className="p-6">
              <form onSubmit={handlePhotoSubmit}>
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-6 md:mb-0">
                    <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-blue-500">
                      <img
                        src={photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 md:pl-8">
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Upload New Photo
                      </label>
                      <input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className={`block w-full text-sm ${
                          darkMode 
                            ? 'text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-white'
                            : 'text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700'
                        }`}
                      />
                      <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        PNG, JPG or GIF up to 5MB
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className={`px-6 py-2 rounded-md font-medium ${
                          darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        disabled={loading || !uploadedImage}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                            Uploading...
                          </div>
                        ) : (
                          'Update Photo'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
