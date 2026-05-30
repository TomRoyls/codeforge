import { describe, expect, it } from 'vitest'

import { DisjointSet } from '../../../src/utils/disjoint-set.js'

describe('DisjointSet', () => {
  describe('add', () => {
    it('adds a new element', () => {
      const ds = new DisjointSet<string>()
      expect(ds.add('a')).toBe(true)
      expect(ds.has('a')).toBe(true)
    })

    it('returns false for duplicate element', () => {
      const ds = new DisjointSet<string>()
      ds.add('a')
      expect(ds.add('a')).toBe(false)
    })

    it('increments element count', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      ds.add(2)
      ds.add(3)
      expect(ds.elementCount).toBe(3)
    })
  })

  describe('find', () => {
    it('returns the element itself as root', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      expect(ds.find(1)).toBe(1)
    })

    it('returns the same root after union', () => {
      const ds = new DisjointSet<string>()
      ds.add('a')
      ds.add('b')
      ds.union('a', 'b')
      expect(ds.find('a')).toBe(ds.find('b'))
    })

    it('throws for missing element', () => {
      const ds = new DisjointSet<string>()
      expect(() => ds.find('x')).toThrow(RangeError)
    })
  })

  describe('union', () => {
    it('merges two separate sets', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      ds.add(2)
      expect(ds.union(1, 2)).toBe(true)
      expect(ds.connected(1, 2)).toBe(true)
    })

    it('returns false for already connected elements', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      ds.add(2)
      ds.union(1, 2)
      expect(ds.union(1, 2)).toBe(false)
    })

    it('decrements set count', () => {
      const ds = new DisjointSet<string>()
      ds.add('a')
      ds.add('b')
      ds.add('c')
      expect(ds.setCount).toBe(3)
      ds.union('a', 'b')
      expect(ds.setCount).toBe(2)
      ds.union('b', 'c')
      expect(ds.setCount).toBe(1)
    })

    it('handles chain unions', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 10; i++) ds.add(i)
      for (let i = 1; i < 10; i++) ds.union(0, i)
      for (let i = 0; i < 10; i++) {
        expect(ds.connected(0, i)).toBe(true)
      }
      expect(ds.setCount).toBe(1)
    })

    it('uses union by rank', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 100; i++) ds.add(i)
      for (let i = 1; i < 100; i++) ds.union(0, i)
      expect(ds.componentSize(0)).toBe(100)
    })
  })

  describe('connected', () => {
    it('returns true for same element', () => {
      const ds = new DisjointSet<string>()
      ds.add('a')
      expect(ds.connected('a', 'a')).toBe(true)
    })

    it('returns false for unconnected elements', () => {
      const ds = new DisjointSet<string>()
      ds.add('a')
      ds.add('b')
      expect(ds.connected('a', 'b')).toBe(false)
    })

    it('returns true after union', () => {
      const ds = new DisjointSet<string>()
      ds.add('a')
      ds.add('b')
      ds.union('a', 'b')
      expect(ds.connected('a', 'b')).toBe(true)
    })
  })

  describe('componentSize', () => {
    it('returns 1 for isolated element', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      expect(ds.componentSize(1)).toBe(1)
    })

    it('returns merged size after union', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      ds.add(2)
      ds.add(3)
      ds.union(1, 2)
      ds.union(1, 3)
      expect(ds.componentSize(1)).toBe(3)
    })
  })

  describe('getComponent', () => {
    it('returns all members of a component', () => {
      const ds = new DisjointSet<string>()
      ds.add('a')
      ds.add('b')
      ds.add('c')
      ds.add('d')
      ds.union('a', 'b')
      ds.union('a', 'c')
      const comp = ds.getComponent('a')
      expect(comp).toHaveLength(3)
      expect(comp).toContain('a')
      expect(comp).toContain('b')
      expect(comp).toContain('c')
      expect(comp).not.toContain('d')
    })
  })

  describe('toArray', () => {
    it('returns all components as arrays', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      ds.add(2)
      ds.add(3)
      ds.add(4)
      ds.union(1, 2)
      ds.union(3, 4)
      const groups = ds.toArray()
      expect(groups).toHaveLength(2)
      for (const g of groups) {
        expect(g).toHaveLength(2)
      }
    })

    it('returns single group when all connected', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      ds.add(2)
      ds.add(3)
      ds.union(1, 2)
      ds.union(2, 3)
      expect(ds.toArray()).toHaveLength(1)
      expect(ds.toArray()[0]).toHaveLength(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty set', () => {
      const ds = new DisjointSet<number>()
      expect(ds.isEmpty).toBe(true)
    })

    it('returns false after adding element', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      expect(ds.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      ds.add(2)
      ds.clear()
      expect(ds.elementCount).toBe(0)
      expect(ds.setCount).toBe(0)
      expect(ds.isEmpty).toBe(true)
    })
  })

  describe('stats', () => {
    it('returns correct stats', () => {
      const ds = new DisjointSet<number>()
      ds.add(1)
      ds.add(2)
      ds.add(3)
      ds.union(1, 2)
      const s = ds.stats()
      expect(s.elementCount).toBe(3)
      expect(s.setCount).toBe(2)
      expect(s.maxSetSize).toBe(2)
    })
  })

  describe('path compression', () => {
    it('flattens tree structure on repeated finds', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 100; i++) ds.add(i)
      for (let i = 1; i < 100; i++) ds.union(0, i)
      for (let i = 0; i < 100; i++) {
        ds.find(i)
      }
      expect(ds.connected(0, 99)).toBe(true)
      expect(ds.componentSize(0)).toBe(100)
    })
  })

  describe('string element type', () => {
    it('works with string keys', () => {
      const ds = new DisjointSet<string>()
      ds.add('node-a')
      ds.add('node-b')
      ds.add('node-c')
      ds.union('node-a', 'node-b')
      expect(ds.connected('node-a', 'node-b')).toBe(true)
      expect(ds.connected('node-a', 'node-c')).toBe(false)
    })
  })
})
