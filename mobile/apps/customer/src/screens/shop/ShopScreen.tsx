/**
 * Shop Screen
 * Product browsing home screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Card, SearchBar, Skeleton, useAppTheme } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/core';
import type { Product } from '@ecomify/types';
import type { ShopStackParamList } from '../../navigation/MainNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Mock products
const mockProducts: Product[] = [
  { id: '1', title: 'Classic T-Shirt', handle: 'classic-tshirt', images: [{ url: 'https://via.placeholder.com/200' }], variants: [{ price: 29.99, compareAtPrice: 39.99 }] } as Product,
  { id: '2', title: 'Denim Jeans', handle: 'denim-jeans', images: [{ url: 'https://via.placeholder.com/200' }], variants: [{ price: 65.00 }] } as Product,
  { id: '3', title: 'Running Sneakers', handle: 'running-sneakers', images: [{ url: 'https://via.placeholder.com/200' }], variants: [{ price: 89.99 }] } as Product,
  { id: '4', title: 'Leather Jacket', handle: 'leather-jacket', images: [{ url: 'https://via.placeholder.com/200' }], variants: [{ price: 199.99, compareAtPrice: 249.99 }] } as Product,
  { id: '5', title: 'Summer Dress', handle: 'summer-dress', images: [{ url: 'https://via.placeholder.com/200' }], variants: [{ price: 55.00 }] } as Product,
  { id: '6', title: 'Canvas Backpack', handle: 'canvas-backpack', images: [{ url: 'https://via.placeholder.com/200' }], variants: [{ price: 45.00 }] } as Product,
];

const categories = ['All', 'Clothing', 'Shoes', 'Accessories', 'Sale'];

type ShopNavProp = NativeStackNavigationProp<ShopStackParamList, 'ShopHome'>;

export function ShopScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<ShopNavProp>();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleProductPress = (productId: string) => {
    rootNav.navigate('ProductDetail', { productId });
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const variant = item.variants[0];
    const hasDiscount = variant?.compareAtPrice && variant.compareAtPrice > variant.price;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          {item.images[0]?.url ? (
            <Image source={{ uri: item.images[0].url }} style={styles.productImage} />
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No Image</Text>
          )}
          {hasDiscount && (
            <View style={[styles.saleBadge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.saleBadgeText}>SALE</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.productTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.colors.onSurface }]}>
              {formatCurrency(variant?.price || 0)}
            </Text>
            {hasDiscount && (
              <Text style={[styles.comparePrice, { color: theme.colors.onSurfaceVariant }]}>
                {formatCurrency(variant.compareAtPrice!)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={{ color: theme.colors.onSurfaceVariant }}>🔍 Search products...</Text>
      </TouchableOpacity>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === item ? theme.colors.primary : theme.colors.surfaceVariant,
              },
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={{
                color: selectedCategory === item ? '#fff' : theme.colors.onSurface,
                fontWeight: '500',
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={mockProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  searchBar: {
    margin: 16,
    padding: 14,
    borderRadius: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  productInfo: {
    paddingTop: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  comparePrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
});
