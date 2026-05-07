/**
 * DF Mobile - Header Component
 * Reusable header with back button, title, and optional right action
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';

const Header = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  rightLabel,
  onRightPress,
  showLogo = false,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        transparent && styles.transparent,
        { paddingTop: insets.top + 8 },
      ]}
    >
      <View style={styles.content}>
        {/* Left side - back button or logo */}
        <View style={styles.leftSection}>
          {onBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : showLogo ? (
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>DF</Text>
              </View>
              <View style={styles.logoTextContainer}>
                <Text style={styles.brandName}>DF Mobile</Text>
                <Text style={styles.tagline}>Smart Choice, Better Life</Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Center - title (only if no logo) */}
        {!showLogo && title && (
          <View style={styles.centerSection}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>
        )}

        {/* Right side - action button */}
        <View style={styles.rightSection}>
          {onRightPress ? (
            <TouchableOpacity
              style={styles.rightButton}
              onPress={onRightPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {rightIcon && (
                <Icon name={rightIcon} size={24} color={COLORS.primary} />
              )}
              {rightLabel && (
                <Text style={styles.rightLabel}>{rightLabel}</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>

      {/* Bottom border */}
      {!transparent && <View style={styles.border} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rightLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  placeholder: {
    width: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.neon,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 1,
  },
  logoTextContainer: {
    gap: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 10,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  border: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
});

export default Header;
