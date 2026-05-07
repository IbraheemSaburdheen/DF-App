/**
 * DF Mobile - Profile Screen
 * User profile view with logout
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
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { logoutUser, updateUserProfile } from '../../services/authService';
import { COLORS } from '../../constants/colors';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || user?.displayName || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editAddress, setEditAddress] = useState(userProfile?.address || '');

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
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

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      Alert.alert('Validation Error', 'Please enter a valid name (minimum 2 characters).');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
      await refreshUserProfile();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = userProfile?.name || user?.displayName || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const menuItems = [
    {
      icon: 'package-variant',
      label: 'My Orders',
      sublabel: 'View your order history',
      action: () => {},
    },
    {
      icon: 'heart-outline',
      label: 'Wishlist',
      sublabel: 'Saved items',
      action: () => {},
    },
    {
      icon: 'map-marker-outline',
      label: 'Delivery Address',
      sublabel: userProfile?.address || 'Add your address',
      action: () => setEditing(true),
    },
    {
      icon: 'shield-check-outline',
      label: 'Privacy Policy',
      sublabel: 'Read our privacy policy',
      action: () => {},
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      sublabel: 'Get help with your orders',
      action: () => {},
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            <Icon name={editing ? 'close' : 'pencil'} size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.displayEmail}>{displayEmail}</Text>
          <View style={styles.roleBadge}>
            <Icon name="account" size={14} color={COLORS.primary} />
            <Text style={styles.roleText}>Customer</Text>
          </View>
        </View>

        {editing ? (
          /* Edit Form */
          <View style={styles.editCard}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Icon name="account-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your full name"
                  placeholderTextColor={COLORS.textMuted}
                  color={COLORS.textPrimary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Icon name="phone-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  color={COLORS.textPrimary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Delivery Address</Text>
              <View style={[styles.inputWrapper, { alignItems: 'flex-start' }]}>
                <Icon name="map-marker-outline" size={18} color={COLORS.textMuted} style={[styles.inputIcon, { marginTop: 14 }]} />
                <TextInput
                  style={[styles.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 14 }]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Street, City, State, ZIP"
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  color={COLORS.textPrimary}
                />
              </View>
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.textDark} size="small" />
                ) : (
                  <>
                    <Icon name="check" size={18} color={COLORS.textDark} />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Profile Info Cards */
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Icon name="package-variant" size={22} color={COLORS.primary} />
                <Text style={styles.statValue}>-</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Icon name="heart" size={22} color={COLORS.primary} />
                <Text style={styles.statValue}>-</Text>
                <Text style={styles.statLabel}>Wishlist</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Icon name="star" size={22} color={COLORS.primary} />
                <Text style={styles.statValue}>-</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>

            {/* Profile Details */}
            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>Account Info</Text>
              <View style={styles.detailRow}>
                <Icon name="email-outline" size={18} color={COLORS.textMuted} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{displayEmail}</Text>
                </View>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Icon name="phone-outline" size={18} color={COLORS.textMuted} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>
                    {userProfile?.phone || 'Not set'}
                  </Text>
                </View>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Icon name="map-marker-outline" size={18} color={COLORS.textMuted} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>
                    {userProfile?.address || 'Not set'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu */}
            <View style={styles.menuCard}>
              {menuItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.action}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIconBg}>
                      <Icon name={item.icon} size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuSublabel} numberOfLines={1}>{item.sublabel}</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
                </React.Fragment>
              ))}
            </View>
          </>
        )}

        {/* Logout Button */}
        {!editing && (
          <TouchableOpacity
            style={[styles.logoutButton, loggingOut && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.85}
          >
            {loggingOut ? (
              <ActivityIndicator color={COLORS.error} size="small" />
            ) : (
              <>
                <Icon name="logout" size={20} color={COLORS.error} />
                <Text style={styles.logoutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* App Version */}
        <Text style={styles.version}>DF Mobile v1.0.0 · Smart Choice, Better Life</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 3,
    borderColor: COLORS.neon,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  displayEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
    marginTop: 4,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 12,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuSublabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  editCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelEditButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelEditText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '700',
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
    marginBottom: 16,
  },
  logoutButtonDisabled: {
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

export default ProfileScreen;
