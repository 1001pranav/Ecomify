/**
 * Forgot Password Screen
 * Password reset request
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '@ecomify/api';
import { Button, Input, useAppTheme } from '@ecomify/ui';
import { isValidEmail } from '@ecomify/core';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const theme = useAppTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailError('');
    setIsLoading(true);

    try {
      await apiClient.auth.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.successContent}>
          <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Check your email
          </Text>
          <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            We've sent password reset instructions to {email}
          </Text>
          <Button onPress={() => navigation.navigate('Login')} fullWidth>
            Return to Sign In
          </Button>
          <Button
            variant="ghost"
            onPress={() => setIsSuccess(false)}
            style={styles.retryButton}
          >
            Didn't receive the email? Try again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
              Forgot Password?
            </Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              Enter your email and we'll send you reset instructions
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <Button onPress={handleSubmit} loading={isLoading} fullWidth>
              Send Reset Instructions
            </Button>
          </View>

          {/* Back link */}
          <Button
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            ← Back to Sign In
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  successContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkIcon: {
    fontSize: 40,
    color: '#059669',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
  form: {
    marginBottom: 24,
  },
  backButton: {
    alignSelf: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
});
