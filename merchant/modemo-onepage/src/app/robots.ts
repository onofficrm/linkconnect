import { MetadataRoute } from 'next';

export const dynamic = "force-static";

const BASE_URL = 'https://www.modemo.co.kr';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
