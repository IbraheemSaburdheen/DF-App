/**
 * DF Mobile - Orders Screen
 * Order history with status
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders, formatOrderStatus, formatOrderDate, ORDER_STATUS } from '../../services/orderService';
import { COLORS } from '../../constants/colors';

const STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: { color: COLORS.statusPending, icon: 'clock-outline' },
  [ORDER_STATUS.PROCESSING]: { color: COLORS.statusProcessing, icon: 'cog-outline' },
  [ORDER_STATUS.SHIPPED]: { color: COLORS.statusShipped, icon: 'truck-fast' },
  [ORDER_STATUS.DELIVERED]: { color: COLORS.statusDelivered, icon: 'check-circle' },
  [ORDER_STATUS.CANCELLED]: { color: COLORS.statusCancelled, icon: 'close-circle' },
};

const OrdersScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [user])
  );

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await getUserOrders(user.uid);
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || { color: COLORS.textSecondary, icon: 'help-circle' };
  };

  const renderOrderItem = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    const itemCount = item.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{formatOrderDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Icon name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {formatOrderStatus(item.status)}
            </Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsPreview}>
          {(item.items || []).slice(0, 2).map((orderItem, index) => (
            <View key={index} style={styles.previewItem}>
              <View style={styles.previewItemDot} />
              <Text style={styles.previewItemName} numberOfLines={1}>
                {orderItem.name}
              </Text>
              <Text style={styles.previewItemQty}>×{orderItem.quantity}</Text>
              <Text style={styles.previewItemPrice}>
                ${(orderItem.subtotal || orderItem.price * orderItem.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          {(item.items?.length || 0) > 2 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 2} more item{item.items.length - 2 !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.itemCountText}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${parseFloat(item.total).toFixed(2)}</Text>
          </View>
        </View>

        {/* Progress Steps */}
        {item.status !== ORDER_STATUS.CANCELLED && (
          <View style={styles.progressContainer}>
            {[ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED].map((step, index, arr) => {
              const stepConfig = getStatusConfig(step);
              const isCompleted = isStatusCompleted(step, item.status);
              const isActive = item.status === step;
              return (
                <React.Fragment key={step}>
                  <View style={styles.progressStep}>
                    <View style={[
                      styles.progressDot,
                      isCompleted && styles.progressDotCompleted,
                      isActive && styles.progressDotActive,
                    ]}>
                      {isCompleted && <Icon name="check" size={8} color={COLORS.textDark} />}
                    </View>
                    <Text style={[
                      styles.progressLabel,
                      (isCompleted || isActive) && styles.progressLabelActive,
                    ]} numberOfLines={1}>
                      {formatOrderStatus(step).split(' ')[0]}
                    </Text>
                  </View>
                  {index < arr.length - 1 && (
                    <View style={[styles.progressLine, isCompleted && styles.progressLineCompleted]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const isStatusCompleted = (step, currentStatus) => {
    const order = [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED];
    const stepIndex = order.indexOf(step);
    const currentIndex = order.indexOf(currentStatus);
    return stepIndex < currentIndex;
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
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.orderCountBadge}>
          <Text style={styles.orderCountText}>{orders.length}</Text>
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="package-variant-closed" size={80} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>
            Your order history will appear here once you make a purchase.
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Products', { screen: 'ProductsList' })}
          >
            <Icon name="shopping" size={18} color={COLORS.textDark} />
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  orderCountBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  orderCountText: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
    marginTop: 8,
  },
  shopButtonText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsPreview: {
    backgroundColor: COLORS.cardElevated,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewItemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  previewItemName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  previewItemQty: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  previewItemPrice: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    paddingLeft: 10,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemCountText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  progressStep: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  progressDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.cardElevated,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressDotActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  progressLineCompleted: {
    backgroundColor: COLORS.primary,
  },
  progressLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: COLORS.primary,
  },
});

export default OrdersScreen;
