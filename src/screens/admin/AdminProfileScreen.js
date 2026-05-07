import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import { COLORS } from '../../constants/colors';

const AdminProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = userProfile?.name || user?.displayName || 'Admin';
  const email = userProfile?.email || user?.email || '';

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const MENU_ITEMS = [
    {
      section: 'Account',
      items: [
        { icon: 'account-outline', label: 'Full Name', value: displayName },
        { icon: 'email-outline', label: 'Email', value: email },
        { icon: 'shield-account', label: 'Role', value: 'Administrator' },
      ],
    },
    {
      section: 'App Info',
      items: [
        { icon: 'cellphone', label: 'App Name', value: 'DF Mobile' },
        { icon: 'information-outline', label: 'Version', value: '1.0.0' },
        { icon: 'tag-outline', label: 'Build', value: 'Release' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Profile</Text>
        </View>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{displayName}</Text>
            <Text style={styles.avatarEmail}>{email}</Text>
            <View style={styles.adminBadge}>
              <Icon name="shield-account" size={12} color={COLORS.warning} />
              <Text style={styles.adminBadgeText}>Administrator</Text>
            </View>
          </View>
        </View>

        {/* Info Sections */}
        {MENU_ITEMS.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <View
                  key={item.label}
                  style={[
                    styles.menuRow,
                    idx < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                >
                  <View style={styles.menuIconWrap}>
                    <Icon name={item.icon} size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuValue} numberOfLines={1}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          <View style={styles.sectionCard}>
            {[
              { icon: 'package-variant', label: 'Manage Products' },
              { icon: 'clipboard-list', label: 'Manage Orders' },
              { icon: 'account-group', label: 'Manage Users' },
              { icon: 'cash-multiple', label: 'View Revenue' },
            ].map((perm, idx, arr) => (
              <View
                key={perm.label}
                style={[styles.menuRow, idx < arr.length - 1 && styles.menuRowBorder]}
              >
                <View style={styles.menuIconWrap}>
                  <Icon name={perm.icon} size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.menuLabel}>{perm.label}</Text>
                <Icon name="check-circle" size={18} color={COLORS.primary} />
              </View>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.8}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <>
                <Icon name="logout" size={18} color={COLORS.error} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DF Mobile — Smart Choice, Better Life</Text>
          <Text style={styles.footerSub}>© 2024 DF Mobile. All rights reserved.</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.warning + '25',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.warning,
  },
  avatarText: { fontSize: 26, fontWeight: '900', color: COLORS.warning },
  avatarInfo: { flex: 1, gap: 4 },
  avatarName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  avatarEmail: { fontSize: 13, color: COLORS.textSecondary },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.warning + '20',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  adminBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.warning },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  menuValue: { fontSize: 13, color: COLORS.textSecondary, maxWidth: 150 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.error + '15',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },
  footer: { alignItems: 'center', gap: 4, paddingHorizontal: 16, marginTop: 8 },
  footerText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  footerSub: { fontSize: 11, color: COLORS.textMuted },
});

export default AdminProfileScreen;
