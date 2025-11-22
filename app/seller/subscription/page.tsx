'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { processJazzCashPayment } from '@/lib/jazzcash-client';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic_monthly',
    name: 'Basic',
    price: 2000,
    duration: 'monthly',
    features: [
      'Up to 50 invoices per month',
      'Basic reporting',
      'Email support',
      'FBR integration',
    ],
  },
  {
    id: 'pro_monthly',
    name: 'Professional',
    price: 5000,
    duration: 'monthly',
    popular: true,
    features: [
      'Unlimited invoices',
      'Advanced reporting & analytics',
      'Priority support',
      'FBR integration',
      'Custom branding',
      'Multi-user access',
    ],
  },
  {
    id: 'enterprise_monthly',
    name: 'Enterprise',
    price: 10000,
    duration: 'monthly',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom integrations',
      'API access',
      'Training & onboarding',
    ],
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    email: '',
    mobile: '',
  });

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }
    const userData = JSON.parse(session);

    // Check if user has access to subscription (testing only for NTN: 090078601)
    if (userData.company?.ntn_number !== '090078601') {
      setAccessDenied(true);
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 3000);
      return;
    }

    setUser(userData);
    loadSubscription(userData.company_id);

    // Check for payment response in URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status) {
      const response = {
        status: status,
        txnRefNo: urlParams.get('txn'),
        amount: urlParams.get('amount'),
        message: urlParams.get('message'),
        code: urlParams.get('code'),
        rrn: urlParams.get('rrn'),
        rawResponse: urlParams.get('response'),
      };
      setPaymentResponse(response);
      setShowResponse(true);

      // Reload subscription after payment
      if (status === 'success') {
        setTimeout(() => {
          loadSubscription(userData.company_id);
        }, 2000);
      }
    }
  }, [router]);

  const loadSubscription = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/subscription?company_id=${companyId}`);
      const data = await response.json();

      if (data.success && data.subscription) {
        setCurrentSubscription({
          plan: data.subscription.plan_id || 'basic_monthly',
          status: data.subscription.status,
          expiresAt: data.subscription.end_date,
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    // Pre-fill with user data if available
    setCustomerDetails({
      email: user?.email || '',
      mobile: user?.phone || '',
    });
    setShowPaymentForm(true);
  };

  const handleProcessPayment = async () => {
    if (!user || !selectedPlan) return;

    // Validate customer details
    if (!customerDetails.email || !customerDetails.mobile) {
      alert('Please provide both email and mobile number');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) {
      alert('Please provide a valid email address');
      return;
    }

    // Validate mobile format (Pakistani format: 03XXXXXXXXX)
    const mobileRegex = /^03\d{9}$/;
    if (!mobileRegex.test(customerDetails.mobile)) {
      alert('Please provide a valid mobile number (format: 03XXXXXXXXX)');
      return;
    }

    setLoading(true);

    try {
      // Generate shorter bill reference (max 20 chars for JazzCash)
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits
      const companyShort = user.company_id.slice(0, 8); // First 8 chars of UUID
      const txnRefNo = `S${companyShort}${timestamp}`; // Format: S + 8chars + 8digits = 17 chars

      // Create subscription record first
      const subResponse = await fetch('/api/seller/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: user.company_id,
          planId: selectedPlan.id,
          amount: selectedPlan.price,
          txnRefNo,
        }),
      });

      const subData = await subResponse.json();

      if (!subData.success) {
        throw new Error(subData.error || 'Failed to create subscription');
      }

      // Process payment via JazzCash (open in same page for testing)
      await processJazzCashPayment(
        {
          amount: selectedPlan.price,
          billReference: txnRefNo,
          description: `${selectedPlan.name} Subscription`,
          customerEmail: customerDetails.email,
          customerMobile: customerDetails.mobile,
        },
        (error) => {
          alert(`Payment Error: ${error}`);
          setLoading(false);
        },
        true // Open in same page for testing
      );

      setLoading(false);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to process subscription payment');
      setLoading(false);
    }
  };

  // Show access denied message
  if (accessDenied) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-700 mb-4">
            This feature is currently in testing phase and only available for selected accounts.
          </p>
          <p className="text-sm text-gray-600">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Customer Details Form Modal */}
      {showPaymentForm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Complete Payment Details
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedPlan(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Selected Plan Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedPlan.name} Plan</h3>
                    <p className="text-sm text-gray-600">{selectedPlan.duration}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      PKR {selectedPlan.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Payment confirmation will be sent to this email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerDetails.mobile}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, mobile: e.target.value })}
                    placeholder="03001234567"
                    maxLength={11}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 03XXXXXXXXX (11 digits)
                  </p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>You will be redirected to JazzCash payment gateway</li>
                      <li>Please complete the payment within 1 hour</li>
                      <li>Do not close the browser during payment</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedPlan(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={loading || !customerDetails.email || !customerDetails.mobile}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Response Modal */}
      {showResponse && paymentResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  JazzCash Payment Response
                </h2>
                <button
                  onClick={() => {
                    setShowResponse(false);
                    // Clean URL
                    window.history.replaceState({}, '', '/seller/subscription');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                {paymentResponse.status === 'success' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">✅</div>
                      <div>
                        <h3 className="text-lg font-bold text-green-900">Payment Successful!</h3>
                        <p className="text-sm text-green-700">
                          Your subscription has been activated successfully.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">❌</div>
                      <div>
                        <h3 className="text-lg font-bold text-red-900">Payment Failed</h3>
                        <p className="text-sm text-red-700">
                          {paymentResponse.message || 'The payment could not be processed.'}
                        </p>
                        {paymentResponse.code && (
                          <p className="text-xs text-red-600 mt-1">
                            Error Code: {paymentResponse.code}
                            {paymentResponse.code === 'FE34' && (
                              <span className="block mt-1">
                                This is a JazzCash system error. Please contact JazzCash support or try again later.
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Transaction Reference</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {paymentResponse.txnRefNo}
                    </p>
                  </div>
                  {paymentResponse.amount && (
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-semibold text-gray-900">
                        PKR {(parseInt(paymentResponse.amount) / 100).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Response Code</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {paymentResponse.code}
                    </p>
                  </div>
                  {paymentResponse.rrn && (
                    <div>
                      <p className="text-sm text-gray-600">Retrieval Reference (RRN)</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {paymentResponse.rrn}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Response (for testing) */}
              {paymentResponse.rawResponse && (
                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Raw Response (Testing)</h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentResponse.rawResponse);
                        alert('Response copied to clipboard!');
                      }}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-xs text-green-400 overflow-x-auto">
                    {JSON.stringify(JSON.parse(paymentResponse.rawResponse), null, 2)}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResponse(false);
                    window.history.replaceState({}, '', '/seller/subscription');
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Continue
                </button>
                {paymentResponse.status === 'failed' && (
                  <button
                    onClick={() => {
                      setShowResponse(false);
                      window.history.replaceState({}, '', '/seller/subscription');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testing Badge */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧪</span>
          <div>
            <h3 className="font-semibold text-blue-900">Testing Mode</h3>
            <p className="text-sm text-blue-700">
              This subscription feature is currently in testing phase. Only available for NTN: 090078601
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
        <p className="text-gray-600">Manage your platform subscription and payment</p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900">Current Plan</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  Active
                </span>
              </div>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Plan:</span>{' '}
                {SUBSCRIPTION_PLANS.find(p => p.id === currentSubscription.plan)?.name || 'Basic'}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Expires:</span>{' '}
                {new Date(currentSubscription.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                PKR {SUBSCRIPTION_PLANS.find(p => p.id === currentSubscription.plan)?.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${plan.popular ? 'ring-2 ring-blue-500' : ''
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    PKR {plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600">/{plan.duration}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading || currentSubscription?.plan === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition ${currentSubscription?.plan === plan.id
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                >
                  {loading
                    ? 'Processing...'
                    : currentSubscription?.plan === plan.id
                      ? 'Current Plan'
                      : 'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💳</div>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Payment via JazzCash</h3>
              <p className="text-sm text-gray-600 mt-1">
                All payments are processed securely through JazzCash payment gateway. You can pay using:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• Credit/Debit Cards (Visa, Mastercard)</li>
                <li>• JazzCash Mobile Wallet</li>
                <li>• Bank Account</li>
                <li>• Over The Counter (OTC)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">🔄</div>
            <div>
              <h3 className="font-semibold text-gray-900">Auto-Renewal</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your subscription will automatically renew at the end of each billing period. You can cancel anytime.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">📧</div>
            <div>
              <h3 className="font-semibold text-gray-900">Payment Confirmation</h3>
              <p className="text-sm text-gray-600 mt-1">
                You&apos;ll receive a payment confirmation email after each successful transaction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Can I change my plan later?</h3>
            <p className="text-sm text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">What happens if my payment fails?</h3>
            <p className="text-sm text-gray-600">
              We&apos;ll send you a notification and give you 7 days to update your payment. Your account will remain active during this grace period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Can I get a refund?</h3>
            <p className="text-sm text-gray-600">
              We offer a 30-day money-back guarantee for new subscriptions. Contact support for refund requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
