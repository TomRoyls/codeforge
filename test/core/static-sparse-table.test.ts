import { describe, it, expect } from "vitest"
import { StaticSparseTable } from "../../src/core/static-sparse-table/static-sparse-table.js"

function bruteMin(arr: number[], s: number, e: number): number {
  let m = arr[s]!
  for (let i = s + 1; i <= e; i++) {
    if (arr[i]! < m) m = arr[i]!
  }
  return m
}

function bruteMax(arr: number[], s: number, e: number): number {
  let m = arr[s]!
  for (let i = s + 1; i <= e; i++) {
    if (arr[i]! > m) m = arr[i]!
  }
  return m
}

function bruteGcd(arr: number[], s: number, e: number): number {
  let g = Math.abs(arr[s]!)
  for (let i = s + 1; i <= e; i++) {
    let b = Math.abs(arr[i]!)
    while (b !== 0) {
      const t = b
      b = g % b
      g = t
    }
  }
  return g
}

function bruteSum(arr: number[], s: number, e: number): number {
  let sum = 0
  for (let i = s; i <= e; i++) sum += arr[i]!
  return sum
}

describe("StaticSparseTable", () => {
  describe("construction", () => {
    it("constructs with numeric array", () => {
      const st = new StaticSparseTable({ data: [3, 1, 4, 1, 5, 9, 2, 6] })
      expect(st.size).toBe(8)
    })

    it("constructs with empty array", () => {
      const st = new StaticSparseTable<number>({ data: [] })
      expect(st.size).toBe(0)
    })

    it("constructs with single element", () => {
      const st = new StaticSparseTable({ data: [42] })
      expect(st.size).toBe(1)
    })

    it("constructs with two elements", () => {
      const st = new StaticSparseTable({ data: [5, 3] })
      expect(st.size).toBe(2)
    })

    it("constructs with string values", () => {
      const st = new StaticSparseTable({ data: ["cherry", "apple", "banana"] })
      expect(st.size).toBe(3)
    })

    it("constructs with custom comparator", () => {
      const st = new StaticSparseTable({
        data: [3, 1, 4],
        comparator: (a, b) => a - b,
      })
      expect(st.size).toBe(3)
    })

    it("does not mutate original array", () => {
      const original = [3, 1, 4]
      const copy = [...original]
      new StaticSparseTable({ data: original })
      expect(original).toEqual(copy)
    })

    it("detects numeric data for gcd/sum tables", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3] })
      expect(st.stats().queryMode).toBe("min,max,gcd,sum")
    })

    it("detects non-numeric data", () => {
      const st = new StaticSparseTable({ data: ["a", "b", "c"] })
      expect(st.stats().queryMode).toBe("min,max")
    })

    it("handles power-of-2 length arrays", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3, 4] })
      expect(st.size).toBe(4)
    })

    it("handles non-power-of-2 length arrays", () => {
      const st = new StaticSparseTable({ data: [5, 3, 8, 1, 4] })
      expect(st.size).toBe(5)
    })

    it("handles large array construction", () => {
      const data = Array.from({ length: 10000 }, (_, i) => i)
      const st = new StaticSparseTable({ data })
      expect(st.size).toBe(10000)
    })
  })

  describe("queryMin", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const st = new StaticSparseTable({ data: values })

    it("finds min of full range", () => {
      expect(st.queryMin(0, 7)).toBe(1)
    })

    it("finds min of single element", () => {
      expect(st.queryMin(0, 0)).toBe(3)
      expect(st.queryMin(3, 3)).toBe(1)
      expect(st.queryMin(7, 7)).toBe(6)
    })

    it("finds min of partial range", () => {
      expect(st.queryMin(2, 5)).toBe(1)
      expect(st.queryMin(4, 7)).toBe(2)
      expect(st.queryMin(0, 3)).toBe(1)
    })

    it("finds min of two elements", () => {
      expect(st.queryMin(0, 1)).toBe(1)
      expect(st.queryMin(4, 5)).toBe(5)
      expect(st.queryMin(6, 7)).toBe(2)
    })

    it("finds min of first half", () => {
      expect(st.queryMin(0, 3)).toBe(1)
    })

    it("finds min of second half", () => {
      expect(st.queryMin(4, 7)).toBe(2)
    })

    it("finds min of three elements", () => {
      expect(st.queryMin(0, 2)).toBe(1)
      expect(st.queryMin(5, 7)).toBe(2)
    })

    it("matches brute force for all ranges", () => {
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.queryMin(s, e)).toBe(bruteMin(values, s, e))
        }
      }
    })
  })

  describe("queryMax", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const st = new StaticSparseTable({ data: values })

    it("finds max of full range", () => {
      expect(st.queryMax(0, 7)).toBe(9)
    })

    it("finds max of single element", () => {
      expect(st.queryMax(0, 0)).toBe(3)
      expect(st.queryMax(5, 5)).toBe(9)
      expect(st.queryMax(7, 7)).toBe(6)
    })

    it("finds max of partial range", () => {
      expect(st.queryMax(0, 3)).toBe(4)
      expect(st.queryMax(2, 4)).toBe(5)
      expect(st.queryMax(5, 7)).toBe(9)
    })

    it("finds max of two elements", () => {
      expect(st.queryMax(0, 1)).toBe(3)
      expect(st.queryMax(4, 5)).toBe(9)
    })

    it("matches brute force for all ranges", () => {
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.queryMax(s, e)).toBe(bruteMax(values, s, e))
        }
      }
    })
  })

  describe("queryGcd", () => {
    const values = [12, 18, 24, 9, 15]
    const st = new StaticSparseTable({ data: values })

    it("finds gcd of full range", () => {
      expect(st.queryGcd(0, 4)).toBe(3)
    })

    it("finds gcd of partial range", () => {
      expect(st.queryGcd(0, 2)).toBe(6)
      expect(st.queryGcd(1, 3)).toBe(3)
      expect(st.queryGcd(2, 4)).toBe(3)
    })

    it("finds gcd of single element", () => {
      expect(st.queryGcd(0, 0)).toBe(12)
      expect(st.queryGcd(3, 3)).toBe(9)
    })

    it("finds gcd of two elements", () => {
      expect(st.queryGcd(0, 1)).toBe(6)
      expect(st.queryGcd(3, 4)).toBe(3)
    })

    it("matches brute force for all ranges", () => {
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.queryGcd(s, e)).toBe(bruteGcd(values, s, e))
        }
      }
    })

    it("throws TypeError for non-numeric data", () => {
      const st = new StaticSparseTable({ data: ["a", "b", "c"] })
      expect(() => st.queryGcd(0, 2)).toThrow(TypeError)
    })
  })

  describe("querySum", () => {
    const values = [1, 2, 3, 4, 5]
    const st = new StaticSparseTable({ data: values })

    it("computes sum of full range", () => {
      expect(st.querySum(0, 4)).toBe(15)
    })

    it("computes sum of single element", () => {
      expect(st.querySum(0, 0)).toBe(1)
      expect(st.querySum(2, 2)).toBe(3)
      expect(st.querySum(4, 4)).toBe(5)
    })

    it("computes sum of partial range", () => {
      expect(st.querySum(1, 3)).toBe(9)
      expect(st.querySum(0, 2)).toBe(6)
      expect(st.querySum(2, 4)).toBe(12)
    })

    it("computes sum of two elements", () => {
      expect(st.querySum(0, 1)).toBe(3)
      expect(st.querySum(3, 4)).toBe(9)
    })

    it("computes sum of first half", () => {
      expect(st.querySum(0, 2)).toBe(6)
    })

    it("computes sum of second half", () => {
      expect(st.querySum(2, 4)).toBe(12)
    })

    it("matches brute force for all ranges", () => {
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.querySum(s, e)).toBe(bruteSum(values, s, e))
        }
      }
    })

    it("throws TypeError for non-numeric data", () => {
      const st = new StaticSparseTable({ data: ["a", "b", "c"] })
      expect(() => st.querySum(0, 2)).toThrow(TypeError)
    })
  })

  describe("queryAll", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const st = new StaticSparseTable({ data: values })

    it("returns all aggregates for full range", () => {
      const result = st.queryAll(0, 7)
      expect(result.min).toBe(1)
      expect(result.max).toBe(9)
      expect(result.gcd).toBe(1)
      expect(result.sum).toBe(31)
    })

    it("returns all aggregates for partial range", () => {
      const result = st.queryAll(2, 5)
      expect(result.min).toBe(1)
      expect(result.max).toBe(9)
      expect(result.gcd).toBe(1)
      expect(result.sum).toBe(19)
    })

    it("returns all aggregates for single element", () => {
      const result = st.queryAll(3, 3)
      expect(result.min).toBe(1)
      expect(result.max).toBe(1)
      expect(result.gcd).toBe(1)
      expect(result.sum).toBe(1)
    })

    it("returns correct min and max for two elements", () => {
      const result = st.queryAll(4, 5)
      expect(result.min).toBe(5)
      expect(result.max).toBe(9)
      expect(result.sum).toBe(14)
    })
  })

  describe("query dispatch", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const st = new StaticSparseTable({ data: values })

    it("query with min mode returns same as queryMin", () => {
      expect(st.query(0, 7, "min")).toBe(st.queryMin(0, 7))
      expect(st.query(2, 5, "min")).toBe(st.queryMin(2, 5))
    })

    it("query with max mode returns same as queryMax", () => {
      expect(st.query(0, 7, "max")).toBe(st.queryMax(0, 7))
      expect(st.query(2, 5, "max")).toBe(st.queryMax(2, 5))
    })

    it("query with gcd mode returns same as queryGcd", () => {
      expect(st.query(0, 7, "gcd")).toBe(st.queryGcd(0, 7))
      expect(st.query(2, 5, "gcd")).toBe(st.queryGcd(2, 5))
    })

    it("query with sum mode returns same as querySum", () => {
      expect(st.query(0, 7, "sum")).toBe(st.querySum(0, 7))
      expect(st.query(2, 5, "sum")).toBe(st.querySum(2, 5))
    })
  })

  describe("indexOf", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const st = new StaticSparseTable({ data: values })

    it("finds first occurrence of existing value", () => {
      expect(st.indexOf(3)).toBe(0)
      expect(st.indexOf(1)).toBe(1)
      expect(st.indexOf(4)).toBe(2)
      expect(st.indexOf(9)).toBe(5)
    })

    it("returns -1 for non-existent value", () => {
      expect(st.indexOf(99)).toBe(-1)
      expect(st.indexOf(0)).toBe(-1)
    })

    it("finds value in single element array", () => {
      const st2 = new StaticSparseTable({ data: [42] })
      expect(st2.indexOf(42)).toBe(0)
      expect(st2.indexOf(1)).toBe(-1)
    })

    it("returns -1 for empty array", () => {
      const st2 = new StaticSparseTable<number>({ data: [] })
      expect(st2.indexOf(1)).toBe(-1)
    })

    it("finds first occurrence with duplicates", () => {
      expect(st.indexOf(1)).toBe(1)
    })

    it("works with string data", () => {
      const st2 = new StaticSparseTable({ data: ["cherry", "apple", "banana"] })
      expect(st2.indexOf("apple")).toBe(1)
      expect(st2.indexOf("cherry")).toBe(0)
      expect(st2.indexOf("grape")).toBe(-1)
    })
  })

  describe("lastIndexOf", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const st = new StaticSparseTable({ data: values })

    it("finds last occurrence of existing value", () => {
      expect(st.lastIndexOf(1)).toBe(3)
      expect(st.lastIndexOf(3)).toBe(0)
      expect(st.lastIndexOf(9)).toBe(5)
    })

    it("returns -1 for non-existent value", () => {
      expect(st.lastIndexOf(99)).toBe(-1)
      expect(st.lastIndexOf(0)).toBe(-1)
    })

    it("returns -1 for empty array", () => {
      const st2 = new StaticSparseTable<number>({ data: [] })
      expect(st2.lastIndexOf(1)).toBe(-1)
    })

    it("finds last occurrence in single element", () => {
      const st2 = new StaticSparseTable({ data: [42] })
      expect(st2.lastIndexOf(42)).toBe(0)
    })

    it("works with string data", () => {
      const st2 = new StaticSparseTable({ data: ["apple", "banana", "apple"] })
      expect(st2.lastIndexOf("apple")).toBe(2)
      expect(st2.lastIndexOf("banana")).toBe(1)
    })
  })

  describe("edge cases", () => {
    it("handles empty array", () => {
      const st = new StaticSparseTable<number>({ data: [] })
      expect(st.size).toBe(0)
      expect(st.toArray()).toEqual([])
    })

    it("handles single element", () => {
      const st = new StaticSparseTable({ data: [42] })
      expect(st.queryMin(0, 0)).toBe(42)
      expect(st.queryMax(0, 0)).toBe(42)
      expect(st.queryGcd(0, 0)).toBe(42)
      expect(st.querySum(0, 0)).toBe(42)
    })

    it("handles all same elements", () => {
      const st = new StaticSparseTable({ data: [7, 7, 7, 7, 7] })
      expect(st.queryMin(0, 4)).toBe(7)
      expect(st.queryMax(0, 4)).toBe(7)
      expect(st.queryGcd(0, 4)).toBe(7)
      expect(st.querySum(0, 4)).toBe(35)
    })

    it("handles sorted ascending array", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3, 4, 5] })
      expect(st.queryMin(0, 4)).toBe(1)
      expect(st.queryMax(0, 4)).toBe(5)
    })

    it("handles sorted descending array", () => {
      const st = new StaticSparseTable({ data: [5, 4, 3, 2, 1] })
      expect(st.queryMin(0, 4)).toBe(1)
      expect(st.queryMax(0, 4)).toBe(5)
    })

    it("handles negative numbers", () => {
      const st = new StaticSparseTable({ data: [-5, 3, -1, 7, -8, 2] })
      expect(st.queryMin(0, 5)).toBe(-8)
      expect(st.queryMax(0, 5)).toBe(7)
      expect(st.querySum(0, 5)).toBe(-2)
    })

    it("handles negative numbers for gcd", () => {
      const st = new StaticSparseTable({ data: [-12, 18, -24, 9] })
      expect(st.queryGcd(0, 3)).toBe(3)
      expect(st.queryGcd(0, 1)).toBe(6)
    })

    it("handles zeros in gcd", () => {
      const st = new StaticSparseTable({ data: [0, 5, 0, 10] })
      expect(st.queryGcd(0, 0)).toBe(0)
      expect(st.queryGcd(1, 1)).toBe(5)
      expect(st.queryGcd(1, 3)).toBe(5)
    })

    it("throws RangeError for start > end", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3] })
      expect(() => st.queryMin(2, 1)).toThrow(RangeError)
    })

    it("throws RangeError for negative start", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3] })
      expect(() => st.queryMin(-1, 2)).toThrow(RangeError)
    })

    it("throws RangeError for end beyond array", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3] })
      expect(() => st.queryMin(0, 3)).toThrow(RangeError)
    })

    it("throws RangeError for query on empty array", () => {
      const st = new StaticSparseTable<number>({ data: [] })
      expect(() => st.queryMin(0, 0)).toThrow(RangeError)
    })

    it("throws RangeError for queryMax on empty array", () => {
      const st = new StaticSparseTable<number>({ data: [] })
      expect(() => st.queryMax(0, 0)).toThrow(RangeError)
    })

    it("handles two elements", () => {
      const st = new StaticSparseTable({ data: [5, 3] })
      expect(st.queryMin(0, 1)).toBe(3)
      expect(st.queryMax(0, 1)).toBe(5)
      expect(st.querySum(0, 1)).toBe(8)
    })

    it("handles power of 2 length", () => {
      const values = [1, 2, 3, 4]
      const st = new StaticSparseTable({ data: values })
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.queryMin(s, e)).toBe(bruteMin(values, s, e))
          expect(st.queryMax(s, e)).toBe(bruteMax(values, s, e))
          expect(st.querySum(s, e)).toBe(bruteSum(values, s, e))
        }
      }
    })

    it("handles non-power-of-2 length", () => {
      const values = [5, 3, 8, 1, 4]
      const st = new StaticSparseTable({ data: values })
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.queryMin(s, e)).toBe(bruteMin(values, s, e))
        }
      }
    })

    it("handles all same elements with sum", () => {
      const st = new StaticSparseTable({ data: [3, 3, 3, 3] })
      expect(st.querySum(0, 3)).toBe(12)
      expect(st.querySum(1, 2)).toBe(6)
    })

    it("handles large identical values", () => {
      const st = new StaticSparseTable({ data: [100, 100, 100, 100, 100] })
      expect(st.querySum(0, 4)).toBe(500)
      expect(st.queryMin(0, 4)).toBe(100)
      expect(st.queryMax(0, 4)).toBe(100)
    })
  })

  describe("string data", () => {
    it("finds lexicographic minimum", () => {
      const st = new StaticSparseTable({ data: ["cherry", "apple", "banana", "date"] })
      expect(st.queryMin(0, 3)).toBe("apple")
      expect(st.queryMin(0, 0)).toBe("cherry")
      expect(st.queryMin(2, 3)).toBe("banana")
    })

    it("finds lexicographic maximum", () => {
      const st = new StaticSparseTable({ data: ["cherry", "apple", "banana", "date"] })
      expect(st.queryMax(0, 3)).toBe("date")
      expect(st.queryMax(0, 2)).toBe("cherry")
    })

    it("handles single string", () => {
      const st = new StaticSparseTable({ data: ["hello"] })
      expect(st.queryMin(0, 0)).toBe("hello")
      expect(st.queryMax(0, 0)).toBe("hello")
    })

    it("handles duplicate strings", () => {
      const st = new StaticSparseTable({ data: ["a", "b", "a", "c"] })
      expect(st.queryMin(0, 3)).toBe("a")
      expect(st.queryMax(0, 3)).toBe("c")
    })

    it("indexOf works with strings", () => {
      const st = new StaticSparseTable({ data: ["x", "y", "z"] })
      expect(st.indexOf("y")).toBe(1)
      expect(st.indexOf("w")).toBe(-1)
    })

    it("lastIndexOf works with strings", () => {
      const st = new StaticSparseTable({ data: ["x", "y", "x"] })
      expect(st.lastIndexOf("x")).toBe(2)
    })
  })

  describe("large arrays", () => {
    it("10000 elements with min queries", () => {
      const data = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000))
      const st = new StaticSparseTable({ data })
      for (let trial = 0; trial < 100; trial++) {
        const s = Math.floor(Math.random() * data.length)
        const e = s + Math.floor(Math.random() * (data.length - s))
        expect(st.queryMin(s, e)).toBe(bruteMin(data, s, e))
      }
    })

    it("10000 elements with max queries", () => {
      const data = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000))
      const st = new StaticSparseTable({ data })
      for (let trial = 0; trial < 100; trial++) {
        const s = Math.floor(Math.random() * data.length)
        const e = s + Math.floor(Math.random() * (data.length - s))
        expect(st.queryMax(s, e)).toBe(bruteMax(data, s, e))
      }
    })

    it("10000 elements with gcd queries", () => {
      const data = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100) + 1)
      const st = new StaticSparseTable({ data })
      for (let trial = 0; trial < 100; trial++) {
        const s = Math.floor(Math.random() * data.length)
        const e = s + Math.floor(Math.random() * (data.length - s))
        expect(st.queryGcd(s, e)).toBe(bruteGcd(data, s, e))
      }
    })

    it("10000 elements with sum queries", () => {
      const data = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100))
      const st = new StaticSparseTable({ data })
      for (let trial = 0; trial < 100; trial++) {
        const s = Math.floor(Math.random() * data.length)
        const e = s + Math.floor(Math.random() * (data.length - s))
        expect(st.querySum(s, e)).toBe(bruteSum(data, s, e))
      }
    })

    it("random lengths from 1 to 100 with min", () => {
      for (let len = 1; len <= 100; len++) {
        const data = Array.from({ length: len }, () => Math.floor(Math.random() * 100))
        const st = new StaticSparseTable({ data })
        const s = Math.floor(Math.random() * data.length)
        const e = s + Math.floor(Math.random() * (data.length - s))
        expect(st.queryMin(s, e)).toBe(bruteMin(data, s, e))
      }
    })

    it("random lengths from 1 to 50 with sum", () => {
      for (let len = 1; len <= 50; len++) {
        const data = Array.from({ length: len }, () => Math.floor(Math.random() * 10))
        const st = new StaticSparseTable({ data })
        const s = Math.floor(Math.random() * data.length)
        const e = s + Math.floor(Math.random() * (data.length - s))
        expect(st.querySum(s, e)).toBe(bruteSum(data, s, e))
      }
    })
  })

  describe("clone", () => {
    it("creates independent clone with same values", () => {
      const st = new StaticSparseTable({ data: [3, 1, 4, 1, 5] })
      const cloned = st.clone()
      expect(cloned.toArray()).toEqual(st.toArray())
      expect(cloned.size).toBe(st.size)
    })

    it("clone produces same query results", () => {
      const st = new StaticSparseTable({ data: [3, 1, 4, 1, 5] })
      const cloned = st.clone()
      expect(cloned.queryMin(0, 4)).toBe(st.queryMin(0, 4))
      expect(cloned.queryMax(0, 3)).toBe(st.queryMax(0, 3))
      expect(cloned.querySum(0, 4)).toBe(st.querySum(0, 4))
    })

    it("clone with sum produces correct results", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3, 4, 5] })
      const cloned = st.clone()
      expect(cloned.querySum(0, 4)).toBe(15)
      expect(cloned.querySum(1, 3)).toBe(9)
    })

    it("clone is independent from original", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3] })
      const cloned = st.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size).toBe(3)
    })
  })

  describe("from factory", () => {
    it("creates table from static factory", () => {
      const st = StaticSparseTable.from([3, 1, 4, 1, 5])
      expect(st.size).toBe(5)
      expect(st.queryMin(0, 4)).toBe(1)
    })

    it("creates table with options via factory", () => {
      const st = StaticSparseTable.from([3, 1, 4], {
        comparator: (a, b) => a - b,
      })
      expect(st.size).toBe(3)
      expect(st.queryMin(0, 2)).toBe(1)
    })

    it("factory creates independent instance", () => {
      const st = StaticSparseTable.from([1, 2, 3])
      const st2 = StaticSparseTable.from([1, 2, 3])
      expect(st.queryMin(0, 2)).toBe(st2.queryMin(0, 2))
    })

    it("factory with empty array", () => {
      const st = StaticSparseTable.from<number>([])
      expect(st.size).toBe(0)
    })
  })

  describe("stats", () => {
    it("returns correct stats for numeric data", () => {
      const st = new StaticSparseTable({ data: [3, 1, 4, 1, 5, 9, 2, 6] })
      const s = st.stats()
      expect(s.size).toBe(8)
      expect(s.tableLevels).toBeGreaterThan(0)
      expect(s.queryMode).toBe("min,max,gcd,sum")
      expect(s.memoryBytes).toBeGreaterThan(0)
    })

    it("returns correct stats for string data", () => {
      const st = new StaticSparseTable({ data: ["a", "b", "c"] })
      const s = st.stats()
      expect(s.size).toBe(3)
      expect(s.queryMode).toBe("min,max")
    })

    it("returns correct stats for empty data", () => {
      const st = new StaticSparseTable<number>({ data: [] })
      const s = st.stats()
      expect(s.size).toBe(0)
      expect(s.tableLevels).toBe(0)
      expect(s.memoryBytes).toBe(0)
    })

    it("returns correct stats for single element", () => {
      const st = new StaticSparseTable({ data: [42] })
      const s = st.stats()
      expect(s.size).toBe(1)
      expect(s.tableLevels).toBe(1)
    })

    it("table levels grows with log2 of size", () => {
      const st8 = new StaticSparseTable({ data: Array.from({ length: 8 }, (_, i) => i) })
      const st16 = new StaticSparseTable({ data: Array.from({ length: 16 }, (_, i) => i) })
      expect(st16.stats().tableLevels).toBeGreaterThan(st8.stats().tableLevels)
    })
  })

  describe("overlapping queries", () => {
    const values = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    const st = new StaticSparseTable({ data: values })

    it("overlapping ranges produce consistent min", () => {
      expect(st.queryMin(0, 4)).toBe(1)
      expect(st.queryMin(1, 5)).toBe(1)
      expect(st.queryMin(2, 6)).toBe(1)
      expect(st.queryMin(3, 7)).toBe(1)
    })

    it("overlapping ranges produce consistent max", () => {
      expect(st.queryMax(0, 4)).toBe(9)
      expect(st.queryMax(1, 5)).toBe(9)
      expect(st.queryMax(2, 6)).toBe(9)
      expect(st.queryMax(4, 8)).toBe(9)
    })

    it("overlapping ranges produce consistent sum", () => {
      const sum02 = st.querySum(0, 2)
      const sum13 = st.querySum(1, 3)
      const expected02 = values[0]! + values[1]! + values[2]!
      const expected13 = values[1]! + values[2]! + values[3]!
      expect(sum02).toBe(expected02)
      expect(sum13).toBe(expected13)
    })
  })

  describe("boundary queries", () => {
    const values = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    const st = new StaticSparseTable({ data: values })

    it("query at start boundary", () => {
      expect(st.queryMin(0, 0)).toBe(5)
      expect(st.queryMax(0, 0)).toBe(5)
      expect(st.querySum(0, 0)).toBe(5)
    })

    it("query at end boundary", () => {
      expect(st.queryMin(8, 8)).toBe(6)
      expect(st.queryMax(8, 8)).toBe(6)
      expect(st.querySum(8, 8)).toBe(6)
    })

    it("query spanning entire array", () => {
      expect(st.queryMin(0, 8)).toBe(1)
      expect(st.queryMax(0, 8)).toBe(9)
      expect(st.querySum(0, 8)).toBe(45)
    })

    it("query starting at each position", () => {
      for (let i = 0; i < values.length; i++) {
        expect(st.queryMin(i, i)).toBe(values[i])
        expect(st.queryMax(i, i)).toBe(values[i])
        expect(st.querySum(i, i)).toBe(values[i])
      }
    })

    it("query of length 2 at each position", () => {
      for (let i = 0; i < values.length - 1; i++) {
        expect(st.queryMin(i, i + 1)).toBe(Math.min(values[i]!, values[i + 1]!))
        expect(st.queryMax(i, i + 1)).toBe(Math.max(values[i]!, values[i + 1]!))
        expect(st.querySum(i, i + 1)).toBe(values[i]! + values[i + 1]!)
      }
    })
  })

  describe("repeated queries consistency", () => {
    it("returns same result when called multiple times", () => {
      const st = new StaticSparseTable({ data: [3, 1, 4, 1, 5, 9, 2, 6] })
      for (let i = 0; i < 10; i++) {
        expect(st.queryMin(2, 6)).toBe(1)
        expect(st.queryMax(2, 6)).toBe(9)
        expect(st.querySum(2, 6)).toBe(21)
      }
    })
  })

  describe("toArray", () => {
    it("returns copy of original data", () => {
      const data = [3, 1, 4, 1, 5]
      const st = new StaticSparseTable({ data })
      expect(st.toArray()).toEqual(data)
    })

    it("returns empty array for empty table", () => {
      const st = new StaticSparseTable<number>({ data: [] })
      expect(st.toArray()).toEqual([])
    })

    it("returns independent copy", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3] })
      const arr = st.toArray()
      arr[0] = 999
      expect(st.toArray()).toEqual([1, 2, 3])
    })
  })

  describe("size getter", () => {
    it("returns correct size", () => {
      const st = new StaticSparseTable({ data: [1, 2, 3, 4, 5] })
      expect(st.size).toBe(5)
    })

    it("returns 0 for empty", () => {
      const st = new StaticSparseTable<number>({ data: [] })
      expect(st.size).toBe(0)
    })

    it("returns 1 for single element", () => {
      const st = new StaticSparseTable({ data: [42] })
      expect(st.size).toBe(1)
    })
  })

  describe("7 elements (non-power-of-2 exhaustive)", () => {
    it("all ranges match brute force for min", () => {
      const values = [10, 3, 7, 1, 9, 4, 6]
      const st = new StaticSparseTable({ data: values })
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.queryMin(s, e)).toBe(bruteMin(values, s, e))
          expect(st.queryMax(s, e)).toBe(bruteMax(values, s, e))
          expect(st.querySum(s, e)).toBe(bruteSum(values, s, e))
        }
      }
    })
  })

  describe("13 elements (prime length exhaustive)", () => {
    it("all ranges match brute force", () => {
      const values = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0, 11, 13, 12]
      const st = new StaticSparseTable({ data: values })
      expect(st.queryMin(0, 12)).toBe(0)
      expect(st.queryMin(0, 3)).toBe(1)
      expect(st.queryMax(4, 8)).toBe(9)
      expect(st.querySum(0, 12)).toBe(81)
    })
  })

  describe("custom comparator", () => {
    it("uses custom comparator for min/max", () => {
      const st = new StaticSparseTable({
        data: [3, 1, 4, 1, 5],
        comparator: (a, b) => b - a,
      })
      expect(st.queryMin(0, 4)).toBe(5)
      expect(st.queryMax(0, 4)).toBe(1)
    })

    it("custom comparator with objects", () => {
      const data = [{ v: 3 }, { v: 1 }, { v: 4 }]
      const st = new StaticSparseTable({
        data,
        comparator: (a, b) => a.v - b.v,
      })
      expect(st.queryMin(0, 2)).toEqual({ v: 1 })
      expect(st.queryMax(0, 2)).toEqual({ v: 4 })
    })
  })

  describe("duplicate values", () => {
    it("handles duplicates for min", () => {
      const st = new StaticSparseTable({ data: [5, 5, 5, 2, 2, 5, 5] })
      expect(st.queryMin(0, 6)).toBe(2)
      expect(st.queryMin(0, 2)).toBe(5)
      expect(st.queryMin(3, 5)).toBe(2)
    })

    it("handles duplicates for max", () => {
      const st = new StaticSparseTable({ data: [3, 3, 1, 3, 3] })
      expect(st.queryMax(0, 4)).toBe(3)
      expect(st.queryMax(2, 2)).toBe(1)
    })

    it("handles duplicates for sum", () => {
      const st = new StaticSparseTable({ data: [2, 2, 2, 2] })
      expect(st.querySum(0, 3)).toBe(8)
      expect(st.querySum(1, 2)).toBe(4)
    })

    it("handles duplicates for gcd", () => {
      const st = new StaticSparseTable({ data: [6, 6, 6, 6] })
      expect(st.queryGcd(0, 3)).toBe(6)
      expect(st.queryGcd(0, 1)).toBe(6)
    })
  })

  describe("stress tests", () => {
    it("1000 elements all ranges with min/max", () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
      const st = new StaticSparseTable({ data: values })
      for (let trial = 0; trial < 200; trial++) {
        const s = Math.floor(Math.random() * values.length)
        const e = s + Math.floor(Math.random() * (values.length - s))
        expect(st.queryMin(s, e)).toBe(bruteMin(values, s, e))
        expect(st.queryMax(s, e)).toBe(bruteMax(values, s, e))
      }
    })

    it("1000 elements with gcd queries", () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100) + 1)
      const st = new StaticSparseTable({ data: values })
      for (let trial = 0; trial < 200; trial++) {
        const s = Math.floor(Math.random() * values.length)
        const e = s + Math.floor(Math.random() * (values.length - s))
        expect(st.queryGcd(s, e)).toBe(bruteGcd(values, s, e))
      }
    })

    it("1000 elements with sum queries", () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100))
      const st = new StaticSparseTable({ data: values })
      for (let trial = 0; trial < 200; trial++) {
        const s = Math.floor(Math.random() * values.length)
        const e = s + Math.floor(Math.random() * (values.length - s))
        expect(st.querySum(s, e)).toBe(bruteSum(values, s, e))
      }
    })

    it("power of 2 sized array all possible ranges", () => {
      const values = [8, 3, 5, 1, 9, 2, 7, 4]
      const st = new StaticSparseTable({ data: values })
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.queryMin(s, e)).toBe(bruteMin(values, s, e))
          expect(st.queryMax(s, e)).toBe(bruteMax(values, s, e))
          expect(st.queryGcd(s, e)).toBe(bruteGcd(values, s, e))
          expect(st.querySum(s, e)).toBe(bruteSum(values, s, e))
        }
      }
    })

    it("6 elements with sum exhaustive", () => {
      const values = [1, 2, 3, 4, 5, 6]
      const st = new StaticSparseTable({ data: values })
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.querySum(s, e)).toBe(bruteSum(values, s, e))
        }
      }
    })
  })
})
