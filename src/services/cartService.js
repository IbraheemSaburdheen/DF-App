/**
 * DF Mobile - Cart Service
 * Cart operations using AsyncStorage locally, sync to Firestore on checkout
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

const CART_KEY = '@dfmobile_cart';

/**
 * Get cart items from AsyncStorage
 */
export const getCart = async () => {
  try {
    const cartJson = await AsyncStorage.getItem(CART_KEY);
    if (cartJson) {
      return JSON.parse(cartJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

/**
 * Save cart to AsyncStorage
 */
export const saveCart = async (cartItems) => {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (product, quantity = 1) => {
  try {
    const cart = await getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
      // Item already in cart, increase quantity
      cart[existingIndex].quantity += quantity;
    } else {
      // New item
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || '',
        category: product.category || '',
        quantity,
      });
    }

    await saveCart(cart);
    return cart;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (productId) => {
  try {
    const cart = await getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    await saveCart(updatedCart);
    return updatedCart;
  } catch (error) {
    throw error;
  }
};

/**
 * Update item quantity in cart
 */
export const updateCartItemQuantity = async (productId, quantity) => {
  try {
    const cart = await getCart();

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );

    await saveCart(updatedCart);
    return updatedCart;
  } catch (error) {
    throw error;
  }
};

/**
 * Clear cart
 */
export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem(CART_KEY);
    return [];
  } catch (error) {
    throw error;
  }
};

/**
 * Get cart item count
 */
export const getCartCount = async () => {
  try {
    const cart = await getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    return 0;
  }
};

/**
 * Get cart total
 */
export const getCartTotal = async () => {
  try {
    const cart = await getCart();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  } catch (error) {
    return 0;
  }
};

/**
 * Sync cart to Firestore (called before checkout or on login)
 */
export const syncCartToFirestore = async (userId) => {
  try {
    const cart = await getCart();
    await firestore().collection('carts').doc(userId).set({
      items: cart,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error syncing cart to Firestore:', error);
    // Don't throw - cart sync failure shouldn't break the app
  }
};

/**
 * Restore cart from Firestore (on login)
 */
export const restoreCartFromFirestore = async (userId) => {
  try {
    const doc = await firestore().collection('carts').doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      if (data.items && data.items.length > 0) {
        await saveCart(data.items);
        return data.items;
      }
    }
    return [];
  } catch (error) {
    console.error('Error restoring cart from Firestore:', error);
    return [];
  }
};

/**
 * Check if item is in cart
 */
export const isInCart = async (productId) => {
  try {
    const cart = await getCart();
    return cart.some(item => item.id === productId);
  } catch (error) {
    return false;
  }
};

/**
 * Get item quantity in cart
 */
export const getItemQuantity = async (productId) => {
  try {
    const cart = await getCart();
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  } catch (error) {
    return 0;
  }
};
