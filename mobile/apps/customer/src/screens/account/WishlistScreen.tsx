/**
 * Wishlist Screen
 * Saved/favorite products
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '@ecomify/store';
import { apiClient } from '@ecomify/api';
import { Card, Button, EmptyState, Skeleton, useAppTheme } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/core';
import type { Product } from '@ecomify/types';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const WISHLIST_STORAGE_KEY = '@ecomify/wishlist';

// Helper functions to manage wishlist in local storage
const getStoredWishlistIds = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const removeFromStoredWishlist = async (productId: string): Promise<void> => {
  const ids = await getStoredWishlistIds();
  const filtered = ids.filter(id => id !== productId);
  await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(filtered));
};

export function WishlistScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { addItem } = useCart();

  // Fetch wishlist: get stored IDs, then fetch product details
  const {
    data: wishlistProducts = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const ids = await getStoredWishlistIds();
      if (ids.length === 0) return [];
      // Fetch each product by ID
      const products = await Promise.all(
        ids.map(id => apiClient.products.get(id).catch(() => null))
      );
      return products.filter((p): p is Product => p !== null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromStoredWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRemove = (productId: string) => {
    Alert.alert('Remove from Wishlist', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMutation.mutate(productId) },
    ]);
  };

  const handleAddToCart = (product: Product) => {
    const variant = product.variants[0];
    addItem({
      id: `${product.id}-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      price: variant.price,
      quantity: 1,
      image: product.images[0]?.url,
    });
    Alert.alert('Added to Cart', product.title);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <Card style={styles.itemCard}>
      <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
        <View style={[styles.itemImage, { backgroundColor: theme.colors.surfaceVariant }]}>
          {item.images[0]?.url && <Image source={{ uri: item.images[0].url }} style={styles.image} />}
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
          <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>{formatCurrency(item.variants[0]?.price || 0)}</Text>
          <Text style={{ color: item.variants[0]?.inventory > 0 ? '#10b981' : '#ef4444', fontSize: 12 }}>
            {item.variants[0]?.inventory > 0 ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
          <Text style={{ color: theme.colors.error }}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <Button size="sm" onPress={() => handleAddToCart(item)} disabled={item.variants[0]?.inventory === 0} fullWidth>
        Add to Cart
      </Button>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.list}>
          {[1, 2].map((i) => (
            <Skeleton key={i} height={150} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <EmptyState title="Your wishlist is empty" description="Save items you love for later" actionLabel="Start Shopping" onAction={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={wishlistProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { justifyContent: 'center' },
  list: { padding: 16 },
  itemCard: { marginBottom: 12 },
  itemRow: { flexDirection: 'row', marginBottom: 12 },
  itemImage: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 14, fontWeight: '500' },
  itemPrice: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  removeButton: { padding: 8 },
});
