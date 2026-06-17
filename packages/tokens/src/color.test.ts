import { describe, expect, it } from "vitest"
import { colors } from "./color"

describe("colors", () => {
  it("exposes brand tokens", () => {
    expect(colors.brand.primary).toBe("#cd2a05")
    expect(colors.brand.secondary).toBe("#e7d808")
  })

  it("uses valid 6-digit hex values", () => {
    for (const value of Object.values(colors.brand)) {
      expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})
