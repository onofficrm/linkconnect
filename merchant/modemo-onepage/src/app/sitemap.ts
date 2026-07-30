import { MetadataRoute } from 'next';

export const dynamic = "force-static";

const BASE_URL = 'https://linkconnect.co.kr/merchant/modemo';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        }
    ];
}
