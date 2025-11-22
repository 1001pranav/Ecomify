'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
} from 'lucide-react';
import {
  Button,
  Sheet,
  SheetContent,
  SheetTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
} from '@ecomify/ui';
import { useCart } from '../../stores/cart-store';
import { useAuth } from '../../stores/auth-store';
import { SearchBar } from '../search/search-bar';
import { CartDrawer } from '../cart/cart-drawer';

/**
 * Header Component - Compound Component Pattern
 * Main navigation header for the storefront
 */

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    href: '/products',
    children: [
      { label: 'All Products', href: '/products' },
      { label: 'New Arrivals', href: '/products?sort=newest' },
      { label: 'Best Sellers', href: '/products?sort=best-selling' },
      { label: 'On Sale', href: '/products?on_sale=true' },
    ],
  },
  { label: 'Collections', href: '/collections' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { getItemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top bar - Optional announcement */}
        <div className="hidden border-b py-2 text-center text-sm text-muted-foreground md:block">
          Free shipping on orders over $50 | Shop now
        </div>

        {/* Main header */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <MobileNav items={navItems} onClose={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight">Ecomify</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <SearchBar />

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            {/* User menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">Order History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Sign in</span>
                </Link>
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </Badge>
              )}
              <span className="sr-only">Cart ({itemCount} items)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

/**
 * Desktop Nav Item with Dropdown
 */
function NavItemComponent({ item }: { item: NavItem }) {
  if (item.children) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-1">
            {item.label}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {item.children.map((child) => (
            <DropdownMenuItem key={child.href} asChild>
              <Link href={child.href}>{child.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link
      href={item.href}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {item.label}
    </Link>
  );
}

/**
 * Mobile Navigation
 */
function MobileNav({
  items,
  onClose,
}: {
  items: NavItem[];
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <Link href="/" onClick={onClose} className="text-xl font-bold">
        Ecomify
      </Link>
      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={onClose}
              className="block py-2 text-lg font-medium"
            >
              {item.label}
            </Link>
            {item.children && (
              <div className="ml-4 flex flex-col gap-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className="block py-1 text-muted-foreground"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
