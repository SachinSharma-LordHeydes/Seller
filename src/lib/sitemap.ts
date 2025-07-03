export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapConfig {
  baseUrl: string;
  defaultChangeFrequency?: SitemapEntry['changeFrequency'];
  defaultPriority?: number;
  excludePatterns?: string[];
}

// Static routes configuration
export const STATIC_ROUTES: Array<Omit<SitemapEntry, 'url'> & { path: string }> = [
  {
    path: '/',
    changeFrequency: 'daily',
    priority: 1.0,
  },
  {
    path: '/about',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/contact',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/privacy',
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    path: '/terms',
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    path: '/help',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/pricing',
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    path: '/features',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
];

// Dynamic route generators
export const DynamicRouteGenerators = {
  // Generate sitemap entries for products
  products: async (config: SitemapConfig): Promise<SitemapEntry[]> => {
    // This would typically fetch from your database or API
    // For now, returning example structure
    try {
      // Replace with actual API call to fetch products
      // const products = await fetch(`${config.baseUrl}/api/products`).then(res => res.json());
      
      // Example products - replace with actual data
      const products = [
        { id: '1', slug: 'premium-widget', updatedAt: '2024-01-15T10:00:00Z' },
        { id: '2', slug: 'deluxe-gadget', updatedAt: '2024-01-14T15:30:00Z' },
        { id: '3', slug: 'standard-tool', updatedAt: '2024-01-13T09:15:00Z' },
      ];

      return products.map(product => ({
        url: `${config.baseUrl}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } catch (error) {
      console.error('Error generating product sitemap entries:', error);
      return [];
    }
  },

  // Generate sitemap entries for categories
  categories: async (config: SitemapConfig): Promise<SitemapEntry[]> => {
    try {
      // Replace with actual API call to fetch categories
      const categories = [
        { id: '1', slug: 'electronics', updatedAt: '2024-01-10T12:00:00Z' },
        { id: '2', slug: 'clothing', updatedAt: '2024-01-09T14:20:00Z' },
        { id: '3', slug: 'home-garden', updatedAt: '2024-01-08T16:45:00Z' },
      ];

      return categories.map(category => ({
        url: `${config.baseUrl}/categories/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    } catch (error) {
      console.error('Error generating category sitemap entries:', error);
      return [];
    }
  },

  // Generate sitemap entries for blog posts
  blog: async (config: SitemapConfig): Promise<SitemapEntry[]> => {
    try {
      // Replace with actual API call to fetch blog posts
      const posts = [
        { id: '1', slug: 'how-to-sell-online', publishedAt: '2024-01-12T08:00:00Z' },
        { id: '2', slug: 'ecommerce-trends-2024', publishedAt: '2024-01-11T10:30:00Z' },
        { id: '3', slug: 'customer-service-tips', publishedAt: '2024-01-10T14:15:00Z' },
      ];

      return posts.map(post => ({
        url: `${config.baseUrl}/blog/${post.slug}`,
        lastModified: post.publishedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      console.error('Error generating blog sitemap entries:', error);
      return [];
    }
  },

  // Generate sitemap entries for user profiles (if public)
  users: async (config: SitemapConfig): Promise<SitemapEntry[]> => {
    try {
      // Only include public user profiles
      // const users = await fetch(`${config.baseUrl}/api/users/public`).then(res => res.json());
      
      // For now, returning empty array - uncomment when you have public user profiles
      return [];
    } catch (error) {
      console.error('Error generating user sitemap entries:', error);
      return [];
    }
  },
};

// Main sitemap generator
export async function generateSitemap(config: SitemapConfig): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  // Add static routes
  for (const route of STATIC_ROUTES) {
    const entry: SitemapEntry = {
      url: `${config.baseUrl}${route.path}`,
      changeFrequency: route.changeFrequency || config.defaultChangeFrequency || 'monthly',
      priority: route.priority || config.defaultPriority || 0.5,
    };
    entries.push(entry);
  }

  // Add dynamic routes
  try {
    const dynamicEntries = await Promise.all([
      DynamicRouteGenerators.products(config),
      DynamicRouteGenerators.categories(config),
      DynamicRouteGenerators.blog(config),
      DynamicRouteGenerators.users(config),
    ]);

    dynamicEntries.forEach(routeEntries => {
      entries.push(...routeEntries);
    });
  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error);
  }

  // Filter out excluded patterns
  if (config.excludePatterns) {
    return entries.filter(entry => {
      return !config.excludePatterns!.some(pattern => {
        const regex = new RegExp(pattern);
        return regex.test(entry.url);
      });
    });
  }

  return entries;
}

// Convert sitemap entries to XML
export function generateSitemapXML(entries: SitemapEntry[]): string {
  const urls = entries.map(entry => {
    const lastMod = entry.lastModified ? `\n    <lastmod>${entry.lastModified}</lastmod>` : '';
    const changeFreq = entry.changeFrequency ? `\n    <changefreq>${entry.changeFrequency}</changefreq>` : '';
    const priority = entry.priority !== undefined ? `\n    <priority>${entry.priority}</priority>` : '';

    return `  <url>
    <loc>${entry.url}</loc>${lastMod}${changeFreq}${priority}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Robots.txt generator
export function generateRobotsTxt(config: SitemapConfig, additionalRules?: string[]): string {
  const rules = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Disallow admin and private areas',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /dashboard/',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /reset-password',
    'Disallow: /verify-email',
    '',
    '# Disallow search and filter pages',
    'Disallow: /search?*',
    'Disallow: /*?*sort=*',
    'Disallow: /*?*filter=*',
    '',
    `Sitemap: ${config.baseUrl}/sitemap.xml`,
  ];

  if (additionalRules) {
    rules.push('', '# Additional rules', ...additionalRules);
  }

  return rules.join('\n');
}

// Sitemap index for large sites
export function generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
  const sitemapEntries = sitemaps.map(sitemap => {
    const lastMod = sitemap.lastmod ? `\n    <lastmod>${sitemap.lastmod}</lastmod>` : '';
    return `  <sitemap>
    <loc>${sitemap.loc}</loc>${lastMod}
  </sitemap>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}
