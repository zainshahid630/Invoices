import { useEffect, useRef, useState } from 'react';

/**
 * Auto-save Hook
 * 
 * Automatically saves data at regular intervals
 * 
 * Usage:
 * const { isSaving, lastSaved } = useAutoSave(formData, saveFn, {
 *   interval: 30000, // 30 seconds
 *   enabled: isDraft,
 * });
 */

interface AutoSaveOptions {
  interval?: number; // Interval in milliseconds (default: 30000 = 30s)
  enabled?: boolean; // Enable/disable auto-save (default: true)
  onSave?: () => void; // Callback after successful save
  onError?: (error: Error) => void; // Callback on error
}

export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
) {
  const {
    interval = 30000,
    enabled = true,
    onSave,
    onError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef(data);
  const hasChangesRef = useRef(false);

  // Track if data has changed
  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(dataRef.current)) {
      hasChangesRef.current = true;
      dataRef.current = data;
    }
  }, [data]);

  // Auto-save interval
  useEffect(() => {
    if (!enabled) return;

    const save = async () => {
      // Only save if there are changes
      if (!hasChangesRef.current) return;

      setIsSaving(true);
      setError(null);

      try {
        await saveFn(dataRef.current);
        setLastSaved(new Date());
        hasChangesRef.current = false;
        onSave?.();
      } catch (err: any) {
        const errorMessage = err.message || 'Auto-save failed';
        setError(errorMessage);
        onError?.(err);
        console.error('Auto-save error:', err);
      } finally {
        setIsSaving(false);
      }
    };

    const intervalId = setInterval(save, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, saveFn, onSave, onError]);

  // Manual save function
  const saveNow = async () => {
    if (!hasChangesRef.current) return;

    setIsSaving(true);
    setError(null);

    try {
      await saveFn(dataRef.current);
      setLastSaved(new Date());
      hasChangesRef.current = false;
      onSave?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Save failed';
      setError(errorMessage);
      onError?.(err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    lastSaved,
    error,
    saveNow,
    hasUnsavedChanges: hasChangesRef.current,
  };
}
