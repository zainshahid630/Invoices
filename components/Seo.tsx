'use client';

import { useEffect } from 'react';

type SeoProps = {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    url?: string;
};

export default function Seo({ title, description, keywords, ogImage, url }: SeoProps) {
    const defaultTitle = 'InvoiceFBR - FBR Invoicing Pakistan | Compliant Digital Invoicing Software';
    const defaultDescription = "Generate FBR-compliant invoices with seamless FBR integration and WhatsApp sharing. Trusted invoicing software for Pakistani businesses. Start your free trial today!";
    const defaultKeywords = [
        'FBR invoicing Pakistan',
        'FBR compliant invoicing',
        'digital invoicing Pakistan',
        'FBR integration',
        'invoice software Pakistan',
        'FBR Digital Invoice',
        'FBR Digital Invoicing System',
        'Pakistan e-invoice',
        'WhatsApp invoice sharing',
        'automated tax calculations Pakistan'
    ];

    const metaTitle = title ? `${title} | InvoiceFBR` : defaultTitle;
    const metaDescription = description || defaultDescription;
    const metaKeywords = (keywords && keywords.length > 0) ? keywords.join(', ') : defaultKeywords.join(', ');
    const metaUrl = url || 'https://invoicefbr.com';
    const metaOgImage = ogImage || 'https://invoicefbr.com/og-image.jpg';

    useEffect(() => {
        // Update document title
        document.title = metaTitle;

        // Helper function to update or create meta tag
        const updateMetaTag = (selector: string, attribute: string, content: string) => {
            let element = document.querySelector(selector) as HTMLMetaElement;
            if (!element) {
                element = document.createElement('meta');
                const attrName = attribute.split('=')[0];
                const attrValue = attribute.split('=')[1].replace(/"/g, '');
                element.setAttribute(attrName, attrValue);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Update meta description
        updateMetaTag('meta[name="description"]', 'name="description"', metaDescription);
        updateMetaTag('meta[name="keywords"]', 'name="keywords"', metaKeywords);

        // Update canonical URL
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', metaUrl);

        // Update Open Graph tags
        updateMetaTag('meta[property="og:title"]', 'property="og:title"', metaTitle);
        updateMetaTag('meta[property="og:description"]', 'property="og:description"', metaDescription);
        updateMetaTag('meta[property="og:image"]', 'property="og:image"', metaOgImage);
        updateMetaTag('meta[property="og:url"]', 'property="og:url"', metaUrl);
        updateMetaTag('meta[property="og:type"]', 'property="og:type"', 'website');
        updateMetaTag('meta[property="og:site_name"]', 'property="og:site_name"', 'InvoiceFBR');

        // Update Twitter Card tags
        updateMetaTag('meta[name="twitter:card"]', 'name="twitter:card"', 'summary_large_image');
        updateMetaTag('meta[name="twitter:title"]', 'name="twitter:title"', metaTitle);
        updateMetaTag('meta[name="twitter:description"]', 'name="twitter:description"', metaDescription);
        updateMetaTag('meta[name="twitter:image"]', 'name="twitter:image"', metaOgImage);
    }, [metaTitle, metaDescription, metaKeywords, metaUrl, metaOgImage]);

    return null; // This component doesn't render anything
}
