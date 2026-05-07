/**
 * DF Mobile - Root Navigator
 * Switches between Auth, User, and Admin navigators based on auth state and role
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingScreen from '../components/LoadingScreen';
import { COLORS } from '../constants/colors';

const RootNavigator = () => {
  const { user, userRole, loading, initializing } = useAuth();

  // Show loading screen while Firebase is initializing
  if (initializing || loading) {
    return <LoadingScreen />;
  }

  // No user - show auth screens
  if (!user) {
    return <AuthNavigator />;
  }

  // User is logged in, show role-based navigator
  // While role is being fetched, show loading
  if (!userRole) {
    return <LoadingScreen />;
  }

  // Admin role
  if (userRole === 'admin') {
    return <AdminNavigator />;
  }

  // Default user role
  return <UserNavigator />;
};

export default RootNavigator;
