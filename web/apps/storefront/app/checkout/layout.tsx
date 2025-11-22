import Link from 'next/link';

/**
 * Checkout Layout
 * Minimal layout for checkout flow
 */

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Ecomify
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Simple Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ecomify. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            {' · '}
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
