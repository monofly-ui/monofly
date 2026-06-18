import { describe, expect, it } from "vitest"
import { colors } from "./color"

describe("colors", () => {
  it("exposes brand tokens", () => {
    expect(colors.brand.primary).toBe("#3178d4")
    expect(colors.brand.secondary).toBe("#48c7e6")
  })

  it("uses valid 6-digit hex values", () => {
    for (const value of Object.values(colors.brand)) {
      expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})
