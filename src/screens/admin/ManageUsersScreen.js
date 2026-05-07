import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAllUsers, updateUserRole } from '../../services/authService';
import { COLORS } from '../../constants/colors';

const ManageUsersScreen = () => {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const q = text.toLowerCase();
    setFiltered(
      users.filter(
        u =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      )
    );
  };

  const handleRoleUpdate = async (uid, newRole) => {
    setUpdatingRole(true);
    try {
      await updateUserRole(uid, newRole);
      const updated = users.map(u => (u.uid === uid ? { ...u, role: newRole } : u));
      setUsers(updated);
      setFiltered(
        updated.filter(
          u =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setSelectedUser(prev => prev ? { ...prev, role: newRole } : prev);
      Alert.alert('Updated', `User role changed to ${newRole}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update user role.');
    } finally {
      setUpdatingRole(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) =>
    role === 'admin' ? COLORS.warning : COLORS.primary;

  const getRoleIcon = (role) =>
    role === 'admin' ? 'shield-account' : 'account';

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => { setSelectedUser(item); setModalVisible(true); }}
      activeOpacity={0.8}
    >
      <View style={[styles.avatar, { backgroundColor: getRoleColor(item.role) + '30', borderColor: getRoleColor(item.role) + '60' }]}>
        <Text style={[styles.avatarText, { color: getRoleColor(item.role) }]}>
          {getInitials(item.name)}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || 'No Name'}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        {item.createdAt && (
          <Text style={styles.userDate}>
            Joined {new Date(item.createdAt?.seconds ? item.createdAt.seconds * 1000 : item.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
        <Icon name={getRoleIcon(item.role)} size={12} color={getRoleColor(item.role)} />
        <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
          {item.role || 'user'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <Text style={styles.headerCount}>{filtered.length} user(s)</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Icon name="account-group" size={14} color={COLORS.primary} />
          <Text style={styles.statPillText}>{users.filter(u => u.role !== 'admin').length} Users</Text>
        </View>
        <View style={styles.statPill}>
          <Icon name="shield-account" size={14} color={COLORS.warning} />
          <Text style={[styles.statPillText, { color: COLORS.warning }]}>{users.filter(u => u.role === 'admin').length} Admins</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.uid || item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadUsers(); }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="account-search-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'No registered users yet'}
            </Text>
          </View>
        }
      />

      {/* User Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedUser && (
                <>
                  {/* User Avatar */}
                  <View style={styles.modalAvatarRow}>
                    <View style={[styles.modalAvatar, { backgroundColor: getRoleColor(selectedUser.role) + '30', borderColor: getRoleColor(selectedUser.role) }]}>
                      <Text style={[styles.modalAvatarText, { color: getRoleColor(selectedUser.role) }]}>
                        {getInitials(selectedUser.name)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.modalUserName}>{selectedUser.name || 'No Name'}</Text>
                      <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Account Info</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>User ID</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>{selectedUser.uid?.slice(0, 14)}...</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Current Role</Text>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(selectedUser.role) + '20' }]}>
                        <Icon name={getRoleIcon(selectedUser.role)} size={12} color={getRoleColor(selectedUser.role)} />
                        <Text style={[styles.roleText, { color: getRoleColor(selectedUser.role) }]}>
                          {selectedUser.role || 'user'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Change Role */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Change Role</Text>
                    <View style={styles.roleOptions}>
                      {['user', 'admin'].map(role => (
                        <TouchableOpacity
                          key={role}
                          style={[
                            styles.roleOption,
                            { borderColor: getRoleColor(role) + '50' },
                            selectedUser.role === role && { backgroundColor: getRoleColor(role) + '20', borderColor: getRoleColor(role) },
                          ]}
                          onPress={() => {
                            if (selectedUser.role !== role) {
                              Alert.alert(
                                'Change Role',
                                `Set ${selectedUser.name || selectedUser.email} as ${role}?`,
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Confirm', onPress: () => handleRoleUpdate(selectedUser.uid, role) },
                                ]
                              );
                            }
                          }}
                          disabled={updatingRole}
                        >
                          <Icon
                            name={selectedUser.role === role ? 'check-circle' : role === 'admin' ? 'shield-account' : 'account'}
                            size={20}
                            color={getRoleColor(role)}
                          />
                          <Text style={[styles.roleOptionText, { color: getRoleColor(role) }]}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </Text>
                          {selectedUser.role === role && (
                            <Text style={[styles.currentRoleLabel, { color: getRoleColor(role) }]}>Current</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                    {updatingRole && (
                      <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 12 }} />
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  headerCount: { fontSize: 13, color: COLORS.textSecondary },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
    gap: 8,
  },
  searchIcon: {},
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statPillText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  listContent: { padding: 16, gap: 10, paddingBottom: 32 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarText: { fontSize: 16, fontWeight: '800' },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  userEmail: { fontSize: 12, color: COLORS.textSecondary },
  userDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.modal,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  modalAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  modalAvatarText: { fontSize: 22, fontWeight: '800' },
  modalUserName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  modalUserEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  modalSection: { marginBottom: 20 },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: { fontSize: 13, color: COLORS.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  roleOptions: { gap: 10 },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleOptionText: { flex: 1, fontSize: 14, fontWeight: '600' },
  currentRoleLabel: { fontSize: 11, fontWeight: '700', opacity: 0.8 },
});

export default ManageUsersScreen;
