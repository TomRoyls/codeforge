import { describe, it, expect, beforeEach } from 'vitest'
import { VEBTree } from '../../src/core/van-emde-boas-tree/van-emde-boas-tree.js'
import type { VEBNode } from '../../src/core/van-emde-boas-tree/types.js'

describe('VEBTree', () => {
  describe('constructor', () => {
    it('creates tree with universe size 2', () => {
      const tree = new VEBTree(2)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('creates tree with universe size 4', () => {
      const tree = new VEBTree(4)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with universe size 16', () => {
      const tree = new VEBTree(16)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with universe size 256', () => {
      const tree = new VEBTree(256)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with universe size 1024', () => {
      const tree = new VEBTree(1024)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with universe size 65536', () => {
      const tree = new VEBTree(65536)
      expect(tree.isEmpty()).toBe(true)
    })

    it('throws for universe size 0', () => {
      expect(() => new VEBTree(0)).toThrow('Universe size must be a power of 2')
    })

    it('throws for universe size 1', () => {
      expect(() => new VEBTree(1)).toThrow('Universe size must be a power of 2')
    })

    it('throws for universe size 3', () => {
      expect(() => new VEBTree(3)).toThrow('Universe size must be a power of 2')
    })

    it('throws for universe size 5', () => {
      expect(() => new VEBTree(5)).toThrow('Universe size must be a power of 2')
    })

    it('throws for universe size 6', () => {
      expect(() => new VEBTree(6)).toThrow('Universe size must be a power of 2')
    })

    it('throws for universe size 7', () => {
      expect(() => new VEBTree(7)).toThrow('Universe size must be a power of 2')
    })

    it('throws for universe size 100', () => {
      expect(() => new VEBTree(100)).toThrow('Universe size must be a power of 2')
    })
  })

  describe('insert and has', () => {
    let tree: VEBTree

    beforeEach(() => {
      tree = new VEBTree(16)
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
      expect(tree.size).toBe(1)
    })

    it('throws RangeError for negative values', () => {
      expect(() => tree.insert(-1)).toThrow(RangeError)
    })

    it('throws RangeError for value >= universe size', () => {
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
      expect(tree.size).toBe(16)
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

    it('inserts only odd values', () => {
      for (let i = 1; i < 16; i += 2) {
        tree.insert(i)
      }
      for (let i = 1; i < 16; i += 2) {
        expect(tree.has(i)).toBe(true)
      }
      for (let i = 0; i < 16; i += 2) {
        expect(tree.has(i)).toBe(false)
      }
    })
  })

  describe('min and max', () => {
    let tree: VEBTree

    beforeEach(() => {
      tree = new VEBTree(16)
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

    it('tracks min correctly with multiple inserts', () => {
      tree.insert(10)
      tree.insert(2)
      tree.insert(7)
      expect(tree.min()).toBe(2)
    })

    it('tracks max correctly with multiple inserts', () => {
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

    it('min and max are same for single element', () => {
      tree.insert(7)
      expect(tree.min()).toBe(tree.max())
    })

    it('min is 0 when 0 is inserted', () => {
      tree.insert(5)
      tree.insert(0)
      expect(tree.min()).toBe(0)
    })

    it('max is U-1 when U-1 is inserted', () => {
      tree.insert(5)
      tree.insert(15)
      expect(tree.max()).toBe(15)
    })
  })

  describe('successor', () => {
    let tree: VEBTree

    beforeEach(() => {
      tree = new VEBTree(16)
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

    it('returns undefined for successor of max element', () => {
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
      const t = new VEBTree(8)
      for (let i = 0; i < 8; i++) t.insert(i)
      for (let i = 0; i < 7; i++) {
        expect(t.successor(i)).toBe(i + 1)
      }
      expect(t.successor(7)).toBeUndefined()
    })

    it('returns undefined successor on empty tree', () => {
      const t = new VEBTree(16)
      expect(t.successor(5)).toBeUndefined()
    })

    it('finds successor across clusters', () => {
      const t = new VEBTree(16)
      t.insert(3)
      t.insert(10)
      expect(t.successor(3)).toBe(10)
    })
  })

  describe('predecessor', () => {
    let tree: VEBTree

    beforeEach(() => {
      tree = new VEBTree(16)
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

    it('returns undefined for predecessor of min element', () => {
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
      const t = new VEBTree(8)
      for (let i = 0; i < 8; i++) t.insert(i)
      for (let i = 7; i > 0; i--) {
        expect(t.predecessor(i)).toBe(i - 1)
      }
      expect(t.predecessor(0)).toBeUndefined()
    })

    it('returns undefined predecessor on empty tree', () => {
      const t = new VEBTree(16)
      expect(t.predecessor(5)).toBeUndefined()
    })

    it('finds predecessor across clusters', () => {
      const t = new VEBTree(16)
      t.insert(3)
      t.insert(10)
      expect(t.predecessor(10)).toBe(3)
    })
  })

  describe('remove', () => {
    let tree: VEBTree

    beforeEach(() => {
      tree = new VEBTree(16)
    })

    it('removes a single element', () => {
      tree.insert(5)
      expect(tree.remove(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false for removing non-existent element', () => {
      expect(tree.remove(5)).toBe(false)
    })

    it('returns false for negative value', () => {
      expect(tree.remove(-1)).toBe(false)
    })

    it('returns false for out-of-range value', () => {
      expect(tree.remove(16)).toBe(false)
    })

    it('removes min element', () => {
      tree.insert(2)
      tree.insert(5)
      tree.insert(8)
      expect(tree.remove(2)).toBe(true)
      expect(tree.min()).toBe(5)
      expect(tree.has(2)).toBe(false)
    })

    it('removes max element', () => {
      tree.insert(2)
      tree.insert(5)
      tree.insert(8)
      expect(tree.remove(8)).toBe(true)
      expect(tree.max()).toBe(5)
      expect(tree.has(8)).toBe(false)
    })

    it('removes middle element', () => {
      tree.insert(2)
      tree.insert(5)
      tree.insert(8)
      expect(tree.remove(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.min()).toBe(2)
      expect(tree.max()).toBe(8)
    })

    it('updates size after removal', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
      tree.remove(2)
      expect(tree.size).toBe(2)
    })

    it('handles remove and re-insert', () => {
      tree.insert(5)
      tree.remove(5)
      expect(tree.has(5)).toBe(false)
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
    })

    it('removes all elements one by one', () => {
      for (let i = 0; i < 8; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 8; i++) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('removes elements in reverse order', () => {
      for (let i = 0; i < 8; i++) {
        tree.insert(i)
      }
      for (let i = 7; i >= 0; i--) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('removes elements in alternating order', () => {
      for (let i = 0; i < 8; i++) {
        tree.insert(i)
      }
      expect(tree.remove(3)).toBe(true)
      expect(tree.remove(7)).toBe(true)
      expect(tree.remove(0)).toBe(true)
      expect(tree.remove(5)).toBe(true)
      expect(tree.toArray()).toEqual([1, 2, 4, 6])
    })

    it('does not affect other elements when removing', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.remove(3)
      expect(tree.has(1)).toBe(true)
      expect(tree.has(5)).toBe(true)
      expect(tree.has(7)).toBe(true)
    })
  })

  describe('isEmpty and size', () => {
    it('starts empty', () => {
      const tree = new VEBTree(16)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('is not empty after insert', () => {
      const tree = new VEBTree(16)
      tree.insert(5)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('tracks size correctly', () => {
      const tree = new VEBTree(16)
      tree.insert(1)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size).toBe(3)
    })

    it('becomes empty after all removes', () => {
      const tree = new VEBTree(16)
      tree.insert(1)
      tree.insert(3)
      tree.remove(1)
      tree.remove(3)
      expect(tree.isEmpty()).toBe(true)
    })

    it('size stays 0 for duplicate insert', () => {
      const tree = new VEBTree(16)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
    })

    it('size decrements on remove', () => {
      const tree = new VEBTree(16)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
      tree.remove(2)
      expect(tree.size).toBe(2)
      tree.remove(1)
      expect(tree.size).toBe(1)
    })

    it('size does not decrement for failed remove', () => {
      const tree = new VEBTree(16)
      tree.insert(5)
      tree.remove(3)
      expect(tree.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears the tree', () => {
      const tree = new VEBTree(16)
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('allows insert after clear', () => {
      const tree = new VEBTree(16)
      tree.insert(5)
      tree.clear()
      tree.insert(3)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(5)).toBe(false)
    })

    it('clear on empty tree is a no-op', () => {
      const tree = new VEBTree(16)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('can rebuild after clear', () => {
      const tree = new VEBTree(16)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      tree.insert(10)
      tree.insert(11)
      expect(tree.size).toBe(2)
      expect(tree.toArray()).toEqual([10, 11])
    })
  })

  describe('clone', () => {
    it('clones an empty tree', () => {
      const tree = new VEBTree(16)
      const cloned = tree.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('clones a tree with elements', () => {
      const tree = new VEBTree(16)
      tree.insert(3)
      tree.insert(7)
      tree.insert(11)
      const cloned = tree.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.has(3)).toBe(true)
      expect(cloned.has(7)).toBe(true)
      expect(cloned.has(11)).toBe(true)
    })

    it('clone is independent of original', () => {
      const tree = new VEBTree(16)
      tree.insert(3)
      tree.insert(7)
      const cloned = tree.clone()
      cloned.insert(10)
      expect(tree.has(10)).toBe(false)
      expect(cloned.has(10)).toBe(true)
    })

    it('clone preserves min and max', () => {
      const tree = new VEBTree(16)
      tree.insert(2)
      tree.insert(8)
      tree.insert(14)
      const cloned = tree.clone()
      expect(cloned.min()).toBe(2)
      expect(cloned.max()).toBe(14)
    })

    it('clone preserves toArray', () => {
      const tree = new VEBTree(16)
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      const cloned = tree.clone()
      expect(cloned.toArray()).toEqual([1, 5, 10])
    })

    it('modifying original does not affect clone', () => {
      const tree = new VEBTree(16)
      tree.insert(5)
      const cloned = tree.clone()
      tree.remove(5)
      expect(cloned.has(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
    })

    it('clone preserves successor and predecessor', () => {
      const tree = new VEBTree(16)
      tree.insert(2)
      tree.insert(6)
      tree.insert(10)
      const cloned = tree.clone()
      expect(cloned.successor(2)).toBe(6)
      expect(cloned.predecessor(10)).toBe(6)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new VEBTree(16)
      expect(tree.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const tree = new VEBTree(16)
      tree.insert(5)
      expect(tree.toArray()).toEqual([5])
    })

    it('returns sorted elements', () => {
      const tree = new VEBTree(16)
      tree.insert(10)
      tree.insert(2)
      tree.insert(7)
      tree.insert(15)
      expect(tree.toArray()).toEqual([2, 7, 10, 15])
    })

    it('returns consecutive elements in order', () => {
      const tree = new VEBTree(8)
      for (let i = 0; i < 8; i++) tree.insert(i)
      expect(tree.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('returns elements after removal', () => {
      const tree = new VEBTree(16)
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(5)
      expect(tree.toArray()).toEqual([1, 10])
    })

    it('returns elements after clear and reinsert', () => {
      const tree = new VEBTree(16)
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      tree.insert(10)
      expect(tree.toArray()).toEqual([10])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty tree', () => {
      const tree = new VEBTree(16)
      const result = [...tree]
      expect(result).toEqual([])
    })

    it('iterates over single element', () => {
      const tree = new VEBTree(16)
      tree.insert(5)
      const result = [...tree]
      expect(result).toEqual([5])
    })

    it('iterates in sorted order', () => {
      const tree = new VEBTree(16)
      tree.insert(10)
      tree.insert(2)
      tree.insert(7)
      tree.insert(15)
      const result = [...tree]
      expect(result).toEqual([2, 7, 10, 15])
    })

    it('iterates over consecutive elements', () => {
      const tree = new VEBTree(8)
      for (let i = 0; i < 8; i++) tree.insert(i)
      const result = [...tree]
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('works with for...of', () => {
      const tree = new VEBTree(16)
      tree.insert(3)
      tree.insert(7)
      tree.insert(11)
      const result: number[] = []
      for (const val of tree) {
        result.push(val)
      }
      expect(result).toEqual([3, 7, 11])
    })

    it('iterator works after modifications', () => {
      const tree = new VEBTree(16)
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(5)
      const result = [...tree]
      expect(result).toEqual([1, 10])
    })
  })

  describe('edge cases with universe size 2', () => {
    let tree: VEBTree

    beforeEach(() => {
      tree = new VEBTree(2)
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
      expect(tree.size).toBe(2)
    })

    it('removes 0 from {0,1}', () => {
      tree.insert(0)
      tree.insert(1)
      tree.remove(0)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(1)
    })

    it('removes 1 from {0,1}', () => {
      tree.insert(0)
      tree.insert(1)
      tree.remove(1)
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

    it('toArray returns both elements', () => {
      tree.insert(0)
      tree.insert(1)
      expect(tree.toArray()).toEqual([0, 1])
    })
  })

  describe('edge cases with universe size 4', () => {
    let tree: VEBTree

    beforeEach(() => {
      tree = new VEBTree(4)
    })

    it('inserts all 4 elements', () => {
      tree.insert(0)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(4)
      expect(tree.toArray()).toEqual([0, 1, 2, 3])
    })

    it('removes from full tree', () => {
      tree.insert(0)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.remove(1)
      tree.remove(3)
      expect(tree.toArray()).toEqual([0, 2])
    })

    it('successor in universe 4', () => {
      tree.insert(0)
      tree.insert(3)
      expect(tree.successor(0)).toBe(3)
      expect(tree.successor(3)).toBeUndefined()
    })

    it('predecessor in universe 4', () => {
      tree.insert(0)
      tree.insert(3)
      expect(tree.predecessor(3)).toBe(0)
      expect(tree.predecessor(0)).toBeUndefined()
    })
  })

  describe('large universe operations', () => {
    it('handles universe size 256', () => {
      const tree = new VEBTree(256)
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
      const tree = new VEBTree(256)
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

    it('handles boundary values in universe 256', () => {
      const tree = new VEBTree(256)
      tree.insert(0)
      tree.insert(255)
      expect(tree.successor(0)).toBe(255)
      expect(tree.predecessor(255)).toBe(0)
    })
  })

  describe('comprehensive delete scenarios', () => {
    it('removes from {0, 8} in universe 16', () => {
      const tree = new VEBTree(16)
      tree.insert(0)
      tree.insert(8)
      expect(tree.remove(0)).toBe(true)
      expect(tree.min()).toBe(8)
      expect(tree.max()).toBe(8)
    })

    it('removes from three elements leaving two', () => {
      const tree = new VEBTree(16)
      tree.insert(3)
      tree.insert(7)
      tree.insert(12)
      tree.remove(7)
      expect(tree.toArray()).toEqual([3, 12])
      expect(tree.min()).toBe(3)
      expect(tree.max()).toBe(12)
    })

    it('removes the only element leaving min and max undefined', () => {
      const tree = new VEBTree(16)
      tree.insert(5)
      tree.remove(5)
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })
  })

  describe('stress test', () => {
    it('inserts and removes all values in universe 64', () => {
      const tree = new VEBTree(64)
      for (let i = 0; i < 64; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(64)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(63)
      for (let i = 0; i < 64; i++) {
        expect(tree.has(i)).toBe(true)
      }
      for (let i = 0; i < 64; i++) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('inserts and removes even values in universe 64', () => {
      const tree = new VEBTree(64)
      for (let i = 0; i < 64; i += 2) {
        tree.insert(i)
      }
      expect(tree.size).toBe(32)
      for (let i = 0; i < 64; i += 2) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('inserts all then removes in reverse', () => {
      const tree = new VEBTree(64)
      for (let i = 0; i < 64; i++) {
        tree.insert(i)
      }
      for (let i = 63; i >= 0; i--) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('interleaved insert and remove', () => {
      const tree = new VEBTree(64)
      for (let i = 0; i < 64; i += 4) {
        tree.insert(i)
        tree.insert(i + 1)
        tree.remove(i)
      }
      for (let i = 0; i < 64; i++) {
        if (i % 4 === 1) {
          expect(tree.has(i)).toBe(true)
        } else {
          expect(tree.has(i)).toBe(false)
        }
      }
    })
  })

  describe('VEBNode type', () => {
    it('VEBNode interface is importable', () => {
      const node: VEBNode = {
        min: undefined,
        max: undefined,
        universeSize: 16,
        summary: null,
        clusters: new Map(),
      }
      expect(node.universeSize).toBe(16)
      expect(node.min).toBeUndefined()
      expect(node.max).toBeUndefined()
    })

    it('VEBNode can hold values', () => {
      const node: VEBNode = {
        min: 5,
        max: 10,
        universeSize: 16,
        summary: null,
        clusters: new Map(),
      }
      expect(node.min).toBe(5)
      expect(node.max).toBe(10)
    })
  })

  describe('successor and predecessor edge cases', () => {
    it('successor of value in gap finds next present value', () => {
      const tree = new VEBTree(16)
      tree.insert(0)
      tree.insert(15)
      expect(tree.successor(7)).toBe(15)
    })

    it('predecessor of value in gap finds previous present value', () => {
      const tree = new VEBTree(16)
      tree.insert(0)
      tree.insert(15)
      expect(tree.predecessor(7)).toBe(0)
    })

    it('successor when element is present returns next distinct element', () => {
      const tree = new VEBTree(16)
      tree.insert(3)
      tree.insert(5)
      expect(tree.successor(3)).toBe(5)
    })

    it('predecessor when element is present returns previous distinct element', () => {
      const tree = new VEBTree(16)
      tree.insert(3)
      tree.insert(5)
      expect(tree.predecessor(5)).toBe(3)
    })
  })

  describe('full universe operations', () => {
    it('inserts all values into universe 8 and verifies all operations', () => {
      const tree = new VEBTree(8)
      for (let i = 0; i < 8; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(8)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(7)
      expect(tree.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
      const result: number[] = []
      for (const v of tree) {
        result.push(v)
      }
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('removes from full universe and verifies remaining', () => {
      const tree = new VEBTree(8)
      for (let i = 0; i < 8; i++) {
        tree.insert(i)
      }
      tree.remove(3)
      tree.remove(5)
      expect(tree.size).toBe(6)
      expect(tree.has(3)).toBe(false)
      expect(tree.has(5)).toBe(false)
      expect(tree.toArray()).toEqual([0, 1, 2, 4, 6, 7])
    })

    it('full universe clone is correct', () => {
      const tree = new VEBTree(8)
      for (let i = 0; i < 8; i++) {
        tree.insert(i)
      }
      const cloned = tree.clone()
      expect(cloned.size).toBe(8)
      expect(cloned.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })
  })
})
