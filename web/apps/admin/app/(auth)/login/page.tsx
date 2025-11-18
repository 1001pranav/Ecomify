'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@ecomify/ui';
import { useLogin } from '@ecomify/api-client';
import { useAuth } from '../../../stores/auth-store';

/**
 * Login Form Validation Schema
 * Uses Zod for type-safe validation
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Login Page Component
 * Demonstrates Form validation with React Hook Form + Zod
 */
export default function LoginPage() {
  const router = useRouter();
  const { login: setAuthState } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // React Hook Form with Zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Login mutation
  const { mutate: login, isPending } = useLogin({
    onSuccess: (data) => {
      // Store auth state
      setAuthState(data.tokens.accessToken, data.user);

      // Store refresh token separately
      localStorage.setItem('refresh-token', data.tokens.refreshToken);

      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error) => {
      setError(error.message || 'Login failed. Please try again.');
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setError(null);
    login(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
