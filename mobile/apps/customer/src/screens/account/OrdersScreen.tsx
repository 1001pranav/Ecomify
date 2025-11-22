/**
 * Orders Screen
 * Customer order history
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useOrders } from '@ecomify/hooks';
import { Card, StatusBadge, EmptyState, Skeleton, useAppTheme } from '@ecomify/ui';
import { formatCurrency, formatDate } from '@ecomify/core';
import type { Order } from '@ecomify/types';
import type { AccountStackParamList } from '../../navigation/MainNavigator';

type OrdersNavProp = NativeStackNavigationProp<AccountStackParamList, 'Orders'>;

export function OrdersScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<OrdersNavProp>();

  const {
    data: orders = [],
    isLoading,
    isRefetching,
    refetch,
  } = useOrders();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.list}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <EmptyState title="No orders yet" description="Your order history will appear here" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
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
  orderCard: { marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNumber: { fontSize: 16, fontWeight: '600' },
  orderDate: { fontSize: 12, marginBottom: 8 },
  orderItems: { fontSize: 14, marginBottom: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  orderTotal: { fontSize: 16, fontWeight: '600' },
});
