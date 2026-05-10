import { describe, it, expect } from 'vitest'
import { TieredHeap } from '../../src/core/tiered-heap/tiered-heap.js'

describe('TieredHeap', () => {
  describe('constructor', () => {
    it('creates heap with default 3 tiers', () => {
      const heap = new TieredHeap<number>()
      expect(heap.tiers).toBe(3)
    })

    it('creates heap with custom tier count', () => {
      const heap = new TieredHeap<number>(5)
      expect(heap.tiers).toBe(5)
    })

    it('creates heap with single tier', () => {
      const heap = new TieredHeap<number>(1)
      expect(heap.tiers).toBe(1)
    })

    it('throws for zero tiers', () => {
      expect(() => new TieredHeap<number>(0)).toThrow('at least 1 tier')
    })

    it('throws for negative tiers', () => {
      expect(() => new TieredHeap<number>(-1)).toThrow('at least 1 tier')
    })

    it('accepts custom comparator', () => {
      const heap = new TieredHeap<string>(3, (a, b) => b.localeCompare(a))
      heap.insert('a', 0)
      heap.insert('b', 0)
      expect(heap.extractMin()).toBe('b')
    })

    it('uses default ascending comparator', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(5, 0)
      heap.insert(3, 0)
      expect(heap.extractMin()).toBe(3)
    })
  })

  describe('insert', () => {
    it('inserts into tier 0', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(10, 0)
      expect(heap.size()).toBe(1)
      expect(heap.sizeOfTier(0)).toBe(1)
    })

    it('inserts into tier 1', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(10, 1)
      expect(heap.sizeOfTier(1)).toBe(1)
    })

    it('inserts into tier 2', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(10, 2)
      expect(heap.sizeOfTier(2)).toBe(1)
    })

    it('inserts multiple items into same tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 0)
      heap.insert(3, 0)
      expect(heap.sizeOfTier(0)).toBe(3)
    })

    it('inserts into highest tier', () => {
      const heap = new TieredHeap<number>(5)
      heap.insert(42, 4)
      expect(heap.sizeOfTier(4)).toBe(1)
    })

    it('throws for negative tier', () => {
      const heap = new TieredHeap<number>(3)
      expect(() => heap.insert(10, -1)).toThrow('out of range')
    })

    it('throws for tier equal to tier count', () => {
      const heap = new TieredHeap<number>(3)
      expect(() => heap.insert(10, 3)).toThrow('out of range')
    })

    it('throws for tier way above range', () => {
      const heap = new TieredHeap<number>(3)
      expect(() => heap.insert(10, 100)).toThrow('out of range')
    })
  })

  describe('extractMin', () => {
    it('returns undefined for empty heap', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.extractMin()).toBeUndefined()
    })

    it('extracts from tier 0 first', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(10, 1)
      heap.insert(5, 0)
      expect(heap.extractMin()).toBe(5)
    })

    it('extracts from tier 1 when tier 0 is empty', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(10, 1)
      heap.insert(20, 2)
      expect(heap.extractMin()).toBe(10)
    })

    it('extracts from tier 2 when tiers 0 and 1 are empty', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(10, 2)
      expect(heap.extractMin()).toBe(10)
    })

    it('maintains min-heap order within tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(5, 0)
      heap.insert(3, 0)
      heap.insert(7, 0)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
    })

    it('decrements size after extraction', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.extractMin()
      expect(heap.size()).toBe(1)
    })

    it('extracts all items in correct order across tiers', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(30, 2)
      heap.insert(10, 0)
      heap.insert(20, 1)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(20)
      expect(heap.extractMin()).toBe(30)
    })

    it('handles many items in same tier', () => {
      const heap = new TieredHeap<number>(3)
      for (let i = 10; i >= 1; i--) {
        heap.insert(i, 0)
      }
      for (let i = 1; i <= 10; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('empties the heap after extracting all items', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns undefined for empty heap', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.peek()).toBeUndefined()
    })

    it('returns minimum from highest priority tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(10, 1)
      heap.insert(5, 0)
      expect(heap.peek()).toBe(5)
    })

    it('does not remove the item', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(5, 0)
      heap.peek()
      expect(heap.size()).toBe(1)
    })

    it('returns min-heap root within tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(5, 0)
      heap.insert(3, 0)
      heap.insert(7, 0)
      expect(heap.peek()).toBe(3)
    })

    it('skips empty tiers', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 2)
      expect(heap.peek()).toBe(42)
    })
  })

  describe('peekTier', () => {
    it('returns -1 for empty heap', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.peekTier()).toBe(-1)
    })

    it('returns tier 0 when tier 0 has items', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      expect(heap.peekTier()).toBe(0)
    })

    it('returns tier 1 when tier 0 is empty', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 1)
      expect(heap.peekTier()).toBe(1)
    })

    it('returns tier 2 when tiers 0 and 1 are empty', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 2)
      expect(heap.peekTier()).toBe(2)
    })

    it('returns highest priority tier with items', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 2)
      heap.insert(2, 0)
      expect(heap.peekTier()).toBe(0)
    })
  })

  describe('size', () => {
    it('returns 0 for new heap', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.size()).toBe(0)
    })

    it('returns count after inserts', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.insert(3, 2)
      expect(heap.size()).toBe(3)
    })

    it('decrements after extraction', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.extractMin()
      expect(heap.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      expect(heap.isEmpty()).toBe(false)
    })

    it('returns true after all items extracted', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all items', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.insert(3, 2)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('clears all tiers', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.insert(3, 2)
      heap.clear()
      expect(heap.sizeOfTier(0)).toBe(0)
      expect(heap.sizeOfTier(1)).toBe(0)
      expect(heap.sizeOfTier(2)).toBe(0)
    })

    it('allows reuse after clear', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.clear()
      heap.insert(2, 1)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(2)
    })
  })

  describe('sizeOfTier', () => {
    it('returns 0 for empty tier', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.sizeOfTier(0)).toBe(0)
    })

    it('returns count for populated tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 1)
      heap.insert(2, 1)
      expect(heap.sizeOfTier(1)).toBe(2)
    })

    it('throws for invalid tier', () => {
      const heap = new TieredHeap<number>(3)
      expect(() => heap.sizeOfTier(5)).toThrow('out of range')
    })

    it('updates after extraction', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 0)
      heap.extractMin()
      expect(heap.sizeOfTier(0)).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.toArray()).toEqual([])
    })

    it('returns items from all tiers in order', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.insert(3, 2)
      const arr = heap.toArray()
      expect(arr).toHaveLength(3)
    })

    it('groups tier 0 items first', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(30, 2)
      heap.insert(10, 0)
      heap.insert(20, 1)
      const arr = heap.toArray()
      expect(arr[0]).toBe(10)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const heap1 = new TieredHeap<number>(3)
      heap1.insert(1, 0)
      heap1.insert(2, 1)
      const heap2 = new TieredHeap<number>(3)
      heap2.insert(3, 0)
      heap2.insert(4, 2)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(4)
    })

    it('merges items into correct tiers', () => {
      const heap1 = new TieredHeap<number>(3)
      heap1.insert(1, 0)
      const heap2 = new TieredHeap<number>(3)
      heap2.insert(2, 1)
      heap1.merge(heap2)
      expect(heap1.sizeOfTier(0)).toBe(1)
      expect(heap1.sizeOfTier(1)).toBe(1)
    })

    it('throws for different tier counts', () => {
      const heap1 = new TieredHeap<number>(3)
      const heap2 = new TieredHeap<number>(5)
      expect(() => heap1.merge(heap2)).toThrow('different tier counts')
    })

    it('preserves order after merge', () => {
      const heap1 = new TieredHeap<number>(3)
      heap1.insert(10, 0)
      const heap2 = new TieredHeap<number>(3)
      heap2.insert(5, 0)
      heap1.merge(heap2)
      expect(heap1.peek()).toBe(5)
    })

    it('merges empty heap', () => {
      const heap1 = new TieredHeap<number>(3)
      heap1.insert(1, 0)
      const heap2 = new TieredHeap<number>(3)
      heap1.merge(heap2)
      expect(heap1.size()).toBe(1)
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true for existing item', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      expect(heap.contains(42)).toBe(true)
    })

    it('returns false for non-existing item', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      expect(heap.contains(99)).toBe(false)
    })

    it('finds items in any tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.insert(3, 2)
      expect(heap.contains(2)).toBe(true)
    })

    it('finds items after extraction of other items', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 0)
      heap.extractMin()
      expect(heap.contains(2)).toBe(true)
    })
  })

  describe('remove', () => {
    it('returns false for empty heap', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.remove(1)).toBe(false)
    })

    it('removes existing item', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      expect(heap.remove(42)).toBe(true)
      expect(heap.size()).toBe(0)
    })

    it('returns false for non-existing item', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      expect(heap.remove(99)).toBe(false)
    })

    it('decrements size', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.remove(1)
      expect(heap.size()).toBe(1)
    })

    it('removes from correct tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.remove(2)
      expect(heap.sizeOfTier(1)).toBe(0)
      expect(heap.sizeOfTier(0)).toBe(1)
    })

    it('removes middle element from tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(5, 0)
      heap.insert(3, 0)
      heap.remove(5)
      expect(heap.sizeOfTier(0)).toBe(2)
    })

    it('can remove and re-insert', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.remove(1)
      heap.insert(1, 1)
      expect(heap.sizeOfTier(1)).toBe(1)
    })
  })

  describe('updateTier', () => {
    it('moves item to new tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      heap.updateTier(42, 2)
      expect(heap.sizeOfTier(0)).toBe(0)
      expect(heap.sizeOfTier(2)).toBe(1)
    })

    it('returns true for successful update', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      expect(heap.updateTier(42, 1)).toBe(true)
    })

    it('returns false for non-existing item', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.updateTier(42, 1)).toBe(false)
    })

    it('returns true when same tier (no-op)', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      expect(heap.updateTier(42, 0)).toBe(true)
    })

    it('preserves total size', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.updateTier(1, 2)
      expect(heap.size()).toBe(2)
    })

    it('throws for invalid new tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      expect(() => heap.updateTier(42, 5)).toThrow('out of range')
    })

    it('allows item to be extracted from new tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      heap.updateTier(42, 2)
      expect(heap.extractMin()).toBe(42)
    })

    it('moves item up in priority', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 2)
      heap.updateTier(42, 0)
      expect(heap.peekTier()).toBe(0)
      expect(heap.peek()).toBe(42)
    })
  })

  describe('tiers getter', () => {
    it('returns configured tier count', () => {
      const heap = new TieredHeap<number>(7)
      expect(heap.tiers).toBe(7)
    })
  })

  describe('currentTier getter', () => {
    it('returns -1 for empty heap', () => {
      const heap = new TieredHeap<number>(3)
      expect(heap.currentTier).toBe(-1)
    })

    it('returns highest non-empty tier index', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 2)
      expect(heap.currentTier).toBe(2)
    })

    it('returns lowest non-empty tier index', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 2)
      expect(heap.currentTier).toBe(0)
    })
  })

  describe('toArrayGrouped', () => {
    it('returns empty arrays for empty heap', () => {
      const heap = new TieredHeap<number>(3)
      const grouped = heap.toArrayGrouped()
      expect(grouped).toEqual([[], [], []])
    })

    it('groups items by tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.insert(3, 2)
      const grouped = heap.toArrayGrouped()
      expect(grouped[0]).toContain(1)
      expect(grouped[1]).toContain(2)
      expect(grouped[2]).toContain(3)
    })

    it('returns correct number of groups', () => {
      const heap = new TieredHeap<number>(5)
      const grouped = heap.toArrayGrouped()
      expect(grouped).toHaveLength(5)
    })

    it('keeps empty tiers as empty arrays', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 2)
      const grouped = heap.toArrayGrouped()
      expect(grouped[1]).toEqual([])
    })
  })

  describe('strings', () => {
    it('works with string values', () => {
      const heap = new TieredHeap<string>(3)
      heap.insert('charlie', 0)
      heap.insert('alpha', 0)
      heap.insert('bravo', 0)
      expect(heap.extractMin()).toBe('alpha')
      expect(heap.extractMin()).toBe('bravo')
      expect(heap.extractMin()).toBe('charlie')
    })

    it('works with strings across tiers', () => {
      const heap = new TieredHeap<string>(3)
      heap.insert('z', 0)
      heap.insert('a', 2)
      expect(heap.extractMin()).toBe('z')
    })
  })

  describe('objects', () => {
    it('works with custom comparator for objects', () => {
      interface Task {
        priority: number
        name: string
      }
      const heap = new TieredHeap<Task>(3, (a, b) => a.priority - b.priority)
      heap.insert({ priority: 3, name: 'low' }, 0)
      heap.insert({ priority: 1, name: 'high' }, 0)
      const result = heap.extractMin()
      expect(result!.name).toBe('high')
    })
  })

  describe('single tier', () => {
    it('behaves like a regular min-heap', () => {
      const heap = new TieredHeap<number>(1)
      heap.insert(5, 0)
      heap.insert(3, 0)
      heap.insert(1, 0)
      heap.insert(4, 0)
      heap.insert(2, 0)
      for (let i = 1; i <= 5; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('peekTier returns 0 when non-empty', () => {
      const heap = new TieredHeap<number>(1)
      heap.insert(1, 0)
      expect(heap.peekTier()).toBe(0)
    })

    it('toArrayGrouped returns single group', () => {
      const heap = new TieredHeap<number>(1)
      heap.insert(1, 0)
      expect(heap.toArrayGrouped()).toHaveLength(1)
    })
  })

  describe('large number of tiers', () => {
    it('handles many tiers', () => {
      const heap = new TieredHeap<number>(10)
      for (let tier = 0; tier < 10; tier++) {
        heap.insert(tier, tier)
      }
      for (let tier = 0; tier < 10; tier++) {
        expect(heap.extractMin()).toBe(tier)
      }
    })
  })

  describe('stress', () => {
    it('handles many insertions and extractions', () => {
      const heap = new TieredHeap<number>(3)
      for (let i = 0; i < 100; i++) {
        heap.insert(i, i % 3)
      }
      expect(heap.size()).toBe(100)
      let lastTierSeen = -1
      while (!heap.isEmpty()) {
        const val = heap.extractMin()!
        const tier = val % 3
        expect(tier).toBeGreaterThanOrEqual(lastTierSeen)
        lastTierSeen = tier
      }
    })

    it('handles interleaved insert and extract', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(5, 0)
      heap.insert(3, 0)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1, 0)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('tier priority ordering', () => {
    it('tier 0 always extracted before tier 1', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(100, 1)
      heap.insert(1, 0)
      heap.insert(99, 1)
      expect(heap.extractMin()).toBe(1)
    })

    it('tier 1 extracted before tier 2', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(50, 2)
      heap.insert(1, 1)
      expect(heap.extractMin()).toBe(1)
    })

    it('extracts all tier 0 before any tier 1', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(10, 0)
      heap.insert(20, 0)
      heap.insert(1, 1)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(20)
      expect(heap.extractMin()).toBe(1)
    })

    it('higher tier values still extracted after lower tier', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 2)
      heap.insert(100, 0)
      expect(heap.extractMin()).toBe(100)
      expect(heap.extractMin()).toBe(1)
    })
  })

  describe('remove + contains interaction', () => {
    it('contains returns false after remove', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(42, 0)
      heap.remove(42)
      expect(heap.contains(42)).toBe(false)
    })

    it('contains returns true for remaining items after remove', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 0)
      heap.remove(1)
      expect(heap.contains(2)).toBe(true)
    })
  })

  describe('updateTier + extractMin', () => {
    it('extracts from new tier after update', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 2)
      heap.insert(2, 0)
      heap.updateTier(2, 1)
      expect(heap.extractMin()).toBe(2)
    })

    it('demoted item extracted later', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 0)
      heap.updateTier(1, 2)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles duplicate values', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(5, 0)
      heap.insert(5, 0)
      expect(heap.size()).toBe(2)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
    })

    it('handles negative values', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(-5, 0)
      heap.insert(-10, 0)
      expect(heap.extractMin()).toBe(-10)
    })

    it('handles zero values', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(0, 0)
      expect(heap.extractMin()).toBe(0)
    })

    it('handles floating point values', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1.5, 0)
      heap.insert(0.5, 0)
      expect(heap.extractMin()).toBe(0.5)
    })

    it('clear then reuse maintains correctness', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(999, 0)
      heap.clear()
      heap.insert(1, 2)
      heap.insert(2, 0)
      expect(heap.extractMin()).toBe(2)
    })

    it('merge then extract in correct order', () => {
      const heap1 = new TieredHeap<number>(3)
      heap1.insert(10, 1)
      const heap2 = new TieredHeap<number>(3)
      heap2.insert(5, 0)
      heap1.merge(heap2)
      expect(heap1.extractMin()).toBe(5)
      expect(heap1.extractMin()).toBe(10)
    })

    it('toArrayGrouped after complex operations', () => {
      const heap = new TieredHeap<number>(3)
      heap.insert(1, 0)
      heap.insert(2, 1)
      heap.insert(3, 2)
      heap.extractMin()
      heap.insert(4, 0)
      const grouped = heap.toArrayGrouped()
      expect(grouped[0]).toContain(4)
      expect(grouped[1]).toContain(2)
      expect(grouped[2]).toContain(3)
    })
  })

  describe('descending comparator', () => {
    it('extracts largest first within tier', () => {
      const heap = new TieredHeap<number>(3, (a, b) => b - a)
      heap.insert(1, 0)
      heap.insert(5, 0)
      heap.insert(3, 0)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(1)
    })

    it('still respects tier ordering with descending comparator', () => {
      const heap = new TieredHeap<number>(3, (a, b) => b - a)
      heap.insert(100, 0)
      heap.insert(1, 2)
      expect(heap.extractMin()).toBe(100)
    })
  })
})
