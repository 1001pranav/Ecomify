/**
 * Addresses Screen
 * Manage saved addresses
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Card, Badge, Button, EmptyState, useAppTheme } from '@ecomify/ui';
import type { Address } from '@ecomify/types';

const mockAddresses: Address[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', address1: '123 Main St', city: 'New York', province: 'NY', provinceCode: 'NY', country: 'United States', countryCode: 'US', zip: '10001', phone: '+1 555-123-4567', isDefault: true },
  { id: '2', firstName: 'John', lastName: 'Doe', address1: '456 Work Ave', address2: 'Suite 100', city: 'New York', province: 'NY', provinceCode: 'NY', country: 'United States', countryCode: 'US', zip: '10002', isDefault: false },
];

export function AddressesScreen() {
  const theme = useAppTheme();

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive' },
    ]);
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <Card style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.firstName} {item.lastName}</Text>
        {item.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
      </View>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>{item.address1}</Text>
      {item.address2 && <Text style={{ color: theme.colors.onSurfaceVariant }}>{item.address2}</Text>}
      <Text style={{ color: theme.colors.onSurfaceVariant }}>{item.city}, {item.province} {item.zip}</Text>
      {item.phone && <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>{item.phone}</Text>}
      <View style={styles.actions}>
        <TouchableOpacity><Text style={{ color: theme.colors.primary }}>Edit</Text></TouchableOpacity>
        {!item.isDefault && (
          <>
            <TouchableOpacity><Text style={{ color: theme.colors.primary }}>Set Default</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={{ color: theme.colors.error }}>Delete</Text></TouchableOpacity>
          </>
        )}
      </View>
    </Card>
  );

  if (mockAddresses.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <EmptyState title="No addresses" description="Add a shipping address" actionLabel="Add Address" onAction={() => {}} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={mockAddresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={<Button onPress={() => {}} fullWidth>Add New Address</Button>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { justifyContent: 'center' },
  list: { padding: 16 },
  addressCard: { marginBottom: 12 },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
});
