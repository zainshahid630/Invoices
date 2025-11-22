"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2, ArrowRight, FileText, Users, Package, CreditCard, BarChart3,
  Settings, Shield, Mail, MessageCircle, Palette, Calculator, Building2, Zap,
  AlertCircle, UserPlus, Key, Send, Download, Eye
} from "lucide-react";


export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"getting-started" | "features" | "settings">("getting-started");

  const simpleSteps = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Sign up with your email and password. It's completely free - no credit card required!",
      icon: UserPlus,
      color: "from-blue-500 to-blue-600",
      time: "2 minutes"
    },
    {
      step: 2,
      title: "Get Your FBR Token",
      description: "Obtain your token from the FBR website and add it to the system. This makes your invoices official.",
      icon: Key,
      color: "from-green-500 to-green-600",
      time: "5 minutes",
      link: "https://download1.fbr.gov.pk/Docs/20256251162757102DIUserManualV1.4.pdf",
      linkText: "Read FBR Guide"
    },
    {
      step: 3,
      title: "Add Business Information",
      description: "Enter your company name, address, logo, and tax details. You only need to do this once.",
      icon: Building2,
      color: "from-purple-500 to-purple-600",
      time: "3 minutes"
    },
    {
      step: 4,
      title: "Add Your Customers",
      description: "Create a list of your customers. Save their names, phone numbers, and NTN details.",
      icon: Users,
      color: "from-yellow-500 to-yellow-600",
      time: "5 minutes"
    },
    {
      step: 5,
      title: "Add Your Products/Services",
      description: "Create a catalog of what you sell. Include prices and tax rates for each item.",
      icon: Package,
      color: "from-pink-500 to-pink-600",
      time: "5 minutes"
    },
    {
      step: 6,
      title: "Create Your First Invoice",
      description: "Select a customer, choose products, and your invoice is ready! Calculations happen automatically.",
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      time: "2 minutes"
    },
    {
      step: 7,
      title: "Submit to FBR",
      description: "With one click, your invoice is submitted to FBR. QR code is generated automatically.",
      icon: Send,
      color: "from-red-500 to-red-600",
      time: "Instant"
    },
    {
      step: 8,
      title: "Send to Customer",
      description: "Send the invoice to your customer via WhatsApp or Email. You can also download as PDF.",
      icon: MessageCircle,
      color: "from-teal-500 to-teal-600",
      time: "Instant"
    }
  ];

  const features = [
    {
      id: 1,
      title: "Dashboard Overview",
      description: "See your complete business picture at a glance. Track total revenue, pending invoices, customer count, and more.",
      image: "01-dashboard.png",
      icon: BarChart3,
      features: [
        "Real-time sales and revenue tracking",
        "List of pending invoices",
        "Customer count and activity",
        "Visual charts and graphs"
      ]
    },
    {
      id: 2,
      title: "Product Management",
      description: "Manage your entire product inventory. Add, edit, or delete products with prices, descriptions, and tax information.",
      image: "02-products.png",
      icon: Package,
      features: [
        "Complete product catalog",
        "Price and tax rate management",
        "Quick search functionality",
        "Easy add, edit, and delete"
      ]
    },
    {
      id: 3,
      title: "Customer Database",
      description: "Keep all customer information in one place. Store contact details, NTN numbers, and view transaction history.",
      image: "03-customers.png",
      icon: Users,
      features: [
        "Complete customer profiles",
        "Contact details and NTN storage",
        "Payment history tracking",
        "Fast search capabilities"
      ]
    },
    {
      id: 4,
      title: "Invoice Center",
      description: "Create professional invoices and submit them to FBR automatically. Everything is just a click away.",
      image: "04-invoices.png",
      icon: FileText,
      features: [
        "Beautiful invoice templates",
        "One-click FBR submission",
        "Status tracking (draft, sent, paid)",
        "WhatsApp and Email delivery"
      ]
    },
    {
      id: 5,
      title: "Payment Tracking",
      description: "Track who has paid and how much is outstanding. Record partial or full payments easily.",
      image: "05-payments.png",
      icon: CreditCard,
      features: [
        "Complete payment history",
        "Partial payment support",
        "Outstanding balance monitoring",
        "Payment reminders"
      ]
    },
    {
      id: 6,
      title: "Reports & Analytics",
      description: "Get detailed reports about your business. Analyze sales, taxes, profits, and customer behavior.",
      image: "06-reports.png",
      icon: BarChart3,
      features: [
        "Sales analysis reports",
        "Tax summaries",
        "Customer insights",
        "Export to Excel"
      ]
    }
  ];

  const settingsConfig = [
    {
      title: "Company Profile",
      description: "Set up your company name, address, NTN, STRN, and upload your logo here.",
      image: "07-settings-company.png",
      icon: Building2
    },
    {
      title: "Invoice Configuration",
      description: "Customize how invoice numbers are generated, set terms & conditions, and payment instructions.",
      image: "08-settings-invoice.png",
      icon: FileText
    },
    {
      title: "Template Design",
      description: "Choose your invoice design. Customize colors and layout to match your brand.",
      image: "08-settings-templates.png",
      icon: Palette
    },
    {
      title: "Tax Settings",
      description: "Set GST and Sales Tax rates. Configure FBR integration parameters here.",
      image: "08-settings-tax.png",
      icon: Calculator
    },
    {
      title: "Email Integration",
      description: "Configure email settings so you can send invoices directly from the system.",
      image: "08-settings-email.png",
      icon: Mail
    },
    {
      title: "WhatsApp Business",
      description: "Set up WhatsApp to send invoices directly to your customers via WhatsApp.",
      image: "08-settings-whatsapp.png",
      icon: MessageCircle
    },
    {
      title: "Security & Access",
      description: "Change passwords, add users, and set permissions for who can access what.",
      image: "08-settings-security.png",
      icon: Shield
    },
    {
      title: "System Preferences",
      description: "Customize language, date format, currency, and notification settings.",
      image: "08-settings-preferences.png",
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/50 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 xxl:px-0">
          <div className="flex justify-between items-center h-16 md:h-20 gap-2">
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent whitespace-nowrap">
                  InvoiceFBR
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center lg:space-x-4 xl:space-x-8">
              <Link href="/#features" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Features</Link>
              <Link href="/#templates" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Templates</Link>
              <Link href="/how-it-works" className="text-blue-600 font-semibold lg:text-md transition-colors">How It Works</Link>
              <Link href="/#pricing" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Pricing</Link>
              <Link href="/#contact" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Contact</Link>
              <Link href="/services" className="text-gray-700 hover:text-blue-600 font-medium lg:text-md transition-colors">Services</Link>
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
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              How It Works
            </h1>
            <h2 className="text-2xl md:text-3xl text-blue-100 mb-6">
              Step-by-Step Guide to FBR-Compliant Invoicing
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Learn how to create professional invoices in just 8 simple steps.
              No technical knowledge required!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="https://download1.fbr.gov.pk/Docs/20256251162757102DIUserManualV1.4.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
              >
                Read FBR Guide
                <Download className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <CheckCircle2 className="h-8 w-8 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                ✅ NO IP WHITELIST IS NEEDED
              </h3>
              <p className="text-green-50 text-base md:text-lg">
                Start immediately! No technical setup required, no IP whitelisting needed.
                Just sign up and start sending invoices to FBR. It&apos;s that simple!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-wrap gap-3 md:gap-4 justify-center mb-12">
          <button
            onClick={() => setActiveTab("getting-started")}
            className={`px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all text-sm md:text-base ${activeTab === "getting-started"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow"
              }`}
          >
            🚀 Getting Started
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all text-sm md:text-base ${activeTab === "features"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow"
              }`}
          >
            ✨ Features
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all text-sm md:text-base ${activeTab === "settings"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow"
              }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Getting Started Content */}
        {activeTab === "getting-started" && (
          <div className="space-y-8 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Create Invoices in 8 Easy Steps
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                No technical knowledge required! Just follow these simple steps
              </p>
            </div>

            {/* Step-by-step flow */}
            <div className="max-w-4xl mx-auto space-y-6">
              {simpleSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === simpleSteps.length - 1;

                return (
                  <div key={step.step} className="relative">
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-all">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Step Number & Icon */}
                        <div className="flex-shrink-0">
                          <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <Icon className="h-10 w-10 text-white" />
                          </div>
                          <div className="mt-3 text-center">
                            <div className="text-sm font-semibold text-gray-500">Step {step.step}</div>
                            <div className="text-xs text-gray-400">{step.time}</div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4">
                            {step.description}
                          </p>

                          {step.link && (
                            <a
                              href={step.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold transition-all"
                            >
                              <Download className="h-4 w-4" />
                              {step.linkText}
                            </a>
                          )}
                        </div>

                        {/* Check mark */}
                        <div className="hidden md:block">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connecting arrow */}
                    {!isLast && (
                      <div className="flex justify-center my-4">
                        <ArrowRight className="h-8 w-8 text-blue-400 rotate-90 md:rotate-0" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FBR Sandbox Image */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-6 md:p-8 mt-12 border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="h-8 w-8 text-amber-600" />
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    Sandbox Environment for Testing
                  </h3>
                  <p className="text-amber-700 font-semibold">Practice Before Going Live</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 text-base md:text-lg leading-relaxed">
                If you have a <strong>Sandbox Token</strong> for testing, practice here first.
                Test invoice submissions without affecting real data. Perfect for learning!
              </p>
              <div className="rounded-xl overflow-hidden border-2 border-amber-300 shadow-lg bg-white">
                <Image
                  src="/screenshots/09-fbr-sandbox.png"
                  alt="FBR Sandbox Configuration"
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                  loading="lazy"
                  quality={75}
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
              <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Everything you do in Sandbox is not real. It&apos;s only for learning.
                  When you&apos;re confident, switch to Production token.
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border-2 border-blue-200">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="h-7 w-7 text-yellow-500" />
                Quick Tips to Remember
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">No IP Whitelist</p>
                    <p className="text-sm text-gray-600">Start immediately, no technical setup needed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">14-Day Free Trial</p>
                    <p className="text-sm text-gray-600">Try first, then decide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">24/7 Support</p>
                    <p className="text-sm text-gray-600">We&apos;re here to help whenever you need</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Easy to Use</p>
                    <p className="text-sm text-gray-600">Simple interface, no training required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Content */}
        {activeTab === "features" && (
          <div className="space-y-16 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Can You Do?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-2">
                All Features Explained with Screenshots
              </p>
              <p className="text-base text-gray-500">
                See exactly how each feature works
              </p>
            </div>

            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={feature.id}
                  className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    } gap-6 md:gap-8 items-center bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-all`}
                >
                  <div className="lg:w-1/2 w-full">
                    <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                      <Image
                        src={`/screenshots/${feature.image}`}
                        alt={feature.title}
                        width={800}
                        height={500}
                        className="w-full h-auto"
                        loading="lazy"
                        quality={75}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                      />
                    </div>
                  </div>

                  <div className="lg:w-1/2 w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 mb-6 text-base md:text-lg leading-relaxed">
                      {feature.description}
                    </p>

                    <ul className="space-y-3">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm md:text-base">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span>See the screenshot above to visualize this feature</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Settings Content */}
        {activeTab === "settings" && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How to Configure Settings?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-2">
                Customize the System to Your Needs
              </p>
              <p className="text-base text-gray-500">
                Set up once, use forever
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {settingsConfig.map((setting, index) => {
                const Icon = setting.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <Icon className="h-6 w-6 md:h-7 md:w-7 text-indigo-600" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">
                          {setting.title}
                        </h3>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">
                        {setting.description}
                      </p>
                    </div>

                    <div className="border-t-2 border-gray-100">
                      <Image
                        src={`/screenshots/${setting.image}`}
                        alt={setting.title}
                        width={600}
                        height={400}
                        className="w-full h-auto"
                        loading="lazy"
                        quality={75}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Settings Tips */}
            <div className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border-2 border-purple-200">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="h-7 w-7 text-purple-600" />
                Settings Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">⚙️ One-Time Setup</p>
                  <p className="text-sm text-gray-600">
                    Configure these settings once. They&apos;ll work automatically after that.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">🔄 Change Anytime</p>
                  <p className="text-sm text-gray-600">
                    You can update any setting later. Nothing is permanent!
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">💡 Help Available</p>
                  <p className="text-sm text-gray-600">
                    Each setting has help text. Contact support if you need assistance.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">✅ Optional Settings</p>
                  <p className="text-sm text-gray-600">
                    Some settings are optional. Only configure what you need.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Benefits Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-center text-indigo-100 mb-12">
            8 Reasons to Start Today
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: CheckCircle2, title: "FBR Compliant", desc: "Direct integration with FBR" },
              { icon: Zap, title: "No IP Whitelist", desc: "Easy setup, no complications" },
              { icon: Palette, title: "Professional Templates", desc: "Beautiful invoice designs" },
              { icon: MessageCircle, title: "Multi-Channel", desc: "Email & WhatsApp delivery" },
              { icon: Package, title: "Complete Management", desc: "All-in-one solution" },
              { icon: BarChart3, title: "Real-time Reports", desc: "Instant business insights" },
              { icon: Shield, title: "Sandbox Testing", desc: "Practice before going live" },
              { icon: FileText, title: "14-Day Free Trial", desc: "Try first, pay later" }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-4 bg-white bg-opacity-20 rounded-2xl mb-4 hover:bg-opacity-30 transition-all">
                    <Icon className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-indigo-100">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial today and experience hassle-free FBR-compliant invoicing!
            No credit card required, no commitment!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 bg-white text-blue-600 rounded-xl font-bold text-base md:text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
            </Link>
            <a
              href="https://download1.fbr.gov.pk/Docs/20256251162757102DIUserManualV1.4.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 bg-transparent border-2 border-white text-white rounded-xl font-bold text-base md:text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Read FBR Guide
              <Download className="ml-2 h-5 w-5 md:h-6 md:w-6" />
            </a>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            ✅ 14 days free • ❌ No credit card required • 🔄 Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">InvoiceFBR</span>
              </div>
              <p className="text-sm text-gray-400">
                Pakistan&apos;s trusted FBR-compliant invoicing software. Made by Zazteck.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><a href="https://wa.me/923164951361" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Support</a></li>
                <li><a href="https://download1.fbr.gov.pk/Docs/20256251162757102DIUserManualV1.4.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">FBR Guide</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} InvoiceFBR by Zazteck. All rights reserved.</p>
            <p className="mt-2">Made with ❤️ in Pakistan 🇵🇰</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
