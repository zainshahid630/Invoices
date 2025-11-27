'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Company details
    company_name: '',
    business_name: '',
    ntn_number: '',
    address: '',
    province: 'Sindh',
    phone: '',
    email: '',
    // Contact person
    user_name: '',
    // Pricing plan
    plan: 'monthly',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.company_name || !formData.business_name || !formData.user_name) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Build WhatsApp message
    const planDetails = formData.plan === 'monthly' 
      ? 'Monthly Plan (PKR 2,000/month + PKR 10,000 setup)'
      : 'Yearly Plan (PKR 25,000/year + PKR 10,000 setup)';

    const message = `🆕 New Registration - InvoiceFBR

📋 Company Information:
• Company Name: ${formData.company_name}
• Business Name: ${formData.business_name}
• NTN Number: ${formData.ntn_number || 'Not provided'}
• Province: ${formData.province}
• Address: ${formData.address || 'Not provided'}
• Phone: ${formData.phone || 'Not provided'}
• Email: ${formData.email || 'Not provided'}

👤 Contact Person:
• Name: ${formData.user_name}

💰 Selected Plan:
• ${planDetails}

Please set up their account and provide login credentials.`;

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/923164951361?text=${encodedMessage}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');

    // Show success message
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 500);
  };

  if (success) {
    const planDetails = formData.plan === 'monthly' 
      ? { name: 'Monthly Plan', price: 'PKR 2,000/month', setup: 'PKR 10,000 setup fee' }
      : { name: 'Yearly Plan', price: 'PKR 25,000/year', setup: 'PKR 10,000 setup fee' };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6 text-center text-lg">
            Thank you for registering with InvoiceFBR!
          </p>

          {/* Selected Plan */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-blue-900 mb-3">Your Selected Plan</h3>
            <div className="space-y-2">
              <p className="text-lg"><span className="font-semibold">Plan:</span> {planDetails.name}</p>
              <p className="text-lg"><span className="font-semibold">Price:</span> {planDetails.price}</p>
              <p className="text-lg"><span className="font-semibold">Setup Fee:</span> {planDetails.setup}</p>
            </div>
          </div>

          {/* WhatsApp Contact */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white mb-6">
            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Next Step: Contact Us on WhatsApp
            </h3>
            <p className="text-green-50 mb-4 text-lg">
              Your registration details have been sent to us via WhatsApp. If the WhatsApp window didn&apos;t open, please click below:
            </p>
            <a
              href={`https://wa.me/923164951361?text=${encodeURIComponent(`🆕 New Registration - InvoiceFBR\n\n📋 Company Information:\n• Company Name: ${formData.company_name}\n• Business Name: ${formData.business_name}\n• NTN Number: ${formData.ntn_number || 'Not provided'}\n• Province: ${formData.province}\n• Address: ${formData.address || 'Not provided'}\n• Phone: ${formData.phone || 'Not provided'}\n• Email: ${formData.email || 'Not provided'}\n\n👤 Contact Person:\n• Name: ${formData.user_name}\n\n💰 Selected Plan:\n• ${formData.plan === 'monthly' ? 'Monthly Plan (PKR 2,000/month + PKR 10,000 setup)' : 'Yearly Plan (PKR 25,000/year + PKR 10,000 setup)'}\n\nPlease set up my account and provide login credentials.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-white text-green-600 rounded-lg hover:bg-green-50 font-bold text-xl text-center shadow-lg transition-all hover:shadow-xl"
            >
              📱 Open WhatsApp
            </a>
            <p className="text-green-50 text-sm mt-3 text-center">
              We&apos;ll activate your account within 24 hours after payment confirmation
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-2">What happens next?</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">1.</span>
                <span>Contact us on WhatsApp with your company details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">2.</span>
                <span>We&apos;ll verify your information and set up your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">3.</span>
                <span>Complete the payment process</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">4.</span>
                <span>Your account will be activated and you can start creating FBR-compliant invoices!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 textx">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              InvoiceFBR
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 textx">Register Your Company</h1>
          <p className="text-md sm:text-lg md:text-xl text-gray-600 textx">Choose your plan and get started today</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden textx">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Create Your Account</h2>
            <p className="text-blue-100">Get started with FBR-compliant invoicing in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Company Information */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</span>
                Company Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC Corp (Pvt) Ltd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NTN Number
                  </label>
                  <input
                    type="text"
                    name="ntn_number"
                    value={formData.ntn_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234567-8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Sindh">Sindh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Azad Jammu and Kashmir">Azad Jammu and Kashmir</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address, city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="company@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">2</span>
                Contact Person Name
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">3</span>
                Choose Your Plan
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Monthly Plan */}
                <div 
                  onClick={() => setFormData({...formData, plan: 'monthly'})}
                  className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                    formData.plan === 'monthly' 
                      ? 'border-blue-600 bg-blue-50 shadow-lg' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-bold text-gray-900">Monthly Plan</h4>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.plan === 'monthly' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {formData.plan === 'monthly' && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-3xl font-bold text-blue-600">PKR 2,000<span className="text-lg text-gray-600">/month</span></p>
                    <p className="text-sm text-gray-600">+ PKR 10,000 one-time setup fee</p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      FBR integration
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      24/7 support
                    </li>
                  </ul>
                </div>

                {/* Yearly Plan */}
                <div 
                  onClick={() => setFormData({...formData, plan: 'yearly'})}
                  className={`cursor-pointer border-2 rounded-xl p-6 transition-all relative ${
                    formData.plan === 'yearly' 
                      ? 'border-purple-600 bg-purple-50 shadow-lg' 
                      : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <div className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    SAVE 17%
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-bold text-gray-900">Yearly Plan</h4>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.plan === 'yearly' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                    }`}>
                      {formData.plan === 'yearly' && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-3xl font-bold text-purple-600">PKR 25,000<span className="text-lg text-gray-600">/year</span></p>
                    <p className="text-sm text-gray-600">+ PKR 10,000 one-time setup fee</p>
                    <p className="text-xs text-green-600 font-semibold">Save PKR 4,000 per year!</p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Everything in Monthly
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Best value
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-yellow-900 mb-1">Important</h4>
                  <p className="text-sm text-yellow-800">
                    After registration, contact us on WhatsApp to activate your account and complete the payment process.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Registration...
                </>
              ) : (
                <>
                  Register Company
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* WhatsApp Contact */}
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-sm text-gray-700 mb-2">Need help? Contact us on WhatsApp</p>
              <a
                href="https://wa.me/923164951361"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                +92 300 1234567
              </a>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-2">✅</div>
            <h4 className="font-bold text-gray-900 mb-1">FBR Compliant</h4>
            <p className="text-sm text-gray-600">Automatic FBR integration</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-bold text-gray-900 mb-1">Quick Setup</h4>
            <p className="text-sm text-gray-600">Start in under 5 minutes</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-2">💬</div>
            <h4 className="font-bold text-gray-900 mb-1">24/7 Support</h4>
            <p className="text-sm text-gray-600">We&apos;re here to help</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-2">💰</div>
            <h4 className="font-bold text-gray-900 mb-1">Affordable</h4>
            <p className="text-sm text-gray-600">Starting at PKR 2K/month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
