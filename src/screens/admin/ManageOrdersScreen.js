/**
 * DF Mobile - Manage Orders Screen (Admin)
 * View all orders and update their status
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAllOrders, updateOrderStatus, formatOrderStatus, formatOrderDate, ORDER_STATUS } from '../../services/orderService';
import { COLORS } from '../../constants/colors';

const STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: { color: COLORS.statusPending, icon: 'clock-outline', label: 'Pending' },
  [ORDER_STATUS.PROCESSING]: { color: COLORS.statusProcessing, icon: 'cog-outline', label: 'Processing' },
  [ORDER_STATUS.SHIPPED]: { color: COLORS.statusShipped, icon: 'truck-fast', label: 'Shipped' },
  [ORDER_STATUS.DELIVERED]: { color: COLORS.statusDelivered, icon: 'check-circle', label: 'Delivered' },
  [ORDER_STATUS.CANCELLED]: { color: COLORS.statusCancelled, icon: 'close-circle', label: 'Cancelled' },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const ManageOrdersScreen = () => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [statusModalOrder, setStatusModalOrder] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
      applyFilter(data, selectedFilter);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (data, filter) => {
    if (filter === 'all') {
      setFilteredOrders(data);
    } else {
      setFilteredOrders(data.filter(o => o.status === filter));
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    applyFilter(orders, filter);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    setStatusModalOrder(null);
    try {
      await updateOrderStatus(orderId, newStatus);
      const updatedOrders = orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      setOrders(updatedOrders);
      applyFilter(updatedOrders, selectedFilter);
    } catch (err) {
      Alert.alert('Error', 'Could not update order status.');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusConfig = (status) => STATUS_CONFIG[status] || { color: COLORS.textSecondary, icon: 'help', label: status };

  const renderStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
        <Icon name={config.icon} size={12} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderIdRow}>
          <Text style={styles.orderId}>#{item.id.slice(-8).toUpperCase()}</Text>
          {updatingOrder === item.id && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
        </View>
        <Text style={styles.orderDate}>
          {item.createdAt instanceof Date
            ? item.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Unknown date'}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.itemsList}>
        {(item.items || []).slice(0, 2).map((orderItem, idx) => (
          <View key={idx} style={styles.orderItemRow}>
            <Text style={styles.itemBullet}>•</Text>
            <Text style={styles.itemName} numberOfLines={1}>{orderItem.name}</Text>
            <Text style={styles.itemQty}>×{orderItem.quantity}</Text>
            <Text style={styles.itemPrice}>
              ${(orderItem.subtotal || orderItem.price * orderItem.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        {(item.items?.length || 0) > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} more</Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.orderFooter}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${parseFloat(item.total).toFixed(2)}</Text>
        </View>
        <View style={styles.statusSection}>
          {renderStatusBadge(item.status)}
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => setStatusModalOrder(item)}
            disabled={updatingOrder === item.id}
          >
            <Icon name="pencil" size={14} color={COLORS.primary} />
            <Text style={styles.updateBtnText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStatusModal = () => {
    if (!statusModalOrder) return null;
    const currentStatus = statusModalOrder.status;

    return (
      <Modal
        visible={!!statusModalOrder}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <TouchableOpacity onPress={() => setStatusModalOrder(null)}>
                <Icon name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalOrderId}>
              Order #{statusModalOrder.id.slice(-8).toUpperCase()}
            </Text>

            <View style={styles.statusOptions}>
              {ALL_STATUSES.map((status) => {
                const config = getStatusConfig(status);
                const isSelected = currentStatus === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      isSelected && { borderColor: config.color, backgroundColor: config.color + '15' },
                    ]}
                    onPress={() => handleUpdateStatus(statusModalOrder.id, status)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.statusOptionIcon, { backgroundColor: config.color + '20' }]}>
                      <Icon name={config.icon} size={18} color={config.color} />
                    </View>
                    <Text style={[styles.statusOptionText, isSelected && { color: config.color, fontWeight: '700' }]}>
                      {config.label}
                    </Text>
                    {isSelected && (
                      <Icon name="check-circle" size={18} color={config.color} style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setStatusModalOrder(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerSubtitle}>{orders.length} total orders</Text>
        </View>
      </View>

      {/* Status Filters */}
      <FlatList
        horizontal
        data={[{ id: 'all', label: 'All', count: orders.length }, ...ALL_STATUSES.map(s => ({
          id: s,
          label: STATUS_CONFIG[s].label,
          count: orders.filter(o => o.status === s).length,
          color: STATUS_CONFIG[s].color,
        }))]}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === item.id && styles.filterPillActive,
              item.color && selectedFilter === item.id && { backgroundColor: item.color, borderColor: item.color },
            ]}
            onPress={() => handleFilterChange(item.id)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === item.id && styles.filterTextActive,
            ]}>
              {item.label}
            </Text>
            <View style={[styles.filterCount, selectedFilter === item.id && { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
              <Text style={[styles.filterCountText, selectedFilter === item.id && { color: COLORS.white }]}>
                {item.count}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        style={styles.filterScroll}
      />

      {/* Results */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</Text>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="clipboard-list-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptyText}>
            {selectedFilter === 'all'
              ? 'No orders placed yet'
              : `No ${STATUS_CONFIG[selectedFilter]?.label} orders`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadOrders(); }}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}

      {renderStatusModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterScroll: {
    marginBottom: 4,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.textDark,
    fontWeight: '700',
  },
  filterCount: {
    backgroundColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  resultsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  list: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemsList: {
    backgroundColor: COLORS.cardElevated,
    borderRadius: 8,
    padding: 10,
    gap: 5,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemBullet: {
    color: COLORS.primary,
    fontSize: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemQty: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  itemPrice: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    paddingLeft: 14,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalSection: {
    gap: 1,
  },
  totalLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  updateBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalOrderId: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: -8,
  },
  statusOptions: {
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  statusOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ManageOrdersScreen;
