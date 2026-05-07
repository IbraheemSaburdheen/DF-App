/**
 * Firebase Configuration
 *
 * IMPORTANT: Replace the placeholder values below with your actual Firebase project config.
 * You can find these values in your Firebase Console:
 * Project Settings -> General -> Your Apps -> Firebase SDK snippet -> Config
 *
 * Steps to set up Firebase:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project or use an existing one
 * 3. Add an Android/iOS app to your project
 * 4. Download and place the google-services.json (Android) or GoogleService-Info.plist (iOS)
 *    in the appropriate native directories
 * 5. Replace the placeholder values below with your actual config
 *
 * For @react-native-firebase, the config is primarily read from native files,
 * but we export these for reference and potential web usage.
 */

// NOTE: With @react-native-firebase, the actual Firebase initialization happens
// natively via google-services.json (Android) and GoogleService-Info.plist (iOS).
// The JS config below is for reference only.
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Export Firebase services - these are automatically initialized by @react-native-firebase
// using the native config files (google-services.json / GoogleService-Info.plist)
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export { auth, firestore, storage };

export default firebaseConfig;
