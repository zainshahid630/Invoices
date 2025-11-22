import { blogPosts, type BlogPost } from '@/app/blog/blog-data';

/**
 * Get all blog posts sorted by date (newest first)
 */
export function getAllPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts
    .filter((post) => post.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const categories = blogPosts.map((post) => post.category);
  return Array.from(new Set(categories));
}

/**
 * Get related posts (same category, excluding current post)
 */
export function getRelatedPosts(slug: string, limit: number = 3): BlogPost[] {
  const currentPost = getPostBySlug(slug);
  if (!currentPost) return [];

  return blogPosts
    .filter((post) => post.category === currentPost.category && post.slug !== slug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/**
 * Get recent posts
 */
export function getRecentPosts(limit: number = 5): BlogPost[] {
  return getAllPosts().slice(0, limit);
}

/**
 * Search posts by keyword
 */
export function searchPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase();
  return blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Format markdown content to HTML
 */
export function formatContent(content: string): string {
  return content
    .split('\n')
    .map((line) => {
      // Headers
      if (line.startsWith('# ')) {
        return `<h1 class="text-4xl font-bold mt-8 mb-4 text-gray-900">${line.slice(2)}</h1>`;
      }
      if (line.startsWith('## ')) {
        return `<h2 class="text-3xl font-bold mt-8 mb-4 text-gray-900">${line.slice(3)}</h2>`;
      }
      if (line.startsWith('### ')) {
        return `<h3 class="text-2xl font-bold mt-6 mb-3 text-gray-900">${line.slice(4)}</h3>`;
      }
      // Bold
      if (line.startsWith('**') && line.endsWith('**')) {
        return `<p class="font-bold text-gray-900 mt-4">${line.slice(2, -2)}</p>`;
      }
      // Lists
      if (line.startsWith('- ')) {
        return `<li class="ml-6 mb-2">${line.slice(2)}</li>`;
      }
      // Empty lines
      if (line.trim() === '') {
        return '<br />';
      }
      // Regular paragraphs
      return `<p class="mb-4">${line}</p>`;
    })
    .join('');
}
