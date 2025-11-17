'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Show sticky CTA bar after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/50 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 xxl:px-0">
          <div className="flex justify-between items-center h-16 md:h-20 gap-2">
            <div className="flex items-center flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent whitespace-nowrap">
                  InvoiceFBR
                </div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center lg:space-x-4 xl:space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Features</a>
              {/* <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About Us</a> */}
              <a href="#templates" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Templates</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Pricing</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Contact</a>
              <a href="/services" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Services</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/seller/login"
                className="hidden sm:block px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 hover:text-blue-600 font-semibold transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-white relative overflow-hidden"
        aria-label="Hero section"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center md:text-left">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 rounded-full">
                <span className="text-blue-700 font-semibold text-xs sm:text-sm">🎉 Trusted by 130+ Pakistani Businesses</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                <span itemProp="name">FBR-Compliant Invoicing</span>
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                Professional invoices banayein automatic FBR integration ke saath. Tax compliance ki tension khatam,
                time bachao aur apne business ko grow karo. Pakistan ki trusted invoicing platform by Zazteck -
                <span className="font-semibold text-blue-600"> Made in Pakistan, for Pakistan! 🇵🇰</span>
              </p>

              <div className="flex flex-col justify-center md:justify-start sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="group px-8 py-3 sm:py-4 w-full sm:w-auto max-w-[280px] sm:max-w-none mx-auto sm:mx-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold text-center text-md shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                >
                  Start Free Trial
                  <span className="inline-block ml-2  group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <a
                  href="https://wa.me/923164951361?text=Hi%2C%20I%27d%20like%20to%20see%20a%20demo%20of%20InvoiceFBR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 sm:py-4 w-full sm:w-auto max-w-[280px] sm:max-w-none mx-auto sm:mx-0 border-2 border-blue-600 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white font-semibold text-center text-md transition-all shadow-lg hover:shadow-xl"
                >
                  Watch Demo
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 md:gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">130+ Businesses</p>
                    <p className="text-xs text-gray-600">Using InvoiceFBR</p>
                  </div>
                </div>
                <div className="hidden sm:block h-12 w-px bg-gray-300"></div>
                <div className="text-center md:text-left">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">2,500+</p>
                  <p className="text-xs sm:text-sm text-gray-600">Invoices Generated</p>
                </div>
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl transform rotate-3 opacity-10"></div>
              <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl p-1 sm:p-2 border border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop"
                  alt="Invoice Dashboard"
                  className="rounded-lg sm:rounded-xl w-full"
                />
                {/* Floating badges */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-white rounded-lg sm:rounded-xl shadow-xl p-2 sm:p-4 border border-gray-100">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">FBR Connected</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-white rounded-lg sm:rounded-xl shadow-xl px-2 py-1 sm:px-4 sm:py-2 border border-gray-100">
                  <p className="text-xs text-gray-600">Invoice #INV-2024-001</p>
                  <p className="text-sm sm:text-lg font-bold text-green-600">✓ Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white border-y border-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 items-center justify-items-center opacity-60">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">🏛️</p>
              <p className="text-xs sm:text-sm font-semibold text-black mt-1 sm:mt-2">FBR Certified</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">🔒</p>
              <p className="text-xs sm:text-sm font-semibold text-black mt-1 sm:mt-2">Bank-Level Security</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">⚡</p>
              <p className="text-xs sm:text-sm font-semibold text-black mt-1 sm:mt-2">99.9% Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">💬</p>
              <p className="text-xs sm:text-sm font-semibold text-black mt-1 sm:mt-2">24/7 Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-10 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 rounded-full mb-4 sm:mb-6">
              <span className="text-blue-700 font-semibold text-xs sm:text-sm">✨ FEATURES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-md md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Powerful features designed specifically for Pakistani businesses to manage invoices professionally
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 mb-4">Professional Invoices</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create stunning, professional invoices with multiple templates. Customize with your logo and branding.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Multiple templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Custom branding</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>PDF export</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-green-500 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🏛️</span>
              </div>
              <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 mb-4">FBR Integration</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Automatic FBR compliance with digital invoice posting. Stay compliant with tax regulations effortlessly.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Auto FBR posting</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>QR code generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Tax compliance</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-500 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 mb-4">WhatsApp Integration</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Send invoices directly to customers via WhatsApp. Instant delivery and better customer engagement.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Direct WhatsApp sending</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Instant notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Better engagement</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-yellow-500 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 mb-4">Customer Management</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Manage all your customers in one place. Track payment history and customer details easily.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Customer database</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Payment tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>History records</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-500 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 mb-4">Analytics & Reports</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get insights into your business with detailed analytics and reports. Make data-driven decisions.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Sales analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Revenue reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Tax summaries</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 mb-4">Secure & Reliable</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your data is encrypted and secure. Multi-user access with role-based permissions.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Data encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>User roles</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Backup & recovery</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA after Features */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 sm:p-12 shadow-2xl">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Transform Your Invoicing?
              </h3>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                Join 130+ Pakistani businesses already saving time and staying FBR compliant
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 font-semibold text-lg shadow-xl transition-all"
                >
                  Start Free Trial - No Credit Card Required
                </Link>
                <a
                  href="https://wa.me/923164951361?text=Hi%2C%20I%20have%20questions%20about%20InvoiceFBR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 font-semibold text-lg transition-all"
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-10 lg:py-14 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in minutes with our simple process</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 place-items-center">
            {/* Step 1 */}
            <div className="text-center max-w-[285px]">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop"
                  alt="Sign Up"
                  className="w-full h-40 object-cover rounded-lg mb-6"
                  loading="lazy"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Up</h3>
                <p className="text-gray-600 mb-4">Create your account in seconds. No credit card required for trial.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center max-w-[285px]">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
                  alt="Setup"
                  className="w-full h-40 object-cover rounded-lg mb-6"
                  loading="lazy"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Setup Profile</h3>
                <p className="text-gray-600 mb-4">Add your business details, logo, and FBR credentials.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center max-w-[285px]">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=400&h=300&fit=crop"
                  alt="Create Invoice"
                  className="w-full h-40 object-cover rounded-lg mb-6"
                  loading="lazy"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Invoice</h3>
                <p className="text-gray-600 mb-4">Generate professional invoices with our easy-to-use interface.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="text-center max-w-[285px]">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                4
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop"
                  alt="Send & Track"
                  className="w-full h-40 object-cover rounded-lg mb-6"
                  loading="lazy"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Send & Track</h3>
                <p className="text-gray-600 mb-4">Send via WhatsApp or email. Track payments and status.</p>
              </div>
            </div>
          </div>

          {/* CTA after How It Works */}
          <div className="text-center mt-16">
            <p className="text-xl text-gray-600 mb-6">
              It's that simple! Start creating professional FBR-compliant invoices today
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold text-lg shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40"
            >
              Get Started Free
              <span className="ml-2">→</span>
            </Link>
            <p className="text-sm text-gray-500 mt-4">7-day free trial • No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* About Zazteck Section */}

      {/* Why Choose Us - Pakistani Perspective */}


      {/* Services Section */}
      <section className="py-10 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive invoicing solutions for every business</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 md:gap-10">
            {/* Service 1 */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 bg-white p-4 rounded-xl shadow-lg max-w-[320px] mx-auto md:max-w-none md:mx-0">
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=400&h=300&fit=crop"
                  alt="Invoice Management"
                  className="w-full lg:w-48 xl:w-64 h-42  object-cover rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Invoice Management</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3">
                  Complete invoice lifecycle management from creation to payment tracking.
                  Edit, duplicate, and manage all your invoices in one place.
                </p>
                <ul className="space-y-1 text-sm sm:text-sm text-gray-600 m-0">
                  <li>• Create & edit invoices</li>
                  <li>• Multiple templates</li>
                  <li>• Bulk operations</li>
                  <li>• Payment tracking</li>
                </ul>
              </div>
            </div>

            {/* Service 2 */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 bg-white p-4 rounded-xl shadow-lg max-w-[320px] mx-auto md:max-w-none md:mx-0">
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop"
                  alt="FBR Compliance"
                  className="w-full lg:w-48 xl:w-64 h-42  object-cover rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">FBR Compliance</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3">
                  Automatic FBR digital invoice integration. Stay compliant with Pakistan's
                  tax regulations without any manual effort.
                </p>
                <ul className="space-y-1 text-sm sm:text-sm text-gray-600 m-0">
                  <li>• Auto FBR posting</li>
                  <li>• Digital signatures</li>
                  <li>• QR code generation</li>
                  <li>• Compliance reports</li>
                </ul>
              </div>
            </div>

            {/* Service 3 */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 bg-white p-4 rounded-xl shadow-lg max-w-[320px] mx-auto md:max-w-none md:mx-0">
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop"
                  alt="Customer Portal"
                  className="w-full lg:w-48 xl:w-64 h-42  object-cover rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Customer Portal</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3">
                  Manage your customer database efficiently. Store contact details,
                  track payment history, and maintain customer relationships.
                </p>
                <ul className="space-y-1 text-sm sm:text-sm text-gray-600 m-0">
                  <li>• Customer database</li>
                  <li>• Payment history</li>
                  <li>• Contact management</li>
                  <li>• Customer insights</li>
                </ul>
              </div>
            </div>

            {/* Service 4 */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 bg-white p-4 rounded-xl shadow-lg max-w-[320px] mx-auto md:max-w-none md:mx-0">
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
                  alt="Analytics"
                  className="w-full lg:w-48 xl:w-64 h-42  object-cover rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Business Analytics</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3">
                  Get detailed insights into your business performance. Track revenue,
                  outstanding payments, and generate comprehensive reports.
                </p>
                <ul className="space-y-1 text-sm sm:text-sm text-gray-600 m-0">
                  <li>• Revenue tracking</li>
                  <li>• Payment analytics</li>
                  <li>• Tax reports</li>
                  <li>• Custom dashboards</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA after Services */}
          <div className="text-center mt-16 bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Everything You Need in One Platform
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Stop juggling multiple tools. Get invoicing, FBR compliance, customer management, and analytics all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold text-lg shadow-xl transition-all"
              >
                Try All Features Free for 7 Days
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 font-semibold text-lg transition-all"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Invoice Templates Showcase Section */}
      <section id="templates" className="py-10 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-6">
              <span className="text-purple-700 font-semibold text-sm">📄 TEMPLATES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
              Professional Invoice Templates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from beautifully designed templates that match your brand. All templates are FBR-compliant and print-ready.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Modern Template */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-blue-500 max-w-[400px] mx-auto sm:max-w-none sm:lg:mx-0">
              <div className="relative h-96 bg-gradient-to-br from-purple-50 to-white p-4 lg:p-4 xl:p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
                <div className="relative bg-white rounded-lg shadow-xl p-4 transform group-hover:scale-105 transition-transform duration-300">
                  {/* Modern Template Preview */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold">INVOICE</h3>
                        <p className="text-xs text-blue-100">INV-2024-001</p>
                      </div>
                      <div className="w-8 h-8 bg-white/20 rounded"></div>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400 text-[8px] uppercase">From</p>
                        <p className="font-semibold text-gray-300 text-[10px]">Your Company</p>
                        <p className="text-gray-600 text-[8px]">NTN: 1234567</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[8px] uppercase">Bill To</p>
                        <p className="font-semibold text-gray-300 text-[10px]">Customer Name</p>
                        <p className="text-gray-600 text-[8px]">NTN: 7654321</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px]">
                          <span className="text-gray-600">Item 1</span>
                          <span className="font-semibold text-gray-300">PKR 10,000</span>
                        </div>
                        <div className="flex justify-between text-[8px]">
                          <span className="text-gray-600">Item 2</span>
                          <span className="font-semibold text-gray-300">PKR 15,000</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t-2 border-blue-600 pt-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className='text-gray-300'>Total:</span>
                        <span className='text-gray-300'>PKR 25,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-2 rounded-b-lg">
                    <p className="text-[7px] text-center">Thank you for your business!</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl md:text-xl xl:text-2xl font-bold text-gray-900 mb-2">Modern Template</h3>
                <p className="text-gray-600 mb-4">
                  Clean and contemporary design with blue gradient accents. Perfect for tech and service businesses.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Gradient header design</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Professional layout</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>QR code support</span>
                  </li>
                </ul>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                  Most Popular
                </div>
              </div>
            </div>

            {/* Excel Template */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-blue-500 max-w-[400px] mx-auto sm:max-w-none sm:lg:mx-0">
              <div className="relative h-96 bg-gradient-to-br from-purple-50 to-white p-4 lg:p-4 xl:p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent"></div>
                <div className="relative bg-white rounded-lg shadow-xl p-4 transform group-hover:scale-105 transition-transform duration-300">
                  {/* Excel Template Preview */}
                  <div className="border-b-2 border-black p-2">
                    <h3 className="text-sm font-bold text-gray-600">SALES TAX INVOICE</h3>
                    <div className="grid grid-cols-2 gap-1 mt-1 text-[7px]">
                      <div>
                        <p className='text-gray-600'>Invoice #: <span className="font-semibold text-gray-300">INV-001</span></p>
                        <p className='text-gray-600'>Date: <span className="font-semibold text-gray-300">15/11/2024</span></p>
                      </div>
                      <div className="text-right">
                        <p className='text-gray-600'>Type: <span className="font-semibold">Sales</span></p>
                        <p className='text-gray-600'>HS: <span className="font-semibold">1234.56</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="border-b border-black p-2">
                    <div className="grid grid-cols-2 gap-2 text-[7px]">
                      <div>
                        <p className="font-bold text-gray-500 bg-gray-100 px-1 text-[8px]">SELLER</p>
                        <p className="font-semibold text-gray-300 text-[8px]">Your Company</p>
                        <p className='text-gray-300'>NTN: 1234567</p>
                      </div>
                      <div>
                        <p className="font-bold bg-gray-100 text-gray-500 px-1 text-[8px]">BUYER</p>
                        <p className="font-semibold text-[8px] text-gray-300">Customer</p>
                        <p className='text-gray-300'>NTN: 7654321</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <table className="w-full text-[6px]">
                      <thead>
                        <tr className="bg-gray-200 border-y border-black">
                          <th className="text-left text-gray-600 py-0.5 px-1">#</th>
                          <th className="text-left text-gray-600 py-0.5 px-1">DESC</th>
                          <th className="text-right text-gray-600 py-0.5 px-1">QTY</th>
                          <th className="text-right text-gray-600 py-0.5 px-1">AMT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-0.5 text-gray-500 px-1">1</td>
                          <td className="py-0.5 text-gray-500 px-1">Item 1</td>
                          <td className="text-right text-gray-500 py-0.5 px-1">2</td>
                          <td className="text-right text-gray-500 py-0.5 px-1">10,000</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-0.5 text-gray-500 px-1">2</td>
                          <td className="py-0.5 text-gray-500 px-1">Item 2</td>
                          <td className="text-right text-gray-500 py-0.5 px-1">1</td>
                          <td className="text-right text-gray-500 py-0.5 px-1">15,000</td>
                        </tr>
                        <tr className="border-t-2 border-black bg-gray-200">
                          <td colSpan={3} className="text-right  text-gray-600 font-bold py-1 px-1">TOTAL:</td>
                          <td className="text-right font-bold  text-gray-600 py-1 px-1">25,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-black p-1 bg-gray-100 text-center">
                    <p className="text-[6px] font-semibold  text-gray-600">Thank you!</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl md:text-xl xl:text-2xl font-bold text-gray-900 mb-2">Excel Template</h3>
                <p className="text-gray-600 mb-4">
                  Spreadsheet-style design optimized for printing. Clean, minimal, and professional.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Compact layout</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Print-optimized</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>B&W printer friendly</span>
                  </li>
                </ul>
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                  Best for Printing
                </div>
              </div>
            </div>

            {/* Classic Template */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-blue-500 max-w-[400px] mx-auto sm:max-w-none sm:lg:mx-0">
              <div className="relative h-96 bg-gradient-to-br from-purple-50 to-white p-4 lg:p-4 xl:p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent"></div>
                <div className="relative bg-white rounded-lg shadow-xl p-4 border-2 border-gray-800 transform group-hover:scale-105 transition-transform duration-300">
                  {/* Classic Template Preview */}
                  <div className="border-b-4 border-gray-800 p-2">
                    <h3 className="text-base font-bold  text-gray-600" style={{ fontFamily: 'serif' }}>INVOICE</h3>
                    <div className="h-0.5 w-12 bg-gray-800 mt-1"></div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[7px]">
                      <div>
                        <p className="text-gray-600 uppercase">Invoice Number</p>
                        <p className="font-bold  text-gray-300 text-[9px]" style={{ fontFamily: 'monospace' }}>INV-2024-001</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 uppercase">Date</p>
                        <p className="font-bold  text-gray-300 text-[8px]">Nov 15, 2024</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-2 border-b-2 border-gray-300">
                    <div className="border-2 border-gray-300 p-2 bg-gray-50">
                      <p className="text-[7px] font-bold text-gray-600 uppercase border-b border-gray-400 pb-1">Seller</p>
                      <p className="font-bold text-[8px] mt-1  text-gray-600" style={{ fontFamily: 'serif' }}>Your Company</p>
                      <p className="text-[6px] text-gray-600">NTN: 1234567</p>
                    </div>
                    <div className="border-2 border-gray-300 p-2 bg-gray-50">
                      <p className="text-[7px] font-bold text-gray-600 uppercase border-b border-gray-400 pb-1">Buyer</p>
                      <p className="font-bold text-[8px] mt-1  text-gray-600" style={{ fontFamily: 'serif' }}>Customer</p>
                      <p className="text-[6px] text-gray-600">NTN: 7654321</p>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="flex justify-between text-[7px] border-b border-gray-200 pb-1">
                      <span className=' text-gray-600'>Item 1</span>
                      <span className="text-gray-600 font-semibold">PKR 10,000</span>
                    </div>
                    <div className="flex justify-between text-[7px] border-b border-gray-200 pb-1">
                      <span className='text-gray-600'>Item 2</span>
                      <span className="text-gray-600 font-semibold">PKR 15,000</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold border-t-2 border-gray-800 pt-1">
                      <span className='text-gray-600'>Total:</span>
                      <span className='text-gray-600'>PKR 25,000</span>
                    </div>
                  </div>
                  <div className="border-t-4 border-gray-800 p-1 text-center">
                    <p className="text-gray-600 text-[6px]">Thank you for your business!</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl md:text-xl xl:text-2xl font-bold text-gray-900 mb-2">Classic Template</h3>
                <p className="text-gray-600 mb-4">
                  Traditional formal design with serif fonts and borders. Ideal for corporate and legal businesses.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Formal appearance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Serif typography</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Traditional borders</span>
                  </li>
                </ul>
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold text-sm">
                  Most Formal
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              All templates include FBR QR codes, digital signatures, and are fully customizable with your logo and branding.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-2 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold text-lg shadow-xl shadow-purple-500/30 transition-all hover:shadow-2xl hover:shadow-purple-500/40"
            >
              Try Templates Now
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-10 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
              <span className="text-blue-700 font-semibold text-sm">💰 PRICING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your business. All plans include 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white p-4 sm:p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Perfect for small businesses</p>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-5xl md:text-4xl xl:text-5xl font-bold text-gray-900">PKR 1,000</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">or PKR 10,000/year (Save 17%)</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700">Generate invoices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700">Post to FBR</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700">View, save & print invoices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700">Basic invoice template</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">✗</span>
                  <span className="text-gray-400">No customer management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">✗</span>
                  <span className="text-gray-400">No product records</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">✗</span>
                  <span className="text-gray-400">No payment tracking</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 px-6 text-center bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Start 7-Day Free Trial
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 pt-10 sm:pt-8 sm:p-8 rounded-2xl shadow-2xl transform md:scale-105 relative border-4 border-blue-400">
              <div className="text-xs lg:text-sm absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-2 sm:px-6 py-2 rounded-full font-bold shadow-lg">
                ⭐ RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <p className="text-blue-100 mb-6">Complete business solution</p>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-5xl md:text-4xl xl:text-5xl font-bold text-white">PKR 5,000</span>
                  <span className="text-blue-100">/month</span>
                </div>
                <p className="text-sm text-blue-200 mt-2">or PKR 50,000/year (Save 17%)</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span className="text-white font-medium">Everything in Starter, plus:</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span className="text-white">Customer management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span className="text-white">Product records & inventory</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span className="text-white">Payment tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span className="text-white">Multiple invoice templates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span className="text-white">WhatsApp integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span className="text-white">Advanced analytics & reports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span className="text-white">Multi-user access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span className="text-white">Priority support</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 px-6 text-center bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
              >
                Start 7-Day Free Trial
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center px-6 py-3 bg-green-100 rounded-full mb-4">
              <span className="text-green-700 font-semibold">⚡ Limited Time: Get 2 Months Free on Annual Plans!</span>
            </div>
            <p className="text-gray-600 mb-4">All plans include 7-day free trial • No credit card required</p>
            <p className="text-sm text-gray-500">Need a custom solution? <a href="#contact" className="text-blue-600 hover:text-blue-700 font-semibold">Contact our sales team</a></p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>130+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>2,500+ Invoices Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}


      {/* FAQ Section */}
      <section className="py-10 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Is FBR integration mandatory?</h3>
              <p className="text-gray-600">
                Yes, for businesses registered with FBR, digital invoice integration is mandatory.
                Our system handles this automatically for you.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Can I try before purchasing?</h3>
              <p className="text-gray-600">
                Absolutely! We offer a 7-day free trial with full access to all features.
                No credit card required.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">How does WhatsApp integration work?</h3>
              <p className="text-gray-600">
                Connect your WhatsApp Business account once, and send invoices directly to your
                customers with a single click. They receive a professional PDF instantly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Can I customize invoice templates?</h3>
              <p className="text-gray-600">
                Yes! Add your logo, customize colors, and choose from multiple professional templates.
                Enterprise plans include fully custom template design.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600">
                We use bank-level encryption to protect your data. All information is stored securely
                and backed up regularly. We never share your data with third parties.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit/debit cards, bank transfers, and JazzCash/EasyPaisa for
                Pakistani customers.
              </p>
            </div>
          </div>

          {/* CTA after FAQ with Social Proof */}
          <div className="text-center mt-16">
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-100">
              <div className="flex justify-center mb-6">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-4 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-4 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-4 border-white flex items-center justify-center">
                    <span className="text-white text-sm font-bold">+130</span>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Join 130+ Businesses Already Using InvoiceFBR
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                "Best decision for our business. FBR compliance is now automatic!" - Ahmed, Karachi
              </p>
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold text-lg shadow-xl transition-all"
              >
                Start Your Free Trial Now
                <span className="ml-2">→</span>
              </Link>
              <p className="text-sm text-gray-500 mt-4">Setup takes less than 5 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6">
            Ready to Streamline Your Invoicing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of businesses already using InvoicePro. Start your free trial today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 xl:py-4 w-full sm:w-auto max-w-[280px] sm:max-w-none mx-auto sm:mx-0 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold text-lg"
            >
              Start Free Trial
            </Link>
            <a
              href="#contact"
              className="px-8 py-3 xl:py-4 w-full sm:w-auto max-w-[280px] sm:max-w-none mx-auto sm:mx-0 border-2 border-white text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Schedule Demo
            </a>
          </div>
          <p className="text-blue-100 mt-6">No credit card required • 7-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-10 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className='bg-gray-100 absolute hidden md:block right-0 top-[190px] w-1/2 z-[0] bottom-0 rounded-tl-[20px]' />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">Have questions? We're here to help</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="md:space-y-6 flex items-start flex-wrap flex-row gap-10 md:gap-0 md:flex-col">
                <div className="flex w-full sm:basis-[calc(50%-2.5rem)] md:w-full items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">
                      <a href="mailto:info@zazteck.com" className="hover:text-blue-600">info@zazteck.com</a>
                    </p>
                    <p className="text-gray-600">
                      <a href="mailto:sales@zazteck.com" className="hover:text-blue-600">sales@zazteck.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex w-full sm:basis-[calc(50%-2.5rem)] md:w-full items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Phone / WhatsApp</h4>
                    <p className="text-gray-600">
                      <a href="tel:+923164951361" className="hover:text-blue-600">+92 316 4951361</a>
                    </p>
                  </div>
                </div>

                <div className="flex w-full sm:basis-[calc(50%-2.5rem)] md:w-full items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Website</h4>
                    <p className="text-gray-600">
                      <a href="https://zazteck.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">zazteck.com</a>
                    </p>
                    <p className="text-gray-600">
                      <a href="https://invoicefbr.com" className="hover:text-blue-600">invoicefbr.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex w-full sm:basis-[calc(50%-2.5rem)] md:w-full items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Business Hours</h4>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            {/* bg-gray-100 */}
            <div className="py-6 px-4 sm:py-8 sm:px-8 md:px-0 lg:px-8 lg:py-8 bg-gray-100 md:bg-transparent rounded-xl relative z-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-12 mb-12">
            <div className='col-span-1 sm:col-span-4 md:col-span-1'>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">InvoiceFBR</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-2 mt-6">
                Professional invoicing with FBR compliance for Pakistani businesses.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Zazteck</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">Invoice Templates</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/seller/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Resources</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">FBR Integration</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">WhatsApp Invoicing</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Customer Management</a></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Zazteck Services</Link></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">&copy; 2024 InvoiceFBR by Zazteck. All rights reserved.</p>
            <div className='flex gap-4 items-center'>
              <p className="text-gray-500 text-sm">
                Powered by <a href="https://zazteck.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Zazteck</a>
              </p>
              <div className="flex gap-4">
                <a href="https://wa.me/923164951361" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                  <span>💬</span>
                </a>
                <a href="mailto:info@zazteck.com" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <span>📧</span>
                </a>
                <a href="tel:+923164951361" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <span>📱</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 shadow-2xl z-40 animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <p className="text-white font-bold text-sm sm:text-base">
                  🎉 Start Your Free 7-Day Trial Today!
                </p>
                <p className="text-blue-100 text-xs sm:text-sm">
                  No credit card required • Full access to all features
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold text-sm sm:text-base shadow-lg transition-all whitespace-nowrap"
                >
                  Get Started Free
                </Link>
                <button
                  onClick={() => setShowStickyBar(false)}
                  className="px-3 py-2.5 text-white hover:bg-blue-800 rounded-lg transition-all"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/923164951361?text=Hi%2C%20I%27m%20interested%20in%20InvoiceFBR"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-2 sm:left-4 z-50 group"
        aria-label="Contact us on WhatsApp"
      >
        <div className="relative">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>

          {/* Main button */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
            <svg
              className="w-8 h-8 sm:w-9 sm:h-9 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </div>

          {/* Tooltip */}
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
            <span className="text-sm font-semibold">Chat with us on WhatsApp</span>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900"></div>
          </div>
        </div>
      </a>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
