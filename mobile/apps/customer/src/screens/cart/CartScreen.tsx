/**
 * Cart Screen
 * Shopping cart management
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCart, useAuth } from '@ecomify/store';
import { Button, Card, EmptyState, useAppTheme } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/core';
import type { CartItem } from '@ecomify/types';
import type { CartStackParamList } from '../../navigation/MainNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type CartNavProp = NativeStackNavigationProp<CartStackParamList, 'CartHome'>;

export function CartScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<CartNavProp>();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();
  const { items, subtotal, total, itemCount, updateItemQuantity, removeItem, clearCart } = useCart();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to continue with checkout',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => rootNav.navigate('Auth') },
        ]
      );
      return;
    }
    navigation.navigate('Checkout');
  };

  const handleRemoveItem = (id: string, title: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${title} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <Card style={styles.cartItem}>
      <View style={styles.itemRow}>
        <View style={[styles.itemImage, { backgroundColor: theme.colors.surfaceVariant }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>📦</Text>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.variantTitle && (
            <Text style={[styles.itemVariant, { color: theme.colors.onSurfaceVariant }]}>
              {item.variantTitle}
            </Text>
          )}
          <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
            {formatCurrency(item.price)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveItem(item.id, item.title)}
          style={styles.removeButton}
        >
          <Text style={{ color: theme.colors.error }}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.quantityRow}>
        <TouchableOpacity
          style={[styles.quantityButton, { borderColor: theme.colors.outline }]}
          onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Text style={{ opacity: item.quantity <= 1 ? 0.3 : 1 }}>−</Text>
        </TouchableOpacity>
        <Text style={[styles.quantity, { color: theme.colors.onSurface }]}>{item.quantity}</Text>
        <TouchableOpacity
          style={[styles.quantityButton, { borderColor: theme.colors.outline }]}
          onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
        >
          <Text>+</Text>
        </TouchableOpacity>
        <Text style={[styles.lineTotal, { color: theme.colors.onSurface }]}>
          {formatCurrency(item.price * item.quantity)}
        </Text>
      </View>
    </Card>
  );

  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          title="Your cart is empty"
          description="Add some items to get started"
          actionLabel="Start Shopping"
          onAction={() => rootNav.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <TouchableOpacity onPress={() => {
            Alert.alert('Clear Cart', 'Remove all items?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearCart },
            ]);
          }}>
            <Text style={[styles.clearCart, { color: theme.colors.error }]}>Clear Cart</Text>
          </TouchableOpacity>
        }
      />

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <View style={styles.summaryRow}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Subtotal ({itemCount} items)</Text>
          <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Shipping</Text>
          <Text style={{ color: theme.colors.onSurface }}>Calculated at checkout</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Total</Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>{formatCurrency(total)}</Text>
        </View>
        <Button onPress={handleCheckout} fullWidth>
          Checkout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 200,
  },
  cartItem: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemVariant: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  lineTotal: {
    marginLeft: 'auto',
    fontSize: 16,
    fontWeight: '600',
  },
  clearCart: {
    textAlign: 'center',
    padding: 16,
  },
  summary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});
