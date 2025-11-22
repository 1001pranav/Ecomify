/**
 * Orders Screen
 * Customer order history
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Card, StatusBadge, EmptyState, useAppTheme } from '@ecomify/ui';
import { formatCurrency, formatDate } from '@ecomify/core';
import type { Order } from '@ecomify/types';
import type { AccountStackParamList } from '../../navigation/MainNavigator';

type OrdersNavProp = NativeStackNavigationProp<AccountStackParamList, 'Orders'>;

// Mock orders
const mockOrders: Order[] = [
  { id: '1', orderNumber: '12345', fulfillmentStatus: 'shipped', totalPrice: 129.99, createdAt: new Date().toISOString(), lineItems: [{ title: 'Classic T-Shirt' }, { title: 'Denim Jeans' }] } as Order,
  { id: '2', orderNumber: '12344', fulfillmentStatus: 'delivered', totalPrice: 89.50, createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), lineItems: [{ title: 'Running Sneakers' }] } as Order,
  { id: '3', orderNumber: '12343', fulfillmentStatus: 'delivered', totalPrice: 245.00, createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), lineItems: [{ title: 'Leather Jacket' }] } as Order,
];

export function OrdersScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<OrdersNavProp>();

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>Order #{item.orderNumber}</Text>
          <StatusBadge status={item.fulfillmentStatus} size="sm" />
        </View>
        <Text style={[styles.orderDate, { color: theme.colors.onSurfaceVariant }]}>{formatDate(item.createdAt)}</Text>
        <Text style={[styles.orderItems, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.lineItems.map(i => i.title).join(', ')}
        </Text>
        <View style={styles.orderFooter}>
          <Text style={[styles.orderTotal, { color: theme.colors.onSurface }]}>{formatCurrency(item.totalPrice)}</Text>
          <Text style={{ color: theme.colors.primary }}>View Details ›</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (mockOrders.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <EmptyState title="No orders yet" description="Your order history will appear here" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={mockOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { justifyContent: 'center' },
  list: { padding: 16 },
  orderCard: { marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNumber: { fontSize: 16, fontWeight: '600' },
  orderDate: { fontSize: 12, marginBottom: 8 },
  orderItems: { fontSize: 14, marginBottom: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  orderTotal: { fontSize: 16, fontWeight: '600' },
});
