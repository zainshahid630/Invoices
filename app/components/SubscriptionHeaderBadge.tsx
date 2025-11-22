'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Subscription {
  id: string;
  start_date: string;
  end_date: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'overdue';
}

export default function SubscriptionHeaderBadge() {
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

  const today = new Date();
  const endDate = new Date(subscription.end_date);
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const isExpired = daysRemaining < 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;

  const getBadgeStyle = () => {
    if (isExpired) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (isExpiringSoon) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getIcon = () => {
    if (isExpired) return '⚠️';
    if (isExpiringSoon) return '⏰';
    return '📋';
  };

  const getMessage = () => {
    if (isExpired) {
      const daysExpired = Math.abs(daysRemaining);
      return `Expired ${daysExpired} day${daysExpired !== 1 ? 's' : ''} ago`;
    }
    if (isExpiringSoon) {
      return `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
    }
    return `${daysRemaining} days remaining`;
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getBadgeStyle()}`}>
      <span>{getIcon()}</span>
      <span>{getMessage()}</span>
    </div>
  );
}
