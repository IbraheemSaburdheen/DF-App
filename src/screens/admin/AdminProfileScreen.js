/**
 * DF Mobile - Admin Profile Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import { COLORS } from '../../constants/colors';

const AdminProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of the admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logoutUser();
            } catch (err) {
              Alert.alert('Error', 'Could not sign out. Please try again.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const displayName = userProfile?.name || user?.displayName || 'Admin';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const adminMenu = [
    {
      section: 'Management',
      items: [
        { icon: 'package-variant', label: 'Manage Products', onPress: () => navigation.navigate('ManageProducts') },
        { icon: 'clipboard-list', label: 'Manage Orders', onPress: () => navigation.navigate('ManageOrders') },
        { icon: 'account-group', label: 'Manage Users', onPress: () => navigation.navigate('ManageUsers') },
      ],
    },
    {
      section: 'System',
      items: [
        { icon: 'shield-check-outline', label: 'Privacy Policy', onPress: () => {} },
        { icon: 'information-outline', label: 'About DF Mobile', onPress: () => {} },
        { icon: 'help-circle-outline', label: 'Support', onPress: () => {} },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>DF</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Admin Profile</Text>
        </View>

        {/* Avatar Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.adminIndicator}>
              <Icon name="shield-account" size={14} color={COLORS.textDark} />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.displayEmail}>{displayEmail}</Text>

            <View style={styles.badgeRow}>
              <View style={styles.adminBadge}>
                <Icon name="shield-account" size={12} color={COLORS.primary} />
                <Text style={styles.adminBadgeText}>Administrator</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Icon name="check-decagram" size={12} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Admin Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Icon name="view-dashboard" size={20} color={COLORS.primary} />
            <Text style={styles.statLabel}>Dashboard Access</Text>
            <View style={styles.statStatus}>
              <Icon name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.statStatusText}>Active</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="database" size={20} color={COLORS.primary} />
            <Text style={styles.statLabel}>Full Data Access</Text>
            <View style={styles.statStatus}>
              <Icon name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.statStatusText}>Enabled</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="account-cog" size={20} color={COLORS.primary} />
            <Text style={styles.statLabel}>User Management</Text>
            <View style={styles.statStatus}>
              <Icon name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.statStatusText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {adminMenu.map((section) => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIconBg}>
                      <Icon name={item.icon} size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  {index < section.items.length - 1 && <View style={styles.menuDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Account Info */}
        <View style={styles.infoCard}>
          <Text style={styles.menuSectionTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <Icon name="email-outline" size={16} color={COLORS.textMuted} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{displayEmail}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Icon name="account-outline" size={16} color={COLORS.textMuted} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Display Name</Text>
              <Text style={styles.infoValue}>{displayName}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Icon name="shield-check" size={16} color={COLORS.textMuted} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Access Level</Text>
              <Text style={[styles.infoValue, { color: COLORS.primary }]}>Administrator</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && styles.logoutDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator color={COLORS.error} size="small" />
          ) : (
            <>
              <Icon name="logout" size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Sign Out of Admin Panel</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>DF Mobile Admin v1.0.0 · Smart Choice, Better Life</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logoRow: {
    marginBottom: 4,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.neon,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  adminIndicator: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  displayEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  adminBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  verifiedText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
  statStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statStatusText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 12,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    gap: 8,
    marginBottom: 12,
  },
  logoutDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
});

export default AdminProfileScreen;
