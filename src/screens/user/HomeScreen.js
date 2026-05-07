/**
 * DF Mobile - Home Screen
 * Banner carousel, featured products, and category navigation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { getFeaturedProducts, getCategories } from '../../services/productService';
import ProductCard from '../../components/ProductCard';
import { addToCart } from '../../services/cartService';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const BANNERS = [
  {
    id: '1',
    title: 'Smart Choice,\nBetter Life',
    subtitle: 'Explore premium phone accessories',
    bg: COLORS.primary,
    icon: 'cellphone',
  },
  {
    id: '2',
    title: 'Fast Charging\nSolutions',
    subtitle: 'Power up in minutes',
    bg: '#1A4A00',
    icon: 'lightning-bolt',
  },
  {
    id: '3',
    title: 'Expert Repairs\nYou Can Trust',
    subtitle: '90-day warranty on all repairs',
    bg: '#0A2A3A',
    icon: 'tools',
  },
  {
    id: '4',
    title: 'Trade In &\nUpgrade',
    subtitle: 'Best value for your old phone',
    bg: '#2A1A3A',
    icon: 'swap-horizontal',
  },
];

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userProfile, user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cartMessage, setCartMessage] = useState('');
  const bannerRef = useRef(null);
  const categories = getCategories();

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  // Auto-scroll banner
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentBanner + 1) % BANNERS.length;
      setCurrentBanner(next);
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3500);
    return () => clearInterval(interval);
  }, [currentBanner]);

  const loadFeaturedProducts = async () => {
    try {
      const products = await getFeaturedProducts(6);
      setFeaturedProducts(products);
    } catch (err) {
      console.error('Error loading featured products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeaturedProducts();
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      setCartMessage(`"${product.name}" added to cart!`);
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleCategoryPress = (category) => {
    if (category.id === 'all') {
      navigation.navigate('Products', { screen: 'ProductsList' });
    } else {
      navigation.navigate('Products', {
        screen: 'ProductsList',
        params: { selectedCategory: category.name },
      });
    }
  };

  const renderBanner = ({ item }) => (
    <View style={[styles.banner, { backgroundColor: item.bg, width }]}>
      <View style={styles.bannerContent}>
        <View style={styles.bannerTextArea}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => navigation.navigate('Products', { screen: 'ProductsList' })}
          >
            <Text style={styles.bannerButtonText}>Shop Now</Text>
            <Icon name="arrow-right" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.bannerIconContainer}>
          <Icon name={item.icon} size={72} color="rgba(255,255,255,0.15)" />
        </View>
      </View>
    </View>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryChip}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.categoryIconBg}>
        <Icon name={item.icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedProduct = ({ item }) => (
    <View style={styles.featuredProductWrapper}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        onAddToCart={handleAddToCart}
      />
    </View>
  );

  const userName = userProfile?.name || user?.displayName || 'there';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Cart message toast */}
      {cartMessage ? (
        <View style={styles.cartToast}>
          <Icon name="cart-check" size={16} color={COLORS.textDark} />
          <Text style={styles.cartToastText}>{cartMessage}</Text>
        </View>
      ) : null}

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
          <View>
            <Text style={styles.greeting}>Hello, {userName.split(' ')[0]}! 👋</Text>
            <Text style={styles.headerSubtitle}>What are you looking for today?</Text>
          </View>
          <TouchableOpacity
            style={styles.headerCartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon name="cart-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Banner Carousel */}
        <FlatList
          ref={bannerRef}
          data={BANNERS}
          renderItem={renderBanner}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentBanner(index);
          }}
          style={styles.bannerList}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        />

        {/* Banner dots */}
        <View style={styles.bannerDots}>
          {BANNERS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, currentBanner === i && styles.dotActive]}
            />
          ))}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products', { screen: 'ProductsList' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products', { screen: 'ProductsList' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : featuredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="package-variant-closed" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No featured products yet</Text>
              <Text style={styles.emptySubText}>Check back soon for new arrivals!</Text>
            </View>
          ) : (
            <FlatList
              data={featuredProducts}
              renderItem={renderFeaturedProduct}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.productsRow}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
            />
          )}
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <Icon name="shield-check" size={32} color={COLORS.primary} />
          <View style={styles.promoTextArea}>
            <Text style={styles.promoTitle}>Quality Guaranteed</Text>
            <Text style={styles.promoSubtitle}>All products come with 30-day return policy</Text>
          </View>
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
  cartToast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 100,
  },
  cartToastText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerCartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bannerList: {
    marginBottom: 8,
  },
  banner: {
    height: 180,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  bannerTextArea: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 28,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 4,
  },
  bannerButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  bannerIconContainer: {
    marginLeft: 16,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 18,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryChip: {
    alignItems: 'center',
    gap: 6,
    width: 72,
  },
  categoryIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  categoryName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  productsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productsList: {
    paddingBottom: 8,
  },
  featuredProductWrapper: {
    flex: 1,
    maxWidth: '48%',
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promoTextArea: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default HomeScreen;
