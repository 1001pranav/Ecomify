/**
 * Product Detail Screen
 * View product details
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Card, Button, Badge, useAppTheme } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/core';
import type { Product } from '@ecomify/types';
import type { ProductsStackParamList } from '../../navigation/MainNavigator';

const { width } = Dimensions.get('window');

type ProductDetailScreenProps = {
  navigation: NativeStackNavigationProp<ProductsStackParamList, 'ProductDetail'>;
  route: RouteProp<ProductsStackParamList, 'ProductDetail'>;
};

// Mock product
const mockProduct: Product = {
  id: '1',
  title: 'Classic T-Shirt',
  handle: 'classic-t-shirt',
  description: 'A comfortable classic t-shirt made from 100% cotton. Perfect for everyday wear.',
  vendor: 'Ecomify Brand',
  productType: 'Clothing',
  tags: ['clothing', 't-shirt', 'cotton'],
  status: 'active',
  images: [
    { id: '1', url: 'https://via.placeholder.com/400', position: 0 },
    { id: '2', url: 'https://via.placeholder.com/400', position: 1 },
  ],
  variants: [
    { id: '1', title: 'Small / Black', sku: 'TSH-S-BLK', price: 29.99, compareAtPrice: 39.99, inventory: 25, options: { size: 'S', color: 'Black' } },
    { id: '2', title: 'Medium / Black', sku: 'TSH-M-BLK', price: 29.99, compareAtPrice: 39.99, inventory: 50, options: { size: 'M', color: 'Black' } },
    { id: '3', title: 'Large / Black', sku: 'TSH-L-BLK', price: 29.99, compareAtPrice: 39.99, inventory: 0, options: { size: 'L', color: 'Black' } },
  ],
  options: [
    { id: '1', name: 'Size', values: ['S', 'M', 'L'] },
    { id: '2', name: 'Color', values: ['Black', 'White', 'Navy'] },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as Product;

export function ProductDetailScreen({ navigation, route }: ProductDetailScreenProps) {
  const theme = useAppTheme();
  const { productId } = route.params;

  const product = mockProduct;
  const totalInventory = product.variants.reduce((sum, v) => sum + v.inventory, 0);

  const handleEdit = () => {
    navigation.navigate('ProductForm', { productId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Product deleted');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Images */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.imageCarousel}
      >
        {product.images.map((image) => (
          <View key={image.id} style={styles.imageContainer}>
            <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {product.title}
            </Text>
            <Text style={[styles.price, { color: theme.colors.onSurface }]}>
              {formatCurrency(product.variants[0]?.price || 0)}
            </Text>
          </View>
          <Badge variant={product.status === 'active' ? 'success' : 'default'}>
            {product.status}
          </Badge>
        </View>

        {/* Quick Stats */}
        <Card style={styles.section}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {totalInventory}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                In Stock
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {product.variants.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Variants
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {product.images.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Images
              </Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        {product.description && (
          <Card style={styles.section}>
            <Card.Header>
              <Card.Title>Description</Card.Title>
            </Card.Header>
            <Card.Content>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {product.description}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Variants */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Variants</Card.Title>
          </Card.Header>
          <Card.Content>
            {product.variants.map((variant) => (
              <View
                key={variant.id}
                style={[styles.variantRow, { borderBottomColor: theme.colors.outlineVariant }]}
              >
                <View style={styles.variantInfo}>
                  <Text style={[styles.variantTitle, { color: theme.colors.onSurface }]}>
                    {variant.title}
                  </Text>
                  {variant.sku && (
                    <Text style={[styles.variantSku, { color: theme.colors.onSurfaceVariant }]}>
                      SKU: {variant.sku}
                    </Text>
                  )}
                </View>
                <View style={styles.variantDetails}>
                  <Text style={{ color: theme.colors.onSurface }}>
                    {formatCurrency(variant.price)}
                  </Text>
                  <Text
                    style={{
                      color: variant.inventory > 0 ? '#10b981' : '#ef4444',
                      fontSize: 12,
                    }}
                  >
                    {variant.inventory > 0 ? `${variant.inventory} in stock` : 'Out of stock'}
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Details */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Details</Card.Title>
          </Card.Header>
          <Card.Content>
            {product.vendor && (
              <View style={styles.detailRow}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Vendor</Text>
                <Text style={{ color: theme.colors.onSurface }}>{product.vendor}</Text>
              </View>
            )}
            {product.productType && (
              <View style={styles.detailRow}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Type</Text>
                <Text style={{ color: theme.colors.onSurface }}>{product.productType}</Text>
              </View>
            )}
            {product.tags.length > 0 && (
              <View style={styles.tagsRow}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Tags</Text>
                <View style={styles.tags}>
                  {product.tags.map((tag) => (
                    <Badge key={tag} size="sm" style={{ marginLeft: 4 }}>
                      {tag}
                    </Badge>
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button onPress={handleEdit} fullWidth>
            Edit Product
          </Button>
          <Button variant="destructive" onPress={handleDelete} style={styles.deleteButton} fullWidth>
            Delete Product
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageCarousel: {
    height: 300,
  },
  imageContainer: {
    width,
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  variantInfo: {
    flex: 1,
  },
  variantTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  variantSku: {
    fontSize: 12,
    marginTop: 2,
  },
  variantDetails: {
    alignItems: 'flex-end',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actions: {
    marginTop: 24,
    marginBottom: 32,
  },
  deleteButton: {
    marginTop: 12,
  },
});
