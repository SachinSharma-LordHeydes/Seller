import { NextApiRequest, NextApiResponse } from 'next';
import { generateRobotsTxt } from '../../lib/sitemap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trueseller.com';

    // Generate robots.txt content
    const robotsTxt = generateRobotsTxt({
      baseUrl,
      disallowPaths: [
        '/admin',
        '/dashboard',
        '/api',
        '/auth',
        '/_next',
        '/static',
        '/*.json$',
        '/*?sort=*',
        '/*?filter=*',
        '/cart',
        '/checkout',
        '/account',
      ],
      crawlDelay: 1,
      additionalRules: [
        '# TrueSeller E-commerce Platform',
        '# Contact: webmaster@trueseller.com',
        '',
        'User-agent: Googlebot',
        'Allow: /',
        'Crawl-delay: 1',
        '',
        'User-agent: Bingbot',
        'Allow: /',
        'Crawl-delay: 2',
        '',
        'User-agent: *',
        'Allow: /',
        'Crawl-delay: 5',
      ],
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // Cache for 24 hours

    return res.status(200).send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
