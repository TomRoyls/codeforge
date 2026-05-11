import { describe, it, expect, beforeEach } from 'vitest'
import { WeightedUnion } from '../../src/core/weighted-union/index.js'

describe('WeightedUnion', () => {
  describe('constructor', () => {
    it('should create a union-find with 0 elements', () => {
      const uf = new WeightedUnion(0)
      expect(uf.size).toBe(0)
      expect(uf.componentCount).toBe(0)
    })

    it('should create a union-find with 1 element', () => {
      const uf = new WeightedUnion(1)
      expect(uf.size).toBe(1)
      expect(uf.componentCount).toBe(1)
    })

    it('should create a union-find with 10 elements', () => {
      const uf = new WeightedUnion(10)
      expect(uf.size).toBe(10)
      expect(uf.componentCount).toBe(10)
    })

    it('should throw on negative size', () => {
      expect(() => new WeightedUnion(-1)).toThrow(RangeError)
    })

    it('should throw on non-integer size', () => {
      expect(() => new WeightedUnion(1.5)).toThrow(RangeError)
    })

    it('should initialize each element as its own parent', () => {
      const uf = new WeightedUnion(5)
      const arr = uf.toArray()
      expect(arr).toEqual([0, 1, 2, 3, 4])
    })

    it('should use default weight of 1', () => {
      const uf = new WeightedUnion(3)
      expect(uf.weight(0)).toBe(1)
      expect(uf.weight(1)).toBe(1)
      expect(uf.weight(2)).toBe(1)
    })

    it('should accept custom initial weight', () => {
      const uf = new WeightedUnion(3, { initialWeight: 5 })
      expect(uf.weight(0)).toBe(5)
      expect(uf.weight(1)).toBe(5)
      expect(uf.weight(2)).toBe(5)
    })

    it('should handle large n', () => {
      const uf = new WeightedUnion(10000)
      expect(uf.size).toBe(10000)
      expect(uf.componentCount).toBe(10000)
    })
  })

  describe('find', () => {
    let uf: WeightedUnion

    beforeEach(() => {
      uf = new WeightedUnion(10)
    })

    it('should return the element itself when no unions', () => {
      expect(uf.find(0)).toBe(0)
      expect(uf.find(5)).toBe(5)
      expect(uf.find(9)).toBe(9)
    })

    it('should return root after union', () => {
      uf.union(0, 1)
      expect(uf.find(0)).toBe(uf.find(1))
    })

    it('should apply path compression', () => {
      uf.union(0, 1)
      uf.union(1, 2)
      uf.union(2, 3)
      uf.find(3)
      expect(uf.toArray()[3]).toBe(uf.find(0))
    })

    it('should throw on negative index', () => {
      expect(() => uf.find(-1)).toThrow(RangeError)
    })

    it('should throw on index >= size', () => {
      expect(() => uf.find(10)).toThrow(RangeError)
    })

    it('should throw on non-integer index', () => {
      expect(() => uf.find(1.5 as number)).toThrow(RangeError)
    })

    it('should find root of deep chain', () => {
      for (let i = 0; i < 9; i++) {
        uf.union(i, i + 1)
      }
      const root = uf.find(9)
      expect(uf.connected(0, 9)).toBe(true)
      expect(uf.find(0)).toBe(root)
    })
  })

  describe('union', () => {
    let uf: WeightedUnion

    beforeEach(() => {
      uf = new WeightedUnion(10)
    })

    it('should merge two separate components', () => {
      const result = uf.union(0, 1)
      expect(result).toBe(true)
      expect(uf.componentCount).toBe(9)
    })

    it('should return false for already connected elements', () => {
      uf.union(0, 1)
      const result = uf.union(0, 1)
      expect(result).toBe(false)
    })

    it('should merge smaller into larger component (by weight)', () => {
      uf.union(0, 1)
      uf.union(0, 2)
      uf.union(3, 4)
      uf.union(0, 3)
      expect(uf.connected(0, 4)).toBe(true)
      expect(uf.componentCount).toBe(6)
    })

    it('should handle self-union', () => {
      const result = uf.union(0, 0)
      expect(result).toBe(false)
      expect(uf.componentCount).toBe(10)
    })

    it('should chain multiple unions', () => {
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.connected(1, 3)).toBe(true)
      expect(uf.componentCount).toBe(7)
    })

    it('should throw on invalid indices', () => {
      expect(() => uf.union(-1, 0)).toThrow(RangeError)
      expect(() => uf.union(0, 10)).toThrow(RangeError)
    })

    it('should merge all into one component', () => {
      for (let i = 0; i < 9; i++) {
        uf.union(i, i + 1)
      }
      expect(uf.componentCount).toBe(1)
      for (let i = 0; i < 10; i++) {
        expect(uf.connected(0, i)).toBe(true)
      }
    })

    it('should update weight after union', () => {
      uf.union(0, 1)
      expect(uf.weight(0)).toBe(2)
      expect(uf.weight(1)).toBe(2)
    })
  })

  describe('connected', () => {
    let uf: WeightedUnion

    beforeEach(() => {
      uf = new WeightedUnion(10)
    })

    it('should return false for unconnected elements', () => {
      expect(uf.connected(0, 1)).toBe(false)
    })

    it('should return true after union', () => {
      uf.union(0, 1)
      expect(uf.connected(0, 1)).toBe(true)
    })

    it('should be reflexive', () => {
      expect(uf.connected(0, 0)).toBe(true)
    })

    it('should be symmetric', () => {
      uf.union(3, 7)
      expect(uf.connected(3, 7)).toBe(uf.connected(7, 3))
      expect(uf.connected(3, 7)).toBe(true)
    })

    it('should be transitive', () => {
      uf.union(0, 1)
      uf.union(1, 2)
      expect(uf.connected(0, 2)).toBe(true)
    })

    it('should throw on invalid indices', () => {
      expect(() => uf.connected(-1, 0)).toThrow(RangeError)
      expect(() => uf.connected(0, 100)).toThrow(RangeError)
    })
  })

  describe('setSize', () => {
    it('should return 1 for singleton', () => {
      const uf = new WeightedUnion(5)
      expect(uf.setSize(0)).toBe(1)
    })

    it('should return size after unions', () => {
      const uf = new WeightedUnion(5)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.setSize(0)).toBe(4)
      expect(uf.setSize(1)).toBe(4)
      expect(uf.setSize(4)).toBe(1)
    })

    it('should return total size when all merged', () => {
      const uf = new WeightedUnion(5)
      for (let i = 0; i < 4; i++) {
        uf.union(i, i + 1)
      }
      expect(uf.setSize(0)).toBe(5)
    })
  })

  describe('weight', () => {
    it('should return default weight of 1', () => {
      const uf = new WeightedUnion(5)
      expect(uf.weight(0)).toBe(1)
    })

    it('should return summed weight after union', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      expect(uf.weight(0)).toBe(2)
      uf.union(2, 3)
      expect(uf.weight(2)).toBe(2)
      uf.union(0, 2)
      expect(uf.weight(0)).toBe(4)
    })

    it('should reflect setWeight changes', () => {
      const uf = new WeightedUnion(3)
      uf.setWeight(0, 10)
      expect(uf.weight(0)).toBe(10)
    })

    it('should throw on invalid index', () => {
      const uf = new WeightedUnion(5)
      expect(() => uf.weight(10)).toThrow(RangeError)
    })
  })

  describe('setWeight', () => {
    it('should set weight of root', () => {
      const uf = new WeightedUnion(3)
      uf.setWeight(0, 42)
      expect(uf.weight(0)).toBe(42)
    })

    it('should set weight of component through non-root', () => {
      const uf = new WeightedUnion(3)
      uf.union(0, 1)
      uf.setWeight(1, 100)
      expect(uf.weight(0)).toBe(100)
      expect(uf.weight(1)).toBe(100)
    })

    it('should allow zero weight', () => {
      const uf = new WeightedUnion(3)
      uf.setWeight(0, 0)
      expect(uf.weight(0)).toBe(0)
    })

    it('should allow negative weight', () => {
      const uf = new WeightedUnion(3)
      uf.setWeight(0, -5)
      expect(uf.weight(0)).toBe(-5)
    })

    it('should affect union decisions (smaller merged into larger)', () => {
      const uf = new WeightedUnion(3)
      uf.setWeight(0, 100)
      uf.setWeight(1, 1)
      uf.union(0, 1)
      expect(uf.find(1)).toBe(0)
    })

    it('should throw on invalid index', () => {
      const uf = new WeightedUnion(3)
      expect(() => uf.setWeight(5, 10)).toThrow(RangeError)
    })
  })

  describe('componentCount', () => {
    it('should equal size initially', () => {
      const uf = new WeightedUnion(5)
      expect(uf.componentCount).toBe(5)
    })

    it('should decrease with each union', () => {
      const uf = new WeightedUnion(5)
      uf.union(0, 1)
      expect(uf.componentCount).toBe(4)
      uf.union(2, 3)
      expect(uf.componentCount).toBe(3)
      uf.union(0, 2)
      expect(uf.componentCount).toBe(2)
    })

    it('should not decrease on redundant union', () => {
      const uf = new WeightedUnion(3)
      uf.union(0, 1)
      expect(uf.componentCount).toBe(2)
      uf.union(0, 1)
      expect(uf.componentCount).toBe(2)
    })
  })

  describe('size', () => {
    it('should return initial size', () => {
      const uf = new WeightedUnion(7)
      expect(uf.size).toBe(7)
    })

    it('should not change after unions', () => {
      const uf = new WeightedUnion(7)
      uf.union(0, 1)
      uf.union(2, 3)
      expect(uf.size).toBe(7)
    })

    it('should increase after addComponent', () => {
      const uf = new WeightedUnion(3)
      uf.addComponent()
      expect(uf.size).toBe(4)
    })
  })

  describe('toArray', () => {
    it('should return identity array initially', () => {
      const uf = new WeightedUnion(5)
      expect(uf.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should return modified array after unions', () => {
      const uf = new WeightedUnion(3)
      uf.union(0, 1)
      const arr = uf.toArray()
      expect(arr[0]).toBe(arr[1])
    })

    it('should return a copy (not internal)', () => {
      const uf = new WeightedUnion(3)
      const arr = uf.toArray()
      arr[0] = 999
      expect(uf.toArray()[0]).toBe(0)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const uf = new WeightedUnion(5)
      uf.union(0, 1)
      uf.union(2, 3)
      const copy = uf.clone()
      expect(copy.size).toBe(uf.size)
      expect(copy.componentCount).toBe(uf.componentCount)
      expect(copy.toArray()).toEqual(uf.toArray())
    })

    it('should be independent from original', () => {
      const uf = new WeightedUnion(5)
      const copy = uf.clone()
      copy.union(0, 1)
      expect(uf.componentCount).toBe(5)
      expect(copy.componentCount).toBe(4)
    })

    it('should preserve weights', () => {
      const uf = new WeightedUnion(3)
      uf.setWeight(0, 42)
      const copy = uf.clone()
      expect(copy.weight(0)).toBe(42)
    })

    it('should preserve custom initial weights', () => {
      const uf = new WeightedUnion(3, { initialWeight: 7 })
      const copy = uf.clone()
      expect(copy.weight(0)).toBe(7)
      expect(copy.weight(1)).toBe(7)
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const uf = new WeightedUnion(5)
      const elements: number[] = []
      uf.forEach((el) => elements.push(el))
      expect(elements).toEqual([0, 1, 2, 3, 4])
    })

    it('should provide root for each element', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      const roots: number[] = []
      uf.forEach((_el, root) => roots.push(root))
      expect(roots[0]).toBe(roots[1])
      expect(roots[2]).toBe(2)
      expect(roots[3]).toBe(3)
    })

    it('should iterate empty structure', () => {
      const uf = new WeightedUnion(0)
      let count = 0
      uf.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should be iterable', () => {
      const uf = new WeightedUnion(5)
      const roots = [...uf]
      expect(roots).toEqual([0, 1, 2, 3, 4])
    })

    it('should return roots after unions', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      uf.union(2, 3)
      const roots = [...uf]
      expect(roots[0]).toBe(roots[1])
      expect(roots[2]).toBe(roots[3])
    })

    it('should work with for-of', () => {
      const uf = new WeightedUnion(3)
      const roots: number[] = []
      for (const root of uf) {
        roots.push(root)
      }
      expect(roots).toEqual([0, 1, 2])
    })
  })

  describe('static fromElements', () => {
    it('should create from weight array', () => {
      const uf = WeightedUnion.fromElements([5, 3, 7])
      expect(uf.size).toBe(3)
      expect(uf.componentCount).toBe(3)
      expect(uf.weight(0)).toBe(5)
      expect(uf.weight(1)).toBe(3)
      expect(uf.weight(2)).toBe(7)
    })

    it('should create from empty array', () => {
      const uf = WeightedUnion.fromElements([])
      expect(uf.size).toBe(0)
    })

    it('should handle unions with custom weights', () => {
      const uf = WeightedUnion.fromElements([10, 20, 5])
      uf.union(0, 1)
      expect(uf.weight(0)).toBe(30)
    })

    it('should merge smaller weight into larger', () => {
      const uf = WeightedUnion.fromElements([100, 1])
      uf.union(0, 1)
      expect(uf.find(1)).toBe(0)
      expect(uf.weight(0)).toBe(101)
    })

    it('should create independent instances', () => {
      const uf1 = WeightedUnion.fromElements([1, 2, 3])
      const uf2 = WeightedUnion.fromElements([4, 5, 6])
      uf1.union(0, 1)
      expect(uf2.componentCount).toBe(3)
    })
  })

  describe('addComponent', () => {
    it('should add a new component with default weight', () => {
      const uf = new WeightedUnion(3)
      const idx = uf.addComponent()
      expect(idx).toBe(3)
      expect(uf.size).toBe(4)
      expect(uf.componentCount).toBe(4)
      expect(uf.weight(3)).toBe(1)
    })

    it('should add a new component with custom weight', () => {
      const uf = new WeightedUnion(3)
      const idx = uf.addComponent(42)
      expect(idx).toBe(3)
      expect(uf.weight(3)).toBe(42)
    })

    it('should be connectable to existing components', () => {
      const uf = new WeightedUnion(3)
      const idx = uf.addComponent()
      uf.union(0, idx)
      expect(uf.connected(0, idx)).toBe(true)
      expect(uf.componentCount).toBe(3)
    })

    it('should increment index sequentially', () => {
      const uf = new WeightedUnion(2)
      expect(uf.addComponent()).toBe(2)
      expect(uf.addComponent()).toBe(3)
      expect(uf.addComponent()).toBe(4)
      expect(uf.size).toBe(5)
    })

    it('should work on empty structure', () => {
      const uf = new WeightedUnion(0)
      expect(uf.addComponent()).toBe(0)
      expect(uf.size).toBe(1)
      expect(uf.componentCount).toBe(1)
    })
  })

  describe('removeComponent', () => {
    it('should isolate an element from its component', () => {
      const uf = new WeightedUnion(5)
      uf.union(0, 1)
      uf.union(1, 2)
      uf.removeComponent(1)
      expect(uf.connected(0, 2)).toBe(true)
      expect(uf.connected(0, 1)).toBe(false)
      expect(uf.weight(1)).toBe(1)
    })

    it('should increment component count', () => {
      const uf = new WeightedUnion(3)
      uf.union(0, 1)
      expect(uf.componentCount).toBe(2)
      uf.removeComponent(0)
      expect(uf.componentCount).toBe(3)
    })

    it('should handle removing from singleton', () => {
      const uf = new WeightedUnion(3)
      uf.removeComponent(0)
      expect(uf.componentCount).toBe(3)
      expect(uf.weight(0)).toBe(1)
    })

    it('should throw on invalid index', () => {
      const uf = new WeightedUnion(3)
      expect(() => uf.removeComponent(10)).toThrow(RangeError)
    })
  })

  describe('components', () => {
    it('should return each element as separate component initially', () => {
      const uf = new WeightedUnion(4)
      const comps = uf.components()
      expect(comps).toEqual([[0], [1], [2], [3]])
    })

    it('should group connected elements', () => {
      const uf = new WeightedUnion(6)
      uf.union(0, 1)
      uf.union(2, 3)
      const comps = uf.components()
      expect(comps.length).toBe(4)
      const found01 = comps.some(c => c.includes(0) && c.includes(1))
      expect(found01).toBe(true)
      const found23 = comps.some(c => c.includes(2) && c.includes(3))
      expect(found23).toBe(true)
    })

    it('should return single component when all merged', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      const comps = uf.components()
      expect(comps.length).toBe(1)
      expect(comps[0]).toEqual([0, 1, 2, 3])
    })

    it('should return empty for empty structure', () => {
      const uf = new WeightedUnion(0)
      expect(uf.components()).toEqual([])
    })
  })

  describe('getComponentInfo', () => {
    it('should return info for singleton', () => {
      const uf = new WeightedUnion(5)
      const info = uf.getComponentInfo(0)
      expect(info.root).toBe(0)
      expect(info.size).toBe(1)
      expect(info.weight).toBe(1)
    })

    it('should return info for merged component', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      const info = uf.getComponentInfo(1)
      expect(info.root).toBe(uf.find(1))
      expect(info.size).toBe(4)
      expect(info.weight).toBe(4)
    })

    it('should reflect weight changes', () => {
      const uf = new WeightedUnion(3)
      uf.setWeight(0, 99)
      const info = uf.getComponentInfo(0)
      expect(info.weight).toBe(99)
    })
  })

  describe('reset', () => {
    it('should reset all elements to initial state', () => {
      const uf = new WeightedUnion(5)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      uf.setWeight(0, 100)
      uf.reset()
      expect(uf.componentCount).toBe(5)
      expect(uf.weight(0)).toBe(1)
      expect(uf.connected(0, 1)).toBe(false)
      expect(uf.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should work on already reset structure', () => {
      const uf = new WeightedUnion(3)
      uf.reset()
      expect(uf.componentCount).toBe(3)
    })
  })

  describe('path compression', () => {
    it('should flatten deep trees', () => {
      const uf = new WeightedUnion(10)
      for (let i = 0; i < 9; i++) {
        uf.union(i, i + 1)
      }
      uf.find(9)
      const arr = uf.toArray()
      expect(arr[9]).toBe(uf.find(0))
    })

    it('should not change connectivity after compression', () => {
      const uf = new WeightedUnion(6)
      uf.union(0, 1)
      uf.union(1, 2)
      uf.union(2, 3)
      uf.find(3)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          expect(uf.connected(i, j)).toBe(true)
        }
      }
    })
  })

  describe('union by weight', () => {
    it('should prefer larger weight as root', () => {
      const uf = WeightedUnion.fromElements([1, 100])
      uf.union(0, 1)
      expect(uf.find(0)).toBe(1)
    })

    it('should maintain correct weight hierarchy', () => {
      const uf = WeightedUnion.fromElements([1, 1, 100])
      uf.union(0, 1)
      uf.union(0, 2)
      expect(uf.find(0)).toBe(2)
      expect(uf.find(1)).toBe(2)
      expect(uf.weight(2)).toBe(102)
    })

    it('should choose consistently for equal weights', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      uf.union(2, 3)
      const root1 = uf.find(0)
      uf.union(0, 2)
      const finalRoot = uf.find(0)
      expect(uf.weight(finalRoot)).toBe(4)
    })
  })

  describe('edge cases', () => {
    it('should handle size 0 operations', () => {
      const uf = new WeightedUnion(0)
      expect(uf.size).toBe(0)
      expect(uf.componentCount).toBe(0)
      expect(uf.toArray()).toEqual([])
      expect(uf.components()).toEqual([])
    })

    it('should handle size 1', () => {
      const uf = new WeightedUnion(1)
      expect(uf.find(0)).toBe(0)
      expect(uf.connected(0, 0)).toBe(true)
      expect(uf.setSize(0)).toBe(1)
      expect(uf.weight(0)).toBe(1)
      expect(uf.components()).toEqual([[0]])
    })

    it('should handle consecutive unions', () => {
      const uf = new WeightedUnion(100)
      for (let i = 0; i < 99; i++) {
        uf.union(i, i + 1)
      }
      expect(uf.componentCount).toBe(1)
      expect(uf.setSize(0)).toBe(100)
      expect(uf.weight(0)).toBe(100)
    })

    it('should handle clone of modified structure', () => {
      const uf = new WeightedUnion(5)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.setWeight(4, 50)
      const c = uf.clone()
      expect(c.connected(0, 1)).toBe(true)
      expect(c.connected(2, 3)).toBe(true)
      expect(c.connected(0, 2)).toBe(false)
      expect(c.weight(4)).toBe(50)
      expect(c.componentCount).toBe(3)
    })
  })

  describe('integration', () => {
    it('should solve connectivity problem', () => {
      const uf = new WeightedUnion(8)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(4, 5)
      uf.union(6, 7)
      expect(uf.componentCount).toBe(4)
      uf.union(0, 2)
      uf.union(4, 6)
      expect(uf.componentCount).toBe(2)
      uf.union(0, 4)
      expect(uf.componentCount).toBe(1)
    })

    it('should handle dynamic addition and connection', () => {
      const uf = new WeightedUnion(2)
      uf.union(0, 1)
      const a = uf.addComponent(5)
      const b = uf.addComponent(10)
      uf.union(a, b)
      expect(uf.componentCount).toBe(2)
      expect(uf.weight(a)).toBe(15)
      uf.union(0, a)
      expect(uf.componentCount).toBe(1)
    })

    it('should support fromElements + full workflow', () => {
      const uf = WeightedUnion.fromElements([1, 2, 3, 4, 5])
      uf.union(0, 1)
      uf.union(3, 4)
      uf.union(0, 3)
      expect(uf.weight(0)).toBe(12)
      expect(uf.connected(1, 4)).toBe(true)
      expect(uf.connected(0, 2)).toBe(false)
      expect(uf.componentCount).toBe(2)
      const comps = uf.components()
      expect(comps.length).toBe(2)
    })

    it('should work with iterator and forEach together', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      uf.union(2, 3)
      const iterRoots = [...uf]
      let forEachCount = 0
      uf.forEach(() => forEachCount++)
      expect(iterRoots.length).toBe(4)
      expect(forEachCount).toBe(4)
    })
  })
})
