import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();

  const handleBack = () => {
    if (location.pathname === '/login' || location.pathname === '/register') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`absolute top-4 left-4 p-2 rounded-lg transition-colors flex items-center hover:scale-105 ${
        darkMode
          ? 'text-gray-300 hover:bg-gray-800/50'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <ArrowLeftIcon className="h-5 w-5 mr-1" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;