/**
 * Settings Screen
 * App settings and preferences
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Card, useAppTheme } from '@ecomify/ui';
import { useTheme } from '@ecomify/store';

export function SettingsScreen() {
  const theme = useAppTheme();
  const { theme: currentTheme, setTheme } = useTheme();

  const isDarkMode = currentTheme === 'dark';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Appearance */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Appearance
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* Notifications */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Notifications
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                New Orders
              </Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Get notified when you receive a new order
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                Low Stock Alerts
              </Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Get alerted when products are running low
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* Security */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Security
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                Biometric Login
              </Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Use Face ID or fingerprint to log in
              </Text>
            </View>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            About
          </Text>
          <View style={styles.aboutRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Version</Text>
            <Text style={{ color: theme.colors.onSurface }}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Build</Text>
            <Text style={{ color: theme.colors.onSurface }}>2024.11.22</Text>
          </View>
        </Card>
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
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
});
