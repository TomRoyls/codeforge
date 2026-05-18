import { describe, it, expect } from 'vitest'
import { WeightedUnion } from '../src/core/weighted-union/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('WeightedUnion', () => {
  describe('constructor', () => {
    it('creates a union-find with n elements', () => {
      const uf = new WeightedUnion(5)
      expect(uf.size).toBe(5)
      expect(uf.componentCount).toBe(5)
    })

    it('creates with zero elements', () => {
      const uf = new WeightedUnion(0)
      expect(uf.size).toBe(0)
      expect(uf.componentCount).toBe(0)
    })

    it('throws RangeError for negative size', () => {
      expect(() => new WeightedUnion(-1)).toThrow(RangeError)
    })

    it('throws RangeError for non-integer size', () => {
      expect(() => new WeightedUnion(1.5)).toThrow(RangeError)
    })

    it('uses default initial weight of 1', () => {
      const uf = new WeightedUnion(3)
      expect(uf.weight(0)).toBe(1)
      expect(uf.weight(1)).toBe(1)
    })

    it('accepts custom initial weight', () => {
      const uf = new WeightedUnion(3, { initialWeight: 5 })
      expect(uf.weight(0)).toBe(5)
    })
  })

  // ─── find / union / connected ─────────────────────────────────────────

  describe('find and union', () => {
    it('find returns the element itself initially', () => {
      const uf = new WeightedUnion(4)
      expect(uf.find(0)).toBe(0)
      expect(uf.find(3)).toBe(3)
    })

    it('union connects two components', () => {
      const uf = new WeightedUnion(4)
      expect(uf.union(0, 1)).toBe(true)
      expect(uf.connected(0, 1)).toBe(true)
      expect(uf.componentCount).toBe(3)
    })

    it('union returns false for already connected', () => {
      const uf = new WeightedUnion(3)
      uf.union(0, 1)
      expect(uf.union(0, 1)).toBe(false)
      expect(uf.componentCount).toBe(2)
    })

    it('union uses weighted union by size', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.connected(0, 3)).toBe(true)
      expect(uf.componentCount).toBe(1)
    })

    it('find throws for out-of-bounds index', () => {
      const uf = new WeightedUnion(3)
      expect(() => uf.find(-1)).toThrow(RangeError)
      expect(() => uf.find(3)).toThrow(RangeError)
    })
  })

  describe('connected', () => {
    it('returns false for unconnected elements', () => {
      const uf = new WeightedUnion(4)
      expect(uf.connected(0, 3)).toBe(false)
    })

    it('returns true after union chain', () => {
      const uf = new WeightedUnion(5)
      uf.union(0, 1)
      uf.union(1, 2)
      uf.union(2, 3)
      expect(uf.connected(0, 3)).toBe(true)
      expect(uf.connected(0, 4)).toBe(false)
    })
  })

  // ─── setSize / weight / setWeight ─────────────────────────────────────

  describe('setSize', () => {
    it('returns 1 for singleton', () => {
      const uf = new WeightedUnion(3)
      expect(uf.setSize(0)).toBe(1)
    })

    it('returns correct size after unions', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      uf.union(0, 2)
      expect(uf.setSize(0)).toBe(3)
      expect(uf.setSize(3)).toBe(1)
    })
  })

  describe('weight and setWeight', () => {
    it('setWeight updates root weight', () => {
      const uf = new WeightedUnion(3)
      uf.setWeight(0, 10)
      expect(uf.weight(0)).toBe(10)
    })

    it('weight is aggregated after union', () => {
      const uf = new WeightedUnion(3, { initialWeight: 2 })
      uf.union(0, 1)
      expect(uf.weight(0)).toBe(4)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('produces an independent copy', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      const copy = uf.clone()
      expect(copy.size).toBe(4)
      expect(copy.componentCount).toBe(3)
      copy.union(2, 3)
      expect(uf.componentCount).toBe(3)
      expect(copy.componentCount).toBe(2)
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements with their roots', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      const pairs: [number, number][] = []
      uf.forEach((el, root) => pairs.push([el, root]))
      expect(pairs.length).toBe(4)
      const root0 = uf.find(0)
      expect(pairs.filter(([, r]) => r === root0).length).toBe(2)
    })
  })

  // ─── fromElements ─────────────────────────────────────────────────────

  describe('fromElements', () => {
    it('creates a WeightedUnion with custom weights', () => {
      const uf = WeightedUnion.fromElements([5, 10, 15])
      expect(uf.size).toBe(3)
      expect(uf.weight(0)).toBe(5)
      expect(uf.weight(1)).toBe(10)
      expect(uf.weight(2)).toBe(15)
    })

    it('creates from empty array', () => {
      const uf = WeightedUnion.fromElements([])
      expect(uf.size).toBe(0)
    })
  })

  // ─── addComponent / removeComponent ───────────────────────────────────

  describe('addComponent', () => {
    it('adds a new component and returns its index', () => {
      const uf = new WeightedUnion(2)
      const idx = uf.addComponent(7)
      expect(idx).toBe(2)
      expect(uf.size).toBe(3)
      expect(uf.componentCount).toBe(3)
      expect(uf.weight(idx)).toBe(7)
    })

    it('adds with default weight of 1', () => {
      const uf = new WeightedUnion(0)
      uf.addComponent()
      expect(uf.weight(0)).toBe(1)
    })
  })

  describe('removeComponent', () => {
    it('removes a component making it its own set', () => {
      const uf = new WeightedUnion(3)
      uf.union(0, 1)
      uf.union(0, 2)
      uf.removeComponent(1)
      expect(uf.connected(0, 2)).toBe(true)
      expect(uf.connected(0, 1)).toBe(false)
      expect(uf.componentCount).toBe(2)
    })
  })

  // ─── components / getComponentInfo ────────────────────────────────────

  describe('components', () => {
    it('returns all components as arrays', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      const comps = uf.components()
      expect(comps.length).toBe(3)
    })
  })

  describe('getComponentInfo', () => {
    it('returns root, size, and weight', () => {
      const uf = new WeightedUnion(3)
      uf.union(0, 1)
      const info = uf.getComponentInfo(0)
      expect(info.size).toBe(2)
      expect(info.weight).toBe(2)
      expect(info.root).toBe(uf.find(0))
    })
  })

  // ─── reset ────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('resets all elements to their own component', () => {
      const uf = new WeightedUnion(4)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.reset()
      expect(uf.componentCount).toBe(4)
      expect(uf.connected(0, 1)).toBe(false)
    })
  })

  // ─── membersOf ────────────────────────────────────────────────────────

  describe('membersOf', () => {
    it('returns all members of a component', () => {
      const uf = new WeightedUnion(5)
      uf.union(0, 1)
      uf.union(0, 2)
      const root = uf.find(0)
      const members = uf.membersOf(root)
      expect(members).toContain(0)
      expect(members).toContain(1)
      expect(members).toContain(2)
      expect(members.length).toBe(3)
    })
  })

  // ─── iterator ─────────────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates yielding root for each element', () => {
      const uf = new WeightedUnion(3)
      uf.union(0, 1)
      const roots = [...uf]
      expect(roots.length).toBe(3)
      expect(roots[0]).toBe(roots[1])
    })
  })
})
