/**
 * DF Mobile - Authentication Context
 * Manages user auth state and role throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        setUserRole(data.role || 'user');
        setUserProfile(data);
      } else {
        // Document doesn't exist, default to user role
        setUserRole('user');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserRole('user');
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  const isAdmin = userRole === 'admin';

  const value = {
    user,
    userRole,
    userProfile,
    loading,
    initializing,
    isAdmin,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
