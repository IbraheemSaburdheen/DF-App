/**
 * DF Mobile - Product Service
 * CRUD operations for products in Firestore
 */

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const COLLECTION = 'products';

/**
 * Get all products with optional filters
 */
export const getProducts = async (filters = {}) => {
  try {
    let query = firestore().collection(COLLECTION);

    if (filters.category && filters.category !== 'All') {
      query = query.where('category', '==', filters.category);
    }

    if (filters.featured) {
      query = query.where('featured', '==', true);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get featured products for home screen
 */
export const getFeaturedProducts = async (limit = 6) => {
  try {
    const snapshot = await firestore()
      .collection(COLLECTION)
      .where('featured', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // Fallback: get latest products if no featured flag
    try {
      const snapshot = await firestore()
        .collection(COLLECTION)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      throw e;
    }
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category) => {
  try {
    const snapshot = await firestore()
      .collection(COLLECTION)
      .where('category', '==', category)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (productId) => {
  try {
    const doc = await firestore().collection(COLLECTION).doc(productId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Search products by name
 */
export const searchProducts = async (searchTerm) => {
  try {
    // Firestore doesn't support full-text search natively
    // We'll get all products and filter client-side
    const snapshot = await firestore()
      .collection(COLLECTION)
      .orderBy('name')
      .get();

    const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const term = searchTerm.toLowerCase();

    return allProducts.filter(product =>
      product.name?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Add a new product
 */
export const addProduct = async (productData) => {
  try {
    const docRef = await firestore().collection(COLLECTION).add({
      ...productData,
      stock: productData.stock || 0,
      featured: productData.featured || false,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (productId, productData) => {
  try {
    await firestore().collection(COLLECTION).doc(productId).update({
      ...productData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId) => {
  try {
    // Get product to check for image
    const doc = await firestore().collection(COLLECTION).doc(productId).get();
    if (doc.exists) {
      const data = doc.data();
      // Delete image from storage if exists
      if (data.imageUrl && data.imageUrl.includes('firebase')) {
        try {
          const imageRef = storage().refFromURL(data.imageUrl);
          await imageRef.delete();
        } catch (e) {
          // Image deletion failed, continue with product deletion
          console.warn('Could not delete product image:', e);
        }
      }
    }

    await firestore().collection(COLLECTION).doc(productId).delete();
  } catch (error) {
    throw error;
  }
};

/**
 * Upload product image to Firebase Storage
 */
export const uploadProductImage = async (imageUri, productId) => {
  try {
    const filename = `products/${productId || Date.now()}_${Date.now()}.jpg`;
    const reference = storage().ref(filename);

    // Upload file
    await reference.putFile(imageUri);

    // Get download URL
    const downloadUrl = await reference.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all product categories
 */
export const getCategories = () => {
  return [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'Smartphones', name: 'Smartphones', icon: 'cellphone' },
    { id: 'Accessories', name: 'Accessories', icon: 'headphones' },
    { id: 'Repairs', name: 'Repairs', icon: 'tools' },
    { id: 'Exchange Offers', name: 'Exchange', icon: 'swap-horizontal' },
  ];
};

/**
 * Update product stock
 */
export const updateProductStock = async (productId, quantityChange) => {
  try {
    await firestore()
      .collection(COLLECTION)
      .doc(productId)
      .update({
        stock: firestore.FieldValue.increment(quantityChange),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    throw error;
  }
};

/**
 * Get product count
 */
export const getProductCount = async () => {
  try {
    const snapshot = await firestore().collection(COLLECTION).get();
    return snapshot.size;
  } catch (error) {
    return 0;
  }
};

/**
 * Seed sample products for demo purposes
 */
export const seedSampleProducts = async () => {
  const sampleProducts = [
    {
      name: 'Premium Phone Case - iPhone 15',
      price: 24.99,
      description: 'Military-grade protection with slim design. Compatible with iPhone 15 series. Features precise cutouts for all ports and buttons.',
      category: 'Accessories',
      imageUrl: 'https://via.placeholder.com/400x400/1A1A1A/7ED321?text=Phone+Case',
      stock: 50,
      featured: true,
    },
    {
      name: 'Fast Charging Cable USB-C (2m)',
      price: 12.99,
      description: 'Premium braided USB-C cable supporting 65W fast charging. Compatible with all USB-C devices. 2-meter length for convenience.',
      category: 'Accessories',
      imageUrl: 'https://via.placeholder.com/400x400/1A1A1A/7ED321?text=USB+Cable',
      stock: 100,
      featured: true,
    },
    {
      name: 'Wireless Earbuds Pro',
      price: 89.99,
      description: 'True wireless earbuds with active noise cancellation. 30-hour battery life with charging case. IPX5 water resistant.',
      category: 'Accessories',
      imageUrl: 'https://via.placeholder.com/400x400/1A1A1A/7ED321?text=Earbuds',
      stock: 30,
      featured: true,
    },
    {
      name: 'Samsung Galaxy A54',
      price: 399.99,
      description: '6.4" Super AMOLED display, 50MP camera, 5000mAh battery, 5G connectivity. Available in Awesome Graphite.',
      category: 'Smartphones',
      imageUrl: 'https://via.placeholder.com/400x400/1A1A1A/7ED321?text=Galaxy+A54',
      stock: 15,
      featured: true,
    },
    {
      name: 'Screen Replacement Service',
      price: 49.99,
      description: 'Professional screen replacement for all major smartphone brands. Includes parts and labor. 90-day warranty on repairs.',
      category: 'Repairs',
      imageUrl: 'https://via.placeholder.com/400x400/1A1A1A/7ED321?text=Screen+Repair',
      stock: 999,
      featured: false,
    },
    {
      name: 'Phone Exchange - Trade In',
      price: 0,
      description: 'Get the best value for your old phone. We accept all brands and models. Instant valuation and same-day payment.',
      category: 'Exchange Offers',
      imageUrl: 'https://via.placeholder.com/400x400/1A1A1A/7ED321?text=Exchange',
      stock: 999,
      featured: true,
    },
    {
      name: 'Tempered Glass Screen Protector',
      price: 9.99,
      description: '9H hardness tempered glass with oleophobic coating. Bubble-free installation. Pack of 2.',
      category: 'Accessories',
      imageUrl: 'https://via.placeholder.com/400x400/1A1A1A/7ED321?text=Screen+Protector',
      stock: 200,
      featured: false,
    },
    {
      name: 'Power Bank 20000mAh',
      price: 49.99,
      description: 'High capacity power bank with 65W PD fast charging. Dual USB-A and USB-C ports. LED indicator display.',
      category: 'Accessories',
      imageUrl: 'https://via.placeholder.com/400x400/1A1A1A/7ED321?text=Power+Bank',
      stock: 40,
      featured: false,
    },
  ];

  const batch = firestore().batch();
  sampleProducts.forEach(product => {
    const ref = firestore().collection(COLLECTION).doc();
    batch.set(ref, {
      ...product,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
};
