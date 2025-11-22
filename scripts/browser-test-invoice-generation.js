/**
 * Browser Console Test for Invoice Number Generation
 * 
 * Copy and paste this entire script into your browser console
 * while on the invoice creation page to test performance.
 * 
 * Usage:
 *   1. Navigate to /seller/invoices/new
 *   2. Open browser DevTools (F12)
 *   3. Go to Console tab
 *   4. Paste this entire script
 *   5. Press Enter
 */

(async function testInvoiceNumberGeneration() {
  console.log('%c═══════════════════════════════════════════════════', 'color: cyan; font-weight: bold');
  console.log('%c  Invoice Number Generation - Browser Test', 'color: cyan; font-weight: bold');
  console.log('%c═══════════════════════════════════════════════════', 'color: cyan; font-weight: bold');
  
  // Get company ID from localStorage
  const session = localStorage.getItem('seller_session');
  if (!session) {
    console.error('❌ No seller session found. Please login first.');
    return;
  }
  
  const userData = JSON.parse(session);
  const companyId = userData.company_id;
  
  console.log('%cℹ️  Company ID:', 'color: cyan', companyId);
  console.log('');
  
  // Test 1: Single Request Performance
  console.log('%c📊 Test 1: Single Request Performance', 'color: blue; font-weight: bold');
  console.time('⏱️  Init-data request');
  
  try {
    const response = await fetch(`/api/seller/invoices/init-data?company_id=${companyId}`);
    console.timeEnd('⏱️  Init-data request');
    
    if (!response.ok) {
      console.error('❌ Request failed:', response.status);
      return;
    }
    
    const data = await response.json();
    
    console.log('%c✅ Response received successfully', 'color: green');
    console.log('   Customers:', data.customers?.length || 0);
    console.log('   Products:', data.products?.length || 0);
    console.log('   Next Invoice #:', data.nextInvoiceNumber);
    console.log('   Default Tax Rate:', data.defaultSalesTaxRate + '%');
    console.log('');
    
    // Test 2: Multiple Requests (Consistency Check)
    console.log('%c🔢 Test 2: Consistency Check (3 requests)', 'color: blue; font-weight: bold');
    
    const results = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      const res = await fetch(`/api/seller/invoices/init-data?company_id=${companyId}`);
      const end = performance.now();
      const json = await res.json();
      
      results.push({
        number: json.nextInvoiceNumber,
        time: Math.round(end - start),
      });
      
      console.log(`   Request ${i + 1}: ${json.nextInvoiceNumber} (${Math.round(end - start)}ms)`);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const allSame = results.every(r => r.number === results[0].number);
    if (allSame) {
      console.log('%c✅ All requests returned same number (consistent)', 'color: green');
    } else {
      console.log('%c⚠️  Different numbers returned (may indicate race condition)', 'color: orange');
    }
    
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    console.log(`   Average time: ${Math.round(avgTime)}ms`);
    console.log('');
    
    // Test 3: Concurrent Requests
    console.log('%c⚡ Test 3: Concurrent Requests (5 parallel)', 'color: blue; font-weight: bold');
    
    const concurrentStart = performance.now();
    const promises = Array(5).fill(null).map(() => 
      fetch(`/api/seller/invoices/init-data?company_id=${companyId}`)
        .then(r => r.json())
    );
    
    const concurrentResults = await Promise.all(promises);
    const concurrentEnd = performance.now();
    
    const numbers = concurrentResults.map(r => r.nextInvoiceNumber);
    const uniqueNumbers = new Set(numbers);
    
    console.log(`   Total time: ${Math.round(concurrentEnd - concurrentStart)}ms`);
    console.log(`   Numbers: ${numbers.join(', ')}`);
    console.log(`   Unique numbers: ${uniqueNumbers.size}`);
    
    if (uniqueNumbers.size === 1) {
      console.log('%c✅ All concurrent requests returned same number', 'color: green');
    } else {
      console.log('%c⚠️  Got different numbers in concurrent requests', 'color: orange');
    }
    console.log('');
    
    // Performance Summary
    console.log('%c═══════════════════════════════════════════════════', 'color: cyan; font-weight: bold');
    console.log('%c  Performance Summary', 'color: cyan; font-weight: bold');
    console.log('%c═══════════════════════════════════════════════════', 'color: cyan; font-weight: bold');
    
    if (avgTime < 500) {
      console.log('%c✅ EXCELLENT: Average response time < 500ms', 'color: green; font-weight: bold');
    } else if (avgTime < 1000) {
      console.log('%c⚠️  GOOD: Average response time < 1s (consider adding indexes)', 'color: orange; font-weight: bold');
    } else {
      console.log('%c❌ SLOW: Average response time > 1s (optimization needed!)', 'color: red; font-weight: bold');
    }
    
    console.log('');
    console.log('%c📚 For detailed testing guide, see: TEST_INVOICE_NUMBER_GENERATION.md', 'color: cyan');
    console.log('');
    
    // Return results for further inspection
    return {
      companyId,
      nextInvoiceNumber: data.nextInvoiceNumber,
      averageTime: Math.round(avgTime),
      customersCount: data.customers?.length || 0,
      productsCount: data.products?.length || 0,
      consistencyCheck: allSame ? 'PASS' : 'FAIL',
      concurrentCheck: uniqueNumbers.size === 1 ? 'PASS' : 'WARN',
    };
    
  } catch (error) {
    console.error('%c❌ Test failed:', 'color: red; font-weight: bold', error);
    console.error(error);
  }
})();
