/**
 * DF Mobile - Admin Dashboard Screen
 * Stats cards: total products, orders, users, revenue
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { getProductCount } from '../../services/productService';
import { getOrderCount, getTotalRevenue, getAllOrders, ORDER_STATUS, formatOrderStatus } from '../../services/orderService';
import { getAllUsers } from '../../services/authService';
import { COLORS } from '../../constants/colors';

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userProfile, user } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      const [products, orders, users, revenue, allOrders] = await Promise.all([
        getProductCount(),
        getOrderCount(),
        getAllUsers().then(u => u.length).catch(() => 0),
        getTotalRevenue(),
        getAllOrders().then(o => o.slice(0, 5)).catch(() => []),
      ]);

      setStats({ products, orders, users, revenue });
      setRecentOrders(allOrders);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const STAT_CARDS = [
    {
      title: 'Products',
      value: stats.products,
      icon: 'package-variant',
      color: COLORS.primary,
      bg: COLORS.primary + '20',
    },
    {
      title: 'Orders',
      value: stats.orders,
      icon: 'clipboard-list',
      color: COLORS.statusProcessing,
      bg: COLORS.statusProcessing + '20',
    },
    {
      title: 'Users',
      value: stats.users,
      icon: 'account-group',
      color: COLORS.warning,
      bg: COLORS.warning + '20',
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toFixed(0)}`,
      icon: 'cash-multiple',
      color: COLORS.neon,
      bg: COLORS.neon + '20',
      isString: true,
    },
  ];

  const STATUS_CONFIG = {
    [ORDER_STATUS.PENDING]: COLORS.statusPending,
    [ORDER_STATUS.PROCESSING]: COLORS.statusProcessing,
    [ORDER_STATUS.SHIPPED]: COLORS.statusShipped,
    [ORDER_STATUS.DELIVERED]: COLORS.statusDelivered,
    [ORDER_STATUS.CANCELLED]: COLORS.statusCancelled,
  };

  const adminName = userProfile?.name || user?.displayName || 'Admin';

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>DF</Text>
            </View>
            <View>
              <Text style={styles.brandName}>DF Mobile Admin</Text>
              <Text style={styles.tagline}>Smart Choice, Better Life</Text>
            </View>
          </View>
          <View style={styles.adminBadge}>
            <Icon name="shield-account" size={14} color={COLORS.primary} />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Welcome back, {adminName.split(' ')[0]}!</Text>
          <Text style={styles.greetingSubtitle}>Here's what's happening today</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STAT_CARDS.map((card) => (
            <View key={card.title} style={[styles.statCard, { borderColor: card.color + '40' }]}>
              <View style={[styles.statIconBg, { backgroundColor: card.bg }]}>
                <Icon name={card.icon} size={26} color={card.color} />
              </View>
              <Text style={[styles.statValue, { color: card.color }]}>
                {card.isString ? card.value : card.value.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>{card.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManageProducts', { screen: 'AddEditProduct', params: { product: null } })}
              activeOpacity={0.8}
            >
              <Icon name="plus-circle" size={28} color={COLORS.primary} />
              <Text style={styles.actionLabel}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManageOrders')}
              activeOpacity={0.8}
            >
              <Icon name="clipboard-list" size={28} color={COLORS.statusProcessing} />
              <Text style={styles.actionLabel}>View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManageUsers')}
              activeOpacity={0.8}
            >
              <Icon name="account-group" size={28} color={COLORS.warning} />
              <Text style={styles.actionLabel}>Users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManageProducts')}
              activeOpacity={0.8}
            >
              <Icon name="package-variant" size={28} color={COLORS.neon} />
              <Text style={styles.actionLabel}>Products</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ManageOrders')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="clipboard-list-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          ) : (
            recentOrders.map((order) => {
              const statusColor = STATUS_CONFIG[order.status] || COLORS.textSecondary;
              return (
                <View key={order.id} style={styles.orderRow}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>
                      {order.createdAt instanceof Date
                        ? order.createdAt.toLocaleDateString()
                        : 'Just now'}
                    </Text>
                  </View>
                  <View style={styles.orderMiddle}>
                    <Text style={styles.orderItems}>
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={styles.orderTotal}>${parseFloat(order.total).toFixed(2)}</Text>
                    <View style={[styles.orderStatus, { backgroundColor: statusColor + '20' }]}>
                      <Text style={[styles.orderStatusText, { color: statusColor }]}>
                        {formatOrderStatus(order.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Icon name="information-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.appInfoText}>DF Mobile Admin Panel v1.0.0</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.neon,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 1,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tagline: {
    fontSize: 10,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  adminBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  greetingSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    margin: 4,
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  orderInfo: {
    flex: 1,
    gap: 2,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  orderMiddle: {
    flex: 1,
    alignItems: 'center',
  },
  orderItems: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  orderStatus: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  orderStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  appInfoText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});

export default DashboardScreen;
