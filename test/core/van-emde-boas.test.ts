import { describe, it, expect, beforeEach } from 'vitest'
import { VanEmdeBoasTree } from '../../src/core/van-emde-boas/van-emde-boas.js'
import { DEFAULT_VEB_OPTIONS } from '../../src/core/van-emde-boas/van-emde-boas.js'
import type { VEBOptions } from '../../src/core/van-emde-boas/van-emde-boas.js'

describe('VanEmdeBoasTree', () => {
  describe('constructor', () => {
    it('creates tree with default options', () => {
      const tree = new VanEmdeBoasTree()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('creates tree with custom universe size', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with universe size 2', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 2 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with universe size 4', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 4 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with universe size 1024', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 1024 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with universe size 65536', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 65536 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('throws for non-power-of-2 universe size', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 3 })).toThrow(
        'Universe size must be a power of 2',
      )
    })

    it('throws for universe size 1', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 1 })).toThrow()
    })

    it('throws for universe size 0', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 0 })).toThrow()
    })

    it('throws for universe size 5', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 5 })).toThrow(
        'Universe size must be a power of 2',
      )
    })

    it('throws for universe size 100', () => {
      expect(() => new VanEmdeBoasTree({ universeSize: 100 })).toThrow(
        'Universe size must be a power of 2',
      )
    })
  })

  describe('insert and has', () => {
    let tree: VanEmdeBoasTree

    beforeEach(() => {
      tree = new VanEmdeBoasTree({ universeSize: 16 })
    })

    it('inserts a single element', () => {
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
    })

    it('inserts element 0', () => {
      tree.insert(0)
      expect(tree.has(0)).toBe(true)
    })

    it('inserts maximum element', () => {
      tree.insert(15)
      expect(tree.has(15)).toBe(true)
    })

    it('inserts multiple elements', () => {
      tree.insert(3)
      tree.insert(7)
      tree.insert(11)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(7)).toBe(true)
      expect(tree.has(11)).toBe(true)
    })

    it('does not contain non-inserted element', () => {
      tree.insert(5)
      expect(tree.has(4)).toBe(false)
    })

    it('handles duplicate insert gracefully', () => {
      tree.insert(5)
      tree.insert(5)
      expect(tree.size()).toBe(1)
    })

    it('throws for negative values', () => {
      expect(() => tree.insert(-1)).toThrow(RangeError)
    })

    it('throws for value >= universe size', () => {
      expect(() => tree.insert(16)).toThrow(RangeError)
    })

    it('returns false for has with negative value', () => {
      expect(tree.has(-1)).toBe(false)
    })

    it('returns false for has with out-of-range value', () => {
      expect(tree.has(16)).toBe(false)
      expect(tree.has(100)).toBe(false)
    })

    it('inserts all values in universe', () => {
      for (let i = 0; i < 16; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 16; i++) {
        expect(tree.has(i)).toBe(true)
      }
      expect(tree.size()).toBe(16)
    })

    it('inserts values in reverse order', () => {
      for (let i = 15; i >= 0; i--) {
        tree.insert(i)
      }
      for (let i = 0; i < 16; i++) {
        expect(tree.has(i)).toBe(true)
      }
    })

    it('inserts only even values', () => {
      for (let i = 0; i < 16; i += 2) {
        tree.insert(i)
      }
      for (let i = 0; i < 16; i += 2) {
        expect(tree.has(i)).toBe(true)
      }
      for (let i = 1; i < 16; i += 2) {
        expect(tree.has(i)).toBe(false)
      }
    })
  })

  describe('min and max', () => {
    let tree: VanEmdeBoasTree

    beforeEach(() => {
      tree = new VanEmdeBoasTree({ universeSize: 16 })
    })

    it('returns undefined min for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('returns undefined max for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('returns min after single insert', () => {
      tree.insert(5)
      expect(tree.min()).toBe(5)
    })

    it('returns max after single insert', () => {
      tree.insert(5)
      expect(tree.max()).toBe(5)
    })

    it('tracks min correctly', () => {
      tree.insert(10)
      tree.insert(2)
      tree.insert(7)
      expect(tree.min()).toBe(2)
    })

    it('tracks max correctly', () => {
      tree.insert(3)
      tree.insert(14)
      tree.insert(7)
      expect(tree.max()).toBe(14)
    })

    it('updates min when smaller element inserted', () => {
      tree.insert(8)
      expect(tree.min()).toBe(8)
      tree.insert(3)
      expect(tree.min()).toBe(3)
      tree.insert(0)
      expect(tree.min()).toBe(0)
    })

    it('updates max when larger element inserted', () => {
      tree.insert(4)
      expect(tree.max()).toBe(4)
      tree.insert(12)
      expect(tree.max()).toBe(12)
      tree.insert(15)
      expect(tree.max()).toBe(15)
    })
  })

  describe('successor', () => {
    let tree: VanEmdeBoasTree

    beforeEach(() => {
      tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(2)
      tree.insert(5)
      tree.insert(9)
      tree.insert(13)
    })

    it('finds successor of 0', () => {
      expect(tree.successor(0)).toBe(2)
    })

    it('finds successor of 2', () => {
      expect(tree.successor(2)).toBe(5)
    })

    it('finds successor of 3', () => {
      expect(tree.successor(3)).toBe(5)
    })

    it('finds successor of 7', () => {
      expect(tree.successor(7)).toBe(9)
    })

    it('returns undefined for successor of max', () => {
      expect(tree.successor(13)).toBeUndefined()
    })

    it('returns undefined for successor of 15', () => {
      expect(tree.successor(15)).toBeUndefined()
    })

    it('returns undefined for negative value', () => {
      expect(tree.successor(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-range value', () => {
      expect(tree.successor(16)).toBeUndefined()
    })

    it('finds successor in tree with consecutive values', () => {
      const t = new VanEmdeBoasTree({ universeSize: 8 })
      for (let i = 0; i < 8; i++) t.insert(i)
      for (let i = 0; i < 7; i++) {
        expect(t.successor(i)).toBe(i + 1)
      }
      expect(t.successor(7)).toBeUndefined()
    })
  })

  describe('predecessor', () => {
    let tree: VanEmdeBoasTree

    beforeEach(() => {
      tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(2)
      tree.insert(5)
      tree.insert(9)
      tree.insert(13)
    })

    it('finds predecessor of 15', () => {
      expect(tree.predecessor(15)).toBe(13)
    })

    it('finds predecessor of 13', () => {
      expect(tree.predecessor(13)).toBe(9)
    })

    it('finds predecessor of 10', () => {
      expect(tree.predecessor(10)).toBe(9)
    })

    it('finds predecessor of 7', () => {
      expect(tree.predecessor(7)).toBe(5)
    })

    it('returns undefined for predecessor of min', () => {
      expect(tree.predecessor(2)).toBeUndefined()
    })

    it('returns undefined for predecessor of 0', () => {
      expect(tree.predecessor(0)).toBeUndefined()
    })

    it('returns undefined for negative value', () => {
      expect(tree.predecessor(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-range value', () => {
      expect(tree.predecessor(16)).toBeUndefined()
    })

    it('finds predecessor in tree with consecutive values', () => {
      const t = new VanEmdeBoasTree({ universeSize: 8 })
      for (let i = 0; i < 8; i++) t.insert(i)
      for (let i = 7; i > 0; i--) {
        expect(t.predecessor(i)).toBe(i - 1)
      }
      expect(t.predecessor(0)).toBeUndefined()
    })
  })

  describe('delete', () => {
    let tree: VanEmdeBoasTree

    beforeEach(() => {
      tree = new VanEmdeBoasTree({ universeSize: 16 })
    })

    it('deletes a single element', () => {
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false for deleting non-existent element', () => {
      expect(tree.delete(5)).toBe(false)
    })

    it('returns false for negative value', () => {
      expect(tree.delete(-1)).toBe(false)
    })

    it('returns false for out-of-range value', () => {
      expect(tree.delete(16)).toBe(false)
    })

    it('deletes min element', () => {
      tree.insert(2)
      tree.insert(5)
      tree.insert(8)
      expect(tree.delete(2)).toBe(true)
      expect(tree.min()).toBe(5)
      expect(tree.has(2)).toBe(false)
    })

    it('deletes max element', () => {
      tree.insert(2)
      tree.insert(5)
      tree.insert(8)
      expect(tree.delete(8)).toBe(true)
      expect(tree.max()).toBe(5)
      expect(tree.has(8)).toBe(false)
    })

    it('deletes middle element', () => {
      tree.insert(2)
      tree.insert(5)
      tree.insert(8)
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.min()).toBe(2)
      expect(tree.max()).toBe(8)
    })

    it('updates size after deletion', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size()).toBe(3)
      tree.delete(2)
      expect(tree.size()).toBe(2)
    })

    it('handles delete and re-insert', () => {
      tree.insert(5)
      tree.delete(5)
      expect(tree.has(5)).toBe(false)
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
    })

    it('deletes all elements one by one', () => {
      for (let i = 0; i < 8; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 8; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('deletes elements in reverse order', () => {
      for (let i = 0; i < 8; i++) {
        tree.insert(i)
      }
      for (let i = 7; i >= 0; i--) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('isEmpty and size', () => {
    it('starts empty', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('is not empty after insert', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('tracks size correctly', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(1)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size()).toBe(3)
    })

    it('becomes empty after all deletes', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(1)
      tree.insert(3)
      tree.delete(1)
      tree.delete(3)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears the tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
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
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(5)
      expect(tree.toArray()).toEqual([5])
    })

    it('returns sorted elements', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(10)
      tree.insert(2)
      tree.insert(7)
      tree.insert(15)
      expect(tree.toArray()).toEqual([2, 7, 10, 15])
    })

    it('returns consecutive elements in order', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 8 })
      for (let i = 0; i < 8; i++) tree.insert(i)
      expect(tree.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('returns elements after deletion', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.delete(5)
      expect(tree.toArray()).toEqual([1, 10])
    })
  })

  describe('DEFAULT_VEB_OPTIONS', () => {
    it('has universeSize 256', () => {
      expect(DEFAULT_VEB_OPTIONS.universeSize).toBe(256)
    })
  })

  describe('VEBOptions type', () => {
    it('accepts valid options', () => {
      const opts: VEBOptions = { universeSize: 64 }
      expect(opts.universeSize).toBe(64)
    })
  })

  describe('edge cases with universe size 2', () => {
    let tree: VanEmdeBoasTree

    beforeEach(() => {
      tree = new VanEmdeBoasTree({ universeSize: 2 })
    })

    it('inserts 0', () => {
      tree.insert(0)
      expect(tree.has(0)).toBe(true)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(0)
    })

    it('inserts 1', () => {
      tree.insert(1)
      expect(tree.has(1)).toBe(true)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(1)
    })

    it('inserts both 0 and 1', () => {
      tree.insert(0)
      tree.insert(1)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(1)
      expect(tree.size()).toBe(2)
    })

    it('deletes 0 from {0,1}', () => {
      tree.insert(0)
      tree.insert(1)
      tree.delete(0)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(1)
    })

    it('deletes 1 from {0,1}', () => {
      tree.insert(0)
      tree.insert(1)
      tree.delete(1)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(0)
    })

    it('successor of 0 is 1', () => {
      tree.insert(0)
      tree.insert(1)
      expect(tree.successor(0)).toBe(1)
    })

    it('predecessor of 1 is 0', () => {
      tree.insert(0)
      tree.insert(1)
      expect(tree.predecessor(1)).toBe(0)
    })

    it('no successor for 1', () => {
      tree.insert(0)
      tree.insert(1)
      expect(tree.successor(1)).toBeUndefined()
    })

    it('no predecessor for 0', () => {
      tree.insert(0)
      tree.insert(1)
      expect(tree.predecessor(0)).toBeUndefined()
    })
  })

  describe('large universe operations', () => {
    it('handles universe size 256', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 256 })
      tree.insert(0)
      tree.insert(127)
      tree.insert(255)
      expect(tree.has(0)).toBe(true)
      expect(tree.has(127)).toBe(true)
      expect(tree.has(255)).toBe(true)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(255)
    })

    it('handles sparse insertions', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 256 })
      tree.insert(1)
      tree.insert(50)
      tree.insert(100)
      tree.insert(200)
      expect(tree.successor(1)).toBe(50)
      expect(tree.successor(50)).toBe(100)
      expect(tree.successor(100)).toBe(200)
      expect(tree.predecessor(200)).toBe(100)
      expect(tree.predecessor(100)).toBe(50)
      expect(tree.predecessor(50)).toBe(1)
    })
  })

  describe('successor and predecessor on empty tree', () => {
    it('returns undefined successor on empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.successor(5)).toBeUndefined()
    })

    it('returns undefined predecessor on empty tree', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      expect(tree.predecessor(5)).toBeUndefined()
    })
  })

  describe('comprehensive delete scenarios', () => {
    it('deletes from {0, 8} in universe 16', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(0)
      tree.insert(8)
      expect(tree.delete(0)).toBe(true)
      expect(tree.min()).toBe(8)
      expect(tree.max()).toBe(8)
    })

    it('deletes from three elements leaving two', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 16 })
      tree.insert(3)
      tree.insert(7)
      tree.insert(12)
      tree.delete(7)
      expect(tree.toArray()).toEqual([3, 12])
      expect(tree.min()).toBe(3)
      expect(tree.max()).toBe(12)
    })
  })

  describe('stress test', () => {
    it('inserts and deletes all values in universe 64', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 64 })
      for (let i = 0; i < 64; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(64)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(63)
      for (let i = 0; i < 64; i++) {
        expect(tree.has(i)).toBe(true)
      }
      for (let i = 0; i < 64; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('inserts and deletes even values in universe 64', () => {
      const tree = new VanEmdeBoasTree({ universeSize: 64 })
      for (let i = 0; i < 64; i += 2) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(32)
      for (let i = 0; i < 64; i += 2) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })
  })
})
