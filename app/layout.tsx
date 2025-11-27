import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import ToastProvider from "./components/ToastProvider";
import GoogleAnalytics from "@/lib/google-analytics";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://invoicefbr.com'),
  title: {
    default: "Digital Invoice FBR | Best FBR Invoice Software Pakistan | InvoiceFBR",
    template: "%s | InvoiceFBR"
  },
  description: "Digital Invoice FBR software trusted by 130+ Pakistani businesses. Generate FBR-compliant invoices, automate tax filing, QR codes. Best FBR invoice solution. Free 7-day trial!",
  keywords: [
    // Primary Keywords
    "FBR Digital Invoice",
    "FBR Digital Invoicing System",
    "Pakistan e-invoice",
    "FBR e-invoice",
    "Digital invoicing Pakistan",
    "FBR invoice verification",
    "FBR invoice submission",
    "FBR POS invoice",
    "FBR tax invoice",
    "Tax invoice Pakistan",
    "FBR e-services",
    "FBR invoice API",
    "FBR sales tax invoice",
    "FBR integration API",
    "Digital tax system Pakistan",
    "FBR QR invoice",
    // Secondary Keywords
    "What is FBR digital invoice",
    "How to submit invoice to FBR",
    "FBR invoice validation",
    "FBR invoice token",
    "FBR invoice format",
    "FBR invoicing rules",
    "FBR new tax system",
    "FBR invoice software",
    "Pakistan tax invoicing",
    "FBR API documentation",
    "FBR sandbox API",
    "FBR test invoice",
    "Real-time invoice reporting",
    "Sales tax reporting Pakistan",
    "Tax compliance software Pakistan",
    // Long-tail Keywords
    "How to generate digital invoice for FBR",
    "How to automate FBR invoice submission",
    "Best digital invoicing software in Pakistan",
    "How to integrate POS with FBR",
    "Digital invoice with QR code Pakistan",
    "FBR invoice error codes",
    "FBR invoice rejected solution",
    "FBR digital invoice requirements",
    "Step-by-step FBR invoice registration",
    "Online invoice portal Pakistan",
    "How to check invoice status on FBR",
    "E-invoicing benefits for businesses in Pakistan",
    // Service / Software Keywords
    "FBR invoice generator",
    "FBR invoicing software Pakistan",
    "Online invoice system Pakistan",
    "Digital invoice management",
    "Invoice automation system",
    "QR invoice generator Pakistan",
    "Cloud invoicing software",
    "FBR API integration service",
    // Taxation Keywords
    "Sales tax Pakistan",
    "NTN registration Pakistan",
    "FBR login",
    "STRN registration",
    "POS integration FBR",
    "FBR compliance",
    "Withholding tax Pakistan",
    "Income tax Pakistan",
    "FBR return filing",
    // Brand + SEO Keywords
    "InvoiceFBR digital invoicing",
    "InvoiceFBR QR invoice generator",
    "InvoiceFBR FBR integration",
    "InvoiceFBR tax invoice maker",
    "InvoiceFBR cloud invoice system",
    "InvoiceFBR e-invoice API",
    "InvoiceFBR for businesses",
    "InvoiceFBR online tax invoicing",
    // Transactional Keywords
    "Buy digital invoice software Pakistan",
    "FBR invoice solution",
    "FBR invoice submission service",
    "POS integration service Pakistan",
    "Best tax invoice software",
    "E-invoice generator online",
    "FBR software provider"
  ],
  authors: [{ name: "Zazteck", url: "https://zazteck.com" }],
  creator: "Zazteck",
  publisher: "Zazteck",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [
      { url: '/icon.svg' },
      { url: '/icon.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },

  manifest: '/manifest.json',

  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://invoicefbr.com",
    siteName: "InvoiceFBR",
    title: "InvoiceFBR - Best FBR Compliant Invoicing Software in Pakistan",
    description: "Pakistan's #1 FBR-compliant invoicing software. Create professional invoices, automate FBR posting, manage customers & inventory. Trusted by 130+ businesses.",
    images: [
      {
        url: "https://invoicefbr.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "InvoiceFBR - FBR Compliant Invoicing Software",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "InvoiceFBR - Best FBR Compliant Invoicing Software in Pakistan",
    description: "Pakistan's #1 FBR-compliant invoicing software. Create professional invoices, automate FBR posting. Free 7-day trial.",
    images: ["https://invoicefbr.com/og-image.jpg"],
    creator: "@zazteck",
  },

  alternates: {
    canonical: "https://invoicefbr.com",
  },

  verification: {
    google: "google-site-verification-code-here", // Replace with actual code from Google Search Console
    other: {
      "msvalidate.01": "bing-verification-code-here", // Replace with actual code from Bing Webmaster Tools
    }
  },

  category: "Business Software",

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msvalidate.01": "your-bing-verification-code", // Bing verification
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PK" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for performance */}
        {/* FBR Gateway - Critical for invoice posting */}
        <link rel="preconnect" href="https://gw.fbr.gov.pk" />
        <link rel="dns-prefetch" href="https://gw.fbr.gov.pk" />

        {/* Supabase - Database connection */}
        <link rel="preconnect" href="https://xyzcompany.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://xyzcompany.supabase.co" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "InvoiceFBR",
              "alternateName": "Zazteck InvoiceFBR",
              "url": "https://invoicefbr.com",
              "logo": "https://invoicefbr.com/logo.svg",
              "description": "Pakistan's leading FBR-compliant invoicing software",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "PK"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+92-316-4951361",
                "contactType": "Customer Service",
                "email": "info@zazteck.com",
                "availableLanguage": ["English", "Urdu"]
              },
              "sameAs": [
                "https://zazteck.com"
              ]
            })
          }}
        />

        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "InvoiceFBR",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "1000",
                "priceCurrency": "PKR",
                "priceValidUntil": "2025-12-31"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "130"
              },
              "description": "FBR-compliant invoicing software for Pakistani businesses with automatic digital invoice posting"
            })
          }}
        />

        {/* Structured Data - FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is FBR integration mandatory?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, for businesses registered with FBR, digital invoice integration is mandatory. Our system handles this automatically for you."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I try before purchasing?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely! We offer a 7-day free trial with full access to all features. No credit card required."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does WhatsApp integration work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Connect your WhatsApp Business account once, and send invoices directly to your customers with a single click. They receive a professional PDF instantly."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I customize invoice templates?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Add your logo, customize colors, and choose from multiple professional templates. Enterprise plans include fully custom template design."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is my data secure?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We use bank-level encryption to protect your data. All information is stored securely and backed up regularly. We never share your data with third parties."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What payment methods do you accept?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We accept all major credit/debit cards, bank transfers, and JazzCash/EasyPaisa for Pakistani customers."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {/* DevTools blocker - DISABLED for all environments */}
        <GoogleAnalytics measurementId="G-BFZ49GLZYH" />
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}

