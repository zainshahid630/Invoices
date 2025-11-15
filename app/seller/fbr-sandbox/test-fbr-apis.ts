// Utility to test FBR Reference APIs and find correct configurations

const FBR_BASE_URL = 'https://gw.fbr.gov.pk';
const TOKEN = 'ed1898fa-4168-3c84-9072-383aa7c4c3ba'; // Your sandbox token

interface TransactionType {
  transactioN_TYPE_ID: number;
  transactioN_DESC: string;
}

interface RateInfo {
  ratE_ID: number;
  ratE_DESC: string;
  ratE_VALUE: number;
}

interface HSCodeInfo {
  hS_CODE: string;
  description: string;
}

// Get all transaction types
export async function getTransactionTypes(): Promise<TransactionType[]> {
  const response = await fetch(`${FBR_BASE_URL}/pdi/v1/transtypecode`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction types: ${response.statusText}`);
  }
  
  return response.json();
}

// Get rates for a specific transaction type
export async function getRatesForTransactionType(
  transTypeId: number,
  date: string = '2025-05-26',
  provinceId: number = 8 // Sindh
): Promise<RateInfo[]> {
  const response = await fetch(
    `${FBR_BASE_URL}/pdi/v2/SaleTypeToRate?date=${date}&transTypeId=${transTypeId}&originationSupplier=${provinceId}`,
    {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.statusText}`);
  }
  
  return response.json();
}

// Get all HS codes
export async function getHSCodes(): Promise<HSCodeInfo[]> {
  const response = await fetch(`${FBR_BASE_URL}/pdi/v1/itemdesccode`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch HS codes: ${response.statusText}`);
  }
  
  return response.json();
}

// Search for ship breaking related transaction types
export async function findShipBreakingConfig() {
  console.log('🔍 Searching for Ship Breaking configuration...\n');
  
  try {
    // Get all transaction types
    const transTypes = await getTransactionTypes();
    console.log(`📋 Found ${transTypes.length} transaction types\n`);
    
    // Search for ship breaking or steel related types
    const shipBreakingTypes = transTypes.filter(t => 
      t.transactioN_DESC.toLowerCase().includes('ship') ||
      t.transactioN_DESC.toLowerCase().includes('break') ||
      t.transactioN_DESC.toLowerCase().includes('steel') ||
      t.transactioN_DESC.toLowerCase().includes('scrap')
    );
    
    console.log('🚢 Ship Breaking / Steel related transaction types:');
    shipBreakingTypes.forEach(t => {
      console.log(`  - ID: ${t.transactioN_TYPE_ID}, Desc: ${t.transactioN_DESC}`);
    });
    
    // Get rates for each ship breaking type
    console.log('\n💰 Checking rates for each type...\n');
    for (const type of shipBreakingTypes) {
      try {
        const rates = await getRatesForTransactionType(type.transactioN_TYPE_ID);
        console.log(`Transaction Type: ${type.transactioN_DESC} (ID: ${type.transactioN_TYPE_ID})`);
        console.log(`Available Rates:`);
        rates.forEach(r => {
          console.log(`  - ${r.ratE_DESC} (${r.ratE_VALUE}%)`);
        });
        console.log('');
      } catch (error) {
        console.log(`  ⚠️  No rates available for ${type.transactioN_DESC}`);
      }
    }
    
    // Search for HS code 7204.1010
    console.log('\n🔢 Searching for HS Code 7204.1010...\n');
    const hsCodes = await getHSCodes();
    const targetHS = hsCodes.find(hs => hs.hS_CODE === '7204.1010');
    if (targetHS) {
      console.log(`✅ Found: ${targetHS.hS_CODE} - ${targetHS.description}`);
    } else {
      console.log('❌ HS Code 7204.1010 not found');
      
      // Search for similar codes
      const similar = hsCodes.filter(hs => hs.hS_CODE.startsWith('7204'));
      console.log('\n📦 Similar HS Codes (72xx series):');
      similar.slice(0, 10).forEach(hs => {
        console.log(`  - ${hs.hS_CODE}: ${hs.description.substring(0, 80)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test function to call from browser console
if (typeof window !== 'undefined') {
  (window as any).testFBRAPIs = findShipBreakingConfig;
}
