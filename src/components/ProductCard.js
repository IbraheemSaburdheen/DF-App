/**
 * DF Mobile - Product Card Component
 * Reusable product card for listings
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductCard = ({ product, onPress, onAddToCart, horizontal = false }) => {
  const formatPrice = (price) => {
    if (price === 0) return 'Free Quote';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  if (horizontal) {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Product Image */}
        <View style={styles.horizontalImageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.horizontalImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.horizontalImagePlaceholder}>
              <Icon name="image-off" size={32} color={COLORS.textMuted} />
            </View>
          )}
          {product.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.horizontalInfo}>
          <Text style={styles.categoryText}>{product.category}</Text>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{product.description}</Text>

          <View style={styles.horizontalFooter}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.stock !== undefined && (
              <Text style={[styles.stock, product.stock === 0 && styles.outOfStock]}>
                {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
              </Text>
            )}
          </View>

          {onAddToCart && product.stock !== 0 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddToCart(product)}
              activeOpacity={0.8}
            >
              <Icon name="cart-plus" size={16} color={COLORS.textDark} />
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
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
            <Icon name="image-off" size={40} color={COLORS.textMuted} />
          </View>
        )}
        {product.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        {product.stock === 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockOverlayText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.categoryText}>{product.category}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {onAddToCart && product.stock !== 0 && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => onAddToCart(product)}
              activeOpacity={0.8}
            >
              <Icon name="cart-plus" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  featuredText: {
    color: COLORS.textDark,
    fontSize: 10,
    fontWeight: '700',
  },
  outOfStockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  outOfStockOverlayText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    padding: 10,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stock: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  outOfStock: {
    color: COLORS.error,
  },

  // Horizontal card styles
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  horizontalImageContainer: {
    width: 120,
    height: 130,
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalInfo: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProductCard;
