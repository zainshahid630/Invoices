import { MetadataRoute } from 'next'
import { blogPosts } from './blog/blog-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://invoicefbr.com'
  const currentDate = new Date()

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Blog posts - sorted by date (newest first get higher priority)
  const sortedPosts = [...blogPosts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  const blogPages = sortedPosts.map((post, index) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    // Newer posts get slightly higher priority
    priority: index < 3 ? 0.8 : 0.7,
  }))

  return [...staticPages, ...blogPages]
}
