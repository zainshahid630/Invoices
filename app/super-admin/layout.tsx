'use client';

import { usePathname } from 'next/navigation';
import SuperAdminLayout from './components/SuperAdminLayout';

export default function SuperAdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Don't wrap login page with SuperAdminLayout
    if (pathname === '/super-admin/login') {
        return <>{children}</>;
    }

    return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
