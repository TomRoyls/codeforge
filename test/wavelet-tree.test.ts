import { describe, expect, it } from "vitest"

import { WaveletTree } from "../src/utils/wavelet-tree.js"

// ─── Constructor ───

describe("WaveletTree constructor", () => {
  it("builds from a string", () => {
    const wt = new WaveletTree("banana")
    expect(wt.length).toBe(6)
  })

  it("builds from empty string", () => {
    const wt = new WaveletTree("")
    expect(wt.length).toBe(0)
  })
})

// ─── Access ───

describe("WaveletTree access", () => {
  it("returns character at each position", () => {
    const wt = new WaveletTree("banana")
    expect(wt.access(0)).toBe("b")
    expect(wt.access(1)).toBe("a")
    expect(wt.access(2)).toBe("n")
    expect(wt.access(3)).toBe("a")
    expect(wt.access(4)).toBe("n")
    expect(wt.access(5)).toBe("a")
  })

  it("throws RangeError for out-of-bounds index", () => {
    const wt = new WaveletTree("abc")
    expect(() => wt.access(-1)).toThrow(RangeError)
    expect(() => wt.access(3)).toThrow(RangeError)
  })
})

// ─── Rank ───

describe("WaveletTree rank", () => {
  it("returns correct count of character up to position", () => {
    const wt = new WaveletTree("banana")
    expect(wt.rank("a", 1)).toBe(0)
    expect(wt.rank("a", 2)).toBe(1)
    expect(wt.rank("a", 4)).toBe(2)
    expect(wt.rank("a", 6)).toBe(3)
    expect(wt.rank("b", 6)).toBe(1)
    expect(wt.rank("n", 5)).toBe(2)
  })

  it("returns 0 for character not in text", () => {
    const wt = new WaveletTree("banana")
    expect(wt.rank("z", 6)).toBe(0)
  })
})

// ─── Select ───

describe("WaveletTree select", () => {
  it("returns position of nth occurrence (1-indexed)", () => {
    const wt = new WaveletTree("banana")
    expect(wt.select("a", 1)).toBe(1)
    expect(wt.select("a", 2)).toBe(3)
    expect(wt.select("a", 3)).toBe(5)
    expect(wt.select("b", 1)).toBe(0)
    expect(wt.select("n", 1)).toBe(2)
    expect(wt.select("n", 2)).toBe(4)
  })

  it("returns -1 for occurrence beyond count", () => {
    const wt = new WaveletTree("banana")
    expect(wt.select("b", 2)).toBe(-1)
    expect(wt.select("a", 4)).toBe(-1)
    expect(wt.select("z", 1)).toBe(-1)
  })
})

// ─── Text Getter ───

describe("WaveletTree text getter", () => {
  it("returns original text", () => {
    const wt = new WaveletTree("hello world")
    expect(wt.text).toBe("hello world")
  })
})

// ─── Length ───

describe("WaveletTree length", () => {
  it("returns text length", () => {
    const wt = new WaveletTree("abc")
    expect(wt.length).toBe(3)
  })
})

// ─── Consistency ───

describe("WaveletTree rank/select consistency", () => {
  it("rank and select are inverse operations", () => {
    const text = "abracadabra"
    const wt = new WaveletTree(text)
    const chars = [...new Set(text)]
    for (const char of chars) {
      const total = wt.rank(char, text.length)
      for (let i = 1; i <= total; i++) {
        const pos = wt.select(char, i)
        expect(pos).toBeGreaterThanOrEqual(0)
        expect(wt.rank(char, pos + 1)).toBe(i)
        expect(wt.access(pos)).toBe(char)
      }
    }
  })
})

// ─── Edge Case: Single Character ───

describe("WaveletTree single character", () => {
  it("works correctly with single character string", () => {
    const wt = new WaveletTree("x")
    expect(wt.access(0)).toBe("x")
    expect(wt.rank("x", 1)).toBe(1)
    expect(wt.select("x", 1)).toBe(0)
    expect(wt.length).toBe(1)
  })
})

// ─── Edge Case: All Same Character ───

describe("WaveletTree all same character", () => {
  it("works correctly with all same character string", () => {
    const wt = new WaveletTree("aaaaaa")
    for (let i = 0; i < 6; i++) {
      expect(wt.access(i)).toBe("a")
      expect(wt.rank("a", i + 1)).toBe(i + 1)
      expect(wt.select("a", i + 1)).toBe(i)
    }
    expect(wt.select("a", 7)).toBe(-1)
  })
})
