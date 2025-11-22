import type { Metadata } from 'next';
import type { Product } from '@ecomify/types';

/**
 * SEO Utilities
 * Helpers for generating metadata and structured data
 */

const SITE_NAME = 'Ecomify Store';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecomify.store';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

/**
 * Generate metadata for a page
 */
export function generateMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
}: SeoConfig): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const defaultDescription =
    'Discover amazing products at Ecomify. Shop our wide selection of quality items with fast shipping and great prices.';
  const finalDescription = description || defaultDescription;
  const defaultImage = `${SITE_URL}/og-image.jpg`;
  const finalImage = image || defaultImage;
  const finalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return {
    title: fullTitle,
    description: finalDescription,
    keywords: keywords?.join(', '),
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: finalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: finalDescription,
      url: finalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
      locale: 'en_US',
      type: type === 'product' ? 'website' : type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: finalDescription,
      images: [finalImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Generate product structured data (JSON-LD)
 */
export function generateProductJsonLd(product: Product): string {
  const variant = product.variants[0];
  const image = product.images[0]?.url;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: image ? [image] : undefined,
    sku: variant?.sku,
    brand: {
      '@type': 'Brand',
      name: product.vendor || SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.handle}`,
      priceCurrency: 'USD',
      price: variant?.price,
      priceValidUntil: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      availability:
        variant && variant.inventory > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate organization structured data
 */
export function generateOrganizationJsonLd(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/ecomify',
      'https://facebook.com/ecomify',
      'https://instagram.com/ecomify',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-123-4567',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate website search structured data
 */
export function generateWebsiteJsonLd(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(jsonLd);
}
