import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getRelatedPosts, formatContent } from "@/lib/blog-utils";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      url: `https://invoicefbr.com/blog/${post.slug}`,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    alternates: {
      canonical: `https://invoicefbr.com/blog/${post.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(params.slug, 3);
  const formattedContent = formatContent(post.content);

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition">
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <span>/</span>
            <span className="text-gray-900">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">{post.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <time dateTime={post.date}>{post.dateFormatted}</time>
            <span>•</span>
            <span>By {post.author}</span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="aspect-video rounded-lg mb-8 relative overflow-hidden bg-gray-200 shadow-xl">
          <img
            src={post.image}
            alt={post.imageAlt}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute bottom-4 right-4 text-6xl bg-white/90 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
            {post.icon}
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>

        {/* CTA Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 my-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to Transform Your Invoicing?
          </h3>
          <p className="text-gray-700 mb-6">
            Join 130+ businesses using InvoiceFBR for FBR-compliant invoicing
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Free 7-Day Trial
          </Link>
        </div>

        {/* Share Section */}
        <div className="border-t border-b py-6 my-8">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-semibold">Share this article:</span>
            <div className="flex gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://invoicefbr.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://invoicefbr.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-800"
              >
                LinkedIn
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://invoicefbr.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-gray-100 rounded-lg p-6 my-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">About {post.author}</h3>
          <p className="text-gray-700">
            The Zazteck team consists of experienced developers, business consultants, and FBR compliance experts dedicated to helping Pakistani businesses succeed with modern invoicing solutions.
          </p>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.slug}
                  className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className="aspect-video relative overflow-hidden bg-gray-200">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.imageAlt}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 text-3xl bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                        {relatedPost.icon}
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {relatedPost.category}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 hover:text-blue-600 transition">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 InvoiceFBR by Zazteck. All rights reserved.</p>
        </div>
      </footer>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: {
              "@type": "ImageObject",
              url: post.image,
              width: 1200,
              height: 630,
              caption: post.imageAlt,
            },
            datePublished: post.date,
            dateModified: post.date,
            author: {
              "@type": "Organization",
              name: post.author,
            },
            publisher: {
              "@type": "Organization",
              name: "InvoiceFBR",
              logo: {
                "@type": "ImageObject",
                url: "https://invoicefbr.com/logo.svg",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://invoicefbr.com/blog/${post.slug}`,
            },
            keywords: post.keywords.join(", "),
          }),
        }}
      />
    </div>
  );
}
