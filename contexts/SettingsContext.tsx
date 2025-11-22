'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CompanySettings {
  id: string;
  company_id: string;
  invoice_prefix: string;
  invoice_counter: number;
  default_hs_code: string;
  default_sales_tax_rate: number;
  default_further_tax_rate: number;
  fbr_pos_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  name: string;
  business_name: string;
  ntn_number: string;
  gst_number: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
}

interface SettingsData {
  settings: CompanySettings | null;
  company: Company | null;
}

interface SettingsContextType {
  settings: CompanySettings | null;
  company: Company | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const CACHE_KEY = 'company_settings_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: SettingsData;
  timestamp: number;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async (useCache = true) => {
    try {
      // Get company ID from session
      const session = localStorage.getItem('seller_session');
      if (!session) {
        setLoading(false);
        return;
      }

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      // Check cache first
      if (useCache) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const cachedData: CachedData = JSON.parse(cached);
          const age = Date.now() - cachedData.timestamp;

          // Use cache if less than 5 minutes old
          if (age < CACHE_DURATION) {
            setSettings(cachedData.data.settings);
            setCompany(cachedData.data.company);
            setLoading(false);
            console.log('✅ Settings loaded from cache');
            return;
          }
        }
      }

      // Fetch from API
      const response = await fetch(`/api/seller/settings?company_id=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data: SettingsData = await response.json();
      
      setSettings(data.settings);
      setCompany(data.company);

      // Cache the data
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      console.log('✅ Settings loaded from API and cached');
      setError(null);
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    // Clear cache and reload
    sessionStorage.removeItem(CACHE_KEY);
    await loadSettings(false);
  };

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    if (settings) {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);

      // Update cache
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedData: CachedData = JSON.parse(cached);
        cachedData.data.settings = updated;
        cachedData.timestamp = Date.now();
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
      }
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value: SettingsContextType = {
    settings,
    company,
    loading,
    error,
    refreshSettings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
