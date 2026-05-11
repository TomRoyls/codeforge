import { describe, it, expect } from 'vitest'
import { VanEmdeBoasTree } from '../../src/core/van-emde-boas-2/index.js'

describe('VanEmdeBoasTree', () => {
  describe('constructor', () => {
    it('creates a tree with default universe size', () => {
      const tree = new VanEmdeBoasTree()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates a tree with custom universe size', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates a tree with universe size 2', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 2 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates a tree with universe size 4', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 4 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates a tree with universe size 8', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 8 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates a tree with large universe size 65536', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 65536 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('throws for universe size less than 2', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 1 })).toThrow(RangeError)
    })

    it('throws for universe size 0', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 0 })).toThrow(RangeError)
    })

    it('throws for non-power-of-2 universe size', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 3 })).toThrow(RangeError)
    })

    it('throws for non-power-of-2 universe size 5', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 5 })).toThrow(RangeError)
    })

    it('throws for non-power-of-2 universe size 100', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 100 })).toThrow(RangeError)
    })
  })

  describe('isPowerOfTwo', () => {
    it('returns true for 1', () => {
      expect(VanEmdeBoasTree.isPowerOfTwo(1)).toBe(true)
    })

    it('returns true for 2', () => {
      expect(VanEmdeBoasTree.isPowerOfTwo(2)).toBe(true)
    })

    it('returns true for 256', () => {
      expect(VanEmdeBoasTree.isPowerOfTwo(256)).toBe(true)
    })

    it('returns false for 0', () => {
      expect(VanEmdeBoasTree.isPowerOfTwo(0)).toBe(false)
    })

    it('returns false for 3', () => {
      expect(VanEmdeBoasTree.isPowerOfTwo(3)).toBe(false)
    })

    it('returns false for negative', () => {
      expect(VanEmdeBoasTree.isPowerOfTwo(-4)).toBe(false)
    })
  })

  describe('insert and has', () => {
    it('inserts a single value and reports it present', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
      expect(tree.size()).toBe(1)
    })

    it('inserts value 0', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(0)
      expect(tree.has(0)).toBe(true)
    })

    it('inserts max value in universe', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(15)
      expect(tree.has(15)).toBe(true)
    })

    it('does not duplicate insert', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      tree.insert(5)
      expect(tree.size()).toBe(1)
    })

    it('inserts multiple values', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(11)
      expect(tree.size()).toBe(3)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(7)).toBe(true)
      expect(tree.has(11)).toBe(true)
    })

    it('reports non-inserted value as absent', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      expect(tree.has(3)).toBe(false)
    })

    it('throws on negative value', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(() => tree.insert(-1)).toThrow(RangeError)
    })

    it('throws on value >= universeSize', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(() => tree.insert(16)).toThrow(RangeError)
    })

    it('has returns false for negative value', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.has(-1)).toBe(false)
    })

    it('has returns false for value >= universeSize', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.has(16)).toBe(false)
    })

    it('inserts all values in universe size 2', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 2 })
      tree.insert(0)
      tree.insert(1)
      expect(tree.has(0)).toBe(true)
      expect(tree.has(1)).toBe(true)
      expect(tree.size()).toBe(2)
    })

    it('inserts all values in universe size 4', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 4 })
      for (let i = 0; i < 4; i++) tree.insert(i)
      expect(tree.size()).toBe(4)
      for (let i = 0; i < 4; i++) expect(tree.has(i)).toBe(true)
    })

    it('inserts values in reverse order', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      for (let i = 15; i >= 0; i--) tree.insert(i)
      expect(tree.size()).toBe(16)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(15)
    })
  })

  describe('min and max', () => {
    it('returns undefined for empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('returns same value for single element', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(7)
      expect(tree.min()).toBe(7)
      expect(tree.max()).toBe(7)
    })

    it('tracks min correctly across inserts', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(10)
      tree.insert(3)
      tree.insert(15)
      expect(tree.min()).toBe(3)
    })

    it('tracks max correctly across inserts', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(10)
      tree.insert(3)
      tree.insert(15)
      expect(tree.max()).toBe(15)
    })

    it('tracks min as 0', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(0)
      tree.insert(5)
      expect(tree.min()).toBe(0)
    })

    it('tracks max as universeSize - 1', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      tree.insert(15)
      expect(tree.max()).toBe(15)
    })
  })

  describe('delete', () => {
    it('deletes a single value', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false when deleting from empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.delete(5)).toBe(false)
    })

    it('returns false when deleting non-existent value', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      expect(tree.delete(3)).toBe(false)
    })

    it('returns false for out-of-range value', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.delete(-1)).toBe(false)
      expect(tree.delete(16)).toBe(false)
    })

    it('deletes min and updates min', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(10)
      tree.delete(3)
      expect(tree.min()).toBe(7)
      expect(tree.size()).toBe(2)
    })

    it('deletes max and updates max', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(10)
      tree.delete(10)
      expect(tree.max()).toBe(7)
      expect(tree.size()).toBe(2)
    })

    it('deletes all values leaving empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.delete(3)
      tree.delete(7)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('deletes middle value preserving others', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.delete(5)
      expect(tree.has(1)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.has(10)).toBe(true)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(10)
    })

    it('handles delete in universe size 2', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 2 })
      tree.insert(0)
      tree.insert(1)
      tree.delete(0)
      expect(tree.has(0)).toBe(false)
      expect(tree.has(1)).toBe(true)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(1)
    })

    it('handles delete of both elements in universe size 2', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 2 })
      tree.insert(0)
      tree.insert(1)
      tree.delete(0)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('successor', () => {
    it('returns undefined for empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.successor(5)).toBeUndefined()
    })

    it('returns the next larger value', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      expect(tree.successor(3)).toBe(7)
    })

    it('returns undefined when no successor exists', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      expect(tree.successor(5)).toBeUndefined()
    })

    it('returns successor of value not in tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      expect(tree.successor(4)).toBe(7)
    })

    it('returns min when querying below min', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      tree.insert(10)
      expect(tree.successor(2)).toBe(5)
    })

    it('returns undefined for out-of-range', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.successor(-1)).toBeUndefined()
      expect(tree.successor(16)).toBeUndefined()
    })

    it('works in universe size 2', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 2 })
      tree.insert(0)
      tree.insert(1)
      expect(tree.successor(0)).toBe(1)
    })

    it('returns undefined when successor would exceed universe', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 4 })
      tree.insert(3)
      expect(tree.successor(3)).toBeUndefined()
    })
  })

  describe('predecessor', () => {
    it('returns undefined for empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.predecessor(5)).toBeUndefined()
    })

    it('returns the next smaller value', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      expect(tree.predecessor(7)).toBe(3)
    })

    it('returns undefined when no predecessor exists', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      expect(tree.predecessor(5)).toBeUndefined()
    })

    it('returns predecessor of value not in tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      expect(tree.predecessor(6)).toBe(3)
    })

    it('returns max when querying above max', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      tree.insert(10)
      expect(tree.predecessor(12)).toBe(10)
    })

    it('returns undefined for out-of-range', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.predecessor(-1)).toBeUndefined()
      expect(tree.predecessor(16)).toBeUndefined()
    })

    it('works in universe size 2', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 2 })
      tree.insert(0)
      tree.insert(1)
      expect(tree.predecessor(1)).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(10)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('allows insert after clear', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      tree.clear()
      tree.insert(3)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('clear on empty tree is no-op', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.toArray()).toEqual([])
    })

    it('returns single element array', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      expect(tree.toArray()).toEqual([5])
    })

    it('returns sorted elements', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(10)
      tree.insert(3)
      tree.insert(7)
      expect(tree.toArray()).toEqual([3, 7, 10])
    })

    it('returns all elements for full tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 8 })
      for (let i = 0; i < 8; i++) tree.insert(i)
      expect(tree.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('returns sorted after random insert order', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      const order = [13, 2, 8, 15, 1, 6, 11, 4]
      for (const v of order) tree.insert(v)
      expect(tree.toArray()).toEqual([1, 2, 4, 6, 8, 11, 13, 15])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      let called = false
      tree.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('iterates all values in order', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(10)
      tree.insert(3)
      tree.insert(7)
      const result: number[] = []
      tree.forEach((v) => result.push(v))
      expect(result).toEqual([3, 7, 10])
    })

    it('provides correct index', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(10)
      tree.insert(3)
      tree.insert(7)
      const indices: number[] = []
      tree.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('extractMin', () => {
    it('returns undefined for empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.extractMin()).toBeUndefined()
    })

    it('extracts and removes the minimum', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(10)
      tree.insert(3)
      tree.insert(7)
      expect(tree.extractMin()).toBe(3)
      expect(tree.has(3)).toBe(false)
      expect(tree.size()).toBe(2)
      expect(tree.min()).toBe(7)
    })

    it('extracts all elements one by one', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 8 })
      tree.insert(5)
      tree.insert(2)
      tree.insert(7)
      expect(tree.extractMin()).toBe(2)
      expect(tree.extractMin()).toBe(5)
      expect(tree.extractMin()).toBe(7)
      expect(tree.extractMin()).toBeUndefined()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('extractMax', () => {
    it('returns undefined for empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.extractMax()).toBeUndefined()
    })

    it('extracts and removes the maximum', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(10)
      tree.insert(3)
      tree.insert(7)
      expect(tree.extractMax()).toBe(10)
      expect(tree.has(10)).toBe(false)
      expect(tree.size()).toBe(2)
      expect(tree.max()).toBe(7)
    })

    it('extracts all elements from the top', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 8 })
      tree.insert(5)
      tree.insert(2)
      tree.insert(7)
      expect(tree.extractMax()).toBe(7)
      expect(tree.extractMax()).toBe(5)
      expect(tree.extractMax()).toBe(2)
      expect(tree.extractMax()).toBeUndefined()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.size()).toBe(0)
    })

    it('size increments on insert', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(1)
      expect(tree.size()).toBe(1)
      tree.insert(2)
      expect(tree.size()).toBe(2)
    })

    it('size decrements on delete', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(1)
      tree.insert(2)
      tree.delete(1)
      expect(tree.size()).toBe(1)
    })

    it('isEmpty returns true after all deletes', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      tree.delete(5)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('stress tests with universe size 256', () => {
    it('inserts and finds all values 0..255', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 256 })
      for (let i = 0; i < 256; i++) tree.insert(i)
      expect(tree.size()).toBe(256)
      for (let i = 0; i < 256; i++) expect(tree.has(i)).toBe(true)
    })

    it('successor chain covers all values', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 256 })
      for (let i = 0; i < 256; i += 2) tree.insert(i)
      let cur = tree.min()
      const values: number[] = []
      while (cur !== undefined) {
        values.push(cur)
        cur = tree.successor(cur)
      }
      expect(values.length).toBe(128)
      for (let i = 0; i < values.length - 1; i++) {
        expect(values[i + 1]).toBeGreaterThan(values[i])
      }
    })

    it('predecessor chain covers all values in reverse', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 256 })
      for (let i = 0; i < 256; i += 3) tree.insert(i)
      let cur = tree.max()
      const values: number[] = []
      while (cur !== undefined) {
        values.push(cur)
        cur = tree.predecessor(cur)
      }
      for (let i = 0; i < values.length - 1; i++) {
        expect(values[i + 1]).toBeLessThan(values[i])
      }
    })

    it('delete all even values', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 64 })
      for (let i = 0; i < 64; i++) tree.insert(i)
      for (let i = 0; i < 64; i += 2) tree.delete(i)
      expect(tree.size()).toBe(32)
      for (let i = 0; i < 64; i++) {
        expect(tree.has(i)).toBe(i % 2 === 1)
      }
    })

    it('insert random values and verify toArray is sorted', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 256 })
      const rng = (seed: number) => {
        let s = seed
        return () => {
          s = (s * 1664525 + 1013904223) & 0xffffffff
          return (s >>> 0) % 256
        }
      }
      const rand = rng(42)
      const inserted = new Set<number>()
      for (let i = 0; i < 100; i++) {
        const v = rand()
        if (!inserted.has(v)) {
          tree.insert(v)
          inserted.add(v)
        }
      }
      const arr = tree.toArray()
      expect(arr.length).toBe(inserted.size)
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i + 1]).toBeGreaterThan(arr[i])
      }
    })
  })

  describe('universe size 4 edge cases', () => {
    it('inserts and deletes all values', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 4 })
      tree.insert(0)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size()).toBe(4)
      tree.delete(2)
      expect(tree.size()).toBe(3)
      expect(tree.has(2)).toBe(false)
      expect(tree.toArray()).toEqual([0, 1, 3])
    })

    it('successor and predecessor work at boundaries', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 4 })
      tree.insert(1)
      tree.insert(2)
      expect(tree.successor(0)).toBe(1)
      expect(tree.successor(1)).toBe(2)
      expect(tree.successor(2)).toBeUndefined()
      expect(tree.predecessor(3)).toBe(2)
      expect(tree.predecessor(2)).toBe(1)
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('delete min then max', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 4 })
      tree.insert(0)
      tree.insert(2)
      tree.insert(3)
      tree.delete(0)
      expect(tree.min()).toBe(2)
      tree.delete(3)
      expect(tree.max()).toBe(2)
      expect(tree.size()).toBe(1)
    })

    it('extractMin and extractMax on universe size 4', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 4 })
      tree.insert(0)
      tree.insert(3)
      expect(tree.extractMin()).toBe(0)
      expect(tree.extractMax()).toBe(3)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('universe size 8 comprehensive', () => {
    it('inserts sparse values', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 8 })
      tree.insert(0)
      tree.insert(4)
      tree.insert(7)
      expect(tree.toArray()).toEqual([0, 4, 7])
      expect(tree.successor(0)).toBe(4)
      expect(tree.successor(4)).toBe(7)
      expect(tree.predecessor(7)).toBe(4)
      expect(tree.predecessor(4)).toBe(0)
    })

    it('handles deleting only element', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 8 })
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('forEach on sparse tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 8 })
      tree.insert(1)
      tree.insert(4)
      tree.insert(6)
      const pairs: [number, number][] = []
      tree.forEach((v, i) => pairs.push([v, i]))
      expect(pairs).toEqual([[1, 0], [4, 1], [6, 2]])
    })
  })

  describe('interleaved operations', () => {
    it('insert, delete, insert again', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      tree.insert(10)
      tree.delete(5)
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
      expect(tree.size()).toBe(2)
    })

    it('repeatedly insert and extractMin', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(8)
      tree.insert(3)
      tree.insert(12)
      expect(tree.extractMin()).toBe(3)
      tree.insert(1)
      expect(tree.extractMin()).toBe(1)
      expect(tree.extractMin()).toBe(8)
      expect(tree.extractMin()).toBe(12)
      expect(tree.isEmpty()).toBe(true)
    })

    it('repeatedly insert and extractMax', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(8)
      tree.insert(3)
      tree.insert(12)
      expect(tree.extractMax()).toBe(12)
      tree.insert(15)
      expect(tree.extractMax()).toBe(15)
      expect(tree.extractMax()).toBe(8)
      expect(tree.extractMax()).toBe(3)
      expect(tree.isEmpty()).toBe(true)
    })

    it('clear and rebuild', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      tree.insert(10)
      tree.insert(11)
      expect(tree.toArray()).toEqual([10, 11])
      expect(tree.size()).toBe(2)
    })

    it('delete every other element and verify traversal', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 32 })
      for (let i = 0; i < 32; i++) tree.insert(i)
      for (let i = 0; i < 32; i += 2) tree.delete(i)
      const arr = tree.toArray()
      expect(arr.length).toBe(16)
      for (const v of arr) {
        expect(v % 2).toBe(1)
      }
    })

    it('re-inserts deleted value', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(7)
      tree.delete(7)
      expect(tree.has(7)).toBe(false)
      tree.insert(7)
      expect(tree.has(7)).toBe(true)
      expect(tree.size()).toBe(1)
    })

    it('successor and predecessor with gap values', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 64 })
      tree.insert(0)
      tree.insert(31)
      tree.insert(63)
      expect(tree.successor(0)).toBe(31)
      expect(tree.successor(31)).toBe(63)
      expect(tree.predecessor(63)).toBe(31)
      expect(tree.predecessor(31)).toBe(0)
      expect(tree.successor(15)).toBe(31)
      expect(tree.predecessor(45)).toBe(31)
    })
  })
})
