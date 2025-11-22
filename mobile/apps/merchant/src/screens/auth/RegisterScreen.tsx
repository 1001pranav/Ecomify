/**
 * Register Screen
 * New merchant registration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@ecomify/store';
import { Button, Input, useAppTheme } from '@ecomify/ui';
import { isValidEmail, validatePassword } from '@ecomify/core';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const theme = useAppTheme();
  const { register, isLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!isValidEmail(email)) newErrors.email = 'Please enter a valid email';

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await register({ email, password, firstName, lastName });
      Alert.alert('Success', 'Account created successfully!');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please try again');
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Start managing your store today
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  error={errors.firstName}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  error={errors.lastName}
                />
              </View>
            </View>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            {/* Password requirements */}
            {password.length > 0 && (
              <View style={styles.requirements}>
                <PasswordRequirement met={passwordValidation.hasMinLength} text="At least 8 characters" />
                <PasswordRequirement met={passwordValidation.hasUppercase} text="One uppercase letter" />
                <PasswordRequirement met={passwordValidation.hasLowercase} text="One lowercase letter" />
                <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
              </View>
            )}

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button onPress={handleRegister} loading={isLoading} fullWidth>
              Create Account
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  const theme = useAppTheme();

  return (
    <View style={styles.requirement}>
      <Text style={{ color: met ? '#10b981' : theme.colors.onSurfaceVariant, fontSize: 12 }}>
        {met ? '✓' : '○'} {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  requirements: {
    marginBottom: 16,
    marginTop: -8,
  },
  requirement: {
    marginVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
