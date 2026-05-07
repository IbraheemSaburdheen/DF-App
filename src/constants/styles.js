/**
 * DF Mobile - Common Styles
 * Shared style definitions for consistent UI across the app
 */

import { StyleSheet, Platform } from 'react-native';
import { COLORS } from './colors';

export const COMMON_STYLES = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  padded: {
    padding: 16,
  },
  paddedHorizontal: {
    paddingHorizontal: 16,
  },
  paddedVertical: {
    paddingVertical: 16,
  },

  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  cardElevated: {
    backgroundColor: COLORS.cardElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 12,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },

  // Typography
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  bodySecondary: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },

  // Buttons
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonOutline: {
    backgroundColor: COLORS.transparent,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: 'row',
  },
  buttonOutlineText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDanger: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDangerText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSmall: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmallText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Inputs
  input: {
    backgroundColor: COLORS.input,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    backgroundColor: COLORS.input,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },

  // Rows and layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badges
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.textDark,
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },

  // Error
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default COMMON_STYLES;
