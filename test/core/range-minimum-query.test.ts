import { describe, it, expect } from "vitest"
import { RangeMinimumQuery } from "../../src/core/range-minimum-query/index.js"
import type { RMQComparator, RMQResult } from "../../src/core/range-minimum-query/types.js"

function bruteForceMin<T>(
  arr: T[],
  left: number,
  right: number,
  cmp: RMQComparator<T>,
): RMQResult<T> {
  let bestIdx = left
  for (let i = left + 1; i <= right; i++) {
    if (cmp(arr[i]!, arr[bestIdx]!) < 0) {
      bestIdx = i
    }
  }
  return { value: arr[bestIdx]!, index: bestIdx }
}

const defaultCmp: RMQComparator<number> = (a, b) => a - b
const maxCmp: RMQComparator<number> = (a, b) => b - a

describe("RangeMinimumQuery", () => {
  describe("construction", () => {
    it("constructs with number array and default comparator", () => {
      const rmq = new RangeMinimumQuery([3, 1, 4, 1, 5, 9, 2, 6])
      expect(rmq.size()).toBe(8)
    })

    it("constructs with custom comparator for max", () => {
      const rmq = new RangeMinimumQuery([3, 1, 4, 1, 5], maxCmp)
      expect(rmq.size()).toBe(5)
    })

    it("constructs with empty array", () => {
      const rmq = new RangeMinimumQuery<number>([])
      expect(rmq.size()).toBe(0)
      expect(rmq.isEmpty()).toBe(true)
    })

    it("constructs with single element", () => {
      const rmq = new RangeMinimumQuery([42])
      expect(rmq.size()).toBe(1)
      expect(rmq.isEmpty()).toBe(false)
    })

    it("constructs with two elements", () => {
      const rmq = new RangeMinimumQuery([5, 3])
      expect(rmq.size()).toBe(2)
    })

    it("constructs with string array", () => {
      const rmq = new RangeMinimumQuery(["cherry", "apple", "banana"], (a, b) =>
        a < b ? -1 : a > b ? 1 : 0,
      )
      expect(rmq.size()).toBe(3)
    })

    it("does not mutate input array", () => {
      const original = [3, 1, 4]
      const copy = [...original]
      new RangeMinimumQuery(original)
      expect(original).toEqual(copy)
    })

    it("preserves all elements", () => {
      const values = [3, 1, 4, 1, 5]
      const rmq = new RangeMinimumQuery(values)
      expect(rmq.toArray()).toEqual(values)
    })

    it("handles large array", () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i)
      const rmq = new RangeMinimumQuery(arr)
      expect(rmq.size()).toBe(10000)
    })

    it("handles power-of-2 length", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3, 4, 5, 6, 7, 8])
      expect(rmq.size()).toBe(8)
    })

    it("handles non-power-of-2 length", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3, 4, 5])
      expect(rmq.size()).toBe(5)
    })

    it("handles all identical values", () => {
      const rmq = new RangeMinimumQuery([7, 7, 7, 7, 7])
      expect(rmq.size()).toBe(5)
    })
  })

  describe("query - default comparator (min)", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const rmq = new RangeMinimumQuery(values)

    it("finds min of full range", () => {
      const result = rmq.query(0, 7)
      expect(result.value).toBe(1)
      expect(result.index).toBe(1)
    })

    it("finds min of single element at start", () => {
      const result = rmq.query(0, 0)
      expect(result.value).toBe(3)
      expect(result.index).toBe(0)
    })

    it("finds min of single element in middle", () => {
      const result = rmq.query(3, 3)
      expect(result.value).toBe(1)
      expect(result.index).toBe(3)
    })

    it("finds min of single element at end", () => {
      const result = rmq.query(7, 7)
      expect(result.value).toBe(6)
      expect(result.index).toBe(7)
    })

    it("finds min of two adjacent elements", () => {
      const result = rmq.query(0, 1)
      expect(result.value).toBe(1)
      expect(result.index).toBe(1)
    })

    it("finds min of partial range [2,5]", () => {
      const result = rmq.query(2, 5)
      expect(result.value).toBe(1)
      expect(result.index).toBe(3)
    })

    it("finds min of partial range [4,7]", () => {
      const result = rmq.query(4, 7)
      expect(result.value).toBe(2)
      expect(result.index).toBe(6)
    })

    it("finds min of partial range [0,3]", () => {
      const result = rmq.query(0, 3)
      expect(result.value).toBe(1)
      expect(result.index).toBe(1)
    })

    it("finds min of first half", () => {
      const result = rmq.query(0, 3)
      expect(result.value).toBe(1)
    })

    it("finds min of second half", () => {
      const result = rmq.query(4, 7)
      expect(result.value).toBe(2)
    })

    it("returns first occurrence index on ties", () => {
      const result = rmq.query(0, 7)
      expect(result.value).toBe(1)
      expect(result.index).toBe(1)
    })
  })

  describe("query - max comparator", () => {
    const values = [3, 1, 4, 1, 5, 9, 2, 6]
    const rmq = new RangeMinimumQuery(values, maxCmp)

    it("finds max of full range", () => {
      const result = rmq.query(0, 7)
      expect(result.value).toBe(9)
      expect(result.index).toBe(5)
    })

    it("finds max of single element", () => {
      expect(rmq.query(0, 0)).toEqual({ value: 3, index: 0 })
      expect(rmq.query(5, 5)).toEqual({ value: 9, index: 5 })
    })

    it("finds max of partial range [0,3]", () => {
      const result = rmq.query(0, 3)
      expect(result.value).toBe(4)
      expect(result.index).toBe(2)
    })

    it("finds max of partial range [2,4]", () => {
      const result = rmq.query(2, 4)
      expect(result.value).toBe(5)
      expect(result.index).toBe(4)
    })

    it("finds max of partial range [5,7]", () => {
      const result = rmq.query(5, 7)
      expect(result.value).toBe(9)
      expect(result.index).toBe(5)
    })
  })

  describe("query - custom object comparator", () => {
    interface Item {
      priority: number
      name: string
    }
    const items: Item[] = [
      { priority: 3, name: "c" },
      { priority: 1, name: "a" },
      { priority: 2, name: "b" },
    ]
    const rmq = new RangeMinimumQuery(items, (a, b) => a.priority - b.priority)

    it("finds item with lowest priority", () => {
      const result = rmq.query(0, 2)
      expect(result.value.name).toBe("a")
      expect(result.index).toBe(1)
    })

    it("finds item in subrange", () => {
      const result = rmq.query(0, 0)
      expect(result.value.name).toBe("c")
      expect(result.index).toBe(0)
    })
  })

  describe("edge cases", () => {
    it("handles single element array", () => {
      const rmq = new RangeMinimumQuery([42])
      const result = rmq.query(0, 0)
      expect(result).toEqual({ value: 42, index: 0 })
    })

    it("handles two element array - min", () => {
      const rmq = new RangeMinimumQuery([5, 3])
      expect(rmq.query(0, 0)).toEqual({ value: 5, index: 0 })
      expect(rmq.query(1, 1)).toEqual({ value: 3, index: 1 })
      expect(rmq.query(0, 1)).toEqual({ value: 3, index: 1 })
    })

    it("handles two element array - max", () => {
      const rmq = new RangeMinimumQuery([5, 3], maxCmp)
      expect(rmq.query(0, 1)).toEqual({ value: 5, index: 0 })
    })

    it("handles all identical values", () => {
      const rmq = new RangeMinimumQuery([7, 7, 7, 7, 7])
      expect(rmq.query(0, 4)).toEqual({ value: 7, index: 0 })
      expect(rmq.query(1, 3)).toEqual({ value: 7, index: 1 })
      expect(rmq.query(2, 2)).toEqual({ value: 7, index: 2 })
    })

    it("handles ascending values", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3, 4, 5])
      expect(rmq.query(0, 4)).toEqual({ value: 1, index: 0 })
      expect(rmq.query(2, 4)).toEqual({ value: 3, index: 2 })
    })

    it("handles descending values", () => {
      const rmq = new RangeMinimumQuery([5, 4, 3, 2, 1])
      expect(rmq.query(0, 4)).toEqual({ value: 1, index: 4 })
      expect(rmq.query(0, 2)).toEqual({ value: 3, index: 2 })
    })

    it("handles negative numbers", () => {
      const rmq = new RangeMinimumQuery([-5, 3, -1, 7, -8, 2])
      expect(rmq.query(0, 5)).toEqual({ value: -8, index: 4 })
      expect(rmq.query(0, 2)).toEqual({ value: -5, index: 0 })
      expect(rmq.query(3, 5)).toEqual({ value: -8, index: 4 })
    })

    it("handles negative numbers with max comparator", () => {
      const rmq = new RangeMinimumQuery([-5, 3, -1, 7, -8, 2], maxCmp)
      expect(rmq.query(0, 5)).toEqual({ value: 7, index: 3 })
      expect(rmq.query(4, 5)).toEqual({ value: 2, index: 5 })
    })

    it("handles zeros", () => {
      const rmq = new RangeMinimumQuery([0, 0, 0, 1, 0])
      expect(rmq.query(0, 4)).toEqual({ value: 0, index: 0 })
    })

    it("handles floating point numbers", () => {
      const rmq = new RangeMinimumQuery([3.14, 2.71, 1.41, 1.73])
      expect(rmq.query(0, 3)).toEqual({ value: 1.41, index: 2 })
    })

    it("handles power-of-2 length with all ranges", () => {
      const values = [8, 3, 5, 1]
      const rmq = new RangeMinimumQuery(values)
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          const expected = bruteForceMin(values, s, e, defaultCmp)
          expect(rmq.query(s, e)).toEqual(expected)
        }
      }
    })

    it("handles non-power-of-2 length with all ranges", () => {
      const values = [5, 3, 8, 1, 4]
      const rmq = new RangeMinimumQuery(values)
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          const expected = bruteForceMin(values, s, e, defaultCmp)
          expect(rmq.query(s, e)).toEqual(expected)
        }
      }
    })

    it("handles 3 elements with all ranges", () => {
      const values = [5, 2, 8]
      const rmq = new RangeMinimumQuery(values)
      expect(rmq.query(0, 2)).toEqual({ value: 2, index: 1 })
      expect(rmq.query(0, 1)).toEqual({ value: 2, index: 1 })
      expect(rmq.query(1, 2)).toEqual({ value: 2, index: 1 })
    })

    it("handles 7 elements (non-power-of-2)", () => {
      const values = [10, 3, 7, 1, 9, 4, 6]
      const rmq = new RangeMinimumQuery(values)
      for (let s = 0; s < values.length; s++) {
        for (let e = s; e < values.length; e++) {
          expect(rmq.query(s, e)).toEqual(bruteForceMin(values, s, e, defaultCmp))
        }
      }
    })

    it("handles 13 elements (prime)", () => {
      const values = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0, 11, 13, 12]
      const rmq = new RangeMinimumQuery(values)
      expect(rmq.query(0, 12)).toEqual({ value: 0, index: 9 })
      expect(rmq.query(0, 3)).toEqual({ value: 1, index: 3 })
    })

    it("handles duplicate minimum values", () => {
      const values = [5, 2, 8, 2, 9]
      const rmq = new RangeMinimumQuery(values)
      const result = rmq.query(0, 4)
      expect(result.value).toBe(2)
      expect(result.index).toBe(1)
    })
  })

  describe("error handling", () => {
    it("throws on query of empty array", () => {
      const rmq = new RangeMinimumQuery<number>([])
      expect(() => rmq.query(0, 0)).toThrow(RangeError)
    })

    it("throws on start > end", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      expect(() => rmq.query(2, 1)).toThrow(RangeError)
    })

    it("throws on negative start", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      expect(() => rmq.query(-1, 2)).toThrow(RangeError)
    })

    it("throws on end beyond array", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      expect(() => rmq.query(0, 3)).toThrow(RangeError)
    })

    it("throws on update with negative index", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      expect(() => rmq.update(-1, 0)).toThrow(RangeError)
    })

    it("throws on update with index out of bounds", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      expect(() => rmq.update(3, 0)).toThrow(RangeError)
    })

    it("throws on getValue with negative index", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      expect(() => rmq.getValue(-1)).toThrow(RangeError)
    })

    it("throws on getValue with index out of bounds", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      expect(() => rmq.getValue(3)).toThrow(RangeError)
    })

    it("error message includes range info", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      try {
        rmq.query(0, 5)
        expect.unreachable("Should have thrown")
      } catch (e) {
        expect(e).toBeInstanceOf(RangeError)
        expect((e as RangeError).message).toContain("0")
        expect((e as RangeError).message).toContain("5")
      }
    })
  })

  describe("size and isEmpty", () => {
    it("returns correct size", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3, 4, 5])
      expect(rmq.size()).toBe(5)
    })

    it("returns 0 for empty", () => {
      const rmq = new RangeMinimumQuery<number>([])
      expect(rmq.size()).toBe(0)
    })

    it("isEmpty returns true for empty", () => {
      const rmq = new RangeMinimumQuery<number>([])
      expect(rmq.isEmpty()).toBe(true)
    })

    it("isEmpty returns false for non-empty", () => {
      const rmq = new RangeMinimumQuery([1])
      expect(rmq.isEmpty()).toBe(false)
    })

    it("isEmpty returns false for multi-element", () => {
      const rmq = new RangeMinimumQuery([1, 2])
      expect(rmq.isEmpty()).toBe(false)
    })
  })

  describe("toArray", () => {
    it("returns copy of data", () => {
      const values = [3, 1, 4, 1, 5]
      const rmq = new RangeMinimumQuery(values)
      expect(rmq.toArray()).toEqual(values)
    })

    it("returns empty array for empty RMQ", () => {
      const rmq = new RangeMinimumQuery<number>([])
      expect(rmq.toArray()).toEqual([])
    })

    it("returns independent copy", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      const arr = rmq.toArray()
      arr[0] = 999
      expect(rmq.toArray()).toEqual([1, 2, 3])
    })

    it("reflects updates", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      rmq.update(1, 99)
      expect(rmq.toArray()).toEqual([1, 99, 3])
    })
  })

  describe("getValue", () => {
    it("returns value at index", () => {
      const rmq = new RangeMinimumQuery([10, 20, 30])
      expect(rmq.getValue(0)).toBe(10)
      expect(rmq.getValue(1)).toBe(20)
      expect(rmq.getValue(2)).toBe(30)
    })

    it("reflects updates", () => {
      const rmq = new RangeMinimumQuery([10, 20, 30])
      rmq.update(1, 99)
      expect(rmq.getValue(1)).toBe(99)
    })
  })

  describe("update", () => {
    it("updates single value and queries correctly", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8, 1, 4])
      rmq.update(0, 0)
      expect(rmq.query(0, 4)).toEqual({ value: 0, index: 0 })
    })

    it("updates value and adjacent queries work", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8, 1, 4])
      rmq.update(3, 10)
      expect(rmq.query(0, 4)).toEqual({ value: 3, index: 1 })
    })

    it("multiple updates work sequentially", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8, 1, 4])
      rmq.update(0, 100)
      rmq.update(1, 200)
      expect(rmq.query(0, 4)).toEqual({ value: 1, index: 3 })
    })

    it("update to same value works", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8])
      rmq.update(1, 3)
      expect(rmq.query(0, 2)).toEqual({ value: 3, index: 1 })
    })

    it("update at beginning of array", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8, 1])
      rmq.update(0, -1)
      expect(rmq.query(0, 3)).toEqual({ value: -1, index: 0 })
    })

    it("update at end of array", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8, 1])
      rmq.update(3, -1)
      expect(rmq.query(0, 3)).toEqual({ value: -1, index: 3 })
    })

    it("update with max comparator", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8, 1, 4], maxCmp)
      rmq.update(3, 100)
      expect(rmq.query(0, 4)).toEqual({ value: 100, index: 3 })
    })

    it("update preserves other values", () => {
      const rmq = new RangeMinimumQuery([10, 20, 30, 40])
      rmq.update(1, 25)
      expect(rmq.getValue(0)).toBe(10)
      expect(rmq.getValue(1)).toBe(25)
      expect(rmq.getValue(2)).toBe(30)
      expect(rmq.getValue(3)).toBe(40)
    })

    it("update does not change size", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      rmq.update(1, 99)
      expect(rmq.size()).toBe(3)
    })
  })

  describe("clone", () => {
    it("creates independent clone with same values", () => {
      const rmq = new RangeMinimumQuery([3, 1, 4, 1, 5])
      const cloned = rmq.clone()
      expect(cloned.toArray()).toEqual(rmq.toArray())
      expect(cloned.size()).toBe(rmq.size())
    })

    it("clone produces same query results", () => {
      const rmq = new RangeMinimumQuery([3, 1, 4, 1, 5])
      const cloned = rmq.clone()
      expect(cloned.query(0, 4)).toEqual(rmq.query(0, 4))
      expect(cloned.query(1, 3)).toEqual(rmq.query(1, 3))
    })

    it("clone preserves comparator", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3], maxCmp)
      const cloned = rmq.clone()
      expect(cloned.getComparator()).toBe(maxCmp)
    })

    it("clone is independent from original", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8, 1, 4])
      const cloned = rmq.clone()
      rmq.update(0, 100)
      expect(cloned.query(0, 4)).toEqual({ value: 1, index: 3 })
      expect(rmq.query(0, 4)).toEqual({ value: 1, index: 3 })
    })

    it("clone of empty RMQ", () => {
      const rmq = new RangeMinimumQuery<number>([])
      const cloned = rmq.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it("clone of single element", () => {
      const rmq = new RangeMinimumQuery([42])
      const cloned = rmq.clone()
      expect(cloned.query(0, 0)).toEqual({ value: 42, index: 0 })
    })
  })

  describe("getComparator", () => {
    it("returns default comparator when none provided", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      const cmp = rmq.getComparator()
      expect(cmp(1, 2)).toBeLessThan(0)
      expect(cmp(2, 1)).toBeGreaterThan(0)
      expect(cmp(1, 1)).toBe(0)
    })

    it("returns custom comparator", () => {
      const cmp: RMQComparator<number> = (a, b) => b - a
      const rmq = new RangeMinimumQuery([1, 2, 3], cmp)
      expect(rmq.getComparator()).toBe(cmp)
    })
  })

  describe("forEach", () => {
    it("iterates over all values in order", () => {
      const values = [3, 1, 4, 1, 5]
      const rmq = new RangeMinimumQuery(values)
      const collected: Array<{ value: number; index: number }> = []
      rmq.forEach((value, index) => {
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

    it("does not call callback for empty RMQ", () => {
      const rmq = new RangeMinimumQuery<number>([])
      let callCount = 0
      rmq.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it("iterates single element", () => {
      const rmq = new RangeMinimumQuery([42])
      const collected: number[] = []
      rmq.forEach((v) => collected.push(v))
      expect(collected).toEqual([42])
    })

    it("reflects updates", () => {
      const rmq = new RangeMinimumQuery([1, 2, 3])
      rmq.update(1, 99)
      const collected: number[] = []
      rmq.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 99, 3])
    })
  })

  describe("iterator", () => {
    it("is iterable with for-of", () => {
      const values = [3, 1, 4, 1, 5]
      const rmq = new RangeMinimumQuery(values)
      const collected: number[] = []
      for (const v of rmq) {
        collected.push(v)
      }
      expect(collected).toEqual(values)
    })

    it("spread operator works", () => {
      const values = [3, 1, 4, 1, 5]
      const rmq = new RangeMinimumQuery(values)
      expect([...rmq]).toEqual(values)
    })

    it("Array.from works", () => {
      const values = [3, 1, 4, 1, 5]
      const rmq = new RangeMinimumQuery(values)
      expect(Array.from(rmq)).toEqual(values)
    })

    it("empty RMQ yields nothing", () => {
      const rmq = new RangeMinimumQuery<number>([])
      expect([...rmq]).toEqual([])
    })

    it("clone is iterable", () => {
      const rmq = new RangeMinimumQuery([3, 1, 4])
      const cloned = rmq.clone()
      expect([...cloned]).toEqual([3, 1, 4])
    })
  })

  describe("RMQResult properties", () => {
    it("result has value property", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8])
      const result = rmq.query(0, 2)
      expect(result).toHaveProperty("value")
      expect(result.value).toBe(3)
    })

    it("result has index property", () => {
      const rmq = new RangeMinimumQuery([5, 3, 8])
      const result = rmq.query(0, 2)
      expect(result).toHaveProperty("index")
      expect(result.index).toBe(1)
    })

    it("result value matches data at index", () => {
      const rmq = new RangeMinimumQuery([10, 20, 5, 30])
      const result = rmq.query(0, 3)
      expect(result.value).toBe(rmq.getValue(result.index))
    })
  })

  describe("string values", () => {
    it("finds lexicographic minimum", () => {
      const values = ["cherry", "apple", "banana", "date"]
      const rmq = new RangeMinimumQuery(values, (a, b) => (a < b ? -1 : a > b ? 1 : 0))
      expect(rmq.query(0, 3)).toEqual({ value: "apple", index: 1 })
      expect(rmq.query(0, 0)).toEqual({ value: "cherry", index: 0 })
      expect(rmq.query(2, 3)).toEqual({ value: "banana", index: 2 })
    })

    it("finds lexicographic maximum", () => {
      const values = ["cherry", "apple", "banana", "date"]
      const rmq = new RangeMinimumQuery(values, (a, b) => (a > b ? -1 : a < b ? 1 : 0))
      expect(rmq.query(0, 3)).toEqual({ value: "date", index: 3 })
      expect(rmq.query(0, 2)).toEqual({ value: "cherry", index: 0 })
    })

    it("handles string update", () => {
      const rmq = new RangeMinimumQuery(
        ["c", "b", "a"],
        (a, b) => (a < b ? -1 : a > b ? 1 : 0),
      )
      rmq.update(2, "z")
      expect(rmq.query(0, 2)).toEqual({ value: "b", index: 1 })
    })
  })

  describe("stress tests", () => {
    it("1000 elements with min queries match brute force", () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
      const rmq = new RangeMinimumQuery(values)
      for (let trial = 0; trial < 200; trial++) {
        const left = Math.floor(Math.random() * values.length)
        const right = left + Math.floor(Math.random() * (values.length - left))
        const expected = bruteForceMin(values, left, right, defaultCmp)
        expect(rmq.query(left, right)).toEqual(expected)
      }
    })

    it("1000 elements with max queries match brute force", () => {
      const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000))
      const rmq = new RangeMinimumQuery(values, maxCmp)
      for (let trial = 0; trial < 200; trial++) {
        const left = Math.floor(Math.random() * values.length)
        const right = left + Math.floor(Math.random() * (values.length - left))
        const expected = bruteForceMin(values, left, right, maxCmp)
        expect(rmq.query(left, right)).toEqual(expected)
      }
    })

    it("random lengths from 1 to 100 with min queries", () => {
      for (let len = 1; len <= 100; len++) {
        const values = Array.from({ length: len }, () => Math.floor(Math.random() * 100))
        const rmq = new RangeMinimumQuery(values)
        const left = Math.floor(Math.random() * values.length)
        const right = left + Math.floor(Math.random() * (values.length - left))
        const expected = bruteForceMin(values, left, right, defaultCmp)
        expect(rmq.query(left, right)).toEqual(expected)
      }
    })

    it("power of 2 sized arrays with all possible ranges", () => {
      const values = [8, 3, 5, 1, 9, 2, 7, 4]
      const rmq = new RangeMinimumQuery(values)
      for (let left = 0; left < values.length; left++) {
        for (let right = left; right < values.length; right++) {
          expect(rmq.query(left, right)).toEqual(
            bruteForceMin(values, left, right, defaultCmp),
          )
        }
      }
    })

    it("stress with updates", () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80]
      const rmq = new RangeMinimumQuery(values)
      rmq.update(2, 5)
      expect(rmq.query(0, 7)).toEqual({ value: 5, index: 2 })
      rmq.update(0, 1)
      expect(rmq.query(0, 7)).toEqual({ value: 1, index: 0 })
      rmq.update(0, 100)
      expect(rmq.query(0, 7)).toEqual({ value: 5, index: 2 })
    })

    it("100 random updates and queries", () => {
      const values = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100))
      const rmq = new RangeMinimumQuery(values)
      for (let i = 0; i < 100; i++) {
        const idx = Math.floor(Math.random() * values.length)
        const newVal = Math.floor(Math.random() * 100)
        values[idx] = newVal
        rmq.update(idx, newVal)
        const left = Math.floor(Math.random() * values.length)
        const right = left + Math.floor(Math.random() * (values.length - left))
        const expected = bruteForceMin(values, left, right, defaultCmp)
        expect(rmq.query(left, right)).toEqual(expected)
      }
    })

    it("large array all ranges verified at every position", () => {
      const values = Array.from({ length: 50 }, (_, i) => (i * 7 + 3) % 100)
      const rmq = new RangeMinimumQuery(values)
      for (let left = 0; left < values.length; left++) {
        for (let right = left; right < values.length; right++) {
          expect(rmq.query(left, right)).toEqual(
            bruteForceMin(values, left, right, defaultCmp),
          )
        }
      }
    })
  })

  describe("repeated queries", () => {
    it("returns same result when called multiple times", () => {
      const rmq = new RangeMinimumQuery([3, 1, 4, 1, 5, 9, 2, 6])
      for (let i = 0; i < 10; i++) {
        expect(rmq.query(2, 6)).toEqual({ value: 1, index: 3 })
      }
    })

    it("queries are idempotent after many calls", () => {
      const rmq = new RangeMinimumQuery([5, 2, 8, 1, 9, 3, 7])
      const first = rmq.query(0, 6)
      for (let i = 0; i < 100; i++) {
        rmq.query(0, 6)
      }
      expect(rmq.query(0, 6)).toEqual(first)
    })
  })

  describe("query at every position", () => {
    it("single element query at every position", () => {
      const values = [10, 20, 30, 40, 50]
      const rmq = new RangeMinimumQuery(values)
      for (let i = 0; i < values.length; i++) {
        expect(rmq.query(i, i)).toEqual({ value: values[i]!, index: i })
      }
    })

    it("two element query at every position", () => {
      const values = [10, 20, 30, 40, 50]
      const rmq = new RangeMinimumQuery(values)
      for (let i = 0; i < values.length - 1; i++) {
        const result = rmq.query(i, i + 1)
        expect(result.value).toBe(Math.min(values[i]!, values[i + 1]!))
      }
    })

    it("full range query", () => {
      const values = [5, 2, 8, 1, 9]
      const rmq = new RangeMinimumQuery(values)
      expect(rmq.query(0, values.length - 1)).toEqual({ value: 1, index: 3 })
    })

    it("full range with max comparator", () => {
      const values = [5, 2, 8, 1, 9]
      const rmq = new RangeMinimumQuery(values, maxCmp)
      expect(rmq.query(0, values.length - 1)).toEqual({ value: 9, index: 4 })
    })
  })

  describe("first occurrence tie-breaking", () => {
    it("returns leftmost index when values are equal", () => {
      const rmq = new RangeMinimumQuery([2, 1, 1, 3])
      const result = rmq.query(0, 3)
      expect(result.value).toBe(1)
      expect(result.index).toBe(1)
    })

    it("returns leftmost index for all same values", () => {
      const rmq = new RangeMinimumQuery([5, 5, 5, 5])
      expect(rmq.query(0, 3).index).toBe(0)
      expect(rmq.query(1, 2).index).toBe(1)
      expect(rmq.query(2, 3).index).toBe(2)
    })

    it("tie-breaking with max comparator", () => {
      const rmq = new RangeMinimumQuery([3, 5, 5, 2], maxCmp)
      const result = rmq.query(0, 3)
      expect(result.value).toBe(5)
      expect(result.index).toBe(1)
    })
  })

  describe("update then query consistency", () => {
    it("update to new minimum changes result", () => {
      const rmq = new RangeMinimumQuery([10, 20, 30])
      rmq.update(1, 5)
      expect(rmq.query(0, 2)).toEqual({ value: 5, index: 1 })
    })

    it("update to new non-minimum preserves min", () => {
      const rmq = new RangeMinimumQuery([1, 20, 30])
      rmq.update(1, 15)
      expect(rmq.query(0, 2)).toEqual({ value: 1, index: 0 })
    })

    it("update removes old minimum", () => {
      const rmq = new RangeMinimumQuery([1, 20, 30])
      rmq.update(0, 100)
      expect(rmq.query(0, 2)).toEqual({ value: 20, index: 1 })
    })

    it("update on cloned RMQ does not affect original", () => {
      const rmq = new RangeMinimumQuery([10, 20, 30])
      const cloned = rmq.clone()
      cloned.update(0, 1)
      expect(rmq.query(0, 2)).toEqual({ value: 10, index: 0 })
      expect(cloned.query(0, 2)).toEqual({ value: 1, index: 0 })
    })

    it("toArray reflects updates before and after", () => {
      const rmq = new RangeMinimumQuery([10, 20, 30])
      expect(rmq.toArray()).toEqual([10, 20, 30])
      rmq.update(1, 99)
      expect(rmq.toArray()).toEqual([10, 99, 30])
    })

    it("forEach reflects updates", () => {
      const rmq = new RangeMinimumQuery([10, 20, 30])
      rmq.update(1, 99)
      const arr: number[] = []
      rmq.forEach((v) => arr.push(v))
      expect(arr).toEqual([10, 99, 30])
    })
  })

  describe("type safety", () => {
    it("works with generic number type", () => {
      const rmq: RangeMinimumQuery<number> = new RangeMinimumQuery([1, 2, 3])
      const result: RMQResult<number> = rmq.query(0, 2)
      expect(typeof result.value).toBe("number")
    })

    it("works with generic string type", () => {
      const rmq: RangeMinimumQuery<string> = new RangeMinimumQuery(
        ["a", "b", "c"],
        (a, b) => (a < b ? -1 : a > b ? 1 : 0),
      )
      const result: RMQResult<string> = rmq.query(0, 2)
      expect(typeof result.value).toBe("string")
    })
  })
})
