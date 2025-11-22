/**
 * Root Navigator
 * Main navigation structure for customer app
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainNavigator } from './MainNavigator';
import { AuthNavigator } from './AuthNavigator';
import { useAuth } from '@ecomify/store';

// Product detail is accessible from anywhere
import { ProductDetailScreen } from '../screens/shop/ProductDetailScreen';

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: '' }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
