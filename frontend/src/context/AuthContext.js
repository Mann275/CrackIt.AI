import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in by verifying token in local storage
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token with backend
          const response = await fetch('http://localhost:5001/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            credentials: 'include'
          }).catch(err => {
            console.error('Network error during token verification:', err);
            throw new Error('Unable to connect to the server');
          });
          
          let userData;
          try {
            userData = await response.json();
          } catch (err) {
            console.error('Error parsing verify response:', err);
            throw new Error('Invalid response from server');
          }

          if (response.ok && userData.user) {
            setUser(userData.user);
          } else {
            console.error('Token verification failed:', userData);
            // Token invalid, clear localStorage
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          // No token found
          setLoading(false);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Authentication failed. Please try again.');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email });
      
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      }).catch(err => {
        console.error('Network error during login:', err);
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Error parsing login response:', err);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      if (!response.ok) {
        console.error('Login failed:', data);
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      console.log('Login successful:', data);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting registration with:', { ...userData, password: '********' });
      
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      }).catch(err => {
        console.error('Network error during registration:', err);
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Error parsing registration response:', err);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      if (!response.ok) {
        console.error('Registration failed:', data);
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      console.log('Registration successful:', { ...data, user: { ...data.user, password: undefined } });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser({...user, ...data.user});
      return data.user;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message);
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return true;
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        register, 
        logout, 
        updateProfile, 
        changePassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
