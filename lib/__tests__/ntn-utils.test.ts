/**
 * Unit tests for NTN normalization utilities
 */

import { normalizeNTN, isValidNTN, formatNTN } from '../ntn-utils';

describe('normalizeNTN', () => {
  describe('Valid NTN formats', () => {
    test('should normalize 6+1 digit format (066744-0)', () => {
      const result = normalizeNTN('066744-0');
      expect(result).toEqual({
        normalized: '0667440',
        isValid: true,
      });
    });

    test('should normalize 7+1 digit format (1234567-8)', () => {
      const result = normalizeNTN('1234567-8');
      expect(result).toEqual({
        normalized: '1234567',
        isValid: true,
      });
    });

    test('should normalize 7 digits without hyphen (1234567)', () => {
      const result = normalizeNTN('1234567');
      expect(result).toEqual({
        normalized: '1234567',
        isValid: true,
      });
    });

    test('should normalize 8 digits without hyphen (12345678)', () => {
      const result = normalizeNTN('12345678');
      expect(result).toEqual({
        normalized: '12345678',
        isValid: true,
      });
    });

    test('should normalize alphanumeric NTN with hyphen (G980921-2)', () => {
      const result = normalizeNTN('G980921-2');
      expect(result).toEqual({
        normalized: 'G980921',
        isValid: true,
      });
    });

    test('should normalize alphanumeric NTN without hyphen (G980921)', () => {
      const result = normalizeNTN('G980921');
      expect(result).toEqual({
        normalized: 'G980921',
        isValid: true,
      });
    });

    test('should normalize lowercase to uppercase (abc1234)', () => {
      const result = normalizeNTN('abc1234');
      expect(result).toEqual({
        normalized: 'ABC1234',
        isValid: true,
      });
    });

    test('should handle NTN with spaces (066 744-0)', () => {
      const result = normalizeNTN('066 744-0');
      expect(result).toEqual({
        normalized: '0667440',
        isValid: true,
      });
    });
  });

  describe('Invalid NTN formats', () => {
    test('should reject empty string', () => {
      const result = normalizeNTN('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('NTN is empty');
    });

    test('should reject NTN with only 6 digits (123456)', () => {
      const result = normalizeNTN('123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('7-8 characters');
    });

    test('should reject NTN with 5+1 format (12345-6)', () => {
      const result = normalizeNTN('12345-6');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('6+1 or 7-8 characters');
    });

    test('should reject NTN with multiple hyphens (123-456-7)', () => {
      const result = normalizeNTN('123-456-7');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too many hyphens');
    });

    test('should reject NTN with 9 digits (123456789)', () => {
      const result = normalizeNTN('123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('7-8 characters');
    });

    test('should reject NTN with only special characters', () => {
      const result = normalizeNTN('---');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('NTN is empty after cleaning');
    });
  });

  describe('Edge cases', () => {
    test('should handle NTN with leading/trailing spaces', () => {
      const result = normalizeNTN('  1234567  ');
      expect(result).toEqual({
        normalized: '1234567',
        isValid: true,
      });
    });

    test('should handle NTN with special characters (123-4567)', () => {
      const result = normalizeNTN('123-4567');
      expect(result.isValid).toBe(false);
    });

    test('should handle mixed case alphanumeric (g980921)', () => {
      const result = normalizeNTN('g980921');
      expect(result).toEqual({
        normalized: 'G980921',
        isValid: true,
      });
    });
  });
});

describe('isValidNTN', () => {
  test('should return true for valid NTN', () => {
    expect(isValidNTN('066744-0')).toBe(true);
    expect(isValidNTN('1234567')).toBe(true);
    expect(isValidNTN('G980921')).toBe(true);
  });

  test('should return false for invalid NTN', () => {
    expect(isValidNTN('123456')).toBe(false);
    expect(isValidNTN('')).toBe(false);
    expect(isValidNTN('123-456-7')).toBe(false);
  });
});

describe('formatNTN', () => {
  test('should format valid NTN', () => {
    expect(formatNTN('066744-0')).toBe('0667440');
    expect(formatNTN('1234567')).toBe('1234567');
  });

  test('should return original for invalid NTN', () => {
    expect(formatNTN('123456')).toBe('123456');
    expect(formatNTN('invalid')).toBe('invalid');
  });
});
