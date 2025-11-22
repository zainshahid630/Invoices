import { getAllPosts } from '@/lib/blog-utils';

export async function GET() {
  const posts = getAllPosts();
  const baseUrl = 'https://invoicefbr.com';

  const rssItems = posts
    .map((post) => {
      // Properly escape the image URL for XML
      const escapedImageUrl = post.image
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author><![CDATA[info@zazteck.com (${post.author})]]></author>
      <category><![CDATA[${post.category}]]></category>
      ${post.keywords.map((keyword) => `<category><![CDATA[${keyword}]]></category>`).join('\n      ')}
      <enclosure url="${escapedImageUrl}" type="image/jpeg" length="0" />
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[InvoiceFBR Blog - FBR Compliance & Invoicing Tips]]></title>
    <link>${baseUrl}/blog</link>
    <description><![CDATA[Expert insights on FBR compliance, invoicing best practices, and business growth strategies for Pakistani businesses.]]></description>
    <language>en-PK</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.svg</url>
      <title><![CDATA[InvoiceFBR]]></title>
      <link>${baseUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
