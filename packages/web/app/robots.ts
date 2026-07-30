import { APP_URL } from '@formbro/shared/brand'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/f/',
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
