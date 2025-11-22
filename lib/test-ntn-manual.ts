/**
 * Manual test script for NTN normalization
 * Run with: npx ts-node lib/test-ntn-manual.ts
 */

import { normalizeNTN } from './ntn-utils';

console.log('='.repeat(80));
console.log('NTN NORMALIZATION TEST RESULTS');
console.log('='.repeat(80));
console.log();

const testCases = [
  // Valid cases - 6+1 format
  { input: '066744-0', expected: '0667440', description: '6+1 digit format (NEW)' },
  { input: '123456-7', expected: '1234567', description: '6+1 digit format' },
  
  // Valid cases - 7+1 format
  { input: '1234567-8', expected: '1234567', description: '7+1 digit format (ignore check digit)' },
  { input: '9876543-2', expected: '9876543', description: '7+1 digit format' },
  
  // Valid cases - 7 digits only
  { input: '1234567', expected: '1234567', description: '7 digits without hyphen' },
  { input: '0667440', expected: '0667440', description: '7 digits with leading zero' },
  
  // Valid cases - 8 digits
  { input: '12345678', expected: '12345678', description: '8 digits without hyphen' },
  
  // Valid cases - Alphanumeric
  { input: 'G980921-2', expected: 'G980921', description: 'Alphanumeric with check digit' },
  { input: 'G980921', expected: 'G980921', description: 'Alphanumeric without hyphen' },
  { input: 'ABC12345', expected: 'ABC12345', description: 'Alphanumeric 8 chars' },
  { input: 'abc1234', expected: 'ABC1234', description: 'Lowercase alphanumeric (auto uppercase)' },
  
  // Valid cases - With spaces
  { input: '066 744-0', expected: '0667440', description: 'With spaces (auto cleaned)' },
  { input: '  1234567  ', expected: '1234567', description: 'With leading/trailing spaces' },
  
  // Invalid cases
  { input: '123456', expected: 'ERROR', description: 'Only 6 digits (too short)' },
  { input: '12345-6', expected: 'ERROR', description: '5+1 format (invalid)' },
  { input: '123456789', expected: 'ERROR', description: '9 digits (too long)' },
  { input: '123-456-7', expected: 'ERROR', description: 'Multiple hyphens' },
  { input: '', expected: 'ERROR', description: 'Empty string' },
  { input: '---', expected: 'ERROR', description: 'Only special characters' },
];

console.log('VALID NTN FORMATS:');
console.log('-'.repeat(80));

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  const result = normalizeNTN(testCase.input);
  const isExpectedError = testCase.expected === 'ERROR';
  const passed = isExpectedError 
    ? !result.isValid 
    : result.isValid && result.normalized === testCase.expected;
  
  if (passed) passCount++;
  else failCount++;
  
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const icon = result.isValid ? '✓' : '✗';
  
  console.log();
  console.log(`Test ${index + 1}: ${status}`);
  console.log(`  Description: ${testCase.description}`);
  console.log(`  Input:       "${testCase.input}"`);
  console.log(`  Expected:    ${testCase.expected}`);
  console.log(`  Result:      ${icon} ${result.isValid ? `"${result.normalized}"` : `ERROR: ${result.error}`}`);
  
  if (!passed) {
    console.log(`  ⚠️  MISMATCH!`);
  }
});

console.log();
console.log('='.repeat(80));
console.log(`SUMMARY: ${passCount} passed, ${failCount} failed out of ${testCases.length} tests`);
console.log('='.repeat(80));
console.log();

// Detailed validation logic explanation
console.log('VALIDATION LOGIC:');
console.log('-'.repeat(80));
console.log('1. Empty check: NTN must not be empty');
console.log('2. Cleaning: Remove non-alphanumeric except hyphen, convert to uppercase');
console.log('3. Hyphen handling:');
console.log('   a. 6+1 format: "066744-0" → combine to "0667440" (7 digits)');
console.log('   b. 7-8+1 format: "1234567-8" → take before hyphen "1234567"');
console.log('   c. Multiple hyphens: INVALID');
console.log('4. No hyphen: Must be 7-8 characters');
console.log('5. Supports: Numeric (0-9) and Alphanumeric (A-Z, 0-9)');
console.log('='.repeat(80));
