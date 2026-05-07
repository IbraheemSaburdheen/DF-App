/**
 * DF Mobile - Products Screen
 * Browse, search, and filter phone accessories by category
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getProducts, searchProducts, getCategories } from '../../services/productService';
import { addToCart } from '../../services/cartService';
import ProductCard from '../../components/ProductCard';
import { COLORS } from '../../constants/colors';

const ProductsScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartToast, setCartToast] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchFocused, setSearchFocused] = useState(false);

  const categories = [{ id: 'all', name: 'All', icon: 'apps' }, ...getCategories().slice(1)];

  useEffect(() => {
    // Check if navigated with a category filter
    const initialCategory = route.params?.selectedCategory;
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    loadProducts(initialCategory || 'All');
  }, [route.params?.selectedCategory]);

  const loadProducts = async (category = selectedCategory) => {
    try {
      setLoading(true);
      let data;
      if (category === 'All') {
        data = await getProducts();
      } else {
        data = await getProducts({ category });
      }
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      // Reset to category filter
      const data = products;
      setFilteredProducts(data);
      return;
    }
    const term = query.toLowerCase();
    const filtered = products.filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [products]);

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    loadProducts(category);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      setCartToast(`"${product.name}" added!`);
      setTimeout(() => setCartToast(''), 2500);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryPill,
        selectedCategory === item.name && styles.categoryPillActive,
        item.id === 'all' && selectedCategory === 'All' && styles.categoryPillActive,
      ]}
      onPress={() => handleCategoryFilter(item.id === 'all' ? 'All' : item.name)}
      activeOpacity={0.8}
    >
      <Icon
        name={item.icon}
        size={14}
        color={
          (selectedCategory === item.name || (item.id === 'all' && selectedCategory === 'All'))
            ? COLORS.textDark
            : COLORS.textSecondary
        }
      />
      <Text
        style={[
          styles.categoryPillText,
          (selectedCategory === item.name || (item.id === 'all' && selectedCategory === 'All')) &&
            styles.categoryPillTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => {
    if (viewMode === 'list') {
      return (
        <ProductCard
          product={item}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
          onAddToCart={handleAddToCart}
          horizontal
        />
      );
    }
    return (
      <View style={styles.gridItem}>
        <ProductCard
          product={item}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
          onAddToCart={handleAddToCart}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Toast */}
      {cartToast ? (
        <View style={styles.toast}>
          <Icon name="cart-check" size={16} color={COLORS.textDark} />
          <Text style={styles.toastText}>{cartToast}</Text>
        </View>
      ) : null}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Icon
            name={viewMode === 'grid' ? 'view-list' : 'view-grid'}
            size={22}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchWrapper, searchFocused && styles.searchWrapperFocused]}>
        <Icon name="magnify" size={20} color={searchFocused ? COLORS.primary : COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filters */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        style={styles.categoriesScroll}
      />

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {loading ? 'Loading...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
        </Text>
        {selectedCategory !== 'All' && (
          <TouchableOpacity
            onPress={() => handleCategoryFilter('All')}
            style={styles.clearFilter}
          >
            <Text style={styles.clearFilterText}>Clear filter</Text>
            <Icon name="close" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="package-variant-closed" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? `No results for "${searchQuery}"`
              : `No products in ${selectedCategory}`}
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setSearchQuery('');
              handleCategoryFilter('All');
            }}
          >
            <Text style={styles.resetButtonText}>Browse All Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          columnWrapperStyle={viewMode === 'grid' ? styles.row : null}
          contentContainerStyle={styles.productsList}
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
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 100,
  },
  toastText: {
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
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchWrapperFocused: {
    borderColor: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  categoriesScroll: {
    marginTop: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: COLORS.textDark,
    fontWeight: '600',
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearFilterText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
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
  resetButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resetButtonText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '600',
  },
  productsList: {
    padding: 16,
    paddingTop: 4,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%',
  },
});

export default ProductsScreen;
