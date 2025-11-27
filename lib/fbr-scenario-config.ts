// FBR Scenario Configuration
// Defines which fields are required/optional for each scenario

export interface ScenarioFieldConfig {
  // Invoice level fields
  buyerRegistrationType?: 'required' | 'optional' | 'hidden';
  poNumber?: 'required' | 'optional' | 'hidden';
  dcCode?: 'required' | 'optional' | 'hidden';
  
  // Item level fields
  hsCode?: 'required' | 'optional' | 'hidden';
  sroScheduleNo?: 'required' | 'optional' | 'hidden';
  sroItemSerialNo?: 'required' | 'optional' | 'hidden';
  fixedNotifiedValueOrRetailPrice?: 'required' | 'optional' | 'hidden';
  salesTaxWithheldAtSource?: 'required' | 'optional' | 'hidden';
  fedPayable?: 'required' | 'optional' | 'hidden';
  discount?: 'required' | 'optional' | 'hidden';
  extraTax?: 'required' | 'optional' | 'hidden';
  furtherTax?: 'required' | 'optional' | 'hidden';
  
  // Validation rules
  allowedSaleTypes?: string[];
  defaultSaleType?: string;
  description?: string;
}

export const FBR_SCENARIO_CONFIGS: Record<string, ScenarioFieldConfig> = {
  'SN001': {
    description: 'Goods at Standard Rate to Registered Buyers',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'hidden',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Goods at standard rate (default)'],
    defaultSaleType: 'Goods at standard rate (default)'
  },
  'SN002': {
    description: 'Goods at Standard Rate to Unregistered Buyers',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'hidden',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Goods at standard rate (default)'],
    defaultSaleType: 'Goods at standard rate (default)'
  },
  'SN003': {
    description: 'Steel Melting and Re-rolling',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'hidden',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Steel melting and re-rolling'],
    defaultSaleType: 'Steel melting and re-rolling'
  },
  'SN004': {
    description: 'Ship Breaking',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'hidden',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Ship breaking'],
    defaultSaleType: 'Ship breaking'
  },
  'SN005': {
    description: 'Reduced Rate Sale',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'optional',
    fedPayable: 'optional',
    discount: 'optional',
    extraTax: 'optional',
    furtherTax: 'optional',
    allowedSaleTypes: ['Goods at Reduced Rate'],
    defaultSaleType: 'Goods at Reduced Rate'
  },
  'SN006': {
    description: 'Exempt Goods Sale',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'optional',
    fedPayable: 'optional',
    discount: 'optional',
    extraTax: 'optional',
    furtherTax: 'optional',
    allowedSaleTypes: ['Exempt goods'],
    defaultSaleType: 'Exempt goods'
  },
  'SN007': {
    description: 'Zero Rated Sale',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'hidden',
    allowedSaleTypes: ['Goods at zero-rate'],
    defaultSaleType: 'Goods at zero-rate'
  },
  'SN008': {
    description: '3rd Schedule Goods',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'required',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['3rd Schedule Goods'],
    defaultSaleType: '3rd Schedule Goods'
  },
  'SN009': {
    description: 'Cotton Ginners',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'hidden',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Cotton ginners'],
    defaultSaleType: 'Cotton ginners'
  },
  'SN010': {
    description: 'Telecommunication Services',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'hidden',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Telecommunication services'],
    defaultSaleType: 'Telecommunication services'
  },
  'SN011': {
    description: 'Toll Manufacturing',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'hidden',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Toll Manufacturing'],
    defaultSaleType: 'Toll Manufacturing'
  },
  'SN012': {
    description: 'Petroleum Products',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'optional',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Petroleum Products'],
    defaultSaleType: 'Petroleum Products'
  },
  'SN013': {
    description: 'Electricity Supply to Retailers',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'optional',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Electricity Supply to Retailers'],
    defaultSaleType: 'Electricity Supply to Retailers'
  },
  'SN014': {
    description: 'Gas to CNG Stations',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Gas to CNG stations'],
    defaultSaleType: 'Gas to CNG stations'
  },
  'SN015': {
    description: 'Mobile Phones (Ninth Schedule)',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Mobile Phones'],
    defaultSaleType: 'Mobile Phones'
  },
  'SN016': {
    description: 'Processing / Conversion of Goods',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'hidden',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Processing/Conversion of Goods'],
    defaultSaleType: 'Processing/Conversion of Goods'
  },
  'SN017': {
    description: 'Sale of Goods where FED is Charged in ST Mode',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Goods (FED in ST Mode)'],
    defaultSaleType: 'Goods (FED in ST Mode)'
  },
  'SN018': {
    description: 'Sale of Services where FED is Charged in ST Mode',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Services (FED in ST Mode)'],
    defaultSaleType: 'Services (FED in ST Mode)'
  },
  'SN019': {
    description: 'Sale of Services',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Services'],
    defaultSaleType: 'Services'
  },
  'SN020': {
    description: 'Electric Vehicle (1%)',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Electric Vehicle'],
    defaultSaleType: 'Electric Vehicle'
  },
  'SN021': {
    description: 'Cement /Concrete Block',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Cement /Concrete Block'],
    defaultSaleType: 'Cement /Concrete Block'
  },
  'SN022': {
    description: 'Potassium Chlorate',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Potassium Chlorate'],
    defaultSaleType: 'Potassium Chlorate'
  },
  'SN023': {
    description: 'CNG Sales',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['CNG Sales'],
    defaultSaleType: 'CNG Sales'
  },
  'SN024': {
    description: 'Goods Sold that are Listed in SRO 297(1)/2023',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Goods as per SRO.297(|)/2023'],
    defaultSaleType: 'Goods as per SRO.297(|)/2023'
  },
  'SN025': {
    description: 'Non-Adjustable Supplies',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'optional',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Non-Adjustable Supplies'],
    defaultSaleType: 'Non-Adjustable Supplies'
  },
  'SN026': {
    description: 'Goods at Standard Rate to Registered Buyers',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'hidden',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['Goods at standard rate (default)'],
    defaultSaleType: 'Goods at standard rate (default)'
  },
  'SN027': {
    description: '3rd Schedule Goods to Registered Buyers',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'optional',
    sroItemSerialNo: 'optional',
    fixedNotifiedValueOrRetailPrice: 'required',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'hidden',
    furtherTax: 'optional',
    allowedSaleTypes: ['3rd Schedule Goods'],
    defaultSaleType: '3rd Schedule Goods'
  },
  'SN028': {
    description: 'Goods at Reduced Rate',
    buyerRegistrationType: 'required',
    hsCode: 'required',
    sroScheduleNo: 'required',
    sroItemSerialNo: 'required',
    fixedNotifiedValueOrRetailPrice: 'required',
    salesTaxWithheldAtSource: 'hidden',
    fedPayable: 'hidden',
    discount: 'optional',
    extraTax: 'optional',
    furtherTax: 'optional',
    allowedSaleTypes: ['Goods at Reduced Rate'],
    defaultSaleType: 'Goods at Reduced Rate'
  }
};

// Helper function to get field visibility
export function getFieldVisibility(scenario: string, fieldName: keyof ScenarioFieldConfig): 'required' | 'optional' | 'hidden' {
  const config = FBR_SCENARIO_CONFIGS[scenario];
  if (!config) return 'optional'; // Default for unknown scenarios
  
  const visibility = config[fieldName];
  if (visibility === 'required' || visibility === 'optional' || visibility === 'hidden') {
    return visibility;
  }
  
  return 'optional'; // Default
}

// Helper function to check if field should be shown
export function shouldShowField(scenario: string, fieldName: keyof ScenarioFieldConfig): boolean {
  return getFieldVisibility(scenario, fieldName) !== 'hidden';
}

// Helper function to check if field is required
export function isFieldRequired(scenario: string, fieldName: keyof ScenarioFieldConfig): boolean {
  return getFieldVisibility(scenario, fieldName) === 'required';
}

// Get scenario description
export function getScenarioDescription(scenario: string): string {
  return FBR_SCENARIO_CONFIGS[scenario]?.description || scenario;
}

// Get allowed sale types for scenario
export function getAllowedSaleTypes(scenario: string): string[] | undefined {
  return FBR_SCENARIO_CONFIGS[scenario]?.allowedSaleTypes;
}

// Get default sale type for scenario
export function getDefaultSaleType(scenario: string): string {
  return FBR_SCENARIO_CONFIGS[scenario]?.defaultSaleType || 'Goods at standard rate (default)';
}
