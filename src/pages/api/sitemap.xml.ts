import { NextApiRequest, NextApiResponse } from 'next';
import { generateSitemap, generateSitemapXML, SitemapConfig } from '../../lib/sitemap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Configure your sitemap settings
    const config: SitemapConfig = {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://trueseller.com',
      defaultChangeFrequency: 'weekly',
      defaultPriority: 0.5,
      excludePatterns: [
        '/admin.*',
        '/api.*',
        '/dashboard.*',
        '.*\\?.*sort=.*',
        '.*\\?.*filter=.*',
      ],
    };

    // Generate sitemap entries
    const entries = await generateSitemap(config);

    // Convert to XML
    const sitemapXML = generateSitemapXML(entries);

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache for 1 hour

    return res.status(200).send(sitemapXML);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
