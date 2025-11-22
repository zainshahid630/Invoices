'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from "react";
export default function ServicesPage() {
  const [animatedElements, setAnimatedElements] = useState([]);

  function isElementInViewport(elem: Element) {
    const scroll = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const elemTop = elem.getBoundingClientRect().top + scroll;

    return elemTop - scroll < windowHeight;
  }

  const animateSections = useCallback(() => {
    const elementsToAnimate = document.querySelectorAll(".scroll-anime");
    const elementsInViewport: Element[] = [];

    elementsToAnimate.forEach((elem) => {
      if (isElementInViewport(elem)) {
        elem.classList.add("anime");
        elementsInViewport.push(elem);
      }
    });

    setAnimatedElements(elementsInViewport as never[]);
  }, []);

  useEffect(() => {
    animateSections();
    window.addEventListener("scroll", animateSections);

    return () => {
      window.removeEventListener("scroll", animateSections);
    };
  }, [animateSections]);
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/50 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20 gap-2">
            <Link href="/" className="flex items-center flex-shrink-0">
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
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 hover:text-blue-600 font-semibold transition-colors whitespace-nowrap"
              >
                Home
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative text-center textx">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <span className="text-white font-semibold text-sm ">🚀 ZAZTECK SERVICES</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Your Partner in Digital Transformation
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
            From professional websites to custom mobile apps, Zazteck brings your business vision to life
            with cutting-edge technology and affordable solutions designed for Pakistani businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://zazteck.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-3 sm:py-4 w-full sm:w-auto max-w-[280px] sm:max-w-none mx-auto sm:mx-0 bg-white text-blue-600 rounded-xl hover:bg-gray-100 font-bold text-lg shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 inline-flex items-center justify-center gap-2"
            >
              <span>Visit Zazteck.com</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a
              href="https://wa.me/923164951361?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Zazteck%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 sm:py-4 w-full sm:w-auto max-w-[280px] sm:max-w-none mx-auto sm:mx-0 bg-green-500 text-white rounded-xl hover:bg-green-600 font-bold text-lg shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 inline-flex items-center justify-center gap-2"
            >
              <span>💬</span>
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* About Zazteck */}
      <section className="py-10 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 textx">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
              About Zazteck
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Zazteck is a Pakistani technology company dedicated to empowering local businesses
              with world-class digital solutions. We understand the unique challenges of running
              a business in Pakistan and create tools that actually work for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-4 sm:mb-10 xl:mb-16">
            <div className="scroll-anime text-yy bg-gradient-to-br from-blue-50 to-white p-4 lg:p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">🇵🇰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">100% Pakistani</h3>
              <p className="text-gray-600 leading-relaxed">
                Built in Pakistan, for Pakistan. We speak your language, understand your culture,
                and know exactly what Pakistani businesses need to succeed in the digital world.
              </p>
            </div>

            <div className="scroll-anime textxx bg-gradient-to-br from-green-50 to-white p-4 lg:p-8 rounded-2xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Local Expertise</h3>
              <p className="text-gray-600 leading-relaxed">
                From FBR compliance to local payment gateways, we handle all the complexities
                of the Pakistani market so you don&apos;t have to worry about technical details.
              </p>
            </div>

            <div className="scroll-anime textyy bg-gradient-to-br from-purple-50 to-white p-4 lg:p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Affordable Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                No expensive international rates. Our pricing is designed for Pakistani businesses
                with flexible payment plans and transparent costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-10 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-anime textxx">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive digital solutions to take your business to the next level
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Website Development */}
            <div className="scroll-anime text-yy bg-white rounded-2xl p-4 md:p-4 lg:p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl">
                  🌐
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Website Development</h3>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Professional, modern websites that represent your brand perfectly. From simple landing
                pages to complex e-commerce platforms, we build it all.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Responsive design - perfect on all devices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">SEO optimized - rank higher on Google</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Fast loading - no waiting for customers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">E-commerce ready - start selling online</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Free domain & hosting (1 year)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">SSL certificate included</span>
                </li>
              </ul>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Starting from</p>
                <p className="text-2xl lg:text-2xl lg:text-3xl font-bold text-blue-600">PKR 25,000</p>
                <p className="text-sm text-gray-500 mt-1">One-time payment • Payment plans available</p>
              </div>
            </div>

            {/* Mobile App Development */}
            <div className="scroll-anime textyy bg-white rounded-2xl p-4 md:p-4 lg:p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl">
                  📱
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Mobile Apps</h3>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Custom mobile applications for Android and iOS. Reach your customers directly
                on their phones with a powerful, user-friendly app.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Android & iOS development</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Custom features for your business</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Push notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Payment gateway integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Play Store & App Store publishing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Maintenance & updates</span>
                </li>
              </ul>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Starting from</p>
                <p className="text-2xl lg:text-3xl font-bold text-purple-600">PKR 150,000</p>
                <p className="text-sm text-gray-500 mt-1">Custom quote based on features</p>
              </div>
            </div>

            {/* Business Software */}
            <div className="scroll-anime text-yy bg-white rounded-2xl p-4 md:p-4 lg:p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl">
                  💼
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Business Software</h3>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Custom software solutions tailored to your specific business needs. From inventory
                management to CRM systems, we build tools that work for you.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Inventory management systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">CRM & customer management</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">HR & payroll systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Accounting & invoicing (like InvoiceFBR)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Cloud-based solutions</span>
                </li>
              </ul>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Starting from</p>
                <p className="text-2xl lg:text-3xl font-bold text-green-600">PKR 100,000</p>
                <p className="text-sm text-gray-500 mt-1">Custom quote based on requirements</p>
              </div>
            </div>

            {/* Digital Marketing */}
            <div className="scroll-anime textyy bg-white rounded-2xl p-4 md:p-4 lg:p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-3xl">
                  🎯
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Digital Marketing</h3>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Grow your online presence with our comprehensive digital marketing services.
                From SEO to social media, we help you reach more customers.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Search Engine Optimization (SEO)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Social media marketing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Google Ads & Facebook Ads</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Content creation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Email marketing campaigns</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-700">Analytics & reporting</span>
                </li>
              </ul>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-sm text-gray-600 mb-2">Starting from</p>
                <p className="text-2xl lg:text-3xl font-bold text-red-600">PKR 15,000/month</p>
                <p className="text-sm text-gray-500 mt-1">Monthly packages available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Zazteck */}
      <section className="py-10 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-anime textxx ">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Zazteck?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re not just another tech company - we&apos;re your partner in digital success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center scroll-anime text-yy ">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
                🤝
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Dedicated Support</h3>
              <p className="text-gray-600">
                From setup to launch and beyond, we&apos;re with you every step of the way.
                WhatsApp, call, or email - we&apos;re always available.
              </p>
            </div>

            <div className="text-center scroll-anime textxx ">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                We understand time is money. Our efficient processes ensure quick
                turnaround without compromising on quality.
              </p>
            </div>

            <div className="text-center scroll-anime textxx ">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
                🎨
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Modern Design</h3>
              <p className="text-gray-600">
                Beautiful, user-friendly designs that your customers will love.
                We stay updated with the latest design trends.
              </p>
            </div>

            <div className="text-center scroll-anime textyy ">
              <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
                🔒
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Reliable</h3>
              <p className="text-gray-600">
                Bank-level security, regular backups, and 99.9% uptime guarantee.
                Your data and business are safe with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center scroll-anime textxx ">
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Let&apos;s discuss your project and create something amazing together.
            Get a free consultation and custom quote for your business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="https://zazteck.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 sm:py-4 w-full sm:w-auto max-w-[280px] sm:max-w-none mx-auto sm:mx-0 bg-white text-blue-600 rounded-xl hover:bg-gray-100 font-bold text-lg shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              Visit Zazteck.com
            </a>
            <a
              href="https://wa.me/923164951361?text=Hi%2C%20I%20want%20to%20discuss%20my%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 sm:py-4 w-full sm:w-auto max-w-[280px] sm:max-w-none mx-auto sm:mx-0 bg-green-500 text-white rounded-xl hover:bg-green-600 font-bold text-lg shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              💬 WhatsApp Now
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-white/90">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">📧</span>
              <a href="mailto:info@zazteck.com" className="hover:text-white">info@zazteck.com</a>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">📱</span>
              <a href="tel:+923164951361" className="hover:text-white">+92 316 4951361</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className='scroll-anime text-yy'>
              <h3 className="text-2xl font-bold mb-4">Zazteck</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Empowering Pakistani businesses with world-class digital solutions.
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
            <div className='scroll-anime textxx'>
              <h4 className="font-bold mb-4 text-lg">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Website Development</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile Apps</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Software</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Digital Marketing</a></li>
              </ul>
            </div>
            <div className='scroll-anime textyy '>
              <h4 className="font-bold mb-4 text-lg">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">InvoiceFBR</Link></li>
                <li><a href="https://zazteck.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Zazteck.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 scroll-anime textxx ">
            <p>&copy; 2024 Zazteck. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
