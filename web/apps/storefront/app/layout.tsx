import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { Providers } from '../components/providers';
import {
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
} from '../lib/seo';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecomify.store';

export const metadata: Metadata = {
  title: {
    default: 'Ecomify Store | Shop Quality Products Online',
    template: '%s | Ecomify Store',
  },
  description:
    'Discover amazing products at Ecomify. Shop our wide selection of quality items with fast shipping, secure checkout, and great prices.',
  keywords: [
    'ecommerce',
    'online shopping',
    'products',
    'store',
    'shop',
    'deals',
    'discounts',
  ],
  authors: [{ name: 'Ecomify' }],
  creator: 'Ecomify',
  publisher: 'Ecomify',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Ecomify Store',
    title: 'Ecomify Store | Shop Quality Products Online',
    description:
      'Discover amazing products at Ecomify. Shop our wide selection of quality items with fast shipping and great prices.',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Ecomify Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ecomify Store | Shop Quality Products Online',
    description:
      'Discover amazing products at Ecomify. Shop our wide selection of quality items.',
    images: [`${SITE_URL}/og-image.jpg`],
    creator: '@ecomify',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateOrganizationJsonLd(),
          }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateWebsiteJsonLd(),
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
