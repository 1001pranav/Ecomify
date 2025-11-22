/**
 * Addresses Screen
 * Manage saved addresses
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@ecomify/api';
import { Card, Badge, Button, EmptyState, Skeleton, useAppTheme } from '@ecomify/ui';
import type { Address } from '@ecomify/types';

export function AddressesScreen() {
  const theme = useAppTheme();
  const queryClient = useQueryClient();

  const {
    data: addresses = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => apiClient.addresses.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.addresses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => apiClient.addresses.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
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
            <TouchableOpacity onPress={() => handleSetDefault(item.id)}><Text style={{ color: theme.colors.primary }}>Set Default</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={{ color: theme.colors.error }}>Delete</Text></TouchableOpacity>
          </>
        )}
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.list}>
          {[1, 2].map((i) => (
            <Skeleton key={i} height={140} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  if (addresses.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <EmptyState title="No addresses" description="Add a shipping address" actionLabel="Add Address" onAction={() => {}} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
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
