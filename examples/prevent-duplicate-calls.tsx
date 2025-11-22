/**
 * Examples: How to Prevent Duplicate API Calls
 * 
 * This file shows correct patterns to avoid duplicate API calls
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { deduplicatedFetch } from '@/lib/requestDeduplication';
import { useInvoices } from '@/hooks/useInvoices';

// ❌ WRONG: This will cause duplicate calls in React 18 Strict Mode
export function WrongExample() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // This runs TWICE in development due to Strict Mode
    fetch('/api/invoices')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}

// ✅ CORRECT: Solution 1 - Use React Query (BEST)
export function CorrectExample1() {
  const companyId = 'your-company-id';
  
  // React Query automatically deduplicates requests
  const { data, isLoading } = useInvoices(companyId, { page: 1 });

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}

// ✅ CORRECT: Solution 2 - Use useEffectOnce
export function CorrectExample2() {
  const [data, setData] = useState(null);

  // Runs only once, even in Strict Mode
  useEffectOnce(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(setData);
  });

  return <div>{JSON.stringify(data)}</div>;
}

// ✅ CORRECT: Solution 3 - Use deduplicatedFetch
export function CorrectExample3() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Automatically deduplicated
    deduplicatedFetch('/api/invoices')
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}

// ✅ CORRECT: Solution 4 - Use ref to track if loaded
export function CorrectExample4() {
  const [data, setData] = useState(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    fetch('/api/invoices')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
