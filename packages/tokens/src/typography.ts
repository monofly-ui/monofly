// packages/tokens/src/typography.ts
// Derived from the Figma "Typography Primitives" variable collection.

export const fontFamily = {
  sans: "Inter",
  serif: "Noto Serif",
  mono: "Roboto Mono"
} as const

// Type scale steps. Values are pixels.
export const fontSize = {
  "01": 12,
  "02": 14,
  "03": 16,
  "04": 20,
  "05": 24,
  "06": 32,
  "07": 40,
  "08": 48,
  "09": 64,
  "10": 72
} as const

export const fontWeight = {
  thin: 100,
  extraLight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extraBold: 800,
  black: 900
} as const

export type FontFamilyToken = keyof typeof fontFamily
export type FontSizeToken = keyof typeof fontSize
export type FontWeightToken = keyof typeof fontWeight
