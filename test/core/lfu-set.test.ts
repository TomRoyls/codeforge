import { describe, it, expect, beforeEach } from 'vitest'
import { LfuSet } from '../../src/core/lfu-set/lfu-set.js'
import type { LfuSetOptions } from '../../src/core/lfu-set/lfu-set.js'

describe('LfuSet', () => {
  describe('constructor', () => {
    it('creates set with default options', () => {
      const set = new LfuSet<string>()
      expect(set.capacity).toBe(1000)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('creates set with custom capacity', () => {
      const set = new LfuSet<string>({ capacity: 5 })
      expect(set.capacity).toBe(5)
    })

    it('creates set with capacity 1', () => {
      const set = new LfuSet<number>({ capacity: 1 })
      expect(set.capacity).toBe(1)
    })

    it('creates set with capacity 0', () => {
      const set = new LfuSet<number>({ capacity: 0 })
      expect(set.capacity).toBe(0)
    })

    it('creates set with least-frequent eviction policy', () => {
      const set = new LfuSet<number>({
        capacity: 10,
        evictionPolicy: 'least-frequent',
      })
      expect(set.capacity).toBe(10)
    })

    it('creates set with least-recent-least-frequent eviction policy', () => {
      const set = new LfuSet<number>({
        capacity: 10,
        evictionPolicy: 'least-recent-least-frequent',
      })
      expect(set.capacity).toBe(10)
    })

    it('initializes with empty statistics', () => {
      const set = new LfuSet<number>()
      const stats = set.getStatistics()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.frequencyUpdates).toBe(0)
    })
  })

  describe('add', () => {
    it('adds a new element and returns true', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      expect(set.add('a')).toBe(true)
      expect(set.size).toBe(1)
    })

    it('adds multiple elements', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.size).toBe(3)
    })

    it('returns false when adding duplicate element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.add('a')).toBe(false)
      expect(set.size).toBe(1)
    })

    it('bumps frequency when adding duplicate', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('a')
      expect(set.getFrequency('a')).toBe(2)
    })

    it('evicts least frequent when at capacity', () => {
      const set = new LfuSet<string>({ capacity: 2 })
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.size).toBe(2)
      expect(set.has('a')).toBe(false)
    })

    it('evicts correct element (LFU) when at capacity', () => {
      const set = new LfuSet<string>({ capacity: 2 })
      set.add('a')
      set.add('b')
      set.access('b')
      set.add('c')
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('handles adding to capacity 0', () => {
      const set = new LfuSet<string>({ capacity: 0 })
      expect(set.add('a')).toBe(true)
      expect(set.size).toBe(0)
    })

    it('tracks frequency updates stat on duplicate add', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('a')
      expect(set.getStatistics().frequencyUpdates).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.has('a')).toBe(true)
    })

    it('returns false for missing element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      expect(set.has('a')).toBe(false)
    })

    it('bumps frequency when element found', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.getFrequency('a')).toBe(1)
      set.has('a')
      expect(set.getFrequency('a')).toBe(2)
    })

    it('increments hits stat on found', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.has('a')
      expect(set.getStatistics().hits).toBe(1)
    })

    it('increments misses stat on not found', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.has('missing')
      expect(set.getStatistics().misses).toBe(1)
    })

    it('multiple has calls increment frequency', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.has('a')
      set.has('a')
      set.has('a')
      expect(set.getFrequency('a')).toBe(4)
    })
  })

  describe('delete', () => {
    it('removes existing element and returns true', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.delete('a')).toBe(true)
      expect(set.size).toBe(0)
    })

    it('returns false for missing element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      expect(set.delete('a')).toBe(false)
    })

    it('element is no longer accessible after delete', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.delete('a')
      expect(set.has('a')).toBe(false)
    })

    it('frequency is undefined after delete', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.delete('a')
      expect(set.getFrequency('a')).toBeUndefined()
    })

    it('can re-add after delete', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.delete('a')
      expect(set.add('a')).toBe(true)
      expect(set.getFrequency('a')).toBe(1)
    })
  })

  describe('access', () => {
    it('bumps frequency for existing element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.access('a')
      expect(set.getFrequency('a')).toBe(2)
    })

    it('returns true for existing element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.access('a')).toBe(true)
    })

    it('returns false for missing element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      expect(set.access('missing')).toBe(false)
    })

    it('increments hits stat on success', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.access('a')
      expect(set.getStatistics().hits).toBe(1)
    })

    it('increments misses stat on failure', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.access('missing')
      expect(set.getStatistics().misses).toBe(1)
    })

    it('increments frequencyUpdates stat', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.access('a')
      expect(set.getStatistics().frequencyUpdates).toBe(1)
    })
  })

  describe('size and capacity', () => {
    it('size tracks number of elements', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      expect(set.size).toBe(0)
      set.add(1)
      expect(set.size).toBe(1)
      set.add(2)
      expect(set.size).toBe(2)
    })

    it('size decreases on delete', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(1)
      set.add(2)
      set.delete(1)
      expect(set.size).toBe(1)
    })

    it('capacity remains constant', () => {
      const set = new LfuSet<number>({ capacity: 5 })
      set.add(1)
      set.add(2)
      expect(set.capacity).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty set', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      expect(set.isEmpty()).toBe(true)
    })

    it('returns false after adding', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(1)
      expect(set.isEmpty()).toBe(false)
    })

    it('returns true after clearing', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(1)
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })

    it('returns true after deleting all', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(1)
      set.delete(1)
      expect(set.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('b')
      set.add('c')
      set.clear()
      expect(set.size).toBe(0)
    })

    it('resets statistics', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.has('a')
      set.has('missing')
      set.clear()
      const stats = set.getStatistics()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.frequencyUpdates).toBe(0)
    })

    it('can add after clear', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.clear()
      expect(set.add('a')).toBe(true)
      expect(set.size).toBe(1)
    })
  })

  describe('values', () => {
    it('returns empty array for empty set', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      expect(set.values()).toEqual([])
    })

    it('returns all values', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('b')
      set.add('c')
      const vals = set.values()
      expect(vals).toHaveLength(3)
      expect(vals).toContain('a')
      expect(vals).toContain('b')
      expect(vals).toContain('c')
    })

    it('sorts by frequency descending', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('low')
      set.add('high')
      set.access('high')
      set.access('high')
      const vals = set.values()
      expect(vals[0]).toBe('high')
    })

    it('sorts ties by last access (most recent first)', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('first')
      set.add('second')
      const vals = set.values()
      expect(vals[0]).toBe('second')
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      expect(set.toArray()).toEqual([])
    })

    it('returns all values as array', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('x')
      set.add('y')
      const arr = set.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).toContain('x')
      expect(arr).toContain('y')
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('b')
      set.add('c')
      const collected: string[] = []
      set.forEach((v) => collected.push(v))
      expect(collected).toHaveLength(3)
    })

    it('provides correct index', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(10)
      set.add(20)
      const indices: number[] = []
      set.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('does nothing on empty set', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      let called = false
      set.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(1)
      set.add(2)
      const arr = [...set]
      expect(arr).toHaveLength(2)
    })

    it('works with for-of', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('b')
      const collected: string[] = []
      for (const v of set) {
        collected.push(v)
      }
      expect(collected).toHaveLength(2)
    })
  })

  describe('getFrequency', () => {
    it('returns 1 for newly added element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.getFrequency('a')).toBe(1)
    })

    it('returns undefined for missing element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      expect(set.getFrequency('missing')).toBeUndefined()
    })

    it('increments with each access', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.access('a')
      set.access('a')
      set.access('a')
      expect(set.getFrequency('a')).toBe(4)
    })

    it('increments with has', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.has('a')
      expect(set.getFrequency('a')).toBe(2)
    })

    it('increments with duplicate add', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('a')
      set.add('a')
      expect(set.getFrequency('a')).toBe(3)
    })
  })

  describe('getLeastFrequent', () => {
    it('returns undefined for empty set', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      expect(set.getLeastFrequent()).toBeUndefined()
    })

    it('returns the only element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.getLeastFrequent()).toBe('a')
    })

    it('returns element with lowest frequency', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('b')
      set.access('b')
      set.access('b')
      expect(set.getLeastFrequent()).toBe('a')
    })

    it('returns oldest among ties for LRLFU policy', () => {
      const set = new LfuSet<string>({
        capacity: 10,
        evictionPolicy: 'least-recent-least-frequent',
      })
      set.add('first')
      set.add('second')
      expect(set.getLeastFrequent()).toBe('first')
    })
  })

  describe('getMostFrequent', () => {
    it('returns undefined for empty set', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      expect(set.getMostFrequent()).toBeUndefined()
    })

    it('returns the only element', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.getMostFrequent()).toBe('a')
    })

    it('returns element with highest frequency', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('b')
      set.access('a')
      set.access('a')
      expect(set.getMostFrequent()).toBe('a')
    })

    it('returns newest among ties', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('first')
      set.add('second')
      expect(set.getMostFrequent()).toBe('second')
    })
  })

  describe('getStatistics', () => {
    it('returns fresh copy each time', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      const s1 = set.getStatistics()
      const s2 = set.getStatistics()
      expect(s1).not.toBe(s2)
      expect(s1).toEqual(s2)
    })

    it('tracks hits correctly', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.has('a')
      set.access('a')
      expect(set.getStatistics().hits).toBe(2)
    })

    it('tracks misses correctly', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.has('x')
      set.access('y')
      expect(set.getStatistics().misses).toBe(2)
    })

    it('tracks evictions correctly', () => {
      const set = new LfuSet<string>({ capacity: 2 })
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.getStatistics().evictions).toBe(1)
    })

    it('tracks frequencyUpdates correctly', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.access('a')
      set.has('a')
      expect(set.getStatistics().frequencyUpdates).toBe(2)
    })
  })

  describe('eviction', () => {
    it('evicts least frequently used element', () => {
      const set = new LfuSet<string>({ capacity: 3 })
      set.add('a')
      set.add('b')
      set.add('c')
      set.access('b')
      set.access('c')
      set.add('d')
      expect(set.has('a')).toBe(false)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
      expect(set.has('d')).toBe(true)
    })

    it('evicts oldest among equal frequencies with LRLFU', () => {
      const set = new LfuSet<string>({
        capacity: 3,
        evictionPolicy: 'least-recent-least-frequent',
      })
      set.add('a')
      set.add('b')
      set.add('c')
      set.add('d')
      expect(set.has('a')).toBe(false)
    })

    it('multiple evictions track count', () => {
      const set = new LfuSet<number>({ capacity: 2 })
      set.add(1)
      set.add(2)
      set.add(3)
      set.add(4)
      expect(set.getStatistics().evictions).toBe(2)
    })

    it('size stays at capacity after evictions', () => {
      const set = new LfuSet<number>({ capacity: 3 })
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      expect(set.size).toBe(3)
    })

    it('frequently accessed items survive eviction', () => {
      const set = new LfuSet<string>({ capacity: 3 })
      set.add('hot')
      set.access('hot')
      set.access('hot')
      set.access('hot')
      set.add('b')
      set.add('c')
      set.add('d')
      expect(set.has('hot')).toBe(true)
    })

    it('eviction with capacity 1', () => {
      const set = new LfuSet<string>({ capacity: 1 })
      set.add('a')
      set.add('b')
      expect(set.size).toBe(1)
      expect(set.has('b')).toBe(true)
    })

    it('no eviction when below capacity', () => {
      const set = new LfuSet<number>({ capacity: 100 })
      for (let i = 0; i < 50; i++) {
        set.add(i)
      }
      expect(set.getStatistics().evictions).toBe(0)
    })
  })

  describe('tie-breaking with least-frequent policy', () => {
    it('evicts any element with lowest frequency when tied', () => {
      const set = new LfuSet<string>({
        capacity: 2,
        evictionPolicy: 'least-frequent',
      })
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.size).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('empty set operations', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      expect(set.isEmpty()).toBe(true)
      expect(set.size).toBe(0)
      expect(set.values()).toEqual([])
      expect(set.toArray()).toEqual([])
      expect(set.getLeastFrequent()).toBeUndefined()
      expect(set.getMostFrequent()).toBeUndefined()
      expect(set.getFrequency(1)).toBeUndefined()
    })

    it('single element set', () => {
      const set = new LfuSet<string>({ capacity: 1 })
      set.add('only')
      expect(set.size).toBe(1)
      expect(set.getLeastFrequent()).toBe('only')
      expect(set.getMostFrequent()).toBe('only')
    })

    it('repeated add/delete cycles', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      for (let i = 0; i < 5; i++) {
        set.add('a')
        set.delete('a')
      }
      expect(set.size).toBe(0)
    })

    it('works with number values', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(42)
      set.add(0)
      set.add(-1)
      expect(set.size).toBe(3)
    })

    it('works with object values by reference', () => {
      const set = new LfuSet<object>({ capacity: 10 })
      const obj = { key: 'value' }
      set.add(obj)
      expect(set.has(obj)).toBe(true)
    })

    it('add to capacity 0 immediately evicts', () => {
      const set = new LfuSet<string>({ capacity: 0 })
      set.add('a')
      expect(set.size).toBe(0)
      expect(set.getStatistics().evictions).toBe(1)
    })
  })

  describe('large-scale operations', () => {
    it('handles 200+ adds with evictions', () => {
      const set = new LfuSet<number>({ capacity: 50 })
      for (let i = 0; i < 200; i++) {
        set.add(i)
      }
      expect(set.size).toBe(50)
      expect(set.getStatistics().evictions).toBe(150)
    })

    it('frequently accessed items survive 200+ adds', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(999)
      for (let i = 0; i < 10; i++) {
        set.access(999)
      }
      for (let i = 0; i < 200; i++) {
        set.add(i)
      }
      expect(set.has(999)).toBe(true)
    })

    it('large frequency tracking', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('hot')
      for (let i = 0; i < 100; i++) {
        set.access('hot')
      }
      expect(set.getFrequency('hot')).toBe(101)
    })

    it('clear after large-scale operations', () => {
      const set = new LfuSet<number>({ capacity: 50 })
      for (let i = 0; i < 200; i++) {
        set.add(i)
      }
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
      const stats = set.getStatistics()
      expect(stats.evictions).toBe(0)
    })
  })

  describe('access pattern effects', () => {
    it('cold items get evicted before hot items', () => {
      const set = new LfuSet<string>({ capacity: 3 })
      set.add('cold')
      set.add('warm')
      set.add('hot')
      set.access('hot')
      set.access('hot')
      set.access('warm')
      set.add('new')
      expect(set.has('cold')).toBe(false)
    })

    it('previously evicted item can be re-added', () => {
      const set = new LfuSet<string>({ capacity: 2 })
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.has('a')).toBe(false)
      set.add('a')
      expect(set.has('a')).toBe(true)
    })

    it('access pattern affects eviction order', () => {
      const set = new LfuSet<string>({ capacity: 3 })
      set.add('x')
      set.add('y')
      set.add('z')
      set.access('x')
      set.access('y')
      set.add('w')
      expect(set.has('z')).toBe(false)
      expect(set.has('x')).toBe(true)
      expect(set.has('y')).toBe(true)
    })

    it('all items with same frequency - LRLFU evicts oldest', () => {
      const set = new LfuSet<string>({
        capacity: 3,
        evictionPolicy: 'least-recent-least-frequent',
      })
      set.add('first')
      set.add('second')
      set.add('third')
      set.add('fourth')
      expect(set.has('first')).toBe(false)
      expect(set.has('second')).toBe(true)
      expect(set.has('third')).toBe(true)
      expect(set.has('fourth')).toBe(true)
    })
  })

  describe('statistics reset on clear', () => {
    it('clear resets all stats', () => {
      const set = new LfuSet<string>({ capacity: 2 })
      set.add('a')
      set.add('b')
      set.has('a')
      set.has('missing')
      set.add('c')
      set.clear()
      const stats = set.getStatistics()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.frequencyUpdates).toBe(0)
    })

    it('stats accumulate correctly after clear', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.has('a')
      set.clear()
      set.add('b')
      set.has('b')
      expect(set.getStatistics().hits).toBe(1)
    })
  })

  describe('type imports', () => {
    it('exports LfuSetOptions type', () => {
      const opts: LfuSetOptions = {
        capacity: 5,
        evictionPolicy: 'least-frequent',
      }
      const set = new LfuSet<string>(opts)
      expect(set.capacity).toBe(5)
    })
  })

  describe('combined operations', () => {
    it('add then has then delete cycle', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.has('a')).toBe(true)
      expect(set.delete('a')).toBe(true)
      expect(set.has('a')).toBe(false)
    })

    it('mixed operations with eviction', () => {
      const set = new LfuSet<string>({ capacity: 3 })
      set.add('a')
      set.add('b')
      set.add('c')
      set.access('a')
      set.access('a')
      set.delete('b')
      set.add('d')
      set.add('e')
      expect(set.has('a')).toBe(true)
      expect(set.size).toBe(3)
    })

    it('statistics are consistent across operations', () => {
      const set = new LfuSet<string>({ capacity: 3 })
      set.add('a')
      set.add('b')
      set.add('c')
      set.has('a')
      set.has('missing')
      set.access('a')
      set.add('d')
      const stats = set.getStatistics()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.evictions).toBe(1)
      expect(stats.frequencyUpdates).toBe(2)
    })
  })

  describe('iterable consistency', () => {
    it('forEach and toArray have same elements', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(1)
      set.add(2)
      set.add(3)
      const arr = set.toArray()
      const forEachArr: number[] = []
      set.forEach((v) => forEachArr.push(v))
      expect(arr.sort()).toEqual(forEachArr.sort())
    })

    it('iterator and toArray have same elements', () => {
      const set = new LfuSet<number>({ capacity: 10 })
      set.add(1)
      set.add(2)
      const arr = set.toArray()
      const iterArr = [...set]
      expect(arr.sort()).toEqual(iterArr.sort())
    })
  })

  describe('getLeastFrequent and getMostFrequent edge cases', () => {
    it('single element is both least and most frequent', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('only')
      expect(set.getLeastFrequent()).toBe('only')
      expect(set.getMostFrequent()).toBe('only')
    })

    it('after access, most frequent changes', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('b')
      set.access('a')
      set.access('a')
      expect(set.getMostFrequent()).toBe('a')
      expect(set.getLeastFrequent()).toBe('b')
    })

    it('after delete, functions update correctly', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('b')
      set.access('a')
      set.delete('a')
      expect(set.getMostFrequent()).toBe('b')
      expect(set.getLeastFrequent()).toBe('b')
    })
  })

  describe('capacity boundaries', () => {
    it('exact capacity fill without eviction', () => {
      const set = new LfuSet<number>({ capacity: 5 })
      for (let i = 0; i < 5; i++) {
        set.add(i)
      }
      expect(set.size).toBe(5)
      expect(set.getStatistics().evictions).toBe(0)
    })

    it('one over capacity triggers one eviction', () => {
      const set = new LfuSet<number>({ capacity: 5 })
      for (let i = 0; i < 6; i++) {
        set.add(i)
      }
      expect(set.size).toBe(5)
      expect(set.getStatistics().evictions).toBe(1)
    })

    it('many over capacity triggers many evictions', () => {
      const set = new LfuSet<number>({ capacity: 5 })
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      expect(set.size).toBe(5)
      expect(set.getStatistics().evictions).toBe(95)
    })
  })

  describe('eviction with different types', () => {
    it('works with boolean values', () => {
      const set = new LfuSet<boolean>({ capacity: 2 })
      set.add(true)
      set.add(false)
      expect(set.size).toBe(2)
    })

    it('works with null values', () => {
      const set = new LfuSet<null>({ capacity: 2 })
      set.add(null)
      expect(set.size).toBe(1)
      expect(set.has(null)).toBe(true)
    })
  })

  describe('frequency updates only on actual access', () => {
    it('misses do not update frequency', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.has('missing')
      set.access('missing')
      expect(set.getStatistics().frequencyUpdates).toBe(0)
    })

    it('add of new element does not update frequency stat', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      expect(set.getStatistics().frequencyUpdates).toBe(0)
    })

    it('add of duplicate does update frequency stat', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('a')
      set.add('a')
      expect(set.getStatistics().frequencyUpdates).toBe(1)
    })
  })

  describe('values sorting', () => {
    it('values sorted by frequency descending', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('low')
      set.add('mid')
      set.add('high')
      set.access('high')
      set.access('high')
      set.access('mid')
      const vals = set.values()
      expect(vals[0]).toBe('high')
      expect(vals[1]).toBe('mid')
      expect(vals[2]).toBe('low')
    })

    it('values with same frequency sorted by recency', () => {
      const set = new LfuSet<string>({ capacity: 10 })
      set.add('old')
      set.add('new')
      const vals = set.values()
      expect(vals[0]).toBe('new')
      expect(vals[1]).toBe('old')
    })
  })
})
