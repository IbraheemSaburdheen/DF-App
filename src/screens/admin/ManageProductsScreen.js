/**
 * DF Mobile - Manage Products Screen (Admin)
 * List products with add, edit, delete operations
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getProducts, deleteProduct, seedSampleProducts } from '../../services/productService';
import { COLORS } from '../../constants/colors';

const ManageProductsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      Alert.alert('Error', 'Could not load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    const term = query.toLowerCase();
    setFilteredProducts(
      products.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      )
    );
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(product.id);
            try {
              await deleteProduct(product.id);
              const updatedProducts = products.filter(p => p.id !== product.id);
              setProducts(updatedProducts);
              setFilteredProducts(updatedProducts.filter(p =>
                !searchQuery ||
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase())
              ));
            } catch (err) {
              Alert.alert('Error', 'Could not delete product. Please try again.');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const handleSeedProducts = async () => {
    Alert.alert(
      'Seed Sample Products',
      'This will add 8 sample products to your Firestore database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Data',
          onPress: async () => {
            setSeeding(true);
            try {
              await seedSampleProducts();
              await loadProducts();
              Alert.alert('Success', 'Sample products added successfully!');
            } catch (err) {
              Alert.alert('Error', 'Could not seed products: ' + err.message);
            } finally {
              setSeeding(false);
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productRow}>
      {/* Image */}
      <View style={styles.productImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Icon name="image-off" size={20} color={COLORS.textMuted} />
          </View>
        )}
        {item.featured && (
          <View style={styles.featuredDot} />
        )}
      </View>

      {/* Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.productMeta}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{item.category}</Text>
          </View>
          <Text style={styles.priceText}>${parseFloat(item.price).toFixed(2)}</Text>
        </View>
        <View style={styles.stockRow}>
          <Icon
            name={item.stock > 0 ? 'check-circle' : 'close-circle'}
            size={12}
            color={item.stock > 0 ? COLORS.success : COLORS.error}
          />
          <Text style={[styles.stockText, item.stock === 0 && styles.outOfStockText]}>
            {item.stock >= 999 ? 'In Stock' : item.stock === 0 ? 'Out of Stock' : `${item.stock} in stock`}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddEditProduct', { product: item })}
        >
          <Icon name="pencil" size={16} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          disabled={deleting === item.id}
        >
          {deleting === item.id ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <Icon name="trash-can" size={16} color={COLORS.error} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Products</Text>
          <Text style={styles.headerSubtitle}>{products.length} total</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEditProduct', { product: null })}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={20} color={COLORS.textDark} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrapper, searchFocused && styles.searchWrapperFocused]}>
        <Icon name="magnify" size={18} color={searchFocused ? COLORS.primary : COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Results */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          Showing {filteredProducts.length} of {products.length}
        </Text>
        {products.length === 0 && (
          <TouchableOpacity onPress={handleSeedProducts} disabled={seeding}>
            {seeding ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.seedLink}>Add sample data</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="package-variant-closed" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>
            {products.length === 0 ? 'No products yet' : 'No results found'}
          </Text>
          <Text style={styles.emptySubtext}>
            {products.length === 0
              ? 'Add your first product or seed sample data'
              : `No products match "${searchQuery}"`}
          </Text>
          {products.length === 0 && (
            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={styles.primaryEmptyBtn}
                onPress={() => navigation.navigate('AddEditProduct', { product: null })}
              >
                <Icon name="plus" size={16} color={COLORS.textDark} />
                <Text style={styles.primaryEmptyBtnText}>Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryEmptyBtn}
                onPress={handleSeedProducts}
                disabled={seeding}
              >
                {seeding ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <Icon name="database" size={16} color={COLORS.primary} />
                    <Text style={styles.secondaryEmptyBtnText}>Seed Sample Data</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadProducts(); }}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 5,
  },
  addButtonText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    marginBottom: 8,
  },
  searchWrapperFocused: {
    borderColor: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  resultsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  seedLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingTop: 8,
    gap: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  productImageContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 17,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryChipText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 11,
    color: COLORS.success,
  },
  outOfStockText: {
    color: COLORS.error,
  },
  actions: {
    gap: 8,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyActions: {
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  primaryEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  primaryEmptyBtnText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  secondaryEmptyBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ManageProductsScreen;
