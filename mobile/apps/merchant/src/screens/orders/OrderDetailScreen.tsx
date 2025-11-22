/**
 * Order Detail Screen
 * View and manage individual order
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Card, Button, StatusBadge, Skeleton, useAppTheme } from '@ecomify/ui';
import { formatCurrency, formatDateTime } from '@ecomify/core';
import type { Order, LineItem } from '@ecomify/types';
import type { OrdersStackParamList } from '../../navigation/MainNavigator';

type OrderDetailScreenProps = {
  navigation: NativeStackNavigationProp<OrdersStackParamList, 'OrderDetail'>;
  route: RouteProp<OrdersStackParamList, 'OrderDetail'>;
};

// Mock order for demo
const mockOrder: Order = {
  id: '1',
  orderNumber: '1001',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  financialStatus: 'paid',
  fulfillmentStatus: 'unfulfilled',
  lineItems: [
    { id: '1', title: 'Classic T-Shirt', variantTitle: 'Black / M', quantity: 2, price: 29.99 } as LineItem,
    { id: '2', title: 'Denim Jeans', variantTitle: 'Blue / 32', quantity: 1, price: 65.00 } as LineItem,
  ],
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Main St',
    city: 'New York',
    province: 'NY',
    zip: '10001',
    country: 'United States',
  } as any,
  subtotalPrice: 124.98,
  totalShipping: 5.99,
  totalTax: 10.00,
  totalDiscount: 0,
  totalPrice: 140.97,
  currency: 'USD',
  createdAt: new Date().toISOString(),
} as Order;

export function OrderDetailScreen({ route }: OrderDetailScreenProps) {
  const theme = useAppTheme();
  const { orderId } = route.params;

  // For demo, use mock data
  const order = mockOrder;
  const isLoading = false;

  const handleFulfill = () => {
    Alert.alert(
      'Fulfill Order',
      'Mark this order as fulfilled?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Fulfill', onPress: () => Alert.alert('Order fulfilled!') },
      ]
    );
  };

  const handleRefund = () => {
    Alert.alert(
      'Refund Order',
      'Are you sure you want to refund this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Refund', style: 'destructive', onPress: () => Alert.alert('Order refunded!') },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Skeleton height={150} borderRadius={12} />
          <Skeleton height={200} borderRadius={12} style={{ marginTop: 16 }} />
          <Skeleton height={120} borderRadius={12} style={{ marginTop: 16 }} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Order Header */}
        <Card>
          <View style={styles.orderHeader}>
            <View>
              <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
                Order #{order.orderNumber}
              </Text>
              <Text style={[styles.orderDate, { color: theme.colors.onSurfaceVariant }]}>
                {formatDateTime(order.createdAt)}
              </Text>
            </View>
            <StatusBadge status={order.fulfillmentStatus} />
          </View>
          <View style={styles.statusRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Payment: </Text>
            <StatusBadge status={order.financialStatus} size="sm" />
          </View>
        </Card>

        {/* Line Items */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Items</Card.Title>
          </Card.Header>
          <Card.Content>
            {order.lineItems.map((item) => (
              <View
                key={item.id}
                style={[styles.lineItem, { borderBottomColor: theme.colors.outlineVariant }]}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
                    {item.title}
                  </Text>
                  {item.variantTitle && (
                    <Text style={[styles.itemVariant, { color: theme.colors.onSurfaceVariant }]}>
                      {item.variantTitle}
                    </Text>
                  )}
                </View>
                <View style={styles.itemPricing}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    x{item.quantity}
                  </Text>
                  <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Order Summary */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Summary</Card.Title>
          </Card.Header>
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Subtotal</Text>
              <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(order.subtotalPrice)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Shipping</Text>
              <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(order.totalShipping)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Tax</Text>
              <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(order.totalTax)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Total</Text>
              <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
                {formatCurrency(order.totalPrice)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Customer Info */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Customer</Card.Title>
          </Card.Header>
          <Card.Content>
            <Text style={[styles.customerEmail, { color: theme.colors.onSurface }]}>
              {order.email}
            </Text>
            {order.phone && (
              <Text style={[styles.customerPhone, { color: theme.colors.onSurfaceVariant }]}>
                {order.phone}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <Card style={styles.section}>
            <Card.Header>
              <Card.Title>Shipping Address</Card.Title>
            </Card.Header>
            <Card.Content>
              <Text style={{ color: theme.colors.onSurface }}>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {order.shippingAddress.address1}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {order.shippingAddress.country}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {order.fulfillmentStatus === 'unfulfilled' && (
            <Button onPress={handleFulfill} fullWidth>
              Fulfill Order
            </Button>
          )}
          {order.financialStatus === 'paid' && (
            <Button variant="outline" onPress={handleRefund} style={styles.refundButton} fullWidth>
              Refund Order
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 14,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginTop: 16,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemVariant: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  customerEmail: {
    fontSize: 14,
    fontWeight: '500',
  },
  customerPhone: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    marginTop: 24,
    marginBottom: 32,
  },
  refundButton: {
    marginTop: 12,
  },
});
