/**
 * Main Navigator
 * Bottom tab navigation for authenticated users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppTheme } from '@ecomify/ui';

// Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { ProductsScreen } from '../screens/products/ProductsScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';
import { ProductFormScreen } from '../screens/products/ProductFormScreen';
import { MoreScreen } from '../screens/more/MoreScreen';
import { SettingsScreen } from '../screens/more/SettingsScreen';
import { ProfileScreen } from '../screens/more/ProfileScreen';

// Tab icons (using text for now, can be replaced with icons)
import { View, Text, StyleSheet } from 'react-native';

// Orders Stack
export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();

function OrdersNavigator() {
  const theme = useAppTheme();

  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <OrdersStack.Screen
        name="OrdersList"
        component={OrdersScreen}
        options={{ title: 'Orders' }}
      />
      <OrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
    </OrdersStack.Navigator>
  );
}

// Products Stack
export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetail: { productId: string };
  ProductForm: { productId?: string };
};

const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();

function ProductsNavigator() {
  const theme = useAppTheme();

  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <ProductsStack.Screen
        name="ProductsList"
        component={ProductsScreen}
        options={{ title: 'Products' }}
      />
      <ProductsStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <ProductsStack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={({ route }) => ({
          title: route.params?.productId ? 'Edit Product' : 'New Product',
        })}
      />
    </ProductsStack.Navigator>
  );
}

// More Stack
export type MoreStackParamList = {
  MoreMenu: undefined;
  Settings: undefined;
  Profile: undefined;
};

const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function MoreNavigator() {
  const theme = useAppTheme();

  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <MoreStack.Screen
        name="MoreMenu"
        component={MoreScreen}
        options={{ title: 'More' }}
      />
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
      <MoreStack.Screen name="Profile" component={ProfileScreen} />
    </MoreStack.Navigator>
  );
}

// Main Tabs
export type MainTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Products: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Simple tab icon component
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>
        {label.charAt(0)}
      </Text>
    </View>
  );
}

export function MainNavigator() {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="D" focused={focused} />,
          headerShown: true,
          headerTitle: 'Dashboard',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="O" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="P" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="M" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabIconTextFocused: {
    color: '#2563eb',
  },
});
