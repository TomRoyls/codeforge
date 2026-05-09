import { describe, it, expect, beforeEach } from 'vitest'
import { WeightedUnionFind } from '../../src/core/weighted-union-find/weighted-union-find.js'
import type { WeightedUnionFindData } from '../../src/core/weighted-union-find/types.js'

describe('WeightedUnionFind', () => {
  let wuf: WeightedUnionFind

  beforeEach(() => {
    wuf = new WeightedUnionFind(10)
  })

  describe('constructor', () => {
    it('should create instance with given size', () => {
      const w = new WeightedUnionFind(5)
      expect(w.getComponentCount()).toBe(5)
    })

    it('should create instance with size 0', () => {
      const w = new WeightedUnionFind(0)
      expect(w.getComponentCount()).toBe(0)
    })

    it('should throw for negative size', () => {
      expect(() => new WeightedUnionFind(-1)).toThrow('Size must be non-negative')
    })

    it('should initialize all elements as their own parent', () => {
      const w = new WeightedUnionFind(5)
      for (let i = 0; i < 5; i++) {
        expect(w.find(i)).toBe(i)
      }
    })

    it('should initialize all weights to 0', () => {
      const w = new WeightedUnionFind(5)
      for (let i = 0; i < 5; i++) {
        expect(w.getWeight(i)).toBe(0)
      }
    })

    it('should initialize all sizes to 1', () => {
      const w = new WeightedUnionFind(5)
      for (let i = 0; i < 5; i++) {
        expect(w.getSize(i)).toBe(1)
      }
    })

    it('should handle large size', () => {
      const w = new WeightedUnionFind(10000)
      expect(w.getComponentCount()).toBe(10000)
      expect(w.find(9999)).toBe(9999)
    })
  })

  describe('find', () => {
    it('should return element itself as root initially', () => {
      expect(wuf.find(0)).toBe(0)
      expect(wuf.find(5)).toBe(5)
    })

    it('should throw for out of bounds index', () => {
      expect(() => wuf.find(-1)).toThrow('Index -1 out of bounds')
      expect(() => wuf.find(10)).toThrow('Index 10 out of bounds')
    })

    it('should return same root after union', () => {
      wuf.union(0, 1, 5)
      expect(wuf.find(0)).toBe(wuf.find(1))
    })

    it('should apply path compression', () => {
      const w = new WeightedUnionFind(5)
      w.union(0, 1, 1)
      w.union(1, 2, 1)
      w.union(2, 3, 1)
      w.union(3, 4, 1)
      const root = w.find(4)
      expect(w.find(0)).toBe(root)
      expect(w.find(1)).toBe(root)
      expect(w.find(2)).toBe(root)
      expect(w.find(3)).toBe(root)
    })

    it('should maintain correct weights after path compression', () => {
      const w = new WeightedUnionFind(3)
      w.union(0, 1, 5)
      w.union(1, 2, 3)
      w.find(2)
      expect(w.distance(0, 2)).toBe(8)
    })

    it('should handle find on unmodified element', () => {
      expect(wuf.find(3)).toBe(3)
    })
  })

  describe('union', () => {
    it('should union two separate elements', () => {
      expect(wuf.union(0, 1, 5)).toBe(true)
      expect(wuf.connected(0, 1)).toBe(true)
    })

    it('should return false for already connected elements', () => {
      wuf.union(0, 1, 5)
      expect(wuf.union(0, 1, 3)).toBe(false)
    })

    it('should return false for same element', () => {
      expect(wuf.union(0, 0, 5)).toBe(false)
    })

    it('should decrement component count', () => {
      expect(wuf.getComponentCount()).toBe(10)
      wuf.union(0, 1, 5)
      expect(wuf.getComponentCount()).toBe(9)
      wuf.union(2, 3, 3)
      expect(wuf.getComponentCount()).toBe(8)
    })

    it('should not decrement count for already connected', () => {
      wuf.union(0, 1, 5)
      const count = wuf.getComponentCount()
      wuf.union(0, 1, 3)
      expect(wuf.getComponentCount()).toBe(count)
    })

    it('should throw for invalid x', () => {
      expect(() => wuf.union(-1, 0, 5)).toThrow('Index -1 out of bounds')
    })

    it('should throw for invalid y', () => {
      expect(() => wuf.union(0, 10, 5)).toThrow('Index 10 out of bounds')
    })

    it('should handle zero weight', () => {
      expect(wuf.union(0, 1, 0)).toBe(true)
      expect(wuf.distance(0, 1)).toBe(0)
    })

    it('should handle negative weight', () => {
      expect(wuf.union(0, 1, -5)).toBe(true)
      expect(wuf.distance(0, 1)).toBe(-5)
    })

    it('should handle large weight', () => {
      expect(wuf.union(0, 1, 1000000)).toBe(true)
      expect(wuf.distance(0, 1)).toBe(1000000)
    })

    it('should handle fractional weight', () => {
      expect(wuf.union(0, 1, 3.5)).toBe(true)
      expect(wuf.distance(0, 1)).toBeCloseTo(3.5)
    })

    it('should handle chained unions', () => {
      for (let i = 0; i < 9; i++) {
        wuf.union(i, i + 1, 1)
      }
      for (let i = 0; i < 10; i++) {
        expect(wuf.connected(0, i)).toBe(true)
      }
      expect(wuf.getComponentCount()).toBe(1)
    })

    it('should handle star pattern unions', () => {
      for (let i = 1; i < 10; i++) {
        wuf.union(0, i, i)
      }
      expect(wuf.getComponentCount()).toBe(1)
      for (let i = 1; i < 10; i++) {
        expect(wuf.connected(0, i)).toBe(true)
      }
    })

    it('should use union by rank', () => {
      const w = new WeightedUnionFind(4)
      w.union(0, 1, 1)
      w.union(2, 3, 1)
      w.union(0, 2, 1)
      expect(w.connected(1, 3)).toBe(true)
      expect(w.getComponentCount()).toBe(1)
    })
  })

  describe('connected', () => {
    it('should return true for same element', () => {
      expect(wuf.connected(0, 0)).toBe(true)
    })

    it('should return false for unconnected elements', () => {
      expect(wuf.connected(0, 1)).toBe(false)
    })

    it('should return true after union', () => {
      wuf.union(0, 1, 5)
      expect(wuf.connected(0, 1)).toBe(true)
    })

    it('should be transitive', () => {
      wuf.union(0, 1, 5)
      wuf.union(1, 2, 3)
      expect(wuf.connected(0, 2)).toBe(true)
    })

    it('should throw for invalid index', () => {
      expect(() => wuf.connected(-1, 0)).toThrow('Index -1 out of bounds')
      expect(() => wuf.connected(0, 10)).toThrow('Index 10 out of bounds')
    })

    it('should return true for longer chain', () => {
      wuf.union(0, 1, 1)
      wuf.union(1, 2, 1)
      wuf.union(2, 3, 1)
      wuf.union(3, 4, 1)
      expect(wuf.connected(0, 4)).toBe(true)
    })

    it('should return false across components', () => {
      wuf.union(0, 1, 5)
      wuf.union(2, 3, 3)
      expect(wuf.connected(0, 2)).toBe(false)
      expect(wuf.connected(1, 3)).toBe(false)
    })
  })

  describe('distance', () => {
    it('should return 0 for same element', () => {
      expect(wuf.distance(0, 0)).toBe(0)
    })

    it('should return weight for direct union', () => {
      wuf.union(0, 1, 5)
      expect(wuf.distance(0, 1)).toBe(5)
    })

    it('should return negative of reverse', () => {
      wuf.union(0, 1, 5)
      expect(wuf.distance(1, 0)).toBe(-5)
    })

    it('should compute distance along chain', () => {
      wuf.union(0, 1, 2)
      wuf.union(1, 2, 3)
      expect(wuf.distance(0, 2)).toBe(5)
      expect(wuf.distance(2, 0)).toBe(-5)
    })

    it('should throw for unconnected elements', () => {
      expect(() => wuf.distance(0, 1)).toThrow('Elements 0 and 1 are not connected')
    })

    it('should handle longer chain', () => {
      wuf.union(0, 1, 1)
      wuf.union(1, 2, 2)
      wuf.union(2, 3, 3)
      expect(wuf.distance(0, 3)).toBe(6)
      expect(wuf.distance(3, 0)).toBe(-6)
    })

    it('should be consistent with intermediate distances', () => {
      wuf.union(0, 1, 3)
      wuf.union(1, 2, 4)
      expect(wuf.distance(0, 1)).toBe(3)
      expect(wuf.distance(1, 2)).toBe(4)
      expect(wuf.distance(0, 2)).toBe(7)
    })

    it('should work after path compression', () => {
      wuf.union(0, 1, 2)
      wuf.union(1, 2, 3)
      wuf.union(2, 3, 4)
      wuf.find(3)
      expect(wuf.distance(0, 3)).toBe(9)
      expect(wuf.distance(1, 3)).toBe(7)
    })

    it('should handle zero distance chain', () => {
      wuf.union(0, 1, 0)
      wuf.union(1, 2, 0)
      expect(wuf.distance(0, 2)).toBe(0)
    })

    it('should handle negative weights in chain', () => {
      wuf.union(0, 1, -3)
      wuf.union(1, 2, -4)
      expect(wuf.distance(0, 2)).toBe(-7)
    })

    it('should handle mixed positive and negative weights', () => {
      wuf.union(0, 1, 10)
      wuf.union(1, 2, -3)
      expect(wuf.distance(0, 2)).toBe(7)
    })

    it('should handle distance through merged components', () => {
      wuf.union(0, 1, 2)
      wuf.union(0, 2, 5)
      wuf.union(1, 3, 3)
      expect(wuf.union(2, 3, 1)).toBe(false)
      expect(wuf.connected(0, 2)).toBe(true)
      expect(wuf.distance(0, 2)).toBeCloseTo(5)
    })
  })

  describe('getWeight', () => {
    it('should return 0 for unmodified element', () => {
      expect(wuf.getWeight(0)).toBe(0)
    })

    it('should throw for invalid index', () => {
      expect(() => wuf.getWeight(-1)).toThrow('Index -1 out of bounds')
      expect(() => wuf.getWeight(10)).toThrow('Index 10 out of bounds')
    })

    it('should return weight after path compression', () => {
      wuf.union(0, 1, 5)
      wuf.union(1, 2, 3)
      wuf.find(2)
      expect(wuf.getWeight(2)).toBe(-8)
    })

    it('should return 0 for root element', () => {
      wuf.union(0, 1, 5)
      const root = wuf.find(0)
      expect(wuf.getWeight(root)).toBe(0)
    })
  })

  describe('getSize', () => {
    it('should return 1 for unconnected element', () => {
      expect(wuf.getSize(0)).toBe(1)
    })

    it('should throw for invalid index', () => {
      expect(() => wuf.getSize(-1)).toThrow('Index -1 out of bounds')
      expect(() => wuf.getSize(10)).toThrow('Index 10 out of bounds')
    })

    it('should return 2 after union of two elements', () => {
      wuf.union(0, 1, 5)
      expect(wuf.getSize(0)).toBe(2)
      expect(wuf.getSize(1)).toBe(2)
    })

    it('should grow with more unions', () => {
      wuf.union(0, 1, 1)
      wuf.union(1, 2, 1)
      wuf.union(2, 3, 1)
      expect(wuf.getSize(0)).toBe(4)
      expect(wuf.getSize(3)).toBe(4)
    })

    it('should return same size for all elements in component', () => {
      wuf.union(0, 1, 1)
      wuf.union(2, 3, 1)
      wuf.union(0, 2, 1)
      for (let i = 0; i < 4; i++) {
        expect(wuf.getSize(i)).toBe(4)
      }
    })
  })

  describe('setWeight', () => {
    it('should set weight for element', () => {
      wuf.setWeight(0, 42)
      expect(wuf.getWeight(0)).toBe(42)
    })

    it('should throw for invalid index', () => {
      expect(() => wuf.setWeight(-1, 5)).toThrow('Index -1 out of bounds')
      expect(() => wuf.setWeight(10, 5)).toThrow('Index 10 out of bounds')
    })

    it('should overwrite existing weight', () => {
      wuf.setWeight(0, 10)
      expect(wuf.getWeight(0)).toBe(10)
      wuf.setWeight(0, 20)
      expect(wuf.getWeight(0)).toBe(20)
    })

    it('should allow negative weight', () => {
      wuf.setWeight(0, -5)
      expect(wuf.getWeight(0)).toBe(-5)
    })

    it('should allow zero weight', () => {
      wuf.setWeight(0, 0)
      expect(wuf.getWeight(0)).toBe(0)
    })
  })

  describe('getComponentCount', () => {
    it('should return n for new instance', () => {
      const w = new WeightedUnionFind(5)
      expect(w.getComponentCount()).toBe(5)
    })

    it('should return 0 for empty instance', () => {
      const w = new WeightedUnionFind(0)
      expect(w.getComponentCount()).toBe(0)
    })

    it('should decrease after each union', () => {
      expect(wuf.getComponentCount()).toBe(10)
      wuf.union(0, 1, 1)
      expect(wuf.getComponentCount()).toBe(9)
      wuf.union(2, 3, 1)
      expect(wuf.getComponentCount()).toBe(8)
    })

    it('should reach 1 when all connected', () => {
      for (let i = 1; i < 10; i++) {
        wuf.union(0, i, 1)
      }
      expect(wuf.getComponentCount()).toBe(1)
    })
  })

  describe('getElements', () => {
    it('should return only the element when alone', () => {
      expect(wuf.getElements(0)).toEqual([0])
    })

    it('should throw for invalid index', () => {
      expect(() => wuf.getElements(-1)).toThrow('Index -1 out of bounds')
      expect(() => wuf.getElements(10)).toThrow('Index 10 out of bounds')
    })

    it('should return both elements after union', () => {
      wuf.union(0, 1, 5)
      const elements = wuf.getElements(0).sort((a, b) => a - b)
      expect(elements).toEqual([0, 1])
    })

    it('should return same elements from any member', () => {
      wuf.union(0, 1, 5)
      wuf.union(1, 2, 3)
      const from0 = wuf.getElements(0).sort((a, b) => a - b)
      const from2 = wuf.getElements(2).sort((a, b) => a - b)
      expect(from0).toEqual([0, 1, 2])
      expect(from2).toEqual(from0)
    })

    it('should return all elements in large component', () => {
      for (let i = 1; i < 10; i++) {
        wuf.union(0, i, 1)
      }
      const elements = wuf.getElements(0).sort((a, b) => a - b)
      expect(elements).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should return only component members not all', () => {
      wuf.union(0, 1, 5)
      wuf.union(2, 3, 3)
      const comp0 = wuf.getElements(0).sort((a, b) => a - b)
      const comp2 = wuf.getElements(2).sort((a, b) => a - b)
      expect(comp0).toEqual([0, 1])
      expect(comp2).toEqual([2, 3])
    })
  })

  describe('clone', () => {
    it('should produce independent copy', () => {
      wuf.union(0, 1, 5)
      const cloned = wuf.clone()
      expect(cloned.connected(0, 1)).toBe(true)
      expect(cloned.distance(0, 1)).toBe(5)
    })

    it('should not affect original on modification', () => {
      wuf.union(0, 1, 5)
      const cloned = wuf.clone()
      cloned.union(2, 3, 10)
      expect(wuf.connected(2, 3)).toBe(false)
      expect(cloned.connected(2, 3)).toBe(true)
    })

    it('should preserve component count', () => {
      wuf.union(0, 1, 5)
      wuf.union(2, 3, 3)
      const cloned = wuf.clone()
      expect(cloned.getComponentCount()).toBe(wuf.getComponentCount())
    })

    it('should preserve weights', () => {
      wuf.union(0, 1, 7)
      const cloned = wuf.clone()
      expect(cloned.distance(0, 1)).toBe(7)
    })

    it('should preserve sizes', () => {
      wuf.union(0, 1, 1)
      wuf.union(0, 2, 1)
      const cloned = wuf.clone()
      expect(cloned.getSize(0)).toBe(3)
    })

    it('should be identical to original', () => {
      wuf.union(0, 1, 3)
      wuf.union(1, 2, 4)
      const cloned = wuf.clone()
      const origArr = wuf.toArray()
      const cloneArr = cloned.toArray()
      expect(origArr.parent).toEqual(cloneArr.parent)
      expect(origArr.weight).toEqual(cloneArr.weight)
      expect(origArr.size).toEqual(cloneArr.size)
    })

    it('should produce valid WeightedUnionFind instance', () => {
      const cloned = wuf.clone()
      expect(cloned).toBeInstanceOf(WeightedUnionFind)
    })

    it('should clone empty structure', () => {
      const w = new WeightedUnionFind(0)
      const cloned = w.clone()
      expect(cloned.getComponentCount()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return correct structure for initial state', () => {
      const data = wuf.toArray()
      expect(data.parent).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(data.weight).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      expect(data.size).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    })

    it('should return arrays not references', () => {
      const data1 = wuf.toArray()
      const data2 = wuf.toArray()
      expect(data1.parent).toEqual(data2.parent)
      expect(data1.parent).not.toBe(data2.parent)
    })

    it('should reflect union changes', () => {
      wuf.union(0, 1, 5)
      const data = wuf.toArray()
      expect(data.parent[0]).toBe(data.parent[1])
      expect(data.size[0] + data.size[1]).toBeGreaterThanOrEqual(2)
    })

    it('should match WeightedUnionFindData type', () => {
      const data: WeightedUnionFindData = wuf.toArray()
      expect(data.parent).toBeInstanceOf(Array)
      expect(data.weight).toBeInstanceOf(Array)
      expect(data.size).toBeInstanceOf(Array)
    })
  })

  describe('static fromEdges', () => {
    it('should create from empty edges', () => {
      const w = WeightedUnionFind.fromEdges(5, [])
      expect(w.getComponentCount()).toBe(5)
    })

    it('should create from single edge', () => {
      const w = WeightedUnionFind.fromEdges(3, [[0, 1, 5]])
      expect(w.connected(0, 1)).toBe(true)
      expect(w.distance(0, 1)).toBe(5)
    })

    it('should create from multiple edges', () => {
      const w = WeightedUnionFind.fromEdges(4, [
        [0, 1, 2],
        [1, 2, 3],
        [2, 3, 4],
      ])
      expect(w.connected(0, 3)).toBe(true)
      expect(w.distance(0, 3)).toBe(9)
    })

    it('should handle redundant edges', () => {
      const w = WeightedUnionFind.fromEdges(3, [
        [0, 1, 5],
        [0, 1, 10],
      ])
      expect(w.getComponentCount()).toBe(2)
      expect(w.distance(0, 1)).toBe(5)
    })

    it('should return WeightedUnionFind instance', () => {
      const w = WeightedUnionFind.fromEdges(2, [])
      expect(w).toBeInstanceOf(WeightedUnionFind)
    })

    it('should handle size 0', () => {
      const w = WeightedUnionFind.fromEdges(0, [])
      expect(w.getComponentCount()).toBe(0)
    })

    it('should create correct structure from complex edges', () => {
      const w = WeightedUnionFind.fromEdges(5, [
        [0, 1, 1],
        [2, 3, 1],
        [0, 2, 1],
      ])
      expect(w.getComponentCount()).toBe(2)
      expect(w.connected(0, 3)).toBe(true)
      expect(w.connected(0, 4)).toBe(false)
    })
  })

  describe('distance with complex topologies', () => {
    it('should handle diamond pattern', () => {
      wuf.union(0, 1, 2)
      wuf.union(0, 2, 5)
      wuf.union(1, 3, 3)
      expect(wuf.union(2, 3, 0)).toBe(false)
      expect(wuf.connected(0, 3)).toBe(true)
      expect(wuf.distance(0, 3)).toBeCloseTo(5)
      expect(wuf.distance(1, 2)).toBeCloseTo(3)
    })

    it('should handle long chain distances', () => {
      for (let i = 0; i < 9; i++) {
        wuf.union(i, i + 1, 1)
      }
      expect(wuf.distance(0, 9)).toBeCloseTo(9)
      expect(wuf.distance(9, 0)).toBeCloseTo(-9)
      expect(wuf.distance(3, 7)).toBeCloseTo(4)
    })

    it('should handle varied weights along chain', () => {
      const w = new WeightedUnionFind(4)
      w.union(0, 1, 10)
      w.union(1, 2, 20)
      w.union(2, 3, 30)
      expect(w.distance(0, 3)).toBeCloseTo(60)
      expect(w.distance(0, 2)).toBeCloseTo(30)
      expect(w.distance(1, 3)).toBeCloseTo(50)
    })

    it('should maintain consistency after multiple finds', () => {
      wuf.union(0, 1, 3)
      wuf.union(1, 2, 4)
      wuf.union(2, 3, 5)
      wuf.find(3)
      wuf.find(0)
      expect(wuf.distance(0, 3)).toBeCloseTo(12)
      expect(wuf.distance(3, 0)).toBeCloseTo(-12)
    })

    it('should handle merging two weighted chains', () => {
      const w = new WeightedUnionFind(6)
      w.union(0, 1, 2)
      w.union(1, 2, 3)
      w.union(3, 4, 5)
      w.union(4, 5, 7)
      w.union(2, 3, 10)
      expect(w.distance(0, 5)).toBeCloseTo(2 + 3 + 10 + 5 + 7)
    })
  })

  describe('path compression effects', () => {
    it('should preserve distances after compression', () => {
      const w = new WeightedUnionFind(5)
      w.union(0, 1, 1)
      w.union(1, 2, 2)
      w.union(2, 3, 3)
      w.union(3, 4, 4)
      expect(w.distance(0, 4)).toBeCloseTo(10)
      w.find(4)
      expect(w.distance(0, 4)).toBeCloseTo(10)
      expect(w.distance(1, 3)).toBeCloseTo(5)
    })

    it('should handle repeated finds correctly', () => {
      const w = new WeightedUnionFind(4)
      w.union(0, 1, 5)
      w.union(1, 2, 3)
      w.union(2, 3, 2)
      for (let i = 0; i < 5; i++) {
        expect(w.distance(0, 3)).toBeCloseTo(10)
      }
    })

    it('should flatten deep tree', () => {
      const w = new WeightedUnionFind(20)
      for (let i = 0; i < 19; i++) {
        w.union(i, i + 1, 1)
      }
      w.find(19)
      expect(w.distance(0, 19)).toBeCloseTo(19)
    })
  })

  describe('union by rank effects', () => {
    it('should maintain correctness with rank-based merging', () => {
      const w = new WeightedUnionFind(8)
      w.union(0, 1, 1)
      w.union(2, 3, 1)
      w.union(4, 5, 1)
      w.union(6, 7, 1)
      w.union(0, 2, 1)
      w.union(4, 6, 1)
      w.union(0, 4, 1)
      expect(w.getComponentCount()).toBe(1)
      expect(w.getSize(0)).toBe(8)
    })

    it('should handle equal rank merging', () => {
      const w = new WeightedUnionFind(4)
      w.union(0, 1, 2)
      w.union(2, 3, 3)
      w.union(0, 2, 1)
      expect(w.distance(0, 3)).toBeCloseTo(4)
      expect(w.distance(1, 2)).toBeCloseTo(-1)
    })
  })

  describe('edge cases', () => {
    it('should handle size 1', () => {
      const w = new WeightedUnionFind(1)
      expect(w.find(0)).toBe(0)
      expect(w.connected(0, 0)).toBe(true)
      expect(w.distance(0, 0)).toBe(0)
      expect(w.getSize(0)).toBe(1)
      expect(w.getComponentCount()).toBe(1)
    })

    it('should handle size 0', () => {
      const w = new WeightedUnionFind(0)
      expect(w.getComponentCount()).toBe(0)
    })

    it('should handle element 0 correctly', () => {
      const w = new WeightedUnionFind(2)
      w.union(0, 1, 7)
      expect(w.distance(0, 1)).toBe(7)
      expect(w.distance(1, 0)).toBe(-7)
    })

    it('should handle self-union', () => {
      expect(wuf.union(5, 5, 10)).toBe(false)
      expect(wuf.getComponentCount()).toBe(10)
    })

    it('should handle setWeight after union', () => {
      wuf.union(0, 1, 5)
      wuf.setWeight(0, 100)
      expect(wuf.getWeight(0)).toBe(100)
    })

    it('should handle getElements with all elements in one component', () => {
      for (let i = 1; i < 10; i++) {
        wuf.union(0, i, 1)
      }
      const elements = wuf.getElements(5).sort((a, b) => a - b)
      expect(elements).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should handle fractional distances', () => {
      wuf.union(0, 1, 1.5)
      wuf.union(1, 2, 2.5)
      expect(wuf.distance(0, 2)).toBeCloseTo(4.0)
    })

    it('should handle very large n', () => {
      const w = new WeightedUnionFind(500)
      for (let i = 1; i < 500; i++) {
        w.union(0, i, 1)
      }
      expect(w.getComponentCount()).toBe(1)
      expect(w.getSize(0)).toBe(500)
    })

    it('should handle alternating unions', () => {
      const w = new WeightedUnionFind(6)
      w.union(0, 5, 1)
      w.union(1, 4, 1)
      w.union(2, 3, 1)
      expect(w.getComponentCount()).toBe(3)
      expect(w.connected(0, 5)).toBe(true)
      expect(w.connected(1, 4)).toBe(true)
      expect(w.connected(0, 1)).toBe(false)
    })

    it('should handle sequential union then sequential find', () => {
      const w = new WeightedUnionFind(100)
      for (let i = 0; i < 99; i++) {
        w.union(i, i + 1, 1)
      }
      for (let i = 0; i < 100; i++) {
        expect(w.find(i)).toBe(w.find(0))
      }
    })

    it('should handle binary merge pattern', () => {
      const w = new WeightedUnionFind(16)
      for (let stride = 1; stride < 16; stride *= 2) {
        for (let i = 0; i + stride < 16; i += stride * 2) {
          w.union(i, i + stride, 1)
        }
      }
      expect(w.getComponentCount()).toBe(1)
    })

    it('should handle distance after multiple path compressions', () => {
      const w = new WeightedUnionFind(10)
      for (let i = 0; i < 9; i++) {
        w.union(i, i + 1, 1)
      }
      for (let i = 0; i < 10; i++) {
        w.find(i)
      }
      expect(w.distance(0, 9)).toBeCloseTo(9)
      expect(w.distance(3, 7)).toBeCloseTo(4)
    })
  })

  describe('type exports', () => {
    it('should export WeightedUnionFindData via toArray', () => {
      const data = wuf.toArray()
      expect(data.parent.length).toBe(10)
      expect(data.weight.length).toBe(10)
      expect(data.size.length).toBe(10)
    })

    it('should allow WeightedUnionFindData type annotation', () => {
      const data: WeightedUnionFindData = {
        parent: [0, 1],
        weight: [0, 5],
        size: [1, 1],
      }
      expect(data.parent[0]).toBe(0)
      expect(data.weight[1]).toBe(5)
    })
  })

  describe('large scale', () => {
    it('should handle 1000 elements with chain unions', () => {
      const w = new WeightedUnionFind(1000)
      for (let i = 0; i < 999; i++) {
        w.union(i, i + 1, 1)
      }
      expect(w.getComponentCount()).toBe(1)
      expect(w.distance(0, 999)).toBeCloseTo(999)
    })

    it('should handle 1000 elements star pattern', () => {
      const w = new WeightedUnionFind(1000)
      for (let i = 1; i < 1000; i++) {
        w.union(0, i, i)
      }
      expect(w.getComponentCount()).toBe(1)
      expect(w.distance(0, 999)).toBeCloseTo(999)
    })

    it('should handle 500 elements binary merge', () => {
      const w = new WeightedUnionFind(500)
      for (let stride = 1; stride < 500; stride *= 2) {
        for (let i = 0; i + stride < 500; i += stride * 2) {
          w.union(i, i + stride, 1)
        }
      }
      expect(w.getComponentCount()).toBe(1)
    })

    it('should handle random union pattern', () => {
      const w = new WeightedUnionFind(200)
      const rng = (seed: number) => {
        let s = seed
        return () => {
          s = (s * 1103515245 + 12345) & 0x7fffffff
          return s
        }
      }
      const rand = rng(42)
      for (let i = 0; i < 300; i++) {
        const a = rand() % 200
        const b = rand() % 200
        const wt = (rand() % 100) - 50
        w.union(a, b, wt)
      }
      expect(w.getComponentCount()).toBeGreaterThanOrEqual(1)
      expect(w.getComponentCount()).toBeLessThanOrEqual(200)
    })
  })

  describe('clone independence', () => {
    it('should not share parent array', () => {
      wuf.union(0, 1, 5)
      const cloned = wuf.clone()
      cloned.union(2, 3, 10)
      expect(wuf.connected(2, 3)).toBe(false)
    })

    it('should not share weight array', () => {
      wuf.setWeight(0, 42)
      const cloned = wuf.clone()
      cloned.setWeight(0, 100)
      expect(wuf.getWeight(0)).toBe(42)
    })

    it('should not share size array', () => {
      wuf.union(0, 1, 5)
      const cloned = wuf.clone()
      cloned.union(2, 3, 10)
      cloned.union(0, 2, 1)
      expect(wuf.getSize(0)).toBe(2)
    })

    it('should be fully independent', () => {
      const w = new WeightedUnionFind(5)
      w.union(0, 1, 3)
      w.union(1, 2, 4)
      const c = w.clone()
      c.union(3, 4, 7)
      c.union(0, 3, 1)
      expect(w.connected(0, 3)).toBe(false)
      expect(w.getComponentCount()).toBe(3)
      expect(c.connected(0, 3)).toBe(true)
      expect(c.getComponentCount()).toBe(1)
    })
  })

  describe('distance symmetry properties', () => {
    it('should satisfy distance(x,x) = 0', () => {
      wuf.union(0, 1, 5)
      wuf.union(1, 2, 3)
      expect(wuf.distance(0, 0)).toBe(0)
      expect(wuf.distance(1, 1)).toBe(0)
      expect(wuf.distance(2, 2)).toBe(0)
    })

    it('should satisfy distance(x,y) = -distance(y,x)', () => {
      wuf.union(0, 1, 7)
      wuf.union(1, 2, 4)
      wuf.union(2, 3, 9)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          expect(wuf.distance(i, j)).toBeCloseTo(-wuf.distance(j, i))
        }
      }
    })

    it('should satisfy triangle inequality for additive weights', () => {
      wuf.union(0, 1, 3)
      wuf.union(1, 2, 4)
      expect(wuf.distance(0, 1) + wuf.distance(1, 2)).toBeCloseTo(wuf.distance(0, 2))
    })
  })

  describe('toArray immutability', () => {
    it('should not reflect external mutations', () => {
      const data = wuf.toArray()
      data.parent[0] = 999
      data.weight[0] = 999
      data.size[0] = 999
      expect(wuf.find(0)).toBe(0)
      expect(wuf.getWeight(0)).toBe(0)
      expect(wuf.getSize(0)).toBe(1)
    })
  })

  describe('getWeight after operations', () => {
    it('should return cumulative weight for non-root', () => {
      wuf.union(0, 1, 3)
      wuf.union(1, 2, 4)
      const root = wuf.find(0)
      expect(wuf.getWeight(root)).toBe(0)
    })

    it('should return 0 for root after union', () => {
      wuf.union(0, 1, 5)
      const root = wuf.find(0)
      expect(wuf.getWeight(root)).toBe(0)
    })

    it('should reflect setWeight changes', () => {
      wuf.setWeight(5, 100)
      expect(wuf.getWeight(5)).toBe(100)
      wuf.setWeight(5, -50)
      expect(wuf.getWeight(5)).toBe(-50)
    })
  })

  describe('multiple components with weights', () => {
    it('should maintain separate distances in separate components', () => {
      const w = new WeightedUnionFind(6)
      w.union(0, 1, 10)
      w.union(2, 3, 20)
      w.union(4, 5, 30)
      expect(w.distance(0, 1)).toBe(10)
      expect(w.distance(2, 3)).toBe(20)
      expect(w.distance(4, 5)).toBe(30)
    })

    it('should throw when querying distance across components', () => {
      const w = new WeightedUnionFind(4)
      w.union(0, 1, 5)
      w.union(2, 3, 3)
      expect(() => w.distance(0, 2)).toThrow('not connected')
      expect(() => w.distance(1, 3)).toThrow('not connected')
    })

    it('should merge distances correctly when components join', () => {
      const w = new WeightedUnionFind(4)
      w.union(0, 1, 5)
      w.union(2, 3, 3)
      w.union(1, 2, 2)
      expect(w.distance(0, 3)).toBeCloseTo(10)
      expect(w.distance(0, 2)).toBeCloseTo(7)
    })
  })

  describe('boundary validation', () => {
    it('should throw on find with index equal to n', () => {
      expect(() => wuf.find(10)).toThrow('out of bounds')
    })

    it('should throw on union with index equal to n', () => {
      expect(() => wuf.union(10, 0, 1)).toThrow('out of bounds')
    })

    it('should throw on connected with index equal to n', () => {
      expect(() => wuf.connected(10, 0)).toThrow('out of bounds')
    })

    it('should throw on distance with index equal to n', () => {
      expect(() => wuf.distance(10, 0)).toThrow('out of bounds')
    })

    it('should throw on getWeight with index equal to n', () => {
      expect(() => wuf.getWeight(10)).toThrow('out of bounds')
    })

    it('should throw on getSize with index equal to n', () => {
      expect(() => wuf.getSize(10)).toThrow('out of bounds')
    })

    it('should throw on setWeight with index equal to n', () => {
      expect(() => wuf.setWeight(10, 5)).toThrow('out of bounds')
    })

    it('should throw on getElements with index equal to n', () => {
      expect(() => wuf.getElements(10)).toThrow('out of bounds')
    })
  })

  describe('fromEdges edge cases', () => {
    it('should create single component from chain of edges', () => {
      const w = WeightedUnionFind.fromEdges(5, [
        [0, 1, 1],
        [1, 2, 2],
        [2, 3, 3],
        [3, 4, 4],
      ])
      expect(w.getComponentCount()).toBe(1)
      expect(w.distance(0, 4)).toBeCloseTo(10)
    })

    it('should handle self-loops gracefully', () => {
      const w = WeightedUnionFind.fromEdges(3, [[0, 0, 5]])
      expect(w.getComponentCount()).toBe(3)
    })

    it('should preserve distances when building from edges', () => {
      const w = WeightedUnionFind.fromEdges(3, [
        [0, 1, 10],
        [1, 2, 20],
      ])
      expect(w.distance(0, 1)).toBeCloseTo(10)
      expect(w.distance(1, 2)).toBeCloseTo(20)
      expect(w.distance(0, 2)).toBeCloseTo(30)
    })
  })
})
