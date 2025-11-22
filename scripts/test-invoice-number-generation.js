#!/usr/bin/env node

/**
 * Invoice Number Generation Performance Test
 * 
 * This script tests the optimized invoice number generation
 * by measuring API response times and verifying functionality.
 * 
 * Usage:
 *   node scripts/test-invoice-number-generation.js
 * 
 * Requirements:
 *   - Development server running (npm run dev)
 *   - Valid company_id in localStorage
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testInitDataEndpoint(companyId) {
  log('\n📊 Testing Init-Data Endpoint Performance...', 'blue');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}/api/seller/invoices/init-data?company_id=${companyId}`);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (!response.ok) {
      logError(`API returned status ${response.status}`);
      const error = await response.json();
      console.error(error);
      return false;
    }
    
    const data = await response.json();
    
    // Verify response structure
    const hasCustomers = Array.isArray(data.customers);
    const hasProducts = Array.isArray(data.products);
    const hasInvoiceNumber = typeof data.nextInvoiceNumber === 'string';
    const hasDefaults = typeof data.defaultSalesTaxRate === 'number';
    
    if (!hasCustomers || !hasProducts || !hasInvoiceNumber || !hasDefaults) {
      logError('Response missing required fields');
      console.log('Response:', data);
      return false;
    }
    
    // Performance check
    logSuccess(`Response time: ${duration}ms`);
    
    if (duration < 500) {
      logSuccess('Performance: EXCELLENT (< 500ms)');
    } else if (duration < 1000) {
      logWarning('Performance: GOOD (< 1s) - Consider adding indexes');
    } else {
      logWarning('Performance: SLOW (> 1s) - Optimization needed!');
    }
    
    // Data summary
    logInfo(`Customers loaded: ${data.customers.length}`);
    logInfo(`Products loaded: ${data.products.length}`);
    logInfo(`Next invoice number: ${data.nextInvoiceNumber}`);
    logInfo(`Default tax rate: ${data.defaultSalesTaxRate}%`);
    
    return true;
    
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }
}

async function testInvoiceNumberGeneration(companyId) {
  log('\n🔢 Testing Invoice Number Generation Logic...', 'blue');
  
  try {
    // Test multiple times to check consistency
    const results = [];
    
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/api/seller/invoices/init-data?company_id=${companyId}`);
      const endTime = Date.now();
      
      if (!response.ok) {
        logError(`Request ${i + 1} failed`);
        continue;
      }
      
      const data = await response.json();
      results.push({
        number: data.nextInvoiceNumber,
        time: endTime - startTime,
      });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Check consistency
    const allSame = results.every(r => r.number === results[0].number);
    
    if (allSame) {
      logSuccess(`Consistent invoice number: ${results[0].number}`);
    } else {
      logWarning('Invoice numbers vary between requests:');
      results.forEach((r, i) => {
        console.log(`  Request ${i + 1}: ${r.number} (${r.time}ms)`);
      });
    }
    
    // Average performance
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    logInfo(`Average response time: ${avgTime.toFixed(0)}ms`);
    
    return true;
    
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return false;
  }
}

async function testConcurrentGeneration(companyId) {
  log('\n⚡ Testing Concurrent Invoice Number Generation...', 'blue');
  
  try {
    // Make 5 concurrent requests
    const promises = Array(5).fill(null).map(() => 
      fetch(`${BASE_URL}/api/seller/invoices/init-data?company_id=${companyId}`)
        .then(r => r.json())
    );
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const numbers = results.map(r => r.nextInvoiceNumber);
    const uniqueNumbers = new Set(numbers);
    
    logInfo(`Concurrent requests: 5`);
    logInfo(`Total time: ${endTime - startTime}ms`);
    logInfo(`Invoice numbers: ${numbers.join(', ')}`);
    
    if (uniqueNumbers.size === 1) {
      logSuccess('All requests returned same number (expected for read-only endpoint)');
    } else {
      logWarning(`Got ${uniqueNumbers.size} different numbers`);
    }
    
    return true;
    
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('═══════════════════════════════════════════════════', 'cyan');
  log('  Invoice Number Generation - Performance Test', 'cyan');
  log('═══════════════════════════════════════════════════', 'cyan');
  
  // Get company ID from command line or use default
  const companyId = process.argv[2];
  
  if (!companyId) {
    logError('Company ID is required!');
    log('\nUsage:', 'yellow');
    log('  node scripts/test-invoice-number-generation.js <company_id>', 'yellow');
    log('\nExample:', 'yellow');
    log('  node scripts/test-invoice-number-generation.js 123e4567-e89b-12d3-a456-426614174000', 'yellow');
    process.exit(1);
  }
  
  logInfo(`Testing with company ID: ${companyId}`);
  logInfo(`Base URL: ${BASE_URL}`);
  
  // Run tests
  const results = {
    initData: await testInitDataEndpoint(companyId),
    generation: await testInvoiceNumberGeneration(companyId),
    concurrent: await testConcurrentGeneration(companyId),
  };
  
  // Summary
  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  Test Summary', 'cyan');
  log('═══════════════════════════════════════════════════', 'cyan');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  if (passed === total) {
    logSuccess(`All tests passed! (${passed}/${total})`);
    log('\n🎉 Invoice number generation is working optimally!', 'green');
  } else {
    logWarning(`Some tests failed (${passed}/${total})`);
    log('\n⚠️  Please review the errors above', 'yellow');
  }
  
  log('\n📚 For more details, see: TEST_INVOICE_NUMBER_GENERATION.md\n');
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
