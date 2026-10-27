import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bvilladanang.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/app-data', '/api/mcp', '/.well-known/', '/openapi.json', '/llms.txt'],
        disallow: ['/admin/', '/admin', '/api/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
