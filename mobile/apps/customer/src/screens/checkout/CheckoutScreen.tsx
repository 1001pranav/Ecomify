/**
 * Checkout Screen
 * Multi-step checkout flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCart, useAuth } from '@ecomify/store';
import { Button, Input, Card, useAppTheme } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/core';
import type { CartStackParamList } from '../../navigation/MainNavigator';

type CheckoutNavProp = NativeStackNavigationProp<CartStackParamList, 'Checkout'>;

const shippingMethods = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3 business days' },
  { id: 'overnight', name: 'Overnight', price: 24.99, days: 'Next business day' },
];

export function CheckoutScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<CheckoutNavProp>();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [address, setAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const shippingTotal = selectedShipping.price;
  const total = subtotal + shippingTotal;

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearCart();
      navigation.navigate('OrderConfirmation', { orderId: '12345' });
    } catch (err) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {['Shipping', 'Payment', 'Review'].map((label, index) => {
        const stepNum = index + 1;
        const isActive = step === stepNum;
        const isComplete = step > stepNum;
        return (
          <View key={label} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: isComplete ? theme.colors.primary : isActive ? theme.colors.primary : theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text style={{ color: isComplete || isActive ? '#fff' : theme.colors.onSurfaceVariant }}>
                {isComplete ? '✓' : stepNum}
              </Text>
            </View>
            <Text style={{ color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 4 }}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderShippingStep = () => (
    <View>
      <Card>
        <Card.Header>
          <Card.Title>Shipping Address</Card.Title>
        </Card.Header>
        <Card.Content>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="First Name" value={address.firstName} onChangeText={(v) => setAddress({ ...address, firstName: v })} />
            </View>
            <View style={styles.halfInput}>
              <Input label="Last Name" value={address.lastName} onChangeText={(v) => setAddress({ ...address, lastName: v })} />
            </View>
          </View>
          <Input label="Address" value={address.address1} onChangeText={(v) => setAddress({ ...address, address1: v })} />
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="City" value={address.city} onChangeText={(v) => setAddress({ ...address, city: v })} />
            </View>
            <View style={styles.halfInput}>
              <Input label="State" value={address.state} onChangeText={(v) => setAddress({ ...address, state: v })} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="ZIP Code" value={address.zip} onChangeText={(v) => setAddress({ ...address, zip: v })} keyboardType="number-pad" />
            </View>
            <View style={styles.halfInput}>
              <Input label="Phone" value={address.phone} onChangeText={(v) => setAddress({ ...address, phone: v })} keyboardType="phone-pad" />
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Card.Header>
          <Card.Title>Shipping Method</Card.Title>
        </Card.Header>
        <Card.Content>
          {shippingMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.shippingOption,
                { borderColor: selectedShipping.id === method.id ? theme.colors.primary : theme.colors.outline },
              ]}
              onPress={() => setSelectedShipping(method)}
            >
              <View style={styles.radioOuter}>
                {selectedShipping.id === method.id && (
                  <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                )}
              </View>
              <View style={styles.shippingInfo}>
                <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>{method.name}</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{method.days}</Text>
              </View>
              <Text style={{ color: theme.colors.onSurface, fontWeight: '600' }}>{formatCurrency(method.price)}</Text>
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      <Button onPress={() => setStep(2)} style={{ marginTop: 24 }} fullWidth>
        Continue to Payment
      </Button>
    </View>
  );

  const renderPaymentStep = () => (
    <View>
      <Card>
        <Card.Header>
          <Card.Title>Payment Details</Card.Title>
        </Card.Header>
        <Card.Content>
          <Input
            label="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
          />
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="Expiry" value={expiry} onChangeText={setExpiry} placeholder="MM/YY" />
            </View>
            <View style={styles.halfInput}>
              <Input label="CVV" value={cvv} onChangeText={setCvv} placeholder="123" keyboardType="number-pad" secureTextEntry />
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonRow}>
        <Button variant="outline" onPress={() => setStep(1)} style={{ flex: 1 }}>
          Back
        </Button>
        <Button onPress={() => setStep(3)} style={{ flex: 1 }}>
          Review Order
        </Button>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View>
      <Card>
        <Card.Header>
          <Card.Title>Order Summary</Card.Title>
        </Card.Header>
        <Card.Content>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={{ color: theme.colors.onSurface, flex: 1 }}>
                {item.title} × {item.quantity}
              </Text>
              <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={[styles.orderItem, { borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant, paddingTop: 12, marginTop: 8 }]}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Subtotal</Text>
            <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Shipping</Text>
            <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(shippingTotal)}</Text>
          </View>
          <View style={[styles.orderItem, { marginTop: 8 }]}>
            <Text style={{ color: theme.colors.onSurface, fontWeight: '600', fontSize: 16 }}>Total</Text>
            <Text style={{ color: theme.colors.onSurface, fontWeight: '700', fontSize: 18 }}>{formatCurrency(total)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Card.Header>
          <Card.Title>Shipping To</Card.Title>
        </Card.Header>
        <Card.Content>
          <Text style={{ color: theme.colors.onSurface }}>{address.firstName} {address.lastName}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{address.address1}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{address.city}, {address.state} {address.zip}</Text>
        </Card.Content>
      </Card>

      <View style={styles.buttonRow}>
        <Button variant="outline" onPress={() => setStep(2)} style={{ flex: 1 }}>
          Back
        </Button>
        <Button onPress={handlePlaceOrder} loading={isLoading} style={{ flex: 1 }}>
          Place Order
        </Button>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      {renderStepIndicator()}
      {step === 1 && renderShippingStep()}
      {step === 2 && renderPaymentStep()}
      {step === 3 && renderReviewStep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 32,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  shippingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shippingInfo: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});
