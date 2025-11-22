/**
 * Product Detail Screen
 * Full product view with variant selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useCart } from '@ecomify/store';
import { Button, Badge, useAppTheme } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/core';
import type { Product, ProductVariant } from '@ecomify/types';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const { width } = Dimensions.get('window');

type ProductDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ProductDetail'>;
};

// Mock product
const mockProduct: Product = {
  id: '1',
  title: 'Classic T-Shirt',
  handle: 'classic-tshirt',
  description: 'A comfortable classic t-shirt made from 100% organic cotton. Perfect for everyday wear with a relaxed fit and soft feel.',
  vendor: 'Ecomify Brand',
  tags: ['cotton', 'casual', 'bestseller'],
  status: 'active',
  images: [
    { id: '1', url: 'https://via.placeholder.com/400', position: 0 },
    { id: '2', url: 'https://via.placeholder.com/400', position: 1 },
    { id: '3', url: 'https://via.placeholder.com/400', position: 2 },
  ],
  variants: [
    { id: '1', title: 'S / Black', price: 29.99, compareAtPrice: 39.99, inventory: 10, options: { Size: 'S', Color: 'Black' } },
    { id: '2', title: 'M / Black', price: 29.99, compareAtPrice: 39.99, inventory: 25, options: { Size: 'M', Color: 'Black' } },
    { id: '3', title: 'L / Black', price: 29.99, compareAtPrice: 39.99, inventory: 0, options: { Size: 'L', Color: 'Black' } },
    { id: '4', title: 'S / White', price: 29.99, compareAtPrice: 39.99, inventory: 15, options: { Size: 'S', Color: 'White' } },
    { id: '5', title: 'M / White', price: 29.99, compareAtPrice: 39.99, inventory: 20, options: { Size: 'M', Color: 'White' } },
    { id: '6', title: 'L / White', price: 29.99, compareAtPrice: 39.99, inventory: 8, options: { Size: 'L', Color: 'White' } },
  ],
  options: [
    { id: '1', name: 'Size', values: ['S', 'M', 'L'] },
    { id: '2', name: 'Color', values: ['Black', 'White'] },
  ],
} as Product;

export function ProductDetailScreen({ route }: ProductDetailScreenProps) {
  const theme = useAppTheme();
  const { addItem } = useCart();
  const { productId } = route.params;

  const product = mockProduct;
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({
    Size: 'M',
    Color: 'Black',
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Find matching variant
  const selectedVariant = product.variants.find((v) =>
    Object.entries(selectedOptions).every(([key, value]) => v.options[key] === value)
  );

  const isOutOfStock = !selectedVariant || selectedVariant.inventory === 0;
  const hasDiscount = selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price;

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      image: product.images[0]?.url,
    });

    Alert.alert('Added to Cart', `${product.title} - ${selectedVariant.title}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Image Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {product.images.map((image) => (
            <View key={image.id} style={styles.imageContainer}>
              <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
            </View>
          ))}
        </ScrollView>

        {/* Image Indicators */}
        <View style={styles.indicators}>
          {product.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentImageIndex ? theme.colors.primary : theme.colors.outlineVariant,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.content}>
          {/* Title & Price */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{product.title}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: theme.colors.onSurface }]}>
                {formatCurrency(selectedVariant?.price || product.variants[0]?.price || 0)}
              </Text>
              {hasDiscount && (
                <>
                  <Text style={[styles.comparePrice, { color: theme.colors.onSurfaceVariant }]}>
                    {formatCurrency(selectedVariant?.compareAtPrice || 0)}
                  </Text>
                  <Badge variant="error" size="sm">
                    {Math.round((1 - selectedVariant!.price / selectedVariant!.compareAtPrice!) * 100)}% OFF
                  </Badge>
                </>
              )}
            </View>
          </View>

          {/* Options */}
          {product.options.map((option) => (
            <View key={option.id} style={styles.optionGroup}>
              <Text style={[styles.optionLabel, { color: theme.colors.onSurface }]}>
                {option.name}: <Text style={{ fontWeight: '600' }}>{selectedOptions[option.name]}</Text>
              </Text>
              <View style={styles.optionValues}>
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.optionValue,
                        {
                          borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                          backgroundColor: isSelected ? theme.colors.primaryContainer : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))}
                    >
                      <Text
                        style={{
                          color: isSelected ? theme.colors.primary : theme.colors.onSurface,
                          fontWeight: isSelected ? '600' : '400',
                        }}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Quantity */}
          <View style={styles.quantityRow}>
            <Text style={[styles.optionLabel, { color: theme.colors.onSurface }]}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: theme.colors.outline }]}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Text style={{ fontSize: 18 }}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.quantityValue, { color: theme.colors.onSurface }]}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: theme.colors.outline }]}
                onPress={() => setQuantity((q) => q + 1)}
              >
                <Text style={{ fontSize: 18 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Description</Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {product.description}
            </Text>
          </View>

          {/* Tags */}
          <View style={styles.tags}>
            {product.tags.map((tag) => (
              <Badge key={tag} size="sm" style={{ marginRight: 8 }}>
                {tag}
              </Badge>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <View style={styles.bottomPrice}>
          <Text style={[styles.bottomPriceLabel, { color: theme.colors.onSurfaceVariant }]}>Total</Text>
          <Text style={[styles.bottomPriceValue, { color: theme.colors.onSurface }]}>
            {formatCurrency((selectedVariant?.price || 0) * quantity)}
          </Text>
        </View>
        <Button
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          style={styles.addButton}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width,
    height: width,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
  },
  comparePrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  optionGroup: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionValue: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  bottomPrice: {
    marginRight: 16,
  },
  bottomPriceLabel: {
    fontSize: 12,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    flex: 1,
  },
});
