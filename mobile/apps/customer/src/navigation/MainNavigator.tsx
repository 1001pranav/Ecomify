/**
 * Main Navigator
 * Bottom tab navigation for customer app
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppTheme } from '@ecomify/ui';
import { useCart } from '@ecomify/store';

// Screens
import { ShopScreen } from '../screens/shop/ShopScreen';
import { SearchScreen } from '../screens/shop/SearchScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrderConfirmationScreen } from '../screens/checkout/OrderConfirmationScreen';
import { AccountScreen } from '../screens/account/AccountScreen';
import { OrdersScreen } from '../screens/account/OrdersScreen';
import { OrderDetailScreen } from '../screens/account/OrderDetailScreen';
import { AddressesScreen } from '../screens/account/AddressesScreen';
import { WishlistScreen } from '../screens/account/WishlistScreen';
import { SettingsScreen } from '../screens/account/SettingsScreen';

// Shop Stack
export type ShopStackParamList = {
  ShopHome: undefined;
  Search: undefined;
  Category: { categoryId: string; title: string };
};

const ShopStack = createNativeStackNavigator<ShopStackParamList>();

function ShopNavigator() {
  const theme = useAppTheme();

  return (
    <ShopStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <ShopStack.Screen
        name="ShopHome"
        component={ShopScreen}
        options={{ title: 'Shop' }}
      />
      <ShopStack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
    </ShopStack.Navigator>
  );
}

// Cart Stack
export type CartStackParamList = {
  CartHome: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
};

const CartStack = createNativeStackNavigator<CartStackParamList>();

function CartNavigator() {
  const theme = useAppTheme();

  return (
    <CartStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <CartStack.Screen
        name="CartHome"
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <CartStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <CartStack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ title: 'Order Confirmed', headerBackVisible: false }}
      />
    </CartStack.Navigator>
  );
}

// Account Stack
export type AccountStackParamList = {
  AccountHome: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Addresses: undefined;
  Wishlist: undefined;
  Settings: undefined;
};

const AccountStack = createNativeStackNavigator<AccountStackParamList>();

function AccountNavigator() {
  const theme = useAppTheme();

  return (
    <AccountStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <AccountStack.Screen
        name="AccountHome"
        component={AccountScreen}
        options={{ title: 'Account' }}
      />
      <AccountStack.Screen name="Orders" component={OrdersScreen} />
      <AccountStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
      <AccountStack.Screen name="Addresses" component={AddressesScreen} />
      <AccountStack.Screen name="Wishlist" component={WishlistScreen} />
      <AccountStack.Screen name="Settings" component={SettingsScreen} />
    </AccountStack.Navigator>
  );
}

// Main Tabs
export type MainTabParamList = {
  Shop: undefined;
  Cart: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon with badge
function TabIcon({ label, focused, badge }: { label: string; focused: boolean; badge?: number }) {
  const theme = useAppTheme();

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconText, { color: focused ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
      {badge && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

export function MainNavigator() {
  const theme = useAppTheme();
  const { itemCount } = useCart();

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
        name="Shop"
        component={ShopNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🛍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="🛒" focused={focused} badge={itemCount} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
