'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('super_admin_session');
    if (!session) {
      router.push('/super-admin/login');
      return;
    }

    const userData = JSON.parse(session);
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('super_admin_session');
    router.push('/super-admin/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/super-admin/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/super-admin/companies/new"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Add Company
              </Link>
              <Link
                href="/super-admin/seed-data"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Seed Data
              </Link>
              <Link
                href="/super-admin/payments"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                💳 Payments
              </Link>
              <Link
                href="/super-admin/whatsapp"
                className="px-4 py-2 text-green-600 hover:text-green-700 font-medium flex items-center"
              >
                📱 WhatsApp
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

