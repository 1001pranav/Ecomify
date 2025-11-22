/**
 * More Screen
 * Additional options and settings
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@ecomify/store';
import { Card, Avatar, useAppTheme } from '@ecomify/ui';
import type { MoreStackParamList } from '../../navigation/MainNavigator';

type MoreScreenProps = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>;
};

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ title, subtitle, onPress, destructive }: MenuItemProps) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: theme.colors.outlineVariant }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <Text
          style={[
            styles.menuItemTitle,
            { color: destructive ? theme.colors.error : theme.colors.onSurface },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.menuItemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>›</Text>
    </TouchableOpacity>
  );
}

export function MoreScreen({ navigation }: MoreScreenProps) {
  const theme = useAppTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Profile Card */}
        <Card>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Avatar
              name={user ? `${user.firstName} ${user.lastName}` : 'User'}
              size="lg"
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.onSurfaceVariant }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Store Section */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Store
          </Text>
          <MenuItem
            title="Analytics"
            subtitle="View store performance"
            onPress={() => Alert.alert('Analytics', 'Coming soon!')}
          />
          <MenuItem
            title="Customers"
            subtitle="View customer list"
            onPress={() => Alert.alert('Customers', 'Coming soon!')}
          />
          <MenuItem
            title="Discounts"
            subtitle="Manage promotions"
            onPress={() => Alert.alert('Discounts', 'Coming soon!')}
          />
        </Card>

        {/* Settings Section */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Settings
          </Text>
          <MenuItem
            title="Settings"
            subtitle="App preferences"
            onPress={() => navigation.navigate('Settings')}
          />
          <MenuItem
            title="Notifications"
            subtitle="Manage push notifications"
            onPress={() => Alert.alert('Notifications', 'Coming soon!')}
          />
          <MenuItem
            title="Help & Support"
            subtitle="Get help"
            onPress={() => Alert.alert('Help', 'Contact support@ecomify.com')}
          />
        </Card>

        {/* Logout */}
        <Card style={styles.section}>
          <MenuItem
            title="Log Out"
            onPress={handleLogout}
            destructive
          />
        </Card>

        {/* App Version */}
        <Text style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
  },
  menuItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
  },
});
