import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "./components/ToastProvider";

export const metadata: Metadata = {
  metadataBase: new URL('https://invoicefbr.com'),
  title: {
    default: "InvoiceFBR - Best FBR Compliant Invoicing Software in Pakistan | Zazteck",
    template: "%s | InvoiceFBR"
  },
  description: "Pakistan's #1 FBR-compliant invoicing software. Create professional invoices, automate FBR posting. Trusted by 130+ businesses. Free trial.",
  keywords: [
    // Primary Keywords
    "FBR invoice software Pakistan",
    "FBR compliant invoicing",
    "digital invoice Pakistan",
    "invoice management system",
    "FBR integration software",
    
    // Secondary Keywords
    "online invoice generator Pakistan",
    "GST invoice software",
    "sales tax invoice Pakistan",
    "invoice maker Pakistan",
    "billing software Pakistan",
    
    // Long-tail Keywords
    "automatic FBR invoice posting",
    "FBR digital invoice integration",
    "WhatsApp invoice sending",
    "invoice software for small business Pakistan",
    "cloud based invoicing Pakistan",
    
    // Location-based
    "invoice software Karachi",
    "invoice software Lahore",
    "invoice software Islamabad",
    
    // Feature-based
    "customer management software",
    "inventory management Pakistan",
    "payment tracking software",
    "invoice template Pakistan",
    
    // Brand
    "Zazteck invoice",
    "InvoiceFBR"
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
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
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
    <html lang="en-PK">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
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
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

