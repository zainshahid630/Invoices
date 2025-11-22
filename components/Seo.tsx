import Head from 'next/head';

type SeoProps = {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    url?: string;
};

export default function Seo({ title, description, keywords, ogImage, url }: SeoProps) {
    const defaultTitle = 'InvoiceFBR - FBR Compliant Invoicing Software Pakistan';
    const defaultDescription = "Pakistan's #1 FBR-compliant invoicing software. Create professional invoices, automate FBR posting. Trusted by 130+ businesses. Free trial.";
    const defaultKeywords = [
        'FBR Digital Invoice',
        'FBR Digital Invoicing System',
        'Pakistan e-invoice',
        'FBR e-invoice',
        'Digital invoicing Pakistan',
        // ... (additional keywords can be added as needed)
    ];

    const metaTitle = title ? `${title} | InvoiceFBR` : defaultTitle;
    const metaDescription = description || defaultDescription;
    const metaKeywords = (keywords && keywords.length > 0) ? keywords.join(', ') : defaultKeywords.join(', ');
    const metaUrl = url || 'https://invoicefbr.com';
    const metaOgImage = ogImage || 'https://invoicefbr.com/og-image.jpg';

    return (
        <Head>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaOgImage} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaOgImage} />
        </Head>
    );
}
