/**
 * DF Mobile - Authentication Service
 * Handles login, register, logout, and user profile operations
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Register a new user with email and password
 * Creates a Firestore user document with role assignment
 */
export const registerUser = async (email, password, name) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Update display name
    await user.updateProfile({ displayName: name });

    // Determine role - admin if email contains admin@dfmobile
    const role = email.includes('admin@dfmobile') ? 'admin' : 'user';

    // Create Firestore user document
    await firestore().collection('users').doc(user.uid).set({
      email,
      name,
      role,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      phone: '',
      address: '',
      avatar: '',
    });

    return { user, role };
  } catch (error) {
    throw error;
  }
};

/**
 * Login with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  try {
    const doc = await firestore().collection('users').doc(uid).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (uid, profileData) => {
  try {
    await firestore().collection('users').doc(uid).update({
      ...profileData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update display name if provided
    if (profileData.name) {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.updateProfile({ displayName: profileData.name });
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error) {
    throw error;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  try {
    const snapshot = await firestore()
      .collection('users')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (uid, role) => {
  try {
    await firestore().collection('users').doc(uid).update({
      role,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Format Firebase auth errors to user-friendly messages
 */
export const formatAuthError = (error) => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};
