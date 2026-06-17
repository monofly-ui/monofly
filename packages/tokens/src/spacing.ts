// packages/tokens/src/spacing.ts
// Derived from the Figma "Space" variable collection. Values are pixels.

export const spacing = {
  "0": 0,
  "050": 2,
  "100": 4,
  "150": 6,
  "200": 8,
  "300": 12,
  "400": 16,
  "600": 24,
  "800": 32,
  "1200": 48,
  "1600": 64,
  "2400": 96,
  "4000": 160,
  "-100": -4,
  "-200": -8,
  "-300": -12,
  "-400": -16,
  "-600": -24
} as const

export type SpacingToken = keyof typeof spacing
export type SpacingValue = (typeof spacing)[SpacingToken]
