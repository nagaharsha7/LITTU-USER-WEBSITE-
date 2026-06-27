import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Subscribe to auth state updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.warn("User Auth initialization timed out. Bypassing load screen.");
      setLoading(false);
    }, 3500);

    const unsubscribe = authService.onAuthStateChanged((user) => {
      clearTimeout(timeoutId);
      setCurrentUser(user);
      setLoading(false);
      setAuthError(null);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      setLoading(true);
      setAuthError(null);
      const user = await authService.login(email, password, rememberMe);
      setCurrentUser(user);
      return user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, phone, email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      const user = await authService.register(name, phone, email, password);
      setCurrentUser(user);
      return user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setCurrentUser(null);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const updateProfile = async (name, phone) => {
    if (!currentUser) throw new Error("No authenticated user");
    try {
      const updated = await authService.updateProfile(currentUser.uid, name, phone);
      setCurrentUser(prev => ({ ...prev, ...updated }));
      return updated;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const updatePasswordSecure = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const verifyEmailMock = async () => {
    if (!currentUser) return;
    try {
      await authService.verifyEmailMock(currentUser.uid);
      setCurrentUser(prev => ({ ...prev, emailVerified: true }));
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    authError,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    updatePasswordSecure,
    verifyEmailMock
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
