/**
 * DF Mobile - Order Service
 * Create, retrieve, and update orders in Firestore
 */

import firestore from '@react-native-firebase/firestore';

const COLLECTION = 'orders';

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

/**
 * Create a new order
 */
export const createOrder = async (userId, cartItems, total, shippingAddress = '') => {
  try {
    const orderData = {
      userId,
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || '',
        subtotal: item.price * item.quantity,
      })),
      total,
      status: ORDER_STATUS.PENDING,
      shippingAddress,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore().collection(COLLECTION).add(orderData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Get orders for a specific user
 */
export const getUserOrders = async (userId) => {
  try {
    const snapshot = await firestore()
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get all orders (admin)
 */
export const getAllOrders = async () => {
  try {
    const snapshot = await firestore()
      .collection(COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    const doc = await firestore().collection(COLLECTION).doc(orderId).get();
    if (doc.exists) {
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    await firestore().collection(COLLECTION).doc(orderId).update({
      status,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId) => {
  try {
    await firestore().collection(COLLECTION).doc(orderId).update({
      status: ORDER_STATUS.CANCELLED,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get order count (admin)
 */
export const getOrderCount = async () => {
  try {
    const snapshot = await firestore().collection(COLLECTION).get();
    return snapshot.size;
  } catch (error) {
    return 0;
  }
};

/**
 * Get total revenue (admin)
 */
export const getTotalRevenue = async () => {
  try {
    const snapshot = await firestore()
      .collection(COLLECTION)
      .where('status', '!=', ORDER_STATUS.CANCELLED)
      .get();

    return snapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().total || 0);
    }, 0);
  } catch (error) {
    // Fallback without inequality filter
    try {
      const snapshot = await firestore().collection(COLLECTION).get();
      return snapshot.docs
        .filter(doc => doc.data().status !== ORDER_STATUS.CANCELLED)
        .reduce((sum, doc) => sum + (doc.data().total || 0), 0);
    } catch (e) {
      return 0;
    }
  }
};

/**
 * Get orders by status (admin)
 */
export const getOrdersByStatus = async (status) => {
  try {
    const snapshot = await firestore()
      .collection(COLLECTION)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Format order status for display
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    [ORDER_STATUS.PENDING]: 'Pending',
    [ORDER_STATUS.PROCESSING]: 'Processing',
    [ORDER_STATUS.SHIPPED]: 'Shipped',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
  };
  return statusMap[status] || status;
};

/**
 * Format date for display
 */
export const formatOrderDate = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
