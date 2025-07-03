'use client';

export interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Schema.org structured data generators
export const SchemaGenerators = {
  // Organization schema for company pages
  organization: (org: {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    address?: {
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    contactPoint?: {
      telephone: string;
      email: string;
      contactType: string;
    };
    socialMedia?: string[];
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    description: org.description,
    address: org.address ? {
      '@type': 'PostalAddress',
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.city,
      addressRegion: org.address.state,
      postalCode: org.address.postalCode,
      addressCountry: org.address.country,
    } : undefined,
    contactPoint: org.contactPoint ? {
      '@type': 'ContactPoint',
      telephone: org.contactPoint.telephone,
      email: org.contactPoint.email,
      contactType: org.contactPoint.contactType,
    } : undefined,
    sameAs: org.socialMedia,
  }),

  // Breadcrumb schema for navigation
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  // FAQ schema for FAQ pages
  faq: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  // Article schema for blog posts
  article: (article: {
    headline: string;
    description: string;
    image: string[];
    author: string;
    publisher: string;
    publishedTime: string;
    modifiedTime?: string;
    url: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: article.publisher,
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    url: article.url,
  }),

  // Product schema with reviews and ratings
  productWithReviews: (product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    brand?: string;
    category?: string;
    sku?: string;
    availability?: string;
    reviews?: Array<{
      author: string;
      rating: number;
      reviewBody: string;
      datePublished: string;
    }>;
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
  }) => ({
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
    review: product.reviews?.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished,
    })),
    aggregateRating: product.aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount,
      bestRating: 5,
    } : undefined,
  }),

  // LocalBusiness schema for physical stores
  localBusiness: (business: {
    name: string;
    description: string;
    url: string;
    telephone: string;
    email?: string;
    address: {
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    openingHours?: string[];
    priceRange?: string;
    image?: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: business.url,
    telephone: business.telephone,
    email: business.email,
    image: business.image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.streetAddress,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    openingHoursSpecification: business.openingHours?.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2],
    })),
    priceRange: business.priceRange,
  }),

  // WebPage schema for general pages
  webPage: (page: {
    name: string;
    description: string;
    url: string;
    image?: string;
    breadcrumb?: Array<{ name: string; url: string }>;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    url: page.url,
    image: page.image,
    breadcrumb: page.breadcrumb ? {
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumb.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    } : undefined,
  }),
};
