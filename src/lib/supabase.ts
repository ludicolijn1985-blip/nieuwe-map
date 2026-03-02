/**
 * Supabase Integration Layer
 * 
 * This module provides all Supabase operations for ForgeLocal AI.
 * In demo mode (no VITE_SUPABASE_URL), it falls back to localStorage.
 * 
 * To connect real Supabase:
 * 1. Create a Supabase project
 * 2. Run SUPABASE_SCHEMA.sql in SQL Editor
 * 3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
 */

import type { UserProfile, SavedApp, BusinessFormData, ROIData } from '../types';

// ============================================
// DEMO MODE - LocalStorage Fallback
// ============================================
const DEMO_MODE = true; // Set to false when Supabase is configured
const STORAGE_KEYS = {
  user: 'forgelocal_user',
  apps: 'forgelocal_apps',
  apiKeys: 'forgelocal_apikeys',
  session: 'forgelocal_session',
};

function getStoredUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.user);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function setStoredUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.user);
  }
}

function getStoredApps(): SavedApp[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.apps);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function setStoredApps(apps: SavedApp[]) {
  localStorage.setItem(STORAGE_KEYS.apps, JSON.stringify(apps));
}

// ============================================
// AUTH FUNCTIONS
// ============================================
export async function signUpWithEmail(email: string, _password: string, name: string): Promise<{ user: UserProfile | null; error: string | null }> {
  if (DEMO_MODE) {
    const user: UserProfile = {
      id: crypto.randomUUID(),
      email,
      name,
      plan: 'free',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      appsBuilt: 0,
    };
    setStoredUser(user);
    return { user, error: null };
  }

  // Real Supabase implementation would go here
  return { user: null, error: 'Supabase not configured' };
}

export async function signInWithEmail(email: string, ..._args: string[]): Promise<{ user: UserProfile | null; error: string | null }> {
  if (DEMO_MODE) {
    const existing = getStoredUser();
    if (existing && existing.email === email) {
      return { user: existing, error: null };
    }
    // Create demo user on first login
    const user: UserProfile = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
      plan: 'free',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      appsBuilt: getStoredApps().length,
    };
    setStoredUser(user);
    return { user, error: null };
  }

  return { user: null, error: 'Supabase not configured' };
}

export async function signInWithGoogle(): Promise<{ user: UserProfile | null; error: string | null }> {
  if (DEMO_MODE) {
    const user: UserProfile = {
      id: crypto.randomUUID(),
      email: 'demo@forgelocal.ai',
      name: 'Demo User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      plan: 'pro',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      appsBuilt: 3,
    };
    setStoredUser(user);
    return { user, error: null };
  }

  return { user: null, error: 'Supabase not configured' };
}

export async function signOut(): Promise<void> {
  if (DEMO_MODE) {
    setStoredUser(null);
    return;
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (DEMO_MODE) {
    return getStoredUser();
  }
  return null;
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  if (DEMO_MODE) {
    const user = getStoredUser();
    if (!user) return null;
    const updated = { ...user, ...updates };
    setStoredUser(updated);
    return updated;
  }
  return null;
}

// ============================================
// API KEY MANAGEMENT
// ============================================
export async function saveApiKey(provider: string, key: string): Promise<boolean> {
  if (DEMO_MODE) {
    const keys = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiKeys) || '{}');
    keys[provider] = {
      key: key, // In production, this would be encrypted server-side
      hint: '···' + key.slice(-4),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(keys));
    return true;
  }
  return false;
}

export async function getApiKey(provider: string): Promise<{ key: string; hint: string } | null> {
  if (DEMO_MODE) {
    const keys = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiKeys) || '{}');
    return keys[provider] || null;
  }
  return null;
}

export async function deleteApiKey(provider: string): Promise<boolean> {
  if (DEMO_MODE) {
    const keys = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiKeys) || '{}');
    delete keys[provider];
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(keys));
    return true;
  }
  return false;
}

// ============================================
// APP CRUD OPERATIONS
// ============================================
export async function saveApp(
  businessData: BusinessFormData,
  codeFiles: { filename: string; code: string }[],
  roi: ROIData
): Promise<SavedApp> {
  const app: SavedApp = {
    id: crypto.randomUUID(),
    userId: getStoredUser()?.id || 'anonymous',
    businessData,
    codeFiles,
    roi,
    status: 'complete',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    maintenanceEnabled: false,
  };

  if (DEMO_MODE) {
    const apps = getStoredApps();
    apps.unshift(app);
    setStoredApps(apps);

    // Update user stats
    const user = getStoredUser();
    if (user) {
      user.appsBuilt = apps.length;
      setStoredUser(user);
    }
  }

  return app;
}

export async function getUserApps(): Promise<SavedApp[]> {
  if (DEMO_MODE) {
    return getStoredApps();
  }
  return [];
}

export async function getAppById(id: string): Promise<SavedApp | null> {
  if (DEMO_MODE) {
    const apps = getStoredApps();
    return apps.find(a => a.id === id) || null;
  }
  return null;
}

export async function updateApp(id: string, updates: Partial<SavedApp>): Promise<SavedApp | null> {
  if (DEMO_MODE) {
    const apps = getStoredApps();
    const index = apps.findIndex(a => a.id === id);
    if (index === -1) return null;
    apps[index] = { ...apps[index], ...updates, updatedAt: new Date().toISOString() };
    setStoredApps(apps);
    return apps[index];
  }
  return null;
}

export async function deleteApp(id: string): Promise<boolean> {
  if (DEMO_MODE) {
    const apps = getStoredApps();
    const filtered = apps.filter(a => a.id !== id);
    setStoredApps(filtered);
    return true;
  }
  return false;
}

// ============================================
// ANALYTICS
// ============================================
export async function trackEvent(eventType: string, eventData?: Record<string, unknown>): Promise<void> {
  if (DEMO_MODE) {
    console.log(`[Analytics] ${eventType}`, eventData);
    return;
  }
}

// ============================================
// SUBSCRIPTION CHECK
// ============================================
export async function checkSubscriptionLimits(): Promise<{
  canBuild: boolean;
  appsThisMonth: number;
  limit: number;
  plan: string;
}> {
  if (DEMO_MODE) {
    const user = getStoredUser();
    const apps = getStoredApps();
    const thisMonth = apps.filter(a => {
      const d = new Date(a.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const plan = user?.plan || 'free';
    const limit = plan === 'free' ? 1 : plan === 'pro' ? 999 : 999;

    return {
      canBuild: thisMonth.length < limit,
      appsThisMonth: thisMonth.length,
      limit,
      plan,
    };
  }

  return { canBuild: true, appsThisMonth: 0, limit: 1, plan: 'free' };
}
