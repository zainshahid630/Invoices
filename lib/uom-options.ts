/**
 * Standard Unit of Measurement (UOM) options
 * Used across the application for consistency
 */

export const UOM_OPTIONS = [
  'Numbers, pieces, units',
  'Kilograms',
  'Grams',
  'Meters',
  'Centimeters',
  'Liters',
  'Milliliters',
  'Dozens',
  'Boxes',
  'Cartons',
  'Pairs',
  'Sets',
  'Square meters',
  'Cubic meters',
  'Tons',
  'Bags',
  'Bottles',
  'Cans',
  'Packets',
  'Rolls',
  'Sheets',
] as const;

export type UOM = typeof UOM_OPTIONS[number];

export const DEFAULT_UOM: UOM = 'Numbers, pieces, units';
