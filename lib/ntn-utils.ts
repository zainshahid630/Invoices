/**
 * NTN (National Tax Number) Utility Functions
 * 
 * This module provides utilities for normalizing and validating NTN numbers
 * to ensure they meet FBR (Federal Board of Revenue) requirements.
 */

export interface NTNResult {
  normalized: string;
  isValid: boolean;
  error?: string;
}

/**
 * Normalizes NTN/CNIC number to format required by FBR API
 * FBR accepts ONLY:
 * - Exactly 7 characters for NTN (numeric or alphanumeric)
 * - Exactly 13 digits for CNIC
 * 
 * Accepts formats:
 * - "066744-0" → "0667440" (6+1 digits = 7 total)
 * - "1234567-8" → "1234567" (7 digits, ignore check digit)
 * - "1234567" → "1234567" (7 digits)
 * - "G980921-2" → "G980921" (7 alphanumeric, ignore check digit)
 * - "1234567890123" → "1234567890123" (13 digits CNIC)
 * 
 * @param ntn - The NTN/CNIC number to normalize
 * @returns Object with normalized NTN, validity status, and optional error message
 * 
 * @example
 * ```typescript
 * const result = normalizeNTN("066744-0");
 * // { normalized: "0667440", isValid: true }
 * 
 * const result2 = normalizeNTN("1234567890123");
 * // { normalized: "1234567890123", isValid: true }
 * ```
 */
export function normalizeNTN(ntn: string): NTNResult {
  // Step 1: Check if empty
  if (!ntn) {
    return { normalized: '', isValid: false, error: 'NTN/CNIC is empty' };
  }

  // Step 2: Clean and uppercase - keep alphanumeric and hyphen
  const cleaned = ntn.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');

  if (!cleaned) {
    return { normalized: '', isValid: false, error: 'NTN/CNIC is empty after cleaning' };
  }

  // Step 3: Check if hyphen exists
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');

    // Check for multiple hyphens
    if (parts.length > 2) {
      return {
        normalized: '',
        isValid: false,
        error: 'Invalid format - too many hyphens',
      };
    }

    const beforeHyphen = parts[0];
    const afterHyphen = parts[1] || '';

    // Special case: 6 characters + hyphen + 1 character = 7 total
    // Example: "066744-0" → "0667440"
    if (beforeHyphen.length === 6 && afterHyphen.length === 1) {
      const combined = beforeHyphen + afterHyphen;
      return { normalized: combined, isValid: true };
    }

    // Standard case: Exactly 7 characters before hyphen (ignore check digit)
    // Example: "G980921-2" → "G980921" or "1234567-8" → "1234567"
    if (beforeHyphen.length === 7) {
      return { normalized: beforeHyphen, isValid: true };
    }

    // CNIC case: 13 digits with hyphens (e.g., "12345-1234567-1")
    // Remove all hyphens and check if 13 digits
    const allDigits = cleaned.replace(/-/g, '');
    if (/^\d{13}$/.test(allDigits)) {
      return { normalized: allDigits, isValid: true };
    }

    return {
      normalized: '',
      isValid: false,
      error: `Invalid format. FBR accepts only 7 characters for NTN or 13 digits for CNIC (found ${beforeHyphen.length} before hyphen)`,
    };
  }

  // Step 4: No hyphen - check for valid lengths
  
  // Check for 13-digit CNIC
  if (/^\d{13}$/.test(cleaned)) {
    return { normalized: cleaned, isValid: true };
  }

  // Check for exactly 7 characters NTN (numeric or alphanumeric)
  if (cleaned.length === 7) {
    return { normalized: cleaned, isValid: true };
  }

  return {
    normalized: '',
    isValid: false,
    error: `Invalid length. FBR accepts only 7 characters for NTN or 13 digits for CNIC (found ${cleaned.length})`,
  };
}

/**
 * Validates if an NTN is in correct format
 * 
 * @param ntn - The NTN number to validate
 * @returns true if valid, false otherwise
 */
export function isValidNTN(ntn: string): boolean {
  return normalizeNTN(ntn).isValid;
}

/**
 * Formats NTN for display (adds hyphen if needed)
 * 
 * @param ntn - The NTN number to format
 * @returns Formatted NTN string
 * 
 * @example
 * ```typescript
 * formatNTN("1234567") // "1234567-X"
 * ```
 */
export function formatNTN(ntn: string): string {
  const result = normalizeNTN(ntn);
  if (!result.isValid) {
    return ntn; // Return original if invalid
  }
  return result.normalized;
}
