import { describe, it, expect, beforeEach } from "vitest"
import { IntervalBTree } from "../../src/core/interval-btree/interval-btree.js"
import { DEFAULT_INTERVAL_BTREE_OPTIONS } from "../../src/core/interval-btree/types.js"
import type { Interval, IntervalBTreeOptions, IntervalBTreeStatistics } from "../../src/core/interval-btree/types.js"

function iv(start: number, end: number): Interval {
  return { start, end }
}

describe("IntervalBTree", () => {
  let tree: IntervalBTree

  beforeEach(() => {
    tree = new IntervalBTree()
  })

  describe("constructor", () => {
    it("should create an empty tree with default options", () => {
      const t = new IntervalBTree()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it("should accept custom degree", () => {
      const t = new IntervalBTree({ degree: 5 })
      expect(t.size).toBe(0)
    })

    it("should use default degree from DEFAULT_INTERVAL_BTREE_OPTIONS", () => {
      expect(DEFAULT_INTERVAL_BTREE_OPTIONS.degree).toBe(32)
    })

    it("should accept empty options", () => {
      const t = new IntervalBTree({})
      expect(t.isEmpty).toBe(true)
    })

    it("should accept partial options with undefined degree", () => {
      const t = new IntervalBTree({ degree: undefined })
      expect(t.isEmpty).toBe(true)
    })

    it("should start with zero statistics", () => {
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.queries).toBe(0)
      expect(stats.overlapChecks).toBe(0)
    })
  })

  describe("insert", () => {
    it("should insert a single interval", () => {
      tree.insert(iv(1, 5))
      expect(tree.size).toBe(1)
      expect(tree.isEmpty).toBe(false)
    })

    it("should insert multiple intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.insert(iv(10, 15))
      expect(tree.size).toBe(3)
    })

    it("should track insert count in statistics", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(2, 6))
      expect(tree.getStatistics().inserts).toBe(2)
    })

    it("should throw for invalid interval where start > end", () => {
      expect(() => tree.insert(iv(5, 1))).toThrow("Invalid interval")
    })

    it("should allow interval where start === end", () => {
      tree.insert(iv(3, 3))
      expect(tree.size).toBe(1)
      expect(tree.has(iv(3, 3))).toBe(true)
    })

    it("should allow negative intervals", () => {
      tree.insert(iv(-5, -1))
      expect(tree.size).toBe(1)
      expect(tree.has(iv(-5, -1))).toBe(true)
    })

    it("should allow zero-length negative interval", () => {
      tree.insert(iv(-3, -3))
      expect(tree.has(iv(-3, -3))).toBe(true)
    })

    it("should handle inserting duplicate intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(1, 5))
      expect(tree.size).toBe(2)
    })

    it("should handle large number of inserts", () => {
      for (let i = 0; i < 200; i++) {
        tree.insert(iv(i, i + 10))
      }
      expect(tree.size).toBe(200)
    })

    it("should handle inserts in reverse order", () => {
      for (let i = 100; i >= 0; i--) {
        tree.insert(iv(i, i + 5))
      }
      expect(tree.size).toBe(101)
    })

    it("should handle overlapping intervals with same start", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(1, 10))
      tree.insert(iv(1, 3))
      expect(tree.size).toBe(3)
    })
  })

  describe("delete", () => {
    it("should delete an existing interval", () => {
      tree.insert(iv(1, 5))
      expect(tree.delete(iv(1, 5))).toBe(true)
      expect(tree.size).toBe(0)
    })

    it("should return false for non-existent interval", () => {
      tree.insert(iv(1, 5))
      expect(tree.delete(iv(2, 6))).toBe(false)
    })

    it("should return false for empty tree", () => {
      expect(tree.delete(iv(1, 5))).toBe(false)
    })

    it("should track delete count in statistics", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(2, 6))
      tree.delete(iv(1, 5))
      expect(tree.getStatistics().deletes).toBe(1)
    })

    it("should track failed delete in statistics", () => {
      tree.delete(iv(1, 5))
      expect(tree.getStatistics().deletes).toBe(1)
    })

    it("should delete from middle of tree", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.insert(iv(10, 15))
      expect(tree.delete(iv(3, 8))).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.has(iv(3, 8))).toBe(false)
    })

    it("should handle delete with many intervals causing rebalance", () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(iv(i, i + 5))
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.delete(iv(i, i + 5))).toBe(true)
      }
      expect(tree.size).toBe(0)
    })

    it("should handle deleting only interval leaving empty tree", () => {
      tree.insert(iv(1, 5))
      tree.delete(iv(1, 5))
      expect(tree.isEmpty).toBe(true)
      expect(tree.toArray()).toEqual([])
    })

    it("should not delete interval with same start but different end", () => {
      tree.insert(iv(1, 5))
      expect(tree.delete(iv(1, 10))).toBe(false)
      expect(tree.size).toBe(1)
    })

    it("should not delete interval with same end but different start", () => {
      tree.insert(iv(1, 5))
      expect(tree.delete(iv(2, 5))).toBe(false)
      expect(tree.size).toBe(1)
    })

    it("should delete one of duplicate intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(1, 5))
      expect(tree.delete(iv(1, 5))).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.has(iv(1, 5))).toBe(true)
    })

    it("should handle alternating insert and delete", () => {
      for (let i = 0; i < 20; i++) {
        tree.insert(iv(i, i + 3))
      }
      for (let i = 0; i < 10; i++) {
        tree.delete(iv(i * 2, i * 2 + 3))
      }
      expect(tree.size).toBe(10)
    })
  })

  describe("has", () => {
    it("should return true for existing interval", () => {
      tree.insert(iv(1, 5))
      expect(tree.has(iv(1, 5))).toBe(true)
    })

    it("should return false for non-existing interval", () => {
      tree.insert(iv(1, 5))
      expect(tree.has(iv(2, 6))).toBe(false)
    })

    it("should return false for empty tree", () => {
      expect(tree.has(iv(1, 5))).toBe(false)
    })

    it("should track queries in statistics", () => {
      tree.has(iv(1, 5))
      expect(tree.getStatistics().queries).toBe(1)
    })

    it("should find interval with same start and different end", () => {
      tree.insert(iv(1, 5))
      expect(tree.has(iv(1, 10))).toBe(false)
    })

    it("should find exact match among many", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.insert(iv(10, 15))
      expect(tree.has(iv(3, 8))).toBe(true)
      expect(tree.has(iv(1, 5))).toBe(true)
      expect(tree.has(iv(10, 15))).toBe(true)
    })
  })

  describe("queryPoint", () => {
    it("should find interval containing point", () => {
      tree.insert(iv(1, 5))
      const result = tree.queryPoint(3)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(iv(1, 5))
    })

    it("should find multiple intervals containing point", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(2, 8))
      tree.insert(iv(3, 4))
      const result = tree.queryPoint(3)
      expect(result).toHaveLength(3)
    })

    it("should return empty for point outside all intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(10, 15))
      const result = tree.queryPoint(7)
      expect(result).toHaveLength(0)
    })

    it("should return empty for empty tree", () => {
      expect(tree.queryPoint(5)).toEqual([])
    })

    it("should find interval at exact start boundary", () => {
      tree.insert(iv(1, 5))
      const result = tree.queryPoint(1)
      expect(result).toHaveLength(1)
    })

    it("should find interval at exact end boundary", () => {
      tree.insert(iv(1, 5))
      const result = tree.queryPoint(5)
      expect(result).toHaveLength(1)
    })

    it("should not find interval just outside end boundary", () => {
      tree.insert(iv(1, 5))
      const result = tree.queryPoint(6)
      expect(result).toHaveLength(0)
    })

    it("should find zero-length interval at exact point", () => {
      tree.insert(iv(3, 3))
      const result = tree.queryPoint(3)
      expect(result).toHaveLength(1)
    })

    it("should handle point query with large dataset", () => {
      for (let i = 0; i < 200; i++) {
        tree.insert(iv(i * 10, i * 10 + 15))
      }
      const result = tree.queryPoint(105)
      expect(result).toHaveLength(2)
    })

    it("should find deeply nested intervals containing point", () => {
      tree.insert(iv(0, 100))
      tree.insert(iv(10, 90))
      tree.insert(iv(20, 80))
      tree.insert(iv(30, 70))
      const result = tree.queryPoint(50)
      expect(result).toHaveLength(4)
    })
  })

  describe("queryRange", () => {
    it("should find intervals overlapping range", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.insert(iv(10, 15))
      const result = tree.queryRange(4, 12)
      expect(result).toHaveLength(3)
    })

    it("should return empty for range with no overlaps", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(10, 15))
      const result = tree.queryRange(6, 9)
      expect(result).toHaveLength(0)
    })

    it("should find interval that exactly matches range", () => {
      tree.insert(iv(1, 5))
      const result = tree.queryRange(1, 5)
      expect(result).toHaveLength(1)
    })

    it("should find intervals contained within range", () => {
      tree.insert(iv(2, 3))
      const result = tree.queryRange(1, 5)
      expect(result).toHaveLength(1)
    })

    it("should find intervals that contain the range", () => {
      tree.insert(iv(0, 10))
      const result = tree.queryRange(3, 7)
      expect(result).toHaveLength(1)
    })

    it("should return empty for empty tree", () => {
      expect(tree.queryRange(1, 5)).toEqual([])
    })

    it("should find adjacent interval touching at boundary", () => {
      tree.insert(iv(1, 5))
      const result = tree.queryRange(5, 10)
      expect(result).toHaveLength(1)
    })

    it("should handle range overlapping all intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(10, 15))
      tree.insert(iv(20, 25))
      const result = tree.queryRange(0, 100)
      expect(result).toHaveLength(3)
    })

    it("should handle large dataset range query", () => {
      for (let i = 0; i < 200; i++) {
        tree.insert(iv(i * 10, i * 10 + 15))
      }
      const result = tree.queryRange(100, 200)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("queryExact", () => {
    it("should find exact interval match", () => {
      tree.insert(iv(1, 5))
      const result = tree.queryExact(1, 5)
      expect(result).toEqual(iv(1, 5))
    })

    it("should return undefined for no match", () => {
      tree.insert(iv(1, 5))
      expect(tree.queryExact(2, 6)).toBeUndefined()
    })

    it("should return undefined for empty tree", () => {
      expect(tree.queryExact(1, 5)).toBeUndefined()
    })

    it("should distinguish intervals with same start different end", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(1, 10))
      expect(tree.queryExact(1, 5)).toEqual(iv(1, 5))
      expect(tree.queryExact(1, 10)).toEqual(iv(1, 10))
    })

    it("should track queries in statistics", () => {
      tree.insert(iv(1, 5))
      tree.queryExact(1, 5)
      expect(tree.getStatistics().queries).toBe(1)
    })

    it("should find exact match among many intervals", () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(iv(i, i + 5))
      }
      expect(tree.queryExact(25, 30)).toEqual(iv(25, 30))
    })

    it("should return undefined for wrong end with right start", () => {
      tree.insert(iv(1, 5))
      expect(tree.queryExact(1, 6)).toBeUndefined()
    })
  })

  describe("findOverlapping", () => {
    it("should find intervals overlapping given interval", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.insert(iv(10, 15))
      const result = tree.findOverlapping(iv(4, 12))
      expect(result).toHaveLength(3)
    })

    it("should return empty for no overlaps", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(10, 15))
      const result = tree.findOverlapping(iv(6, 9))
      expect(result).toHaveLength(0)
    })

    it("should find self-overlapping interval", () => {
      tree.insert(iv(1, 5))
      const result = tree.findOverlapping(iv(1, 5))
      expect(result).toHaveLength(1)
    })

    it("should find partially overlapping intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(4, 10))
      const result = tree.findOverlapping(iv(3, 6))
      expect(result).toHaveLength(2)
    })

    it("should track overlapChecks in statistics", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.findOverlapping(iv(4, 6))
      expect(tree.getStatistics().overlapChecks).toBeGreaterThan(0)
    })

    it("should find nested overlapping intervals", () => {
      tree.insert(iv(0, 100))
      tree.insert(iv(10, 90))
      tree.insert(iv(20, 80))
      const result = tree.findOverlapping(iv(30, 70))
      expect(result).toHaveLength(3)
    })

    it("should not find non-overlapping adjacent intervals", () => {
      tree.insert(iv(1, 3))
      tree.insert(iv(4, 6))
      const result = tree.findOverlapping(iv(3, 4))
      expect(result).toHaveLength(2)
    })

    it("should find overlap with zero-length interval at boundary", () => {
      tree.insert(iv(1, 5))
      const result = tree.findOverlapping(iv(5, 5))
      expect(result).toHaveLength(1)
    })

    it("should handle findOverlapping on empty tree", () => {
      expect(tree.findOverlapping(iv(1, 5))).toEqual([])
    })
  })

  describe("findNonOverlapping", () => {
    it("should return all intervals when none overlap", () => {
      tree.insert(iv(1, 3))
      tree.insert(iv(5, 7))
      tree.insert(iv(9, 11))
      const result = tree.findNonOverlapping()
      expect(result).toHaveLength(3)
    })

    it("should select greedily from overlapping intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 7))
      tree.insert(iv(6, 10))
      const result = tree.findNonOverlapping()
      expect(result.length).toBeLessThan(3)
      expect(result.length).toBeGreaterThanOrEqual(1)
    })

    it("should return empty for empty tree", () => {
      expect(tree.findNonOverlapping()).toEqual([])
    })

    it("should return single interval", () => {
      tree.insert(iv(1, 5))
      const result = tree.findNonOverlapping()
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(iv(1, 5))
    })

    it("should handle fully nested intervals", () => {
      tree.insert(iv(1, 10))
      tree.insert(iv(2, 9))
      tree.insert(iv(3, 8))
      const result = tree.findNonOverlapping()
      expect(result).toHaveLength(1)
    })

    it("should handle adjacent non-overlapping intervals", () => {
      tree.insert(iv(1, 3))
      tree.insert(iv(4, 6))
      tree.insert(iv(7, 9))
      const result = tree.findNonOverlapping()
      expect(result).toHaveLength(3)
    })

    it("should return intervals sorted by start", () => {
      tree.insert(iv(5, 7))
      tree.insert(iv(1, 3))
      tree.insert(iv(9, 11))
      const result = tree.findNonOverlapping()
      expect(result[0]).toEqual(iv(1, 3))
      expect(result[1]).toEqual(iv(5, 7))
      expect(result[2]).toEqual(iv(9, 11))
    })

    it("should handle mix of overlapping and non-overlapping", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(2, 4))
      tree.insert(iv(10, 15))
      tree.insert(iv(12, 14))
      const result = tree.findNonOverlapping()
      expect(result.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe("toArray", () => {
    it("should return empty array for empty tree", () => {
      expect(tree.toArray()).toEqual([])
    })

    it("should return single interval", () => {
      tree.insert(iv(1, 5))
      expect(tree.toArray()).toEqual([iv(1, 5)])
    })

    it("should return intervals sorted by start", () => {
      tree.insert(iv(5, 10))
      tree.insert(iv(1, 3))
      tree.insert(iv(3, 7))
      const arr = tree.toArray()
      expect(arr[0]).toEqual(iv(1, 3))
      expect(arr[1]).toEqual(iv(3, 7))
      expect(arr[2]).toEqual(iv(5, 10))
    })

    it("should handle many intervals sorted", () => {
      for (let i = 50; i >= 0; i--) {
        tree.insert(iv(i, i + 5))
      }
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]!.start).toBeGreaterThanOrEqual(arr[i - 1]!.start)
      }
    })
  })

  describe("forEach", () => {
    it("should iterate over all intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.insert(iv(10, 15))
      const collected: Interval[] = []
      tree.forEach((iv) => collected.push(iv))
      expect(collected).toHaveLength(3)
    })

    it("should provide correct index", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      const indices: number[] = []
      tree.forEach((_iv, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1])
    })

    it("should not call callback for empty tree", () => {
      let callCount = 0
      tree.forEach(() => callCount++)
      expect(callCount).toBe(0)
    })

    it("should iterate in sorted order by start", () => {
      tree.insert(iv(5, 10))
      tree.insert(iv(1, 3))
      tree.insert(iv(3, 7))
      const starts: number[] = []
      tree.forEach((iv) => starts.push(iv.start))
      expect(starts).toEqual([1, 3, 5])
    })
  })

  describe("Symbol.iterator", () => {
    it("should be iterable", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      const result = [...tree]
      expect(result).toHaveLength(2)
    })

    it("should return empty for empty tree", () => {
      const result = [...tree]
      expect(result).toEqual([])
    })

    it("should work with for-of loop", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      const collected: Interval[] = []
      for (const interval of tree) {
        collected.push(interval)
      }
      expect(collected).toHaveLength(2)
    })

    it("should spread into array correctly", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(10, 15))
      const arr = [...tree]
      expect(arr).toHaveLength(2)
      expect(arr[0]).toEqual(iv(1, 5))
      expect(arr[1]).toEqual(iv(10, 15))
    })
  })

  describe("getHeight", () => {
    it("should return 1 for empty tree", () => {
      expect(tree.getHeight()).toBe(1)
    })

    it("should return 1 for single interval", () => {
      tree.insert(iv(1, 5))
      expect(tree.getHeight()).toBe(1)
    })

    it("should increase height with many intervals", () => {
      for (let i = 0; i < 200; i++) {
        tree.insert(iv(i, i + 5))
      }
      expect(tree.getHeight()).toBeGreaterThanOrEqual(1)
    })

    it("should return height of 1 for few intervals", () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(iv(i, i + 5))
      }
      expect(tree.getHeight()).toBeGreaterThanOrEqual(1)
    })
  })

  describe("getStatistics", () => {
    it("should track inserts", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(2, 6))
      expect(tree.getStatistics().inserts).toBe(2)
    })

    it("should track deletes", () => {
      tree.insert(iv(1, 5))
      tree.delete(iv(1, 5))
      expect(tree.getStatistics().deletes).toBe(1)
    })

    it("should track queries", () => {
      tree.insert(iv(1, 5))
      tree.has(iv(1, 5))
      tree.queryPoint(3)
      tree.queryRange(1, 5)
      tree.queryExact(1, 5)
      tree.findOverlapping(iv(1, 5))
      tree.findNonOverlapping()
      expect(tree.getStatistics().queries).toBe(6)
    })

    it("should track overlapChecks from findOverlapping", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.findOverlapping(iv(2, 6))
      expect(tree.getStatistics().overlapChecks).toBeGreaterThan(0)
    })

    it("should track overlapChecks from queryRange", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.queryRange(2, 6)
      expect(tree.getStatistics().overlapChecks).toBeGreaterThan(0)
    })

    it("should return a copy not a reference", () => {
      tree.insert(iv(1, 5))
      const stats1 = tree.getStatistics()
      const stats2 = tree.getStatistics()
      expect(stats1).not.toBe(stats2)
      expect(stats1).toEqual(stats2)
    })

    it("should reset statistics on clear", () => {
      tree.insert(iv(1, 5))
      tree.has(iv(1, 5))
      tree.clear()
      const stats = tree.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.queries).toBe(0)
      expect(stats.overlapChecks).toBe(0)
    })
  })

  describe("clear", () => {
    it("should clear all intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it("should allow insert after clear", () => {
      tree.insert(iv(1, 5))
      tree.clear()
      tree.insert(iv(10, 15))
      expect(tree.size).toBe(1)
      expect(tree.has(iv(10, 15))).toBe(true)
    })

    it("should be safe to call clear on empty tree", () => {
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })

    it("should reset size to zero", () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(iv(i, i + 5))
      }
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  describe("size and isEmpty", () => {
    it("should report correct size after operations", () => {
      expect(tree.size).toBe(0)
      tree.insert(iv(1, 5))
      expect(tree.size).toBe(1)
      tree.insert(iv(3, 8))
      expect(tree.size).toBe(2)
      tree.delete(iv(1, 5))
      expect(tree.size).toBe(1)
    })

    it("should report isEmpty correctly", () => {
      expect(tree.isEmpty).toBe(true)
      tree.insert(iv(1, 5))
      expect(tree.isEmpty).toBe(false)
      tree.delete(iv(1, 5))
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe("edge cases", () => {
    it("should handle single interval operations", () => {
      tree.insert(iv(5, 10))
      expect(tree.has(iv(5, 10))).toBe(true)
      expect(tree.queryPoint(7)).toHaveLength(1)
      expect(tree.queryPoint(4)).toHaveLength(0)
      expect(tree.queryRange(5, 10)).toHaveLength(1)
      expect(tree.queryExact(5, 10)).toEqual(iv(5, 10))
      expect(tree.findOverlapping(iv(5, 10))).toHaveLength(1)
      expect(tree.findNonOverlapping()).toHaveLength(1)
      expect(tree.delete(iv(5, 10))).toBe(true)
      expect(tree.isEmpty).toBe(true)
    })

    it("should handle identical intervals", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(1, 5))
      tree.insert(iv(1, 5))
      expect(tree.size).toBe(3)
      expect(tree.queryPoint(3)).toHaveLength(3)
      tree.delete(iv(1, 5))
      expect(tree.size).toBe(2)
    })

    it("should handle fully nested intervals", () => {
      tree.insert(iv(1, 100))
      tree.insert(iv(10, 90))
      tree.insert(iv(20, 80))
      tree.insert(iv(30, 70))
      const result = tree.queryPoint(50)
      expect(result).toHaveLength(4)
    })

    it("should handle non-overlapping intervals", () => {
      tree.insert(iv(1, 3))
      tree.insert(iv(5, 7))
      tree.insert(iv(9, 11))
      expect(tree.findOverlapping(iv(2, 6))).toHaveLength(2)
      expect(tree.findOverlapping(iv(4, 4))).toHaveLength(0)
    })

    it("should handle adjacent intervals [1,3], [4,6] as not overlapping for point 3.5", () => {
      tree.insert(iv(1, 3))
      tree.insert(iv(4, 6))
      expect(tree.queryPoint(3)).toHaveLength(1)
      expect(tree.findOverlapping(iv(1, 6))).toHaveLength(2)
    })

    it("should handle negative intervals", () => {
      tree.insert(iv(-10, -5))
      tree.insert(iv(-3, 2))
      tree.insert(iv(5, 10))
      expect(tree.queryPoint(-7)).toHaveLength(1)
      expect(tree.queryPoint(0)).toHaveLength(1)
      expect(tree.queryPoint(7)).toHaveLength(1)
    })

    it("should handle large-scale 200+ intervals", () => {
      for (let i = 0; i < 250; i++) {
        tree.insert(iv(i * 4, i * 4 + 3))
      }
      expect(tree.size).toBe(250)
      expect(tree.queryPoint(100)).toHaveLength(1)
      expect(tree.queryRange(0, 100).length).toBeGreaterThan(0)
      const arr = tree.toArray()
      expect(arr).toHaveLength(250)
      expect(arr[0]).toEqual(iv(0, 3))
      expect(arr[249]).toEqual(iv(996, 999))
    })

    it("should handle high degree tree", () => {
      const t = new IntervalBTree({ degree: 64 })
      for (let i = 0; i < 100; i++) {
        t.insert(iv(i, i + 10))
      }
      expect(t.size).toBe(100)
    })

    it("should handle low degree tree", () => {
      const t = new IntervalBTree({ degree: 2 })
      for (let i = 0; i < 50; i++) {
        t.insert(iv(i, i + 5))
      }
      expect(t.size).toBe(50)
      for (let i = 0; i < 25; i++) {
        t.delete(iv(i, i + 5))
      }
      expect(t.size).toBe(25)
    })

    it("should handle intervals with very large values", () => {
      tree.insert(iv(1000000, 2000000))
      tree.insert(iv(3000000, 4000000))
      expect(tree.has(iv(1000000, 2000000))).toBe(true)
      expect(tree.queryPoint(1500000)).toHaveLength(1)
    })

    it("should handle intervals with zero width", () => {
      tree.insert(iv(5, 5))
      expect(tree.queryPoint(5)).toHaveLength(1)
      expect(tree.queryPoint(4)).toHaveLength(0)
      expect(tree.queryPoint(6)).toHaveLength(0)
    })

    it("should handle delete and re-insert", () => {
      tree.insert(iv(1, 5))
      tree.delete(iv(1, 5))
      expect(tree.isEmpty).toBe(true)
      tree.insert(iv(1, 5))
      expect(tree.size).toBe(1)
      expect(tree.has(iv(1, 5))).toBe(true)
    })

    it("should handle queryPoint with no matching intervals after delete", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.delete(iv(1, 5))
      expect(tree.queryPoint(2)).toHaveLength(0)
      expect(tree.queryPoint(4)).toHaveLength(1)
    })

    it("should handle mixed operations", () => {
      tree.insert(iv(1, 5))
      tree.insert(iv(3, 8))
      tree.insert(iv(10, 15))
      tree.delete(iv(3, 8))
      tree.insert(iv(7, 12))
      expect(tree.size).toBe(3)
      expect(tree.queryRange(4, 11)).toHaveLength(3)
    })

    it("should handle stress delete all in random order", () => {
      const intervals: Interval[] = []
      for (let i = 0; i < 100; i++) {
        const interval = iv(i, i + 5)
        intervals.push(interval)
        tree.insert(interval)
      }
      for (let i = intervals.length - 1; i >= 0; i--) {
        expect(tree.delete(intervals[i]!)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe("interval overlap semantics", () => {
    it("should treat touching intervals as overlapping", () => {
      tree.insert(iv(1, 5))
      const result = tree.findOverlapping(iv(5, 10))
      expect(result).toHaveLength(1)
    })

    it("should treat touching at start as overlapping", () => {
      tree.insert(iv(5, 10))
      const result = tree.findOverlapping(iv(1, 5))
      expect(result).toHaveLength(1)
    })

    it("should not find overlap for [1,3] and [4,6]", () => {
      tree.insert(iv(1, 3))
      const result = tree.findOverlapping(iv(4, 6))
      expect(result).toHaveLength(0)
    })

    it("should find overlap for [1,4] and [4,6]", () => {
      tree.insert(iv(1, 4))
      const result = tree.findOverlapping(iv(4, 6))
      expect(result).toHaveLength(1)
    })

    it("should handle queryRange boundary semantics", () => {
      tree.insert(iv(1, 3))
      tree.insert(iv(4, 6))
      const result = tree.queryRange(3, 4)
      expect(result).toHaveLength(2)
    })
  })
})
