import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  subscription: any;
  message?: string;
}

/**
 * Check if a company has an active subscription
 * @param companyId - The company ID to check
 * @returns SubscriptionStatus object
 */
export async function checkSubscription(companyId: string): Promise<SubscriptionStatus> {
  try {
    // Get the latest subscription for the company
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // No subscription found
    if (error || !subscription) {
      return {
        isActive: false,
        isExpired: true,
        subscription: null,
        message: 'No subscription found. Please subscribe to continue using this feature.',
      };
    }

    // Check if subscription is expired
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const isExpired = now > endDate;

    // Check if subscription status is active
    const isStatusActive = subscription.status === 'active';

    // Subscription is active if:
    // 1. Status is 'active'
    // 2. End date is in the future
    const isActive = isStatusActive && !isExpired;

    if (isExpired) {
      return {
        isActive: false,
        isExpired: true,
        subscription,
        message: 'Your subscription has expired. Please renew to continue using this feature.',
      };
    }

    if (!isStatusActive) {
      return {
        isActive: false,
        isExpired: false,
        subscription,
        message: 'Your subscription is not active. Please contact support or renew your subscription.',
      };
    }

    // Subscription is active
    return {
      isActive: true,
      isExpired: false,
      subscription,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      isActive: false,
      isExpired: true,
      subscription: null,
      message: 'Error checking subscription status. Please try again.',
    };
  }
}

/**
 * Get days remaining in subscription
 * @param subscription - The subscription object
 * @returns Number of days remaining (0 if expired)
 */
export function getDaysRemaining(subscription: any): number {
  if (!subscription || !subscription.end_date) return 0;
  
  const now = new Date();
  const endDate = new Date(subscription.end_date);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Check if subscription is expiring soon (within 3 days)
 * @param subscription - The subscription object
 * @returns Boolean indicating if expiring soon
 */
export function isExpiringSoon(subscription: any): boolean {
  const daysRemaining = getDaysRemaining(subscription);
  return daysRemaining > 0 && daysRemaining <= 3;
}
