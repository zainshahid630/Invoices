/**
 * Analytics and Monitoring Utilities
 * 
 * Track user events and application performance
 */

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class Analytics {
  private enabled: boolean;
  private userId: string | null = null;
  private sessionId: string;

  constructor() {
    this.enabled = typeof window !== 'undefined';
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize analytics with user info
   */
  identify(userId: string, properties?: EventProperties) {
    this.userId = userId;
    this.track('user_identified', { ...properties, userId });
  }

  /**
   * Track custom event
   */
  track(event: string, properties?: EventProperties) {
    if (!this.enabled) return;

    const eventData = {
      event,
      properties: {
        ...properties,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventData);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // Google Analytics
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', event, properties);
      }

      // Custom analytics endpoint
      this.sendToServer(eventData);
    }
  }

  /**
   * Track page view
   */
  pageView(path: string, properties?: EventProperties) {
    this.track('page_view', { path, ...properties });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: PerformanceMetric) {
    this.track('performance_metric', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_timestamp: metric.timestamp,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_context: context,
    });
  }

  /**
   * Send event to server
   */
  private async sendToServer(data: any) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (event: string, properties?: EventProperties) => {
  analytics.track(event, properties);
};

export const trackPageView = (path: string) => {
  analytics.pageView(path);
};

export const trackError = (error: Error, context?: string) => {
  analytics.trackError(error, context);
};

// Common events
export const trackInvoiceCreated = (invoiceId: string, amount: number) => {
  trackEvent('invoice_created', { invoice_id: invoiceId, amount });
};

export const trackInvoicePosted = (invoiceId: string) => {
  trackEvent('invoice_posted', { invoice_id: invoiceId });
};

export const trackPaymentReceived = (invoiceId: string, amount: number) => {
  trackEvent('payment_received', { invoice_id: invoiceId, amount });
};

export const trackSearchPerformed = (query: string, resultsCount: number) => {
  trackEvent('search_performed', { query, results_count: resultsCount });
};
