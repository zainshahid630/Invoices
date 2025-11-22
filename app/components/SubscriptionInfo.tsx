'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Subscription {
  id: string;
  start_date: string;
  end_date: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'overdue';
}

export default function SubscriptionInfo() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get company_id from localStorage
  const companyId = useMemo(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) return null;
    const sessionData = JSON.parse(session);
    return sessionData.company_id;
  }, []);

  // Fetch subscription with React Query
  const { data, isLoading } = useQuery({
    queryKey: ['subscription', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/seller/subscription?company_id=${companyId}`);
      const result = await response.json();
      return result.success ? result.subscription : null;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes - subscription doesn't change often
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  if (isLoading || !data) {
    return null;
  }

  const subscription = data;

  const daysRemaining = Math.ceil(
    (new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  const getStatusColor = () => {
    if (subscription.status === 'active' && !isExpired) {
      return isExpiringSoon ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200';
    }
    return 'bg-red-50 border-red-200';
  };

  const getStatusBadgeColor = () => {
    if (subscription.status === 'active') return 'bg-green-100 text-green-800';
    if (subscription.status === 'expired') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPaymentBadgeColor = () => {
    if (subscription.payment_status === 'paid') return 'bg-green-100 text-green-800';
    if (subscription.payment_status === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📋</div>
          <div>
            <h3 className="font-semibold text-gray-900">Subscription Status</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor()}`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentBadgeColor()}`}>
                {subscription.payment_status.charAt(0).toUpperCase() + subscription.payment_status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          {isExpanded ? '▲ Hide' : '▼ Details'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-600 font-medium">Start Date</div>
            <div className="text-sm text-gray-900 mt-1">
              {new Date(subscription.start_date).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 font-medium">End Date</div>
            <div className="text-sm text-gray-900 mt-1">
              {new Date(subscription.end_date).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 font-medium">Amount</div>
            <div className="text-sm text-gray-900 mt-1 font-semibold">
              PKR {subscription.amount.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="mt-2 text-sm text-gray-700">
          {isExpired ? (
            <span className="font-medium text-red-700">⚠️ Subscription expired</span>
          ) : isExpiringSoon ? (
            <span className="font-medium text-yellow-700">
              ⏰ Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-gray-600">
              Valid until {new Date(subscription.end_date).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
