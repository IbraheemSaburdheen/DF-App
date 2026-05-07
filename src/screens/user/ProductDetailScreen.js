/**
 * DF Mobile - Product Detail Screen
 * Shows full product info with add to cart functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { addToCart, getItemQuantity } from '../../services/cartService';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    checkCartQuantity();
  }, []);

  const checkCartQuantity = async () => {
    const qty = await getItemQuantity(product.id);
    setCartQuantity(qty);
    setAdded(qty > 0);
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      Alert.alert('Out of Stock', 'This product is currently unavailable.');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product, quantity);
      setCartQuantity(prev => prev + quantity);
      setAdded(true);
      Alert.alert(
        'Added to Cart!',
        `${quantity} × "${product.name}" has been added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('Cart'),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Could not add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free Quote';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: COLORS.error };
    if (product.stock <= 5) return { text: `Only ${product.stock} left!`, color: COLORS.warning };
    if (product.stock >= 999) return { text: 'In Stock', color: COLORS.success };
    return { text: `${product.stock} in stock`, color: COLORS.success };
  };

  const stockStatus = getStockStatus();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="cart-outline" size={22} color={COLORS.primary} />
          {cartQuantity > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartQuantity}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="image-off" size={64} color={COLORS.textMuted} />
              <Text style={styles.imagePlaceholderText}>No Image</Text>
            </View>
          )}
          {product.featured && (
            <View style={styles.featuredBadge}>
              <Icon name="star" size={12} color={COLORS.textDark} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Category */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
            <View style={[styles.stockBadge, { backgroundColor: stockStatus.color + '20' }]}>
              <View style={[styles.stockDot, { backgroundColor: stockStatus.color }]} />
              <Text style={[styles.stockText, { color: stockStatus.color }]}>
                {stockStatus.text}
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Price */}
          <Text style={styles.price}>{formatPrice(product.price)}</Text>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description || 'No description available.'}</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <Icon name="shield-check" size={18} color={COLORS.primary} />
              <Text style={styles.featureText}>Quality Guaranteed</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="truck-fast" size={18} color={COLORS.primary} />
              <Text style={styles.featureText}>Fast Delivery</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="refresh" size={18} color={COLORS.primary} />
              <Text style={styles.featureText}>30-Day Returns</Text>
            </View>
          </View>

          {/* Quantity Selector */}
          {product.stock !== 0 && (
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.qtyButton, quantity <= 1 && styles.qtyButtonDisabled]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Icon name="minus" size={18} color={quantity <= 1 ? COLORS.textMuted : COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyButton, quantity >= (product.stock || 99) && styles.qtyButtonDisabled]}
                  onPress={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  disabled={quantity >= (product.stock || 99)}
                >
                  <Icon name="plus" size={18} color={quantity >= (product.stock || 99) ? COLORS.textMuted : COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityTotal}>
                  Total: {formatPrice(product.price * quantity)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Add to Cart */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>{formatPrice(product.price * quantity)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (product.stock === 0 || adding) && styles.addToCartDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={product.stock === 0 || adding}
          activeOpacity={0.85}
        >
          {adding ? (
            <ActivityIndicator color={COLORS.textDark} size="small" />
          ) : (
            <>
              <Icon
                name={added ? 'cart-check' : 'cart-plus'}
                size={20}
                color={product.stock === 0 ? COLORS.textMuted : COLORS.textDark}
              />
              <Text style={[
                styles.addToCartText,
                product.stock === 0 && styles.addToCartTextDisabled,
              ]}>
                {product.stock === 0 ? 'Out of Stock' : added ? 'Add More' : 'Add to Cart'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.neon,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  cartBadgeText: {
    color: COLORS.textDark,
    fontSize: 9,
    fontWeight: '700',
  },
  imageContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredText: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginBottom: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 20,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  featureText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  qtyButtonDisabled: {
    borderColor: COLORS.border,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 32,
    textAlign: 'center',
  },
  quantityTotal: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 16,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addToCartButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartDisabled: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addToCartText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
  addToCartTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default ProductDetailScreen;
