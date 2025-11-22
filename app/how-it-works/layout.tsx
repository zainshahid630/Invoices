import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works - FBR Invoice Guide | InvoiceFBR",
  description: "Learn how to create FBR-compliant invoices in 8 simple steps. No technical knowledge required. Start invoicing with automatic FBR submission, WhatsApp delivery, and more.",
  keywords: "FBR invoice tutorial, how to create FBR invoice, invoice guide Pakistan, FBR compliance guide, digital invoicing Pakistan",
  openGraph: {
    title: "How It Works - FBR Invoice Guide | InvoiceFBR",
    description: "Complete step-by-step guide to creating FBR-compliant invoices. Easy setup, no IP whitelist needed.",
    url: "https://invoicefbr.com/how-it-works",
    siteName: "InvoiceFBR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works - FBR Invoice Guide | InvoiceFBR",
    description: "Learn how to create FBR-compliant invoices in 8 simple steps",
  },
  alternates: {
    canonical: "https://invoicefbr.com/how-it-works",
  },
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
