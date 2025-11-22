/**
 * Order Detail Screen
 * View order details and track shipment
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Card, StatusBadge, Button, useAppTheme } from '@ecomify/ui';
import { formatCurrency, formatDateTime } from '@ecomify/core';
import type { AccountStackParamList } from '../../navigation/MainNavigator';

type OrderDetailScreenProps = {
  route: RouteProp<AccountStackParamList, 'OrderDetail'>;
};

export function OrderDetailScreen({ route }: OrderDetailScreenProps) {
  const theme = useAppTheme();
  const { orderId } = route.params;

  // Mock order data
  const order = {
    id: orderId,
    orderNumber: '12345',
    fulfillmentStatus: 'shipped',
    financialStatus: 'paid',
    createdAt: new Date().toISOString(),
    lineItems: [
      { id: '1', title: 'Classic T-Shirt', variantTitle: 'M / Black', quantity: 2, price: 29.99 },
      { id: '2', title: 'Denim Jeans', variantTitle: '32 / Blue', quantity: 1, price: 65.00 },
    ],
    subtotalPrice: 124.98,
    totalShipping: 5.99,
    totalTax: 10.00,
    totalPrice: 140.97,
    shippingAddress: { firstName: 'John', lastName: 'Doe', address1: '123 Main St', city: 'New York', province: 'NY', zip: '10001' },
    trackingNumber: '1Z999AA10123456784',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <Card>
          <View style={styles.header}>
            <View>
              <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>Order #{order.orderNumber}</Text>
              <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>{formatDateTime(order.createdAt)}</Text>
            </View>
            <StatusBadge status={order.fulfillmentStatus} />
          </View>
        </Card>

        {/* Tracking */}
        {order.trackingNumber && (
          <Card style={styles.section}>
            <Card.Header><Card.Title>Tracking</Card.Title></Card.Header>
            <Card.Content>
              <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>Tracking Number</Text>
              <Text style={[styles.trackingNumber, { color: theme.colors.onSurface }]}>{order.trackingNumber}</Text>
              <Button variant="outline" size="sm" style={{ marginTop: 12 }}>Track Shipment</Button>
            </Card.Content>
          </Card>
        )}

        {/* Items */}
        <Card style={styles.section}>
          <Card.Header><Card.Title>Items</Card.Title></Card.Header>
          <Card.Content>
            {order.lineItems.map((item) => (
              <View key={item.id} style={[styles.lineItem, { borderBottomColor: theme.colors.outlineVariant }]}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{item.variantTitle}</Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>×{item.quantity}</Text>
                  <Text style={{ color: theme.colors.onSurface, fontWeight: '600' }}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Summary */}
        <Card style={styles.section}>
          <Card.Header><Card.Title>Summary</Card.Title></Card.Header>
          <Card.Content>
            <View style={styles.summaryRow}><Text style={{ color: theme.colors.onSurfaceVariant }}>Subtotal</Text><Text style={{ color: theme.colors.onSurface }}>{formatCurrency(order.subtotalPrice)}</Text></View>
            <View style={styles.summaryRow}><Text style={{ color: theme.colors.onSurfaceVariant }}>Shipping</Text><Text style={{ color: theme.colors.onSurface }}>{formatCurrency(order.totalShipping)}</Text></View>
            <View style={styles.summaryRow}><Text style={{ color: theme.colors.onSurfaceVariant }}>Tax</Text><Text style={{ color: theme.colors.onSurface }}>{formatCurrency(order.totalTax)}</Text></View>
            <View style={[styles.summaryRow, styles.totalRow]}><Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>Total</Text><Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>{formatCurrency(order.totalPrice)}</Text></View>
          </Card.Content>
        </Card>

        {/* Shipping Address */}
        <Card style={styles.section}>
          <Card.Header><Card.Title>Shipping Address</Card.Title></Card.Header>
          <Card.Content>
            <Text style={{ color: theme.colors.onSurface }}>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{order.shippingAddress.address1}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}</Text>
          </Card.Content>
        </Card>

        <Button variant="outline" style={styles.helpButton} fullWidth>Need Help?</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNumber: { fontSize: 20, fontWeight: '700' },
  date: { fontSize: 12, marginTop: 4 },
  section: { marginTop: 16 },
  trackingNumber: { fontSize: 16, fontWeight: '600', fontFamily: 'monospace' },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '500' },
  itemPricing: { alignItems: 'flex-end' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700' },
  helpButton: { marginTop: 24, marginBottom: 32 },
});
