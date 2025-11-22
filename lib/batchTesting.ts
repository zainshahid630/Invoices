/**
 * Optimized Batch Testing Utility
 * 
 * Processes multiple test scenarios in parallel with concurrency control
 * to avoid overwhelming the server while maximizing throughput.
 */

export interface TestScenario {
  name: string;
  description: string;
  data: any;
}

export interface TestResult {
  scenario: string;
  success: boolean;
  duration: number;
  data?: any;
  error?: string;
}

interface BatchTestOptions {
  concurrency?: number; // Number of parallel requests (default: 5)
  timeout?: number; // Timeout per request in ms (default: 10000)
  onProgress?: (completed: number, total: number, result: TestResult) => void;
}

/**
 * Execute batch tests with controlled concurrency
 * 
 * @param scenarios - Array of test scenarios to execute
 * @param testFn - Function to execute for each scenario
 * @param options - Configuration options
 * @returns Array of test results
 */
export async function executeBatchTests(
  scenarios: TestScenario[],
  testFn: (scenario: TestScenario) => Promise<any>,
  options: BatchTestOptions = {}
): Promise<TestResult[]> {
  const {
    concurrency = 5,
    timeout = 10000,
    onProgress,
  } = options;

  const results: TestResult[] = [];
  let completed = 0;

  // Process scenarios in batches
  for (let i = 0; i < scenarios.length; i += concurrency) {
    const batch = scenarios.slice(i, i + concurrency);

    // Execute batch in parallel
    const batchPromises = batch.map(async (scenario) => {
      const startTime = Date.now();

      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Execute test
        const data = await testFn(scenario);

        clearTimeout(timeoutId);

        const result: TestResult = {
          scenario: scenario.name,
          success: true,
          duration: Date.now() - startTime,
          data,
        };

        return result;
      } catch (error: any) {
        const result: TestResult = {
          scenario: scenario.name,
          success: false,
          duration: Date.now() - startTime,
          error: error.message || 'Unknown error',
        };

        return result;
      }
    });

    // Wait for batch to complete
    const batchResults = await Promise.allSettled(batchPromises);

    // Process results
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
        completed++;

        // Call progress callback
        if (onProgress) {
          onProgress(completed, scenarios.length, result.value);
        }
      } else {
        // Handle rejected promise
        results.push({
          scenario: 'Unknown',
          success: false,
          duration: 0,
          error: result.reason?.message || 'Promise rejected',
        });
        completed++;
      }
    });
  }

  return results;
}

/**
 * Test a single FBR scenario
 */
export async function testFBRScenario(
  scenario: TestScenario,
  companyId: string
): Promise<any> {
  const response = await fetch('/api/seller/fbr/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_id: companyId,
      scenario: scenario.name,
      data: scenario.data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Test failed');
  }

  return response.json();
}

/**
 * Calculate batch test statistics
 */
export function calculateBatchStats(results: TestResult[]) {
  const total = results.length;
  const passed = results.filter((r) => r.success).length;
  const failed = total - passed;
  const successRate = total > 0 ? (passed / total) * 100 : 0;
  const avgDuration =
    results.reduce((sum, r) => sum + r.duration, 0) / total || 0;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  return {
    total,
    passed,
    failed,
    successRate: successRate.toFixed(1),
    avgDuration: Math.round(avgDuration),
    totalDuration: Math.round(totalDuration),
  };
}

/**
 * Format test results for display
 */
export function formatTestResults(results: TestResult[]): string {
  const stats = calculateBatchStats(results);

  let output = `\n${'='.repeat(60)}\n`;
  output += `  Batch Test Results\n`;
  output += `${'='.repeat(60)}\n\n`;
  output += `Total Tests: ${stats.total}\n`;
  output += `Passed: ${stats.passed} ✅\n`;
  output += `Failed: ${stats.failed} ❌\n`;
  output += `Success Rate: ${stats.successRate}%\n`;
  output += `Average Duration: ${stats.avgDuration}ms\n`;
  output += `Total Duration: ${stats.totalDuration}ms\n\n`;

  output += `${'='.repeat(60)}\n`;
  output += `  Individual Results\n`;
  output += `${'='.repeat(60)}\n\n`;

  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    output += `${index + 1}. ${result.scenario}\n`;
    output += `   Status: ${status}\n`;
    output += `   Duration: ${result.duration}ms\n`;
    if (result.error) {
      output += `   Error: ${result.error}\n`;
    }
    output += `\n`;
  });

  return output;
}
