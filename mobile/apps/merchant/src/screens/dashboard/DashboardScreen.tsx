/**
 * Dashboard Screen
 * Merchant dashboard with key metrics
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@ecomify/api';
import { Card, MetricCard, Skeleton, useAppTheme } from '@ecomify/ui';
import { formatCurrency, formatRelativeTime, CACHE_CONFIG } from '@ecomify/core';
import type { Order, DashboardMetrics } from '@ecomify/types';

export function DashboardScreen() {
  const theme = useAppTheme();

  const {
    data: metrics,
    isLoading: metricsLoading,
    refetch: refetchMetrics,
    isRefetching: isRefetchingMetrics,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.analytics.getDashboard(),
    staleTime: CACHE_CONFIG.ANALYTICS_STALE_TIME,
  });

  const {
    data: recentOrders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isRefetching: isRefetchingOrders,
  } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      const response = await apiClient.orders.list({ limit: 5 });
      return response.data || [];
    },
    staleTime: CACHE_CONFIG.ORDERS_STALE_TIME,
  });

  const isLoading = metricsLoading || ordersLoading;
  const isRefetching = isRefetchingMetrics || isRefetchingOrders;

  const refetch = () => {
    refetchMetrics();
    refetchOrders();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.metricsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.metricItem}>
                <Skeleton height={120} borderRadius={12} />
              </View>
            ))}
          </View>
          <Skeleton height={200} borderRadius={12} style={{ marginTop: 16 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <MetricCard
              title="Today's Sales"
              value={formatCurrency(metrics?.todaySales || 0)}
              change="+12.5%"
              trend="up"
            />
          </View>
          <View style={styles.metricItem}>
            <MetricCard
              title="Orders"
              value={metrics?.orders || 0}
              change="+8.2%"
              trend="up"
            />
          </View>
          <View style={styles.metricItem}>
            <MetricCard
              title="Visitors"
              value={metrics?.visitors || 0}
              change="-3.1%"
              trend="down"
            />
          </View>
          <View style={styles.metricItem}>
            <MetricCard
              title="Conversion"
              value={`${metrics?.conversionRate || 0}%`}
              change="+1.2%"
              trend="up"
            />
          </View>
        </View>

        {/* Recent Orders */}
        <Card style={styles.ordersCard}>
          <Card.Header>
            <Card.Title>Recent Orders</Card.Title>
            <TouchableOpacity>
              <Text style={{ color: theme.colors.primary }}>See All</Text>
            </TouchableOpacity>
          </Card.Header>
          <Card.Content>
            {(recentOrders || []).map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderItem, { borderBottomColor: theme.colors.outlineVariant }]}
              >
                <View style={styles.orderInfo}>
                  <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
                    #{order.orderNumber}
                  </Text>
                  <Text style={[styles.orderEmail, { color: theme.colors.onSurfaceVariant }]}>
                    {order.email}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={[styles.orderTotal, { color: theme.colors.onSurface }]}>
                    {formatCurrency(order.totalPrice || 0)}
                  </Text>
                  <Text style={[styles.orderTime, { color: theme.colors.onSurfaceVariant }]}>
                    {formatRelativeTime(order.createdAt || '')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <Card style={styles.statsCard}>
          <Card.Header>
            <Card.Title>This Month</Card.Title>
          </Card.Header>
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(metrics?.monthSales || 0)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Revenue
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {formatCurrency(metrics?.averageOrderValue || 0)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Avg. Order
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    width: '48%',
  },
  ordersCard: {
    marginTop: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderTime: {
    fontSize: 12,
    marginTop: 2,
  },
  statsCard: {
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
