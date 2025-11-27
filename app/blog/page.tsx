import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getAllCategories } from "@/lib/blog-utils";
import type { BlogPost } from "@/app/blog/blog-data";

export const metadata: Metadata = {
  title: "Blog - FBR Invoicing Tips & Business Insights",
  description: "Expert insights on FBR compliance, invoicing best practices, tax regulations, and business growth strategies for Pakistani businesses.",
  keywords: [
    "FBR compliance blog",
    "invoicing tips Pakistan",
    "business tax Pakistan",
    "FBR regulations",
    "invoice management tips",
    "GST Pakistan guide",
    "small business Pakistan",
  ],
  openGraph: {
    title: "InvoiceFBR Blog - FBR Compliance & Business Tips",
    description: "Expert insights on FBR compliance, invoicing, and business growth for Pakistani businesses.",
    type: "website",
    url: "https://invoicefbr.com/blog",
  },
  alternates: {
    canonical: "https://invoicefbr.com/blog",
    types: {
      'application/rss+xml': [
        { url: '/blog/rss.xml', title: 'InvoiceFBR Blog RSS Feed' },
      ],
    },
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              InvoiceFBR
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition">
                Home
              </Link>
              <Link href="/blog" className="text-blue-600 font-semibold">
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                InvoiceFBR Blog
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                Expert insights on FBR compliance, invoicing best practices, and business growth strategies for Pakistani businesses.
              </p>
            </div>
            <a
              href="/blog/rss.xml"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z" />
              </svg>
              RSS Feed
            </a>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm">
            All Posts
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-200 transition"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: BlogPost) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="aspect-video relative overflow-hidden bg-gray-200">
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 text-4xl bg-white/90 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                    {post.icon}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <time dateTime={post.date}>{post.dateFormatted}</time>
                    <span className="text-blue-600 font-semibold hover:underline">
                      Read more →
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Simplify Your Invoicing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 130+ businesses using InvoiceFBR for FBR-compliant invoicing
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 InvoiceFBR by Zazteck. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
