/**
 * DF Mobile - Root App Component
 * Handles navigation container and auth state listener
 */

import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/colors';

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar
              barStyle="light-content"
              backgroundColor={COLORS.background}
            />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
