import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ecomify/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-2xl font-bold">Ecomify Store</div>
          <nav className="flex items-center gap-6">
            <Link href="/products" className="text-sm hover:text-primary">
              Products
            </Link>
            <Link href="/about" className="text-sm hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-sm hover:text-primary">
              Contact
            </Link>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Welcome to Ecomify Store
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          Discover amazing products at unbeatable prices. Sprint 0 implementation
          is complete with all design patterns in place!
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/products">Shop Now</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Sprint 0 Complete
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Design System</CardTitle>
              <CardDescription>shadcn/ui Components</CardDescription>
            </CardHeader>
            <CardContent>
              Theme provider, design tokens, and 20+ base components using
              Compound Component Pattern.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Client</CardTitle>
              <CardDescription>Singleton & Facade Patterns</CardDescription>
            </CardHeader>
            <CardContent>
              Type-safe API client with interceptors, token refresh, and React
              Query integration.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>State Management</CardTitle>
              <CardDescription>Zustand & Observer Pattern</CardDescription>
            </CardHeader>
            <CardContent>
              Auth store, cart store, and UI store with localStorage persistence.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>HOC Pattern</CardDescription>
            </CardHeader>
            <CardContent>
              Protected routes using withAuth HOC, form validation with React Hook
              Form + Zod.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>TypeScript</CardTitle>
              <CardDescription>Strict Mode</CardDescription>
            </CardHeader>
            <CardContent>
              Full type safety with shared types package, strict TypeScript
              configuration.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monorepo</CardTitle>
              <CardDescription>Turborepo</CardDescription>
            </CardHeader>
            <CardContent>
              Shared packages for UI, types, utils, hooks, and API client across
              apps.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Ecomify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
