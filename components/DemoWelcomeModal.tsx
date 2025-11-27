'use client';

import { useState, useEffect } from 'react';

interface DemoWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoWelcomeModal({ isOpen, onClose }: DemoWelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const features = [
    {
      icon: '🎯',
      title: 'Welcome to Your Demo Account',
      description: 'Explore all features of our Invoice Management System without any limitations. This demo account is pre-configured with sample data to help you understand the platform.',
      highlights: [
        'Full access to all features',
        'Pre-loaded sample invoices',
        'Test FBR integration safely',
        'No credit card required'
      ]
    },
    {
      icon: '📄',
      title: 'Invoice Management',
      description: 'Create, manage, and track all your invoices in one place with powerful features designed for Pakistani businesses.',
      highlights: [
        'Create professional invoices with multiple templates',
        'Automatic invoice numbering and tracking',
        'Support for multiple tax scenarios (SN001-SN024)',
        'Real-time calculations for GST and further tax',
        'Print and share invoices instantly'
      ]
    },
    {
      icon: '🏛️',
      title: 'FBR Integration',
      description: 'Seamlessly integrate with Federal Board of Revenue (FBR) for compliance and validation.',
      highlights: [
        'Validate invoices with FBR in real-time',
        'Post invoices directly to FBR portal',
        'Track FBR submission status',
        'Test in sandbox mode before going live',
        'Automatic NTN/CNIC validation'
      ]
    },
    {
      icon: '🌍',
      title: 'Commercial Invoices',
      description: 'Maintain separate invoices for FBR compliance and buyer presentation. Manage product details, descriptions, quantities, prices, HS codes, and UOMs independently for each invoice type.',
      highlights: [
        'Create two versions: FBR invoice and Commercial invoice',
        'Customize descriptions, quantities, and prices separately',
        'Use different HS codes and UOMs for each version',
        'Commercial invoice tailored for buyer understanding',
        'Perfect for businesses with complex product catalogs'
      ]
    },
    {
      icon: '🎨',
      title: 'Professional Templates',
      description: 'Choose from multiple professionally designed invoice templates to match your brand.',
      highlights: [
        'Modern, Classic, Excel, and Letterhead templates',
        'DC (Delivery Challan) template',
        'Customizable company logo and branding',
        'QR code integration for easy verification',
        'Print-optimized layouts'
      ]
    },
    {
      icon: '💬',
      title: 'WhatsApp & Email Integration',
      description: 'Send invoices directly to customers via WhatsApp or Email with professional messages.',
      highlights: [
        'WhatsApp Business integration (Link & Cloud API)',
        'SMTP email configuration',
        'Customizable message templates',
        'Automatic PDF attachment',
        'Track delivery status'
      ]
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'Get insights into your business with comprehensive analytics and reporting tools.',
      highlights: [
        'Real-time dashboard statistics',
        'Revenue tracking and trends',
        'FBR submission analytics',
        'Customer payment tracking',
        'Export data for accounting'
      ]
    },
    {
      icon: '⚙️',
      title: 'Settings & Configuration',
      description: 'Customize the system to match your business needs with flexible settings.',
      highlights: [
        'Company information management',
        'Tax rate configuration',
        'Invoice prefix and numbering',
        'Default values for quick invoicing',
        'FBR token management'
      ]
    },
    {
      icon: '🚀',
      title: 'Getting Started',
      description: 'Ready to explore? Here\'s how to make the most of your demo experience.',
      highlights: [
        '1. Browse existing sample invoices in the dashboard',
        '2. Create a new invoice to see the workflow',
        '3. Try different templates and export options',
        '4. Test FBR validation in sandbox mode',
        '5. Explore settings to customize your experience',
        '⚠️ Note: Password change is disabled for demo accounts'
      ]
    }
  ];

  const currentFeature = features[currentStep];

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentFeature.icon}</span>
              <h2 className="text-2xl font-bold">{currentFeature.title}</h2>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {features.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index === currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            {currentFeature.description}
          </p>

          <div className="space-y-3">
            {currentFeature.highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-green-600 text-xl flex-shrink-0 mt-0.5">
                  {highlight.startsWith('⚠️') ? '⚠️' : '✓'}
                </span>
                <span className="text-gray-800 text-sm leading-relaxed">
                  {highlight.replace('⚠️', '').trim()}
                </span>
              </div>
            ))}
          </div>

          {currentStep === 0 && (
            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-semibold mb-2">
                🎓 Demo Account Benefits:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Unlimited access to all features</li>
                <li>• Safe environment to test and learn</li>
                <li>• No risk of affecting real data</li>
                <li>• Perfect for training your team</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {features.length}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {currentStep === features.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
