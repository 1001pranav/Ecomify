/**
 * Products Screen
 * Product list with search
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar, Card, Badge, Button, Skeleton, EmptyState, useAppTheme } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/core';
import type { Product } from '@ecomify/types';
import type { ProductsStackParamList } from '../../navigation/MainNavigator';

type ProductsScreenProps = {
  navigation: NativeStackNavigationProp<ProductsStackParamList, 'ProductsList'>;
};

// Mock products
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Classic T-Shirt',
    handle: 'classic-t-shirt',
    status: 'active',
    images: [{ url: 'https://via.placeholder.com/150' }],
    variants: [{ price: 29.99, inventory: 50 }],
  } as Product,
  {
    id: '2',
    title: 'Denim Jeans',
    handle: 'denim-jeans',
    status: 'active',
    images: [{ url: 'https://via.placeholder.com/150' }],
    variants: [{ price: 65.00, inventory: 25 }],
  } as Product,
  {
    id: '3',
    title: 'Sneakers',
    handle: 'sneakers',
    status: 'draft',
    images: [{ url: 'https://via.placeholder.com/150' }],
    variants: [{ price: 89.99, inventory: 0 }],
  } as Product,
];

export function ProductsScreen({ navigation }: ProductsScreenProps) {
  const theme = useAppTheme();
  const [search, setSearch] = useState('');

  const products = mockProducts;
  const isLoading = false;

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleAddProduct = () => {
    navigation.navigate('ProductForm', {});
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const variant = item.variants[0];
    const isOutOfStock = variant?.inventory === 0;

    return (
      <TouchableOpacity
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.7}
      >
        <Card style={styles.productCard}>
          <View style={styles.productRow}>
            <View style={[styles.productImage, { backgroundColor: theme.colors.surfaceVariant }]}>
              {item.images[0]?.url ? (
                <Image source={{ uri: item.images[0].url }} style={styles.image} />
              ) : (
                <Text style={{ color: theme.colors.onSurfaceVariant }}>No Image</Text>
              )}
            </View>
            <View style={styles.productInfo}>
              <Text style={[styles.productTitle, { color: theme.colors.onSurface }]}>
                {item.title}
              </Text>
              <Text style={[styles.productPrice, { color: theme.colors.onSurface }]}>
                {formatCurrency(variant?.price || 0)}
              </Text>
              <View style={styles.badges}>
                <Badge
                  variant={item.status === 'active' ? 'success' : 'default'}
                  size="sm"
                >
                  {item.status}
                </Badge>
                {isOutOfStock && (
                  <Badge variant="error" size="sm" style={{ marginLeft: 4 }}>
                    Out of Stock
                  </Badge>
                )}
              </View>
            </View>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>›</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search products..."
        style={styles.searchBar}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        <View style={styles.skeletons}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No products"
            description="Add your first product to get started"
            actionLabel="Add Product"
            onAction={handleAddProduct}
          />
        }
      />
      <View style={styles.fab}>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddProduct}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  skeletons: {
    padding: 16,
  },
  productCard: {
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
});
