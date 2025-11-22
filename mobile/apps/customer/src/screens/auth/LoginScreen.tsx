/**
 * Login Screen
 * Customer authentication
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
import { isValidEmail } from '@ecomify/core';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  const theme = useAppTheme();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!isValidEmail(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email, password);
      navigation.getParent()?.goBack();
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please check your credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Sign in to continue shopping
        </Text>

        <View style={styles.form}>
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

          <Button onPress={handleLogin} loading={isLoading} fullWidth>
            Sign In
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
            <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
          </View>

          <Button variant="outline" fullWidth>
            Continue with Google
          </Button>
          <Button variant="outline" style={{ marginTop: 12 }} fullWidth>
            Continue with Apple
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  form: { marginBottom: 24 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
});
