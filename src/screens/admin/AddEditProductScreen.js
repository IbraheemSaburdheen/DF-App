/**
 * DF Mobile - Add/Edit Product Screen (Admin)
 * Form to create or update a product with optional image upload
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { addProduct, updateProduct, uploadProductImage, getCategories } from '../../services/productService';
import { COLORS } from '../../constants/colors';

const CATEGORIES = ['Smartphones', 'Accessories', 'Repairs', 'Exchange Offers'];

const AddEditProductScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { product } = route.params || {};
  const isEditing = !!product;

  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || CATEGORIES[0]);
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [featured, setFeatured] = useState(product?.featured || false);
  const [imageUri, setImageUri] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(product?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'Enter a valid price (0 or more)';
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'Enter a valid stock quantity';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open image picker');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      let imageUrl = existingImageUrl;

      // Upload image if selected
      if (imageUri) {
        const tempId = product?.id || Date.now().toString();
        try {
          imageUrl = await uploadProductImage(imageUri, tempId);
        } catch (imgErr) {
          console.warn('Image upload failed, using placeholder');
          imageUrl = existingImageUrl || '';
        }
      }

      const productData = {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        category,
        stock: parseInt(stock, 10),
        featured,
        imageUrl,
      };

      if (isEditing) {
        await updateProduct(product.id, productData);
        Alert.alert('Success', 'Product updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addProduct(productData);
        Alert.alert('Success', 'Product added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', `Could not ${isEditing ? 'update' : 'add'} product: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const renderInput = ({ label, value, onChangeText, placeholder, keyboardType, multiline, error, field }) => {
    const isFocused = focused === field;
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          multiline && styles.inputWrapperMultiline,
        ]}>
          <TextInput
            style={[styles.input, multiline && styles.inputMultiline]}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            value={value}
            onChangeText={(text) => {
              onChangeText(text);
              if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
            }}
            keyboardType={keyboardType || 'default'}
            multiline={multiline}
            onFocus={() => setFocused(field)}
            onBlur={() => setFocused('')}
            color={COLORS.textPrimary}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick} activeOpacity={0.8}>
            {imageUri || existingImageUrl ? (
              <Image
                source={{ uri: imageUri || existingImageUrl }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="camera-plus" size={36} color={COLORS.textMuted} />
                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageEditButton} onPress={handleImagePick}>
            <Icon name="camera" size={16} color={COLORS.primary} />
            <Text style={styles.imageEditText}>
              {imageUri || existingImageUrl ? 'Change Image' : 'Add Image'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {renderInput({
            label: 'Product Name *',
            value: name,
            onChangeText: setName,
            placeholder: 'e.g. iPhone 15 Pro Case',
            field: 'name',
            error: errors.name,
          })}

          {renderInput({
            label: 'Price ($) *',
            value: price,
            onChangeText: setPrice,
            placeholder: '0.00 (use 0 for free/quote)',
            keyboardType: 'decimal-pad',
            field: 'price',
            error: errors.price,
          })}

          {renderInput({
            label: 'Stock Quantity *',
            value: stock,
            onChangeText: setStock,
            placeholder: 'e.g. 50 (use 999 for unlimited)',
            keyboardType: 'number-pad',
            field: 'stock',
            error: errors.stock,
          })}

          {renderInput({
            label: 'Description *',
            value: description,
            onChangeText: setDescription,
            placeholder: 'Describe the product in detail...',
            multiline: true,
            field: 'description',
            error: errors.description,
          })}

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category *</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.categoryOptionActive,
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    category === cat && styles.categoryOptionTextActive,
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Featured Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Icon name="star" size={20} color={COLORS.primary} />
              <View>
                <Text style={styles.toggleLabel}>Featured Product</Text>
                <Text style={styles.toggleSublabel}>Show on home screen</Text>
              </View>
            </View>
            <Switch
              value={featured}
              onValueChange={setFeatured}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={featured ? COLORS.white : COLORS.textMuted}
              ios_backgroundColor={COLORS.border}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.textDark} size="small" />
          ) : (
            <>
              <Icon name={isEditing ? 'content-save' : 'plus-circle'} size={20} color={COLORS.textDark} />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Product' : 'Add Product'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    width: 160,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  previewImage: {
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
    fontSize: 13,
  },
  imageEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  imageEditText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  inputWrapper: {
    backgroundColor: COLORS.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  inputWrapperMultiline: {
    minHeight: 100,
  },
  input: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  categoryOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: COLORS.textDark,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  toggleSublabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddEditProductScreen;
