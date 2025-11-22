/**
 * FBR Scenario IDs
 * Standardized across the application
 */

export const FBR_SCENARIOS = [
  { value: 'SN002', label: 'SN002 – Goods at Standard Rate to Unregistered Buyers' },
  { value: 'SN001', label: 'SN001 – Goods at Standard Rate to Registered Buyers' },
  { value: 'SN005', label: 'SN005 – Reduced Rate Sale' },
  { value: 'SN006', label: 'SN006 – Exempt Goods Sale' },
  { value: 'SN007', label: 'SN007 – Zero Rated Sale' },
  { value: 'SN016', label: 'SN016 – Processing / Conversion of Goods' },
  { value: 'SN017', label: 'SN017 – Sale of Goods where FED is Charged in ST Mode' },
  { value: 'SN018', label: 'SN018 – Sale of Services where FED is Charged in ST Mode' },
  { value: 'SN019', label: 'SN019 – Sale of Services' },
  { value: 'SN024', label: 'SN024 – Goods Sold that are Listed in SRO 297(1)/2023' },
] as const;

export const DEFAULT_SCENARIO = 'SN002';

export type ScenarioValue = typeof FBR_SCENARIOS[number]['value'];
