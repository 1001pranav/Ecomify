/**
 * Account Screen
 * User account home
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@ecomify/store';
import { Card, Avatar, Button, useAppTheme } from '@ecomify/ui';
import type { AccountStackParamList } from '../../navigation/MainNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type AccountNavProp = NativeStackNavigationProp<AccountStackParamList, 'AccountHome'>;

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
}

function MenuItem({ icon, title, onPress }: MenuItemProps) {
  const theme = useAppTheme();
  return (
    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.outlineVariant }]} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuTitle, { color: theme.colors.onSurface }]}>{title}</Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>›</Text>
    </TouchableOpacity>
  );
}

export function AccountScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<AccountNavProp>();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.guestContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.guestIcon}>👤</Text>
        <Text style={[styles.guestTitle, { color: theme.colors.onSurface }]}>Sign in to your account</Text>
        <Text style={[styles.guestSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Track orders, save items, and more
        </Text>
        <Button onPress={() => rootNav.navigate('Auth')} style={{ marginTop: 24 }}>
          Sign In
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Profile Header */}
        <Card>
          <View style={styles.profileHeader}>
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.onSurfaceVariant }]}>
                {user?.email}
              </Text>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          <MenuItem icon="📦" title="My Orders" onPress={() => navigation.navigate('Orders')} />
          <MenuItem icon="📍" title="Addresses" onPress={() => navigation.navigate('Addresses')} />
          <MenuItem icon="❤️" title="Wishlist" onPress={() => navigation.navigate('Wishlist')} />
          <MenuItem icon="⚙️" title="Settings" onPress={() => navigation.navigate('Settings')} />
        </Card>

        {/* Support */}
        <Card style={styles.menuCard}>
          <MenuItem icon="💬" title="Help & Support" onPress={() => Alert.alert('Help', 'Contact support@ecomify.com')} />
          <MenuItem icon="📜" title="Terms & Policies" onPress={() => {}} />
        </Card>

        {/* Logout */}
        <Button variant="outline" onPress={handleLogout} style={styles.logoutButton} fullWidth>
          Log Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  guestContainer: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  guestIcon: { fontSize: 60, marginBottom: 16 },
  guestTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  guestSubtitle: { fontSize: 14, textAlign: 'center' },
  content: { padding: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  profileInfo: { marginLeft: 16 },
  profileName: { fontSize: 18, fontWeight: '600' },
  profileEmail: { fontSize: 14, marginTop: 2 },
  menuCard: { marginTop: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuTitle: { flex: 1, fontSize: 16 },
  logoutButton: { marginTop: 24, marginBottom: 32 },
});
