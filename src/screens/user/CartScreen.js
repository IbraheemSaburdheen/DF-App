/**
 * DF Mobile - Cart Screen
 * Cart items, quantity controls, total, and checkout
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from '../../services/cartService';
import { createOrder } from '../../services/orderService';
import { COLORS } from '../../constants/colors';

const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    try {
      const items = await getCart();
      setCartItems(items);
    } catch (err) {
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (productId, productName) => {
    Alert.alert(
      'Remove Item',
      `Remove "${productName}" from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = await removeFromCart(productId);
            setCartItems(updated);
          },
        },
      ]
    );
  };

  const handleQuantityChange = async (productId, newQty) => {
    const updated = await updateCartItemQuantity(productId, newQty);
    setCartItems(updated);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearCart();
            setCartItems([]);
          },
        },
      ]
    );
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to place an order.');
      return;
    }
    if (cartItems.length === 0) return;

    Alert.alert(
      'Confirm Order',
      `Place order for ${getTotalItems()} item(s) totaling $${getTotal().toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: async () => {
            setCheckingOut(true);
            try {
              const orderId = await createOrder(user.uid, cartItems, getTotal());
              await clearCart();
              setCartItems([]);
              Alert.alert(
                'Order Placed!',
                `Your order #${orderId.slice(-6).toUpperCase()} has been placed successfully!`,
                [
                  {
                    text: 'View Orders',
                    onPress: () => navigation.navigate('Orders'),
                  },
                  { text: 'Continue Shopping', style: 'cancel' },
                ]
              );
            } catch (err) {
              Alert.alert('Order Failed', 'Could not place order. Please try again.');
            } finally {
              setCheckingOut(false);
            }
          },
        },
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {/* Image */}
      <View style={styles.itemImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Icon name="image-off" size={24} color={COLORS.textMuted} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemPrice}>${parseFloat(item.price).toFixed(2)} each</Text>

        {/* Quantity Controls */}
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]}
            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Icon name="minus" size={14} color={item.quantity <= 1 ? COLORS.textMuted : COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
          >
            <Icon name="plus" size={14} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.itemTotal}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id, item.name)}
      >
        <Icon name="trash-can-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
            <Icon name="trash-can-outline" size={18} color={COLORS.error} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-off" size={80} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add some products to get started!</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Products', { screen: 'ProductsList' })}
          >
            <Icon name="shopping" size={18} color={COLORS.textDark} />
            <Text style={styles.shopButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Item count */}
          <View style={styles.itemCountRow}>
            <Text style={styles.itemCount}>
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in cart
            </Text>
          </View>

          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Order Summary */}
          <View style={[styles.summaryCard, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({getTotalItems()} items)</Text>
              <Text style={styles.summaryValue}>${getTotal().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, checkingOut && styles.checkoutDisabled]}
              onPress={handleCheckout}
              disabled={checkingOut}
              activeOpacity={0.85}
            >
              {checkingOut ? (
                <ActivityIndicator color={COLORS.textDark} size="small" />
              ) : (
                <>
                  <Icon name="check-circle" size={20} color={COLORS.textDark} />
                  <Text style={styles.checkoutButtonText}>Place Order</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '500',
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
  itemCountRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  itemCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  itemCategory: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: COLORS.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 'auto',
  },
  removeButton: {
    padding: 4,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  checkoutDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartScreen;
