/**
 * DF Mobile - Loading Screen Component
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { COLORS } from '../constants/colors';

const LoadingScreen = ({ message = 'Loading...' }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animation for spinner
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>DF</Text>
        </View>
      </Animated.View>

      <Text style={styles.brandName}>DF Mobile</Text>
      <Text style={styles.tagline}>Smart Choice, Better Life</Text>

      <View style={styles.spinnerContainer}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerInner} />
        </Animated.View>
      </View>

      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.neon,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 2,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 40,
    fontStyle: 'italic',
  },
  spinnerContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.neon,
  },
  spinnerInner: {
    position: 'absolute',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default LoadingScreen;
