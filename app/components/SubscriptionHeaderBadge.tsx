'use client';

import { useEffect, useState } from 'react';

interface Subscription {
  id: string;
  start_date: string;
  end_date: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'overdue';
}

export default function SubscriptionHeaderBadge() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) {
        setLoading(false);
        return;
      }
      
      const sessionData = JSON.parse(session);
      const companyId = sessionData.company_id;
      
      if (!companyId) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/seller/subscription?company_id=${companyId}`);
      const data = await response.json();
      
      if (data.success && data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription) {
    return null;
  }

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
