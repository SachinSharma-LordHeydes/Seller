'use client';

import Head from 'next/head';
import { JsonLd } from './JsonLd';

export interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  structuredData?: Record<string, any>;
  noIndex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_TITLE = 'TrueSeller - E-commerce Platform';
const DEFAULT_DESCRIPTION = 'TrueSeller is a modern e-commerce platform for sellers to manage products, orders, and grow their business online.';
const DEFAULT_KEYWORDS = ['e-commerce', 'online store', 'selling platform', 'business management'];
const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

export function MetaTags({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noIndex = false,
  author,
  publishedTime,
  modifiedTime,
}: MetaTagsProps) {
  const fullTitle = title ? `${title} | TrueSeller` : DEFAULT_TITLE;
  const keywordsString = keywords.join(', ');

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywordsString} />
        {author && <meta name="author" content={author} />}
        
        {/* Robots */}
        {noIndex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow" />
        )}
        
        {/* Canonical URL */}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        
        {/* Open Graph */}
        <meta property="og:type" content={ogType} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="TrueSeller" />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        {publishedTime && <meta property="article:published_time" content={publishedTime} />}
        {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:site" content="@trueseller" />
        <meta name="twitter:creator" content="@trueseller" />
        
        {/* Additional Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      
      {/* Structured Data */}
      {structuredData && <JsonLd data={structuredData} />}
    </>
  );
}

// Pre-configured SEO for common page types
export const SEOTemplates = {
  product: (product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    brand?: string;
    category?: string;
    sku?: string;
    availability?: string;
  }) => ({
    title: product.name,
    description: product.description,
    ogType: 'product' as const,
    ogImage: product.images[0],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images,
      brand: product.brand ? {
        '@type': 'Brand',
        name: product.brand,
      } : undefined,
      category: product.category,
      sku: product.sku,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: `https://schema.org/${product.availability || 'InStock'}`,
      },
    },
  }),
  
  homepage: () => ({
    title: 'TrueSeller - E-commerce Platform for Modern Sellers',
    description: 'Grow your business with TrueSeller\'s comprehensive e-commerce platform. Manage products, track orders, analyze sales, and scale your online store.',
    keywords: ['e-commerce platform', 'online store builder', 'selling tools', 'business management', 'order tracking'],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'TrueSeller',
      url: process.env.NEXT_PUBLIC_SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  }),
  
  dashboard: () => ({
    title: 'Dashboard',
    description: 'Manage your e-commerce business with TrueSeller\'s comprehensive dashboard. View analytics, track orders, and manage products.',
    noIndex: true, // Private area
  }),
  
  category: (category: {
    name: string;
    description: string;
    productCount: number;
  }) => ({
    title: `${category.name} Products`,
    description: `Browse ${category.productCount} ${category.name.toLowerCase()} products. ${category.description}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name} Products`,
      description: category.description,
      numberOfItems: category.productCount,
    },
  }),
};
