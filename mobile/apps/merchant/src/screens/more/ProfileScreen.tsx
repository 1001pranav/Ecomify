/**
 * Profile Screen
 * User profile management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '@ecomify/store';
import { Card, Button, Input, Avatar, useAppTheme } from '@ecomify/ui';

export function ProfileScreen() {
  const theme = useAppTheme();
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            name={`${firstName} ${lastName}`}
            size="xl"
          />
          <Button variant="ghost" style={styles.changePhotoButton}>
            Change Photo
          </Button>
        </View>

        {/* Profile Form */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Personal Information</Card.Title>
          </Card.Header>
          <Card.Content>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </Card.Content>
        </Card>

        {/* Security */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Security</Card.Title>
          </Card.Header>
          <Card.Content>
            <Button variant="outline" fullWidth>
              Change Password
            </Button>
          </Card.Content>
        </Card>

        {/* Save Button */}
        <View style={styles.actions}>
          <Button onPress={handleSave} loading={isLoading} fullWidth>
            Save Changes
          </Button>
        </View>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  changePhotoButton: {
    marginTop: 12,
  },
  section: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  actions: {
    marginTop: 24,
    marginBottom: 32,
  },
});
