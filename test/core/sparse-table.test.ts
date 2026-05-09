import { describe, it, expect } from "vitest"
import { SparseTable } from "../../src/core/sparse-table/sparse-table.js"
import type { SparseTableOptions } from "../../src/core/sparse-table/types.js"

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

function bruteForce<T>(
  values: T[],
  start: number,
  end: number,
  op: (a: T, b: T) => T,
): T {
  let result = values[start]!
  for (let i = start + 1; i <= end; i++) {
    result = op(result, values[i]!)
  }
  return result
}

describe("SparseTable", () => {
  describe("construction", () => {
    it("constructs with min operation (idempotent)", () => {
      const st = new SparseTable({ values: [3, 1, 4, 1, 5, 9, 2, 6], operation: Math.min, isIdempotent: true })
      expect(st.size()).toBe(8)
    })

    it("constructs with max operation (idempotent)", () => {
      const st = new SparseTable({ values: [3, 1, 4, 1, 5, 9, 2, 6], operation: Math.max, isIdempotent: true })
      expect(st.size()).toBe(8)
    })

    it("constructs with sum operation (non-idempotent)", () => {
      const st = new SparseTable({ values: [1, 2, 3, 4, 5], operation: (a, b) => a + b })
      expect(st.size()).toBe(5)
    })

    it("constructs with gcd operation (idempotent)", () => {
      const st = new SparseTable({ values: [12, 18, 24, 9, 15], operation: gcd, isIdempotent: true })
      expect(st.size()).toBe(5)
    })

    it("constructs without isIdempotent flag (defaults to false)", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min })
      expect(st.isIdempotent()).toBe(false)
    })

    it("constructs with explicit isIdempotent false", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min, isIdempotent: false })
      expect(st.isIdempotent()).toBe(false)
    })

    it("constructs with isIdempotent true", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min, isIdempotent: true })
      expect(st.isIdempotent()).toBe(true)
    })

    it("constructs with empty array", () => {
      const st = new SparseTable<number>({ values: [], operation: Math.min })
      expect(st.size()).toBe(0)
      expect(st.isEmpty()).toBe(true)
    })

    it("constructs with single element", () => {
      const st = new SparseTable({ values: [42], operation: Math.min })
      expect(st.size()).toBe(1)
      expect(st.isEmpty()).toBe(false)
    })

    it("constructs with two elements", () => {
      const st = new SparseTable({ values: [5, 3], operation: Math.min, isIdempotent: true })
      expect(st.size()).toBe(2)
    })

    it("constructs with string values", () => {
      const st = new SparseTable({
        values: ["apple", "banana", "cherry"],
        operation: (a, b) => (a < b ? a : b),
        isIdempotent: true,
      })
      expect(st.size()).toBe(3)
    })

    it("preserves original values (does not mutate input)", () => {
      const original = [3, 1, 4]
      const copy = [...original]
      new SparseTable({ values: original, operation: Math.min })
      expect(original).toEqual(copy)
    })
  })

  describe("query (min, idempotent)", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })

    it("finds min of full range", () => {
      expect(st.query(0, 7)).toBe(1)
    })

    it("finds min of single element", () => {
      expect(st.query(0, 0)).toBe(3)
      expect(st.query(3, 3)).toBe(1)
      expect(st.query(7, 7)).toBe(6)
    })

    it("finds min of partial range", () => {
      expect(st.query(2, 5)).toBe(1)
      expect(st.query(4, 7)).toBe(2)
      expect(st.query(0, 3)).toBe(1)
    })

    it("finds min of two elements", () => {
      expect(st.query(0, 1)).toBe(1)
      expect(st.query(4, 5)).toBe(5)
      expect(st.query(6, 7)).toBe(2)
    })

    it("finds min of first half", () => {
      expect(st.query(0, 3)).toBe(1)
    })

    it("finds min of second half", () => {
      expect(st.query(4, 7)).toBe(2)
    })
  })

  describe("query (max, idempotent)", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const st = new SparseTable({ values, operation: Math.max, isIdempotent: true })

    it("finds max of full range", () => {
      expect(st.query(0, 7)).toBe(9)
    })

    it("finds max of single element", () => {
      expect(st.query(0, 0)).toBe(3)
      expect(st.query(5, 5)).toBe(9)
    })

    it("finds max of partial range", () => {
      expect(st.query(0, 3)).toBe(4)
      expect(st.query(2, 4)).toBe(5)
      expect(st.query(5, 7)).toBe(9)
    })
  })

  describe("query (gcd, idempotent)", () => {
    const values = [12, 18, 24, 9, 15]
    const st = new SparseTable({ values, operation: gcd, isIdempotent: true })

    it("finds gcd of full range", () => {
      expect(st.query(0, 4)).toBe(3)
    })

    it("finds gcd of partial range", () => {
      expect(st.query(0, 2)).toBe(6)
      expect(st.query(1, 3)).toBe(3)
      expect(st.query(2, 4)).toBe(3)
    })

    it("finds gcd of single element", () => {
      expect(st.query(0, 0)).toBe(12)
      expect(st.query(3, 3)).toBe(9)
    })
  })

  describe("query (sum, non-idempotent)", () => {
    const values = [1, 2, 3, 4, 5]
    const st = new SparseTable({ values, operation: (a, b) => a + b })

    it("computes sum of full range", () => {
      expect(st.query(0, 4)).toBe(15)
    })

    it("computes sum of single element", () => {
      expect(st.query(0, 0)).toBe(1)
      expect(st.query(2, 2)).toBe(3)
      expect(st.query(4, 4)).toBe(5)
    })

    it("computes sum of partial range", () => {
      expect(st.query(1, 3)).toBe(9)
      expect(st.query(0, 2)).toBe(6)
      expect(st.query(2, 4)).toBe(12)
    })

    it("computes sum of two elements", () => {
      expect(st.query(0, 1)).toBe(3)
      expect(st.query(3, 4)).toBe(9)
    })

    it("computes sum of first half", () => {
      expect(st.query(0, 2)).toBe(6)
    })

    it("computes sum of second half", () => {
      expect(st.query(2, 4)).toBe(12)
    })
  })

  describe("query (product, non-idempotent)", () => {
    const values = [1, 2, 3, 4, 5]
    const st = new SparseTable({ values, operation: (a, b) => a * b })

    it("computes product of full range", () => {
      expect(st.query(0, 4)).toBe(120)
    })

    it("computes product of partial range", () => {
      expect(st.query(1, 3)).toBe(24)
      expect(st.query(0, 2)).toBe(6)
    })
  })

  describe("queryRange", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })

    it("returns same result as query", () => {
      expect(st.queryRange(0, 7)).toBe(st.query(0, 7))
      expect(st.queryRange(2, 5)).toBe(st.query(2, 5))
      expect(st.queryRange(0, 0)).toBe(st.query(0, 0))
    })
  })

  describe("edge cases", () => {
    it("handles single element array", () => {
      const st = new SparseTable({ values: [42], operation: Math.max, isIdempotent: true })
      expect(st.query(0, 0)).toBe(42)
    })

    it("handles two element array", () => {
      const st = new SparseTable({ values: [5, 3], operation: Math.min, isIdempotent: true })
      expect(st.query(0, 0)).toBe(5)
      expect(st.query(1, 1)).toBe(3)
      expect(st.query(0, 1)).toBe(3)
    })

    it("handles all same values", () => {
      const st = new SparseTable({ values: [7, 7, 7, 7, 7], operation: Math.min, isIdempotent: true })
      expect(st.query(0, 4)).toBe(7)
      expect(st.query(1, 3)).toBe(7)
      expect(st.query(2, 2)).toBe(7)
    })

    it("handles all same values with sum", () => {
      const st = new SparseTable({ values: [3, 3, 3, 3], operation: (a, b) => a + b })
      expect(st.query(0, 3)).toBe(12)
      expect(st.query(1, 2)).toBe(6)
    })

    it("handles ascending values", () => {
      const st = new SparseTable({ values: [1, 2, 3, 4, 5], operation: Math.max, isIdempotent: true })
      expect(st.query(0, 4)).toBe(5)
      expect(st.query(0, 2)).toBe(3)
    })

    it("handles descending values", () => {
      const st = new SparseTable({ values: [5, 4, 3, 2, 1], operation: Math.min, isIdempotent: true })
      expect(st.query(0, 4)).toBe(1)
      expect(st.query(0, 2)).toBe(3)
    })

    it("throws on invalid range (start > end)", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min })
      expect(() => st.query(2, 1)).toThrow(RangeError)
    })

    it("throws on negative start", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min })
      expect(() => st.query(-1, 2)).toThrow(RangeError)
    })

    it("throws on end beyond array", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min })
      expect(() => st.query(0, 3)).toThrow(RangeError)
    })

    it("handles power-of-2 length arrays", () => {
      const values = [1, 2, 3, 4]
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
      expect(st.query(0, 3)).toBe(1)
      expect(st.query(0, 1)).toBe(1)
      expect(st.query(2, 3)).toBe(3)
    })

    it("handles non-power-of-2 length arrays", () => {
      const values = [5, 3, 8, 1, 4]
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
      expect(st.query(0, 4)).toBe(1)
      expect(st.query(1, 3)).toBe(1)
      expect(st.query(2, 4)).toBe(1)
    })
  })

  describe("size and isEmpty", () => {
    it("returns correct size", () => {
      const st = new SparseTable({ values: [1, 2, 3, 4, 5], operation: Math.min })
      expect(st.size()).toBe(5)
    })

    it("returns 0 for empty", () => {
      const st = new SparseTable<number>({ values: [], operation: Math.min })
      expect(st.size()).toBe(0)
    })

    it("isEmpty returns true for empty", () => {
      const st = new SparseTable<number>({ values: [], operation: Math.min })
      expect(st.isEmpty()).toBe(true)
    })

    it("isEmpty returns false for non-empty", () => {
      const st = new SparseTable({ values: [1], operation: Math.min })
      expect(st.isEmpty()).toBe(false)
    })

    it("isEmpty returns false for multi-element", () => {
      const st = new SparseTable({ values: [1, 2], operation: Math.min })
      expect(st.isEmpty()).toBe(false)
    })
  })

  describe("toArray", () => {
    it("returns copy of original values", () => {
      const values = [3, 1, 4, 1, 5]
      const st = new SparseTable({ values, operation: Math.min })
      expect(st.toArray()).toEqual(values)
    })

    it("returns empty array for empty table", () => {
      const st = new SparseTable<number>({ values: [], operation: Math.min })
      expect(st.toArray()).toEqual([])
    })

    it("returns independent copy", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min })
      const arr = st.toArray()
      arr[0] = 999
      expect(st.toArray()).toEqual([1, 2, 3])
    })
  })

  describe("clone", () => {
    it("creates independent clone with same values", () => {
      const st = new SparseTable({ values: [3, 1, 4, 1, 5], operation: Math.min, isIdempotent: true })
      const cloned = st.clone()
      expect(cloned.toArray()).toEqual(st.toArray())
      expect(cloned.size()).toBe(st.size())
    })

    it("clone produces same query results", () => {
      const st = new SparseTable({ values: [3, 1, 4, 1, 5], operation: Math.min, isIdempotent: true })
      const cloned = st.clone()
      expect(cloned.query(0, 4)).toBe(st.query(0, 4))
      expect(cloned.query(1, 3)).toBe(st.query(1, 3))
    })

    it("clone preserves operation", () => {
      const op = Math.min
      const st = new SparseTable({ values: [1, 2, 3], operation: op })
      const cloned = st.clone()
      expect(cloned.getOperation()).toBe(op)
    })

    it("clone preserves isIdempotent", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min, isIdempotent: true })
      const cloned = st.clone()
      expect(cloned.isIdempotent()).toBe(true)
    })

    it("clone preserves non-idempotent", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: (a, b) => a + b })
      const cloned = st.clone()
      expect(cloned.isIdempotent()).toBe(false)
    })
  })

  describe("getOperation", () => {
    it("returns the operation function", () => {
      const op = Math.min
      const st = new SparseTable({ values: [1, 2, 3], operation: op })
      expect(st.getOperation()).toBe(op)
    })

    it("returns sum operation", () => {
      const op = (a: number, b: number) => a + b
      const st = new SparseTable({ values: [1, 2, 3], operation: op })
      expect(st.getOperation()).toBe(op)
    })
  })

  describe("isIdempotent", () => {
    it("returns true when set to true", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min, isIdempotent: true })
      expect(st.isIdempotent()).toBe(true)
    })

    it("returns false by default", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min })
      expect(st.isIdempotent()).toBe(false)
    })

    it("returns false when explicitly set", () => {
      const st = new SparseTable({ values: [1, 2, 3], operation: Math.min, isIdempotent: false })
      expect(st.isIdempotent()).toBe(false)
    })
  })

  describe("forEach", () => {
    it("iterates over all values in order", () => {
      const values = [3, 1, 4, 1, 5]
      const st = new SparseTable({ values, operation: Math.min })
      const collected: Array<{ value: number; index: number }> = []
      st.forEach((value, index) => {
        collected.push({ value, index })
      })
      expect(collected).toEqual([
        { value: 3, index: 0 },
        { value: 1, index: 1 },
        { value: 4, index: 2 },
        { value: 1, index: 3 },
        { value: 5, index: 4 },
      ])
    })

    it("does not call callback for empty table", () => {
      const st = new SparseTable<number>({ values: [], operation: Math.min })
      let callCount = 0
      st.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it("iterates single element", () => {
      const st = new SparseTable({ values: [42], operation: Math.min })
      const collected: number[] = []
      st.forEach((v) => collected.push(v))
      expect(collected).toEqual([42])
    })
  })

  describe("iterator", () => {
    it("is iterable with for-of", () => {
      const values = [3, 1, 4, 1, 5]
      const st = new SparseTable({ values, operation: Math.min })
      const collected: number[] = []
      for (const v of st) {
        collected.push(v)
      }
      expect(collected).toEqual(values)
    })

    it("spread operator works", () => {
      const values = [3, 1, 4, 1, 5]
      const st = new SparseTable({ values, operation: Math.min })
      expect([...st]).toEqual(values)
    })

    it("Array.from works", () => {
      const values = [3, 1, 4, 1, 5]
      const st = new SparseTable({ values, operation: Math.min })
      expect(Array.from(st)).toEqual(values)
    })

    it("empty table yields nothing", () => {
      const st = new SparseTable<number>({ values: [], operation: Math.min })
      expect([...st]).toEqual([])
    })
  })

  describe("stress tests", () => {
    it("1000 elements with min queries match brute force", () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
      for (let trial = 0; trial < 200; trial++) {
        const start = Math.floor(Math.random() * values.length)
        const end = start + Math.floor(Math.random() * (values.length - start))
        const expected = bruteForce(values, start, end, Math.min)
        expect(st.query(start, end)).toBe(expected)
      }
    })

    it("1000 elements with max queries match brute force", () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
      const st = new SparseTable({ values, operation: Math.max, isIdempotent: true })
      for (let trial = 0; trial < 200; trial++) {
        const start = Math.floor(Math.random() * values.length)
        const end = start + Math.floor(Math.random() * (values.length - start))
        const expected = bruteForce(values, start, end, Math.max)
        expect(st.query(start, end)).toBe(expected)
      }
    })

    it("1000 elements with gcd queries match brute force", () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100) + 1)
      const st = new SparseTable({ values, operation: gcd, isIdempotent: true })
      for (let trial = 0; trial < 200; trial++) {
        const start = Math.floor(Math.random() * values.length)
        const end = start + Math.floor(Math.random() * (values.length - start))
        const expected = bruteForce(values, start, end, gcd)
        expect(st.query(start, end)).toBe(expected)
      }
    })

    it("1000 elements with sum queries match brute force (non-idempotent)", () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100))
      const st = new SparseTable({ values, operation: (a, b) => a + b })
      for (let trial = 0; trial < 200; trial++) {
        const start = Math.floor(Math.random() * values.length)
        const end = start + Math.floor(Math.random() * (values.length - start))
        const expected = bruteForce(values, start, end, (a, b) => a + b)
        expect(st.query(start, end)).toBe(expected)
      }
    })

    it("random lengths from 1 to 100 with min queries", () => {
      for (let len = 1; len <= 100; len++) {
        const values = Array.from({ length: len }, () => Math.floor(Math.random() * 100))
        const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
        const start = Math.floor(Math.random() * values.length)
        const end = start + Math.floor(Math.random() * (values.length - start))
        const expected = bruteForce(values, start, end, Math.min)
        expect(st.query(start, end)).toBe(expected)
      }
    })

    it("random lengths from 1 to 100 with sum queries", () => {
      for (let len = 1; len <= 50; len++) {
        const values = Array.from({ length: len }, () => Math.floor(Math.random() * 10))
        const st = new SparseTable({ values, operation: (a, b) => a + b })
        const start = Math.floor(Math.random() * values.length)
        const end = start + Math.floor(Math.random() * (values.length - start))
        const expected = bruteForce(values, start, end, (a, b) => a + b)
        expect(st.query(start, end)).toBe(expected)
      }
    })

    it("power of 2 sized arrays with all possible ranges", () => {
      const values = [8, 3, 5, 1, 9, 2, 7, 4]
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
      for (let start = 0; start < values.length; start++) {
        for (let end = start; end < values.length; end++) {
          expect(st.query(start, end)).toBe(bruteForce(values, start, end, Math.min))
        }
      }
    })

    it("large array with product queries (non-idempotent)", () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      const st = new SparseTable({ values, operation: (a, b) => a * b })
      for (let start = 0; start < values.length; start++) {
        for (let end = start; end < values.length; end++) {
          expect(st.query(start, end)).toBe(bruteForce(values, start, end, (a, b) => a * b))
        }
      }
    })
  })

  describe("non-idempotent O(log n) queries", () => {
    it("correctly handles sum for various range lengths", () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      const st = new SparseTable({ values, operation: (a, b) => a + b })
      expect(st.query(0, 9)).toBe(550)
      expect(st.query(0, 4)).toBe(150)
      expect(st.query(5, 9)).toBe(400)
      expect(st.query(3, 7)).toBe(300)
      expect(st.query(1, 8)).toBe(440)
    })

    it("correctly handles concatenation for strings", () => {
      const values = ["a", "b", "c", "d", "e"]
      const st = new SparseTable({ values, operation: (a, b) => a + b })
      expect(st.query(0, 4)).toBe("abcde")
      expect(st.query(1, 3)).toBe("bcd")
      expect(st.query(0, 2)).toBe("abc")
    })

    it("correctly handles bitwise AND", () => {
      const values = [15, 7, 3, 1]
      const st = new SparseTable({ values, operation: (a, b) => a & b, isIdempotent: true })
      expect(st.query(0, 3)).toBe(1)
      expect(st.query(0, 1)).toBe(7)
    })
  })

  describe("queryRange alias", () => {
    it("produces identical results for all ranges", () => {
      const values = [5, 2, 8, 1, 9, 3, 7, 4, 6]
      const st = new SparseTable({ values, operation: Math.max, isIdempotent: true })
      for (let start = 0; start < values.length; start++) {
        for (let end = start; end < values.length; end++) {
          expect(st.queryRange(start, end)).toBe(st.query(start, end))
        }
      }
    })
  })

  describe("string operation", () => {
    it("finds lexicographic minimum", () => {
      const values = ["cherry", "apple", "banana", "date"]
      const st = new SparseTable({
        values,
        operation: (a, b) => (a < b ? a : b),
        isIdempotent: true,
      })
      expect(st.query(0, 3)).toBe("apple")
      expect(st.query(0, 0)).toBe("cherry")
      expect(st.query(2, 3)).toBe("banana")
    })

    it("finds lexicographic maximum", () => {
      const values = ["cherry", "apple", "banana", "date"]
      const st = new SparseTable({
        values,
        operation: (a, b) => (a > b ? a : b),
        isIdempotent: true,
      })
      expect(st.query(0, 3)).toBe("date")
      expect(st.query(0, 2)).toBe("cherry")
    })
  })

  describe("negative numbers", () => {
    it("handles min with negative numbers", () => {
      const values = [-5, 3, -1, 7, -8, 2]
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
      expect(st.query(0, 5)).toBe(-8)
      expect(st.query(0, 2)).toBe(-5)
      expect(st.query(3, 5)).toBe(-8)
    })

    it("handles max with negative numbers", () => {
      const values = [-5, 3, -1, 7, -8, 2]
      const st = new SparseTable({ values, operation: Math.max, isIdempotent: true })
      expect(st.query(0, 5)).toBe(7)
      expect(st.query(0, 2)).toBe(3)
      expect(st.query(4, 5)).toBe(2)
    })

    it("handles sum with negative numbers", () => {
      const values = [-5, 3, -1, 7, -8, 2]
      const st = new SparseTable({ values, operation: (a, b) => a + b })
      expect(st.query(0, 5)).toBe(-2)
      expect(st.query(0, 2)).toBe(-3)
      expect(st.query(3, 5)).toBe(1)
    })
  })

  describe("repeated queries are consistent", () => {
    it("returns same result when called multiple times", () => {
      const st = new SparseTable({ values: [3, 1, 4, 1, 5, 9, 2, 6], operation: Math.min, isIdempotent: true })
      for (let i = 0; i < 10; i++) {
        expect(st.query(2, 6)).toBe(1)
      }
    })
  })

  describe("additional coverage", () => {
    it("handles 3 elements with min", () => {
      const st = new SparseTable({ values: [5, 2, 8], operation: Math.min, isIdempotent: true })
      expect(st.query(0, 2)).toBe(2)
      expect(st.query(0, 0)).toBe(5)
      expect(st.query(1, 1)).toBe(2)
      expect(st.query(2, 2)).toBe(8)
      expect(st.query(0, 1)).toBe(2)
      expect(st.query(1, 2)).toBe(2)
    })

    it("handles 3 elements with max (non-idempotent path)", () => {
      const st = new SparseTable({ values: [5, 2, 8], operation: Math.max })
      expect(st.query(0, 2)).toBe(8)
      expect(st.query(0, 1)).toBe(5)
      expect(st.query(1, 2)).toBe(8)
    })

    it("handles 7 elements (non-power-of-2)", () => {
      const values = [10, 3, 7, 1, 9, 4, 6]
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.query(s, e)).toBe(bruteForce(values, s, e, Math.min))
        }
      }
    })

    it("handles 6 elements with sum", () => {
      const values = [1, 2, 3, 4, 5, 6]
      const st = new SparseTable({ values, operation: (a, b) => a + b })
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(st.query(s, e)).toBe(bruteForce(values, s, e, (a, b) => a + b))
        }
      }
    })

    it("handles 13 elements (prime) with min", () => {
      const values = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0, 11, 13, 12]
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
      expect(st.query(0, 12)).toBe(0)
      expect(st.query(0, 3)).toBe(1)
      expect(st.query(4, 8)).toBe(3)
      expect(st.query(9, 12)).toBe(0)
    })

    it("handles duplicate values correctly with min", () => {
      const values = [5, 5, 5, 2, 2, 5, 5]
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
      expect(st.query(0, 6)).toBe(2)
      expect(st.query(0, 2)).toBe(5)
      expect(st.query(3, 5)).toBe(2)
    })

    it("handles large identical values with sum", () => {
      const values = [100, 100, 100, 100, 100]
      const st = new SparseTable({ values, operation: (a, b) => a + b })
      expect(st.query(0, 4)).toBe(500)
      expect(st.query(1, 3)).toBe(300)
      expect(st.query(2, 4)).toBe(300)
    })

    it("clone with sum produces correct results", () => {
      const values = [1, 2, 3, 4, 5]
      const st = new SparseTable({ values, operation: (a, b) => a + b })
      const cloned = st.clone()
      expect(cloned.query(0, 4)).toBe(15)
      expect(cloned.query(1, 3)).toBe(9)
      expect(cloned.query(0, 0)).toBe(1)
    })

    it("query with length 1 at every position", () => {
      const values = [10, 20, 30, 40, 50]
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: true })
      for (let i = 0; i < values.length; i++) {
        expect(st.query(i, i)).toBe(values[i])
      }
    })

    it("query with length 2 at every position", () => {
      const values = [10, 20, 30, 40, 50]
      const st = new SparseTable({ values, operation: Math.max, isIdempotent: true })
      for (let i = 0; i < values.length - 1; i++) {
        expect(st.query(i, i + 1)).toBe(Math.max(values[i]!, values[i + 1]!))
      }
    })

    it("forEach with sum table", () => {
      const values = [1, 2, 3]
      const st = new SparseTable({ values, operation: (a, b) => a + b })
      const collected: number[] = []
      st.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it("iterator with clone", () => {
      const values = [3, 1, 4]
      const st = new SparseTable({ values, operation: Math.min })
      const cloned = st.clone()
      expect([...cloned]).toEqual([3, 1, 4])
    })

    it("queryRange with sum", () => {
      const values = [1, 2, 3, 4, 5]
      const st = new SparseTable({ values, operation: (a, b) => a + b })
      expect(st.queryRange(0, 4)).toBe(15)
      expect(st.queryRange(2, 4)).toBe(12)
    })

    it("throws on query of empty table", () => {
      const st = new SparseTable<number>({ values: [], operation: Math.min })
      expect(() => st.query(0, 0)).toThrow(RangeError)
    })
  })

  describe("non-idempotent flag correctness", () => {
    it("min treated as non-idempotent still works (but slower)", () => {
      const values = [5, 3, 8, 1, 4, 7, 2, 6]
      const st = new SparseTable({ values, operation: Math.min, isIdempotent: false })
      for (let start = 0; start < values.length; start++) {
        for (let end = start; end < values.length; end++) {
          expect(st.query(start, end)).toBe(bruteForce(values, start, end, Math.min))
        }
      }
    })
  })
})
