/**
 * Order Confirmation Screen
 * Success screen after placing order
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Button, Card, useAppTheme } from '@ecomify/ui';
import type { CartStackParamList } from '../../navigation/MainNavigator';

type OrderConfirmationScreenProps = {
  route: RouteProp<CartStackParamList, 'OrderConfirmation'>;
};

export function OrderConfirmationScreen({ route }: OrderConfirmationScreenProps) {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const { orderId } = route.params;

  const handleContinueShopping = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Order Confirmed!
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Thank you for your purchase
        </Text>

        <Card style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Order Number</Text>
            <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
              #{orderId}
            </Text>
          </View>
          <Text style={[styles.emailNote, { color: theme.colors.onSurfaceVariant }]}>
            A confirmation email has been sent to your email address.
          </Text>
        </Card>

        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: theme.colors.onSurface }]}>
            What's Next?
          </Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📦</Text>
            <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              We're preparing your order for shipment
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📧</Text>
            <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              You'll receive tracking info via email
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🚚</Text>
            <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              Expected delivery in 5-7 business days
            </Text>
          </View>
        </View>

        <Button onPress={handleContinueShopping} fullWidth>
          Continue Shopping
        </Button>

        <Button variant="outline" style={styles.ordersButton} fullWidth>
          View My Orders
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
    color: '#059669',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  orderCard: {
    width: '100%',
    marginBottom: 24,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  emailNote: {
    fontSize: 13,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  ordersButton: {
    marginTop: 12,
  },
});
