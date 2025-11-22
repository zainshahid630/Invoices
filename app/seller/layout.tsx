'use client';

import { usePathname } from 'next/navigation';
import SellerLayout from './components/SellerLayout';

export default function SellerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't wrap login page with SellerLayout
  if (pathname === '/seller/login') {
    return <>{children}</>;
  }
  
  return <SellerLayout>{children}</SellerLayout>;
}
