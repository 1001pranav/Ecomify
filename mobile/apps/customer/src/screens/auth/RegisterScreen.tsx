/**
 * Register Screen
 * New customer registration
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName) newErrors.firstName = 'Required';
    if (!lastName) newErrors.lastName = 'Required';
    if (!email) newErrors.email = 'Required';
    else if (!isValidEmail(email)) newErrors.email = 'Invalid email';
    if (!validatePassword(password).isValid) {
      newErrors.password = 'Min 8 chars with uppercase, lowercase, number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({ email, password, firstName, lastName });
      Alert.alert('Welcome!', 'Account created successfully');
      navigation.getParent()?.goBack();
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please try again');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Join us and start shopping
        </Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input label="First Name" value={firstName} onChangeText={setFirstName} error={errors.firstName} />
            </View>
            <View style={styles.halfInput}>
              <Input label="Last Name" value={lastName} onChangeText={setLastName} error={errors.lastName} />
            </View>
          </View>
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />

          <Button onPress={handleRegister} loading={isLoading} fullWidth>
            Create Account
          </Button>
        </View>

        <Text style={[styles.terms, { color: theme.colors.onSurfaceVariant }]}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  form: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  terms: { fontSize: 12, textAlign: 'center', marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
});
