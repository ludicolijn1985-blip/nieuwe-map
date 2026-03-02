// ============================================
// CORE BUSINESS TYPES
// ============================================
export interface BusinessFormData {
  name: string;
  type: string;
  city: string;
  postcode: string;
  description: string;
  features: string;
  primaryColor: string;
  secondaryColor: string;
  logoUploaded: boolean;
}

export interface LogEntry {
  step: number;
  total: number;
  message: string;
  detail: string;
  timestamp: string;
  status: 'pending' | 'running' | 'complete';
  duration?: string;
}

export interface ROIData {
  revenueBoostMin: number;
  revenueBoostMax: number;
  buildTimeMin: number;
  buildTimeMax: number;
  complexity: 'Easy' | 'Medium' | 'Advanced';
  monthlyPrice: number;
  paybackWeeks: number;
}

export type AppPhase = 'input' | 'roi' | 'building' | 'complete';

// ============================================
// SAAS / USER TYPES
// ============================================
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'agency';
  trialEndsAt?: string;
  apiKey?: string;
  aiProvider?: 'openai' | 'anthropic' | 'grok' | 'groq';
  createdAt: string;
  appsBuilt: number;
  teamId?: string;
}

export interface SavedApp {
  id: string;
  userId: string;
  businessData: BusinessFormData;
  codeFiles: { filename: string; code: string }[];
  roi: ROIData;
  status: 'draft' | 'building' | 'complete' | 'deployed';
  playStoreAssets?: PlayStoreAssets;
  createdAt: string;
  updatedAt: string;
  deployedAt?: string;
  maintenanceEnabled: boolean;
  lastMaintenanceCheck?: string;
}

export interface PlayStoreAssets {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  tags: string[];
  screenshots: string[];
  featureGraphic: string;
  iconGenerated: boolean;
  privacyPolicyUrl: string;
  privacyPolicyDraft: string;
}

export interface MaintenanceSuggestion {
  id: string;
  type: 'feature' | 'performance' | 'security' | 'design' | 'conversion';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedBoost: string;
  status: 'pending' | 'applied' | 'dismissed';
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  annualPrice: number;
  features: string[];
  limits: {
    appsPerMonth: number;
    teamMembers: number;
    apiAccess: boolean;
    whiteLabel: boolean;
    prioritySupport: boolean;
  };
}

export type SaaSPage = 'landing' | 'builder' | 'dashboard' | 'pricing' | 'playstore' | 'maintenance';
