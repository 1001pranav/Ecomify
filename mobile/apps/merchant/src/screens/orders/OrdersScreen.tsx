/**
 * Orders Screen
 * Order list with search and filters
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteOrders } from '@ecomify/hooks';
import { SearchBar, FilterChip, StatusBadge, Card, Skeleton, EmptyState, useAppTheme } from '@ecomify/ui';
import { formatCurrency, formatDate, useDebounce } from '@ecomify/core';
import type { Order, OrderFilters } from '@ecomify/types';
import type { OrdersStackParamList } from '../../navigation/MainNavigator';

type OrdersScreenProps = {
  navigation: NativeStackNavigationProp<OrdersStackParamList, 'OrdersList'>;
};

export function OrdersScreen({ navigation }: OrdersScreenProps) {
  const theme = useAppTheme();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<OrderFilters>({});
  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteOrders({
    search: debouncedSearch,
    ...filters,
  });

  const orders = data?.pages.flatMap((page) => page.data) || [];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => handleOrderPress(item.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
            #{item.orderNumber}
          </Text>
          <StatusBadge status={item.fulfillmentStatus} size="sm" />
        </View>
        <Text style={[styles.orderEmail, { color: theme.colors.onSurfaceVariant }]}>
          {item.email}
        </Text>
        <View style={styles.orderFooter}>
          <Text style={[styles.orderDate, { color: theme.colors.onSurfaceVariant }]}>
            {formatDate(item.createdAt)}
          </Text>
          <Text style={[styles.orderTotal, { color: theme.colors.onSurface }]}>
            {formatCurrency(item.totalPrice)}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search orders..."
        style={styles.searchBar}
      />
      <View style={styles.filters}>
        <FilterChip
          label="All"
          active={!filters.fulfillmentStatus}
          onPress={() => setFilters({})}
        />
        <FilterChip
          label="Unfulfilled"
          active={filters.fulfillmentStatus === 'unfulfilled'}
          onPress={() => setFilters({ fulfillmentStatus: 'unfulfilled' })}
        />
        <FilterChip
          label="Fulfilled"
          active={filters.fulfillmentStatus === 'fulfilled'}
          onPress={() => setFilters({ fulfillmentStatus: 'fulfilled' })}
        />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        <View style={styles.skeletons}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={100} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        <EmptyState
          title="No orders found"
          description="When you receive orders, they'll appear here"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  skeletons: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
});
