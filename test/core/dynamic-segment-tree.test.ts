import { describe, it, expect } from "vitest"
import { DynamicSegmentTree } from "../../src/core/dynamic-segment-tree/dynamic-segment-tree.js"

describe("DynamicSegmentTree", () => {
  describe("constructor", () => {
    it("creates a tree with valid range", () => {
      const tree = new DynamicSegmentTree(0, 100)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it("creates a tree with single element range", () => {
      const tree = new DynamicSegmentTree(5, 5)
      expect(tree.size()).toBe(0)
    })

    it("creates a tree with negative range", () => {
      const tree = new DynamicSegmentTree(-10, 10)
      expect(tree.size()).toBe(0)
    })

    it("throws when minRange > maxRange", () => {
      expect(() => new DynamicSegmentTree(10, 5)).toThrow("minRange must be <= maxRange")
    })

    it("creates a tree with large range", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000_000)
      expect(tree.isEmpty()).toBe(true)
    })

    it("creates a tree with range starting at negative", () => {
      const tree = new DynamicSegmentTree(-1000, -1)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe("update (set)", () => {
    it("sets a value at an index", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      expect(tree.queryPoint(5)).toBe(42)
      expect(tree.size()).toBe(1)
    })

    it("overwrites an existing value", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(3, 10)
      tree.update(3, 20)
      expect(tree.queryPoint(3)).toBe(20)
      expect(tree.size()).toBe(1)
    })

    it("sets multiple values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(3, 20)
      tree.update(5, 30)
      expect(tree.size()).toBe(3)
      expect(tree.query(0, 10)).toBe(60)
    })

    it("sets value to zero removes element from count", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      expect(tree.size()).toBe(1)
      tree.update(5, 0)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it("throws on index below range", () => {
      const tree = new DynamicSegmentTree(5, 10)
      expect(() => tree.update(4, 1)).toThrow(RangeError)
    })

    it("throws on index above range", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(() => tree.update(11, 1)).toThrow(RangeError)
    })

    it("handles negative values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(3, -15)
      expect(tree.queryPoint(3)).toBe(-15)
    })

    it("handles floating point values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(3, 3.14)
      expect(tree.queryPoint(3)).toBeCloseTo(3.14)
    })

    it("sets value at min range boundary", () => {
      const tree = new DynamicSegmentTree(5, 15)
      tree.update(5, 100)
      expect(tree.queryPoint(5)).toBe(100)
    })

    it("sets value at max range boundary", () => {
      const tree = new DynamicSegmentTree(5, 15)
      tree.update(15, 100)
      expect(tree.queryPoint(15)).toBe(100)
    })

    it("updates at index 0 in large range", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000_000)
      tree.update(0, 7)
      expect(tree.queryPoint(0)).toBe(7)
    })

    it("updates at max index in large range", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000_000)
      tree.update(1_000_000_000, 7)
      expect(tree.queryPoint(1_000_000_000)).toBe(7)
    })
  })

  describe("add", () => {
    it("adds to a fresh index", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.add(5, 10)
      expect(tree.queryPoint(5)).toBe(10)
    })

    it("adds to an existing value", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 10)
      tree.add(5, 5)
      expect(tree.queryPoint(5)).toBe(15)
    })

    it("adds negative value", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 10)
      tree.add(5, -3)
      expect(tree.queryPoint(5)).toBe(7)
    })

    it("adds multiple times to same index", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.add(3, 1)
      tree.add(3, 2)
      tree.add(3, 3)
      expect(tree.queryPoint(3)).toBe(6)
    })

    it("throws on index out of range", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(() => tree.add(-1, 1)).toThrow(RangeError)
      expect(() => tree.add(11, 1)).toThrow(RangeError)
    })

    it("add zero does not change count from empty", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.add(5, 0)
      expect(tree.isEmpty()).toBe(true)
    })

    it("adding negative to zero keeps zero count", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.add(5, 0)
      expect(tree.size()).toBe(0)
    })
  })

  describe("query (range sum)", () => {
    it("returns 0 for empty tree range", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(tree.query(0, 10)).toBe(0)
    })

    it("returns single value for single element range", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      expect(tree.query(5, 5)).toBe(42)
    })

    it("sums a range correctly", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(2, 20)
      tree.update(3, 30)
      expect(tree.query(1, 3)).toBe(60)
    })

    it("returns 0 for range with no values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(9, 20)
      expect(tree.query(3, 5)).toBe(0)
    })

    it("handles full range query", () => {
      const tree = new DynamicSegmentTree(0, 5)
      tree.update(0, 1)
      tree.update(1, 2)
      tree.update(2, 3)
      tree.update(3, 4)
      tree.update(4, 5)
      tree.update(5, 6)
      expect(tree.query(0, 5)).toBe(21)
    })

    it("throws when left > right", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(() => tree.query(5, 3)).toThrow("Left bound must be <= right bound")
    })

    it("throws when range out of bounds", () => {
      const tree = new DynamicSegmentTree(5, 15)
      expect(() => tree.query(4, 10)).toThrow(RangeError)
      expect(() => tree.query(10, 16)).toThrow(RangeError)
    })

    it("sums values with negative numbers", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(2, -5)
      tree.update(3, 3)
      expect(tree.query(1, 3)).toBe(8)
    })
  })

  describe("queryPoint", () => {
    it("returns 0 for unset index", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(tree.queryPoint(5)).toBe(0)
    })

    it("returns value for set index", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      expect(tree.queryPoint(5)).toBe(42)
    })

    it("throws on out of range index", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(() => tree.queryPoint(-1)).toThrow(RangeError)
      expect(() => tree.queryPoint(11)).toThrow(RangeError)
    })

    it("returns 0 for index never touched in large range", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000_000)
      expect(tree.queryPoint(500_000_000)).toBe(0)
    })
  })

  describe("rangeMin", () => {
    it("returns Infinity for empty range", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(tree.rangeMin(0, 10)).toBe(Infinity)
    })

    it("finds min of single value", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      expect(tree.rangeMin(0, 10)).toBe(42)
    })

    it("finds min of multiple values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(3, -5)
      tree.update(5, 7)
      expect(tree.rangeMin(0, 10)).toBe(-5)
    })

    it("finds min within subrange", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(3, -5)
      tree.update(5, 7)
      expect(tree.rangeMin(0, 2)).toBe(10)
    })

    it("returns Infinity for subrange with no values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(9, 20)
      expect(tree.rangeMin(3, 5)).toBe(Infinity)
    })

    it("throws when left > right", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(() => tree.rangeMin(5, 3)).toThrow()
    })

    it("throws when out of bounds", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(() => tree.rangeMin(-1, 5)).toThrow(RangeError)
    })
  })

  describe("rangeMax", () => {
    it("returns -Infinity for empty range", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(tree.rangeMax(0, 10)).toBe(-Infinity)
    })

    it("finds max of single value", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      expect(tree.rangeMax(0, 10)).toBe(42)
    })

    it("finds max of multiple values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(3, -5)
      tree.update(5, 100)
      expect(tree.rangeMax(0, 10)).toBe(100)
    })

    it("finds max within subrange", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(3, 50)
      tree.update(5, 100)
      expect(tree.rangeMax(0, 3)).toBe(50)
    })

    it("returns -Infinity for subrange with no values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(9, 20)
      expect(tree.rangeMax(3, 5)).toBe(-Infinity)
    })

    it("throws when left > right", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(() => tree.rangeMax(5, 3)).toThrow()
    })

    it("throws when out of bounds", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(() => tree.rangeMax(0, 11)).toThrow(RangeError)
    })
  })

  describe("size and isEmpty", () => {
    it("returns 0 for empty tree", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it("tracks size after updates", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
      tree.update(2, 20)
      expect(tree.size()).toBe(2)
    })

    it("decrements size when value set to 0", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(2, 20)
      tree.update(1, 0)
      expect(tree.size()).toBe(1)
    })

    it("size stays same when overwriting nonzero with nonzero", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(1, 20)
      expect(tree.size()).toBe(1)
    })
  })

  describe("toArray", () => {
    it("returns empty array for empty tree", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(tree.toArray()).toEqual([])
    })

    it("returns single pair", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      expect(tree.toArray()).toEqual([[5, 42]])
    })

    it("returns sorted pairs", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(7, 70)
      tree.update(3, 30)
      tree.update(1, 10)
      expect(tree.toArray()).toEqual([
        [1, 10],
        [3, 30],
        [7, 70],
      ])
    })

    it("excludes zero values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(3, 30)
      tree.update(5, 50)
      tree.update(3, 0)
      expect(tree.toArray()).toEqual([[5, 50]])
    })
  })

  describe("toString", () => {
    it("returns empty representation", () => {
      const tree = new DynamicSegmentTree(0, 10)
      expect(tree.toString()).toBe("DynamicSegmentTree(empty)")
    })

    it("returns single element representation", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      expect(tree.toString()).toBe("DynamicSegmentTree{[5]:42}")
    })

    it("returns multiple element representation", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(3, 30)
      const str = tree.toString()
      expect(str).toContain("[1]:10")
      expect(str).toContain("[3]:30")
    })
  })

  describe("clone", () => {
    it("creates an independent copy", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      const copy = tree.clone()
      expect(copy.queryPoint(5)).toBe(42)
      expect(copy.size()).toBe(1)
    })

    it("modifications to clone do not affect original", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      const copy = tree.clone()
      copy.update(5, 100)
      expect(tree.queryPoint(5)).toBe(42)
      expect(copy.queryPoint(5)).toBe(100)
    })

    it("modifications to original do not affect clone", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      const copy = tree.clone()
      tree.update(5, 100)
      expect(copy.queryPoint(5)).toBe(42)
      expect(tree.queryPoint(5)).toBe(100)
    })

    it("clones empty tree", () => {
      const tree = new DynamicSegmentTree(0, 10)
      const copy = tree.clone()
      expect(copy.isEmpty()).toBe(true)
      expect(copy.size()).toBe(0)
    })

    it("clone preserves range", () => {
      const tree = new DynamicSegmentTree(5, 15)
      tree.update(10, 42)
      const copy = tree.clone()
      expect(() => copy.update(4, 1)).toThrow(RangeError)
      expect(() => copy.update(16, 1)).toThrow(RangeError)
    })

    it("clone has independent add operations", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(3, 10)
      const copy = tree.clone()
      copy.add(3, 5)
      expect(tree.queryPoint(3)).toBe(10)
      expect(copy.queryPoint(3)).toBe(15)
    })

    it("clone of clone works", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      const copy1 = tree.clone()
      const copy2 = copy1.clone()
      copy1.update(5, 0)
      expect(tree.queryPoint(5)).toBe(42)
      expect(copy1.queryPoint(5)).toBe(0)
      expect(copy2.queryPoint(5)).toBe(42)
    })
  })

  describe("reset", () => {
    it("clears all data", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(2, 20)
      tree.update(3, 30)
      tree.reset()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.query(0, 10)).toBe(0)
    })

    it("allows operations after reset", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      tree.reset()
      tree.update(3, 99)
      expect(tree.queryPoint(3)).toBe(99)
      expect(tree.size()).toBe(1)
    })

    it("reset on empty tree is no-op", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.reset()
      expect(tree.isEmpty()).toBe(true)
    })

    it("toArray returns empty after reset", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.reset()
      expect(tree.toArray()).toEqual([])
    })
  })

  describe("sparse data on large ranges", () => {
    it("handles sparse updates on range 0 to 10^9", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000_000)
      tree.update(0, 1)
      tree.update(500_000_000, 2)
      tree.update(1_000_000_000, 3)
      expect(tree.query(0, 1_000_000_000)).toBe(6)
      expect(tree.size()).toBe(3)
    })

    it("queries across sparse gaps efficiently", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000_000)
      tree.update(100, 10)
      tree.update(1_000_000, 20)
      expect(tree.query(0, 99)).toBe(0)
      expect(tree.query(0, 100)).toBe(10)
      expect(tree.query(101, 999_999)).toBe(0)
      expect(tree.query(0, 1_000_000)).toBe(30)
    })

    it("min/max work on sparse data", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000_000)
      tree.update(10, -5)
      tree.update(1_000_000, 100)
      tree.update(999_999_999, 50)
      expect(tree.rangeMin(0, 1_000_000_000)).toBe(-5)
      expect(tree.rangeMax(0, 1_000_000_000)).toBe(100)
    })

    it("point query on unset index in huge range", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000_000)
      tree.update(0, 1)
      tree.update(1_000_000_000, 2)
      expect(tree.queryPoint(500_000_000)).toBe(0)
    })
  })

  describe("negative range", () => {
    it("works with negative indices", () => {
      const tree = new DynamicSegmentTree(-10, 10)
      tree.update(-5, 10)
      tree.update(0, 20)
      tree.update(5, 30)
      expect(tree.query(-10, 10)).toBe(60)
      expect(tree.query(-5, 0)).toBe(30)
    })

    it("point query on negative index", () => {
      const tree = new DynamicSegmentTree(-100, -1)
      tree.update(-50, 42)
      expect(tree.queryPoint(-50)).toBe(42)
      expect(tree.queryPoint(-1)).toBe(0)
    })

    it("min/max on negative range", () => {
      const tree = new DynamicSegmentTree(-10, 10)
      tree.update(-5, -100)
      tree.update(5, 100)
      expect(tree.rangeMin(-10, 10)).toBe(-100)
      expect(tree.rangeMax(-10, 10)).toBe(100)
    })
  })

  describe("edge cases", () => {
    it("single element range operations", () => {
      const tree = new DynamicSegmentTree(0, 0)
      tree.update(0, 42)
      expect(tree.queryPoint(0)).toBe(42)
      expect(tree.query(0, 0)).toBe(42)
      expect(tree.rangeMin(0, 0)).toBe(42)
      expect(tree.rangeMax(0, 0)).toBe(42)
    })

    it("two element range operations", () => {
      const tree = new DynamicSegmentTree(0, 1)
      tree.update(0, 10)
      tree.update(1, 20)
      expect(tree.query(0, 1)).toBe(30)
      expect(tree.rangeMin(0, 1)).toBe(10)
      expect(tree.rangeMax(0, 1)).toBe(20)
    })

    it("many updates on same index", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 1)
      tree.add(5, 1)
      tree.add(5, 1)
      tree.add(5, 1)
      tree.add(5, 1)
      expect(tree.queryPoint(5)).toBe(5)
      expect(tree.size()).toBe(1)
    })

    it("add then set to zero", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.add(3, 5)
      tree.add(3, 5)
      expect(tree.queryPoint(3)).toBe(10)
      tree.update(3, 0)
      expect(tree.queryPoint(3)).toBe(0)
      expect(tree.size()).toBe(0)
    })

    it("set zero then add", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 0)
      expect(tree.size()).toBe(0)
      tree.add(5, 10)
      expect(tree.queryPoint(5)).toBe(10)
      expect(tree.size()).toBe(1)
    })

    it("handles very large values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, Number.MAX_SAFE_INTEGER)
      tree.update(2, 1)
      expect(tree.query(1, 2)).toBe(Number.MAX_SAFE_INTEGER + 1)
    })

    it("handles very small negative values", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, -Number.MAX_SAFE_INTEGER)
      expect(tree.queryPoint(1)).toBe(-Number.MAX_SAFE_INTEGER)
    })
  })

  describe("interleaved operations", () => {
    it("mix of update and add", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.add(1, 5)
      tree.update(2, 20)
      tree.add(2, -5)
      expect(tree.queryPoint(1)).toBe(15)
      expect(tree.queryPoint(2)).toBe(15)
      expect(tree.query(0, 10)).toBe(30)
    })

    it("update, query, add, query cycle", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 100)
      expect(tree.query(0, 10)).toBe(100)
      tree.add(5, 50)
      expect(tree.query(0, 10)).toBe(150)
      tree.add(3, 25)
      expect(tree.query(0, 10)).toBe(175)
    })

    it("clone in middle of operations", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(2, 20)
      const copy = tree.clone()
      tree.add(1, 5)
      copy.add(2, 5)
      expect(tree.query(0, 10)).toBe(35)
      expect(copy.query(0, 10)).toBe(35)
    })

    it("reset and reuse", () => {
      const tree = new DynamicSegmentTree(0, 100)
      for (let i = 0; i <= 50; i++) {
        tree.update(i, i)
      }
      expect(tree.query(0, 50)).toBe(1275)
      tree.reset()
      expect(tree.isEmpty()).toBe(true)
      for (let i = 0; i <= 50; i++) {
        tree.update(i, i * 2)
      }
      expect(tree.query(0, 50)).toBe(2550)
    })
  })

  describe("stress tests", () => {
    it("1000 point updates and queries", () => {
      const tree = new DynamicSegmentTree(0, 2000)
      let expectedSum = 0
      for (let i = 0; i < 1000; i++) {
        tree.update(i, i + 1)
        expectedSum += i + 1
      }
      expect(tree.query(0, 999)).toBe(expectedSum)
      expect(tree.size()).toBe(1000)
    })

    it("1000 add operations", () => {
      const tree = new DynamicSegmentTree(0, 2000)
      for (let i = 0; i < 1000; i++) {
        tree.add(i, 1)
      }
      expect(tree.query(0, 999)).toBe(1000)
      expect(tree.size()).toBe(1000)
    })

    it("random sparse operations on large range", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000_000)
      const indices = [0, 999_999, 1, 500_000_000, 1_000_000_000, 42, 123_456_789]
      let sum = 0
      for (const idx of indices) {
        tree.update(idx, idx)
        sum += idx
      }
      expect(tree.query(0, 1_000_000_000)).toBe(sum)
    })

    it("sequential updates then range queries", () => {
      const tree = new DynamicSegmentTree(0, 100)
      for (let i = 0; i <= 100; i++) {
        tree.update(i, i)
      }
      for (let l = 0; l <= 100; l += 10) {
        const r = l + 9
        let expected = 0
        for (let i = l; i <= Math.min(r, 100); i++) {
          expected += i
        }
        expect(tree.query(l, Math.min(r, 100))).toBe(expected)
      }
    })

    it("overwrite all to zero", () => {
      const tree = new DynamicSegmentTree(0, 100)
      for (let i = 0; i <= 100; i++) {
        tree.update(i, i + 1)
      }
      expect(tree.size()).toBe(101)
      for (let i = 0; i <= 100; i++) {
        tree.update(i, 0)
      }
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.query(0, 100)).toBe(0)
    })

    it("alternating set and add on same index", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 10)
      tree.add(5, 5)
      expect(tree.queryPoint(5)).toBe(15)
      tree.update(5, 3)
      expect(tree.queryPoint(5)).toBe(3)
      tree.add(5, 7)
      expect(tree.queryPoint(5)).toBe(10)
    })
  })

  describe("toArray after various operations", () => {
    it("reflects add operations", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.add(3, 10)
      tree.add(7, 20)
      expect(tree.toArray()).toEqual([
        [3, 10],
        [7, 20],
      ])
    })

    it("reflects overwrites", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(3, 10)
      tree.update(3, 99)
      expect(tree.toArray()).toEqual([[3, 99]])
    })

    it("reflects reset", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(2, 20)
      tree.reset()
      expect(tree.toArray()).toEqual([])
    })

    it("reflects clone accurately", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(1, 10)
      tree.update(3, 30)
      const copy = tree.clone()
      tree.update(5, 50)
      expect(tree.toArray()).toEqual([
        [1, 10],
        [3, 30],
        [5, 50],
      ])
      expect(copy.toArray()).toEqual([
        [1, 10],
        [3, 30],
      ])
    })
  })

  describe("range queries on boundaries", () => {
    it("query exact single index", () => {
      const tree = new DynamicSegmentTree(0, 100)
      tree.update(50, 42)
      expect(tree.query(50, 50)).toBe(42)
    })

    it("query left boundary of range", () => {
      const tree = new DynamicSegmentTree(10, 20)
      tree.update(10, 5)
      tree.update(15, 10)
      expect(tree.query(10, 15)).toBe(15)
    })

    it("query right boundary of range", () => {
      const tree = new DynamicSegmentTree(10, 20)
      tree.update(20, 7)
      tree.update(15, 3)
      expect(tree.query(15, 20)).toBe(10)
    })

    it("rangeMin on left boundary", () => {
      const tree = new DynamicSegmentTree(0, 100)
      tree.update(0, -10)
      tree.update(100, 10)
      expect(tree.rangeMin(0, 50)).toBe(-10)
    })

    it("rangeMax on right boundary", () => {
      const tree = new DynamicSegmentTree(0, 100)
      tree.update(0, -10)
      tree.update(100, 10)
      expect(tree.rangeMax(50, 100)).toBe(10)
    })
  })

  describe("complex scenarios", () => {
    it("sliding window sum", () => {
      const tree = new DynamicSegmentTree(0, 100)
      for (let i = 0; i <= 100; i++) {
        tree.update(i, i)
      }
      for (let start = 0; start <= 90; start += 10) {
        const end = start + 9
        let expected = 0
        for (let i = start; i <= end; i++) {
          expected += i
        }
        expect(tree.query(start, end)).toBe(expected)
      }
    })

    it("running sum with additions", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.add(0, 1)
      expect(tree.query(0, 10)).toBe(1)
      tree.add(1, 1)
      expect(tree.query(0, 10)).toBe(2)
      tree.add(2, 1)
      expect(tree.query(0, 10)).toBe(3)
    })

    it("min max across wide sparse range", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000)
      tree.update(0, -1000)
      tree.update(500_000, 0)
      tree.update(1_000_000, 1000)
      expect(tree.rangeMin(0, 1_000_000)).toBe(-1000)
      expect(tree.rangeMax(0, 1_000_000)).toBe(1000)
    })

    it("query subset of sparse data", () => {
      const tree = new DynamicSegmentTree(0, 1_000_000)
      tree.update(100, 10)
      tree.update(200_000, 20)
      tree.update(500_000, 30)
      expect(tree.query(0, 150)).toBe(10)
      expect(tree.query(150, 300_000)).toBe(20)
      expect(tree.query(300_001, 1_000_000)).toBe(30)
    })

    it("clone preserves min/max tracking", () => {
      const tree = new DynamicSegmentTree(0, 100)
      tree.update(10, -50)
      tree.update(50, 0)
      tree.update(90, 50)
      const copy = tree.clone()
      expect(copy.rangeMin(0, 100)).toBe(-50)
      expect(copy.rangeMax(0, 100)).toBe(50)
    })
  })

  describe("robustness", () => {
    it("handles power-of-2 range", () => {
      const tree = new DynamicSegmentTree(0, 1023)
      tree.update(0, 1)
      tree.update(512, 2)
      tree.update(1023, 3)
      expect(tree.query(0, 1023)).toBe(6)
    })

    it("handles non-power-of-2 range", () => {
      const tree = new DynamicSegmentTree(0, 999)
      tree.update(0, 1)
      tree.update(499, 2)
      tree.update(999, 3)
      expect(tree.query(0, 999)).toBe(6)
    })

    it("handles range of size 3", () => {
      const tree = new DynamicSegmentTree(0, 2)
      tree.update(0, 1)
      tree.update(1, 2)
      tree.update(2, 3)
      expect(tree.query(0, 2)).toBe(6)
      expect(tree.rangeMin(0, 2)).toBe(1)
      expect(tree.rangeMax(0, 2)).toBe(3)
    })

    it("stress: many clones", () => {
      const tree = new DynamicSegmentTree(0, 10)
      tree.update(5, 42)
      const clones: DynamicSegmentTree[] = []
      for (let i = 0; i < 50; i++) {
        clones.push(tree.clone())
      }
      for (const c of clones) {
        expect(c.queryPoint(5)).toBe(42)
      }
    })

    it("stress: sequential reset and rebuild", () => {
      const tree = new DynamicSegmentTree(0, 1000)
      for (let round = 0; round < 10; round++) {
        tree.reset()
        for (let i = 0; i < 100; i++) {
          tree.update(i, i + 1)
        }
        expect(tree.query(0, 99)).toBe(5050)
        expect(tree.size()).toBe(100)
      }
    })
  })
})
