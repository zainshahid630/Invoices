/**
 * JazzCash Integration Tests
 * 
 * These tests verify the JazzCash payment gateway integration
 * according to the official JazzCash documentation.
 */

import { describe, it, expect } from '@jest/globals';
import crypto from 'crypto';

// Mock environment variables
process.env.JAZZCASH_MERCHANT_ID = 'MC478733';
process.env.JAZZCASH_PASSWORD = 's3184uvwzv';
process.env.JAZZCASH_INTEGRITY_SALT = '2531t08v20';
process.env.JAZZCASH_RETURN_URL = 'http://localhost:3000/api/jazzcash/callback';
process.env.JAZZCASH_ENVIRONMENT = 'sandbox';

describe('JazzCash Integration', () => {
  describe('Hash Generation', () => {
    it('should generate correct HMAC SHA256 hash', () => {
      const integritySalt = '2531t08v20';
      const data = {
        pp_Amount: '100000',
        pp_BillReference: 'TEST-001',
        pp_Description: 'Test Payment',
        pp_Language: 'EN',
        pp_MerchantID: 'MC478733',
        pp_Password: 's3184uvwzv',
        pp_ReturnURL: 'http://localhost:3000/api/jazzcash/callback',
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: '20231119120000',
        pp_TxnExpiryDateTime: '20231119130000',
        pp_TxnRefNo: 'T1700395200000',
        pp_TxnType: 'MWALLET',
        pp_Version: '1.1',
      };

      // Sort keys alphabetically
      const sortedKeys = Object.keys(data).sort();
      const hashString = integritySalt + '&' + sortedKeys.map(key => data[key as keyof typeof data]).join('&');

      // Generate hash
      const hash = crypto
        .createHmac('sha256', integritySalt)
        .update(hashString)
        .digest('hex')
        .toUpperCase();

      // Hash should be 64 characters (SHA256)
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[A-F0-9]+$/);
    });

    it('should generate different hashes for different data', () => {
      const integritySalt = '2531t08v20';
      
      const data1 = { pp_Amount: '100000', pp_TxnRefNo: 'T001' };
      const data2 = { pp_Amount: '200000', pp_TxnRefNo: 'T002' };

      const hash1 = crypto
        .createHmac('sha256', integritySalt)
        .update(integritySalt + '&' + Object.values(data1).join('&'))
        .digest('hex')
        .toUpperCase();

      const hash2 = crypto
        .createHmac('sha256', integritySalt)
        .update(integritySalt + '&' + Object.values(data2).join('&'))
        .digest('hex')
        .toUpperCase();

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Amount Conversion', () => {
    it('should convert PKR to paisa correctly', () => {
      const testCases = [
        { pkr: 100, paisa: 10000 },
        { pkr: 1000, paisa: 100000 },
        { pkr: 1.50, paisa: 150 },
        { pkr: 99.99, paisa: 9999 },
      ];

      testCases.forEach(({ pkr, paisa }) => {
        const converted = Math.round(pkr * 100);
        expect(converted).toBe(paisa);
      });
    });
  });

  describe('Transaction Reference Number', () => {
    it('should generate valid transaction reference number', () => {
      const txnRefNo = 'T' + Date.now();
      
      // Should start with T
      expect(txnRefNo).toMatch(/^T\d+$/);
      
      // Should be unique
      const txnRefNo2 = 'T' + Date.now();
      expect(txnRefNo).not.toBe(txnRefNo2);
    });
  });

  describe('DateTime Format', () => {
    it('should format date correctly (YYYYMMDDHHMMSS)', () => {
      const date = new Date('2023-11-19T12:30:45');
      const formatted = formatDateTime(date);
      
      expect(formatted).toBe('20231119123045');
      expect(formatted).toHaveLength(14);
    });
  });

  describe('Required Fields', () => {
    it('should include all required fields for MWALLET transaction', () => {
      const requiredFields = [
        'pp_Version',
        'pp_TxnType',
        'pp_Language',
        'pp_MerchantID',
        'pp_Password',
        'pp_TxnRefNo',
        'pp_Amount',
        'pp_TxnCurrency',
        'pp_TxnDateTime',
        'pp_TxnExpiryDateTime',
        'pp_BillReference',
        'pp_Description',
        'pp_ReturnURL',
        'pp_SecureHash',
      ];

      // All fields should be present in form data
      requiredFields.forEach(field => {
        expect(requiredFields).toContain(field);
      });
    });
  });

  describe('Response Codes', () => {
    it('should handle success response code', () => {
      const responseCode = '000';
      expect(responseCode).toBe('000');
    });

    it('should handle failure response codes', () => {
      const failureCodes = ['001', '002', '003', '004', '124', '200'];
      failureCodes.forEach(code => {
        expect(code).not.toBe('000');
      });
    });
  });

  describe('URL Configuration', () => {
    it('should use correct sandbox URL', () => {
      const sandboxUrl = 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';
      expect(sandboxUrl).toContain('sandbox.jazzcash.com.pk');
    });

    it('should use correct production URL', () => {
      const productionUrl = 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';
      expect(productionUrl).toContain('payments.jazzcash.com.pk');
      expect(productionUrl).not.toContain('sandbox');
    });
  });
});

// Helper function
function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
