/**
 * Stripe Integration Layer
 * 
 * Handles subscriptions, checkout, and customer portal.
 * In demo mode, simulates all Stripe operations.
 * 
 * To connect real Stripe:
 * 1. Add VITE_STRIPE_PUBLISHABLE_KEY to .env
 * 2. Set up Stripe webhook endpoint
 * 3. Create Products & Prices in Stripe Dashboard
 */

// Demo mode - no real Stripe calls
const DEMO_MODE = true;

export interface StripePlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

export const PLANS: StripePlan[] = [
  {
    id: 'free',
    name: 'Starter',
    priceMonthly: 0,
    priceAnnual: 0,
    stripePriceIdMonthly: 'price_free_monthly',
    stripePriceIdAnnual: 'price_free_annual',
  },
  {
    id: 'pro',
    name: 'Professional',
    priceMonthly: 49,
    priceAnnual: 39,
    stripePriceIdMonthly: 'price_pro_monthly',
    stripePriceIdAnnual: 'price_pro_annual',
  },
  {
    id: 'agency',
    name: 'Agency',
    priceMonthly: 199,
    priceAnnual: 159,
    stripePriceIdMonthly: 'price_agency_monthly',
    stripePriceIdAnnual: 'price_agency_annual',
  },
];

export async function createCheckoutSession(
  planId: string,
  billing: 'monthly' | 'annual'
): Promise<{ url: string; sessionId: string }> {
  if (DEMO_MODE) {
    // Simulate checkout
    void PLANS.find(p => p.id === planId);
    return {
      url: `#checkout-${planId}-${billing}`,
      sessionId: `cs_demo_${Date.now()}`,
    };
  }

  // Real implementation:
  // const response = await fetch('/api/stripe/create-checkout', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ planId, billing }),
  // });
  // return response.json();
  
  return { url: '#', sessionId: '' };
}

export async function createCustomerPortal(): Promise<{ url: string }> {
  if (DEMO_MODE) {
    return { url: '#customer-portal' };
  }

  // Real implementation:
  // const response = await fetch('/api/stripe/customer-portal', {
  //   method: 'POST',
  // });
  // return response.json();
  
  return { url: '#' };
}

export async function startFreeTrial(): Promise<{
  success: boolean;
  trialEndsAt: string;
  message: string;
}> {
  if (DEMO_MODE) {
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    
    // Save trial status to localStorage
    const user = JSON.parse(localStorage.getItem('forgelocal_user') || '{}');
    user.plan = 'pro';
    user.trialEndsAt = trialEnd.toISOString();
    localStorage.setItem('forgelocal_user', JSON.stringify(user));

    return {
      success: true,
      trialEndsAt: trialEnd.toISOString(),
      message: '🎉 14-day Pro trial activated! All features unlocked.',
    };
  }

  return {
    success: false,
    trialEndsAt: '',
    message: 'Stripe not configured',
  };
}

export function getPlanById(id: string): StripePlan | undefined {
  return PLANS.find(p => p.id === id);
}

export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
