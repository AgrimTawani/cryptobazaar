import { MetadataRoute } from 'next';
import { ARTICLES_CATEGORIES } from '@/data/articlesData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cryptobazaar.co.in';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic article pages — one entry per article
  const articlePages: MetadataRoute.Sitemap = ARTICLES_CATEGORIES.flatMap(
    (category) =>
      category.articles.map((article) => ({
        url: `${baseUrl}/articles/${article.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
  );

  return [...staticPages, ...articlePages];
}
