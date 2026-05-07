/**
 * DF Mobile - Register Screen
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { registerUser, formatAuthError } from '../../services/authService';
import { COLORS } from '../../constants/colors';

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const validateForm = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters)');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create auth user and Firestore document
      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim().toLowerCase(),
        password
      );
      const user = userCredential.user;

      // Update display name
      await user.updateProfile({ displayName: name.trim() });

      // Determine role
      const role = email.trim().toLowerCase().includes('admin@dfmobile') ? 'admin' : 'user';

      // Create Firestore user document
      await firestore().collection('users').doc(user.uid).set({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        phone: '',
        address: '',
        avatar: '',
      });

      // Auth state change will trigger RootNavigator to show appropriate screen
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (config) => {
    const { icon, label, value, onChangeText, placeholder, ref: inputRef, nextRef, keyboardType, secureEntry, showToggle, onToggle, returnKeyType } = config;
    const isFocused = focused === label;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
          <Icon name={icon} size={20} color={isFocused ? COLORS.primary : COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            value={value}
            onChangeText={(text) => { onChangeText(text); setError(''); }}
            keyboardType={keyboardType || 'default'}
            autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
            autoCorrect={false}
            secureTextEntry={secureEntry}
            returnKeyType={returnKeyType || 'next'}
            onFocus={() => setFocused(label)}
            onBlur={() => setFocused('')}
            onSubmitEditing={() => nextRef?.current?.focus()}
          />
          {showToggle && (
            <TouchableOpacity onPress={onToggle} style={styles.eyeButton}>
              <Icon name={!secureEntry ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>DF</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join DF Mobile today</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          {renderInput({
            icon: 'account-outline',
            label: 'Full Name',
            value: name,
            onChangeText: setName,
            placeholder: 'Enter your full name',
            nextRef: emailRef,
          })}

          {/* Email */}
          {renderInput({
            icon: 'email-outline',
            label: 'Email Address',
            value: email,
            onChangeText: setEmail,
            placeholder: 'Enter your email',
            ref: emailRef,
            nextRef: passwordRef,
            keyboardType: 'email-address',
          })}

          {/* Password */}
          {renderInput({
            icon: 'lock-outline',
            label: 'Password',
            value: password,
            onChangeText: setPassword,
            placeholder: 'Create a password (min 6 chars)',
            ref: passwordRef,
            nextRef: confirmPasswordRef,
            secureEntry: !showPassword,
            showToggle: true,
            onToggle: () => setShowPassword(!showPassword),
          })}

          {/* Confirm Password */}
          {renderInput({
            icon: 'lock-check-outline',
            label: 'Confirm Password',
            value: confirmPassword,
            onChangeText: setConfirmPassword,
            placeholder: 'Re-enter your password',
            ref: confirmPasswordRef,
            secureEntry: !showConfirmPassword,
            showToggle: true,
            onToggle: () => setShowConfirmPassword(!showConfirmPassword),
            returnKeyType: 'done',
          })}

          {/* Admin hint */}
          <View style={styles.hintBox}>
            <Icon name="information-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.hintText}>
              Tip: Use an email containing "admin@dfmobile" to register as admin
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textDark} size="small" />
            ) : (
              <>
                <Icon name="account-plus" size={20} color={COLORS.textDark} />
                <Text style={styles.registerButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoRow: {
    flex: 1,
    alignItems: 'center',
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.neon,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 1,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
  },
  inputIcon: {
    marginHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  eyeButton: {
    padding: 14,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.cardElevated,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    gap: 6,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPrompt: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
