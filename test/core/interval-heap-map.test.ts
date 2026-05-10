import { describe, it, expect } from 'vitest'
import { IntervalHeapMap } from '../../src/core/interval-heap-map/interval-heap-map.js'

describe('IntervalHeapMap', () => {
  describe('constructor', () => {
    it('creates an empty map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.size()).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('creates a map with custom comparator', () => {
      const m = new IntervalHeapMap<string, number>({
        comparator: (a, b) => b.localeCompare(a),
      })
      m.set('alpha', 1)
      m.set('beta', 2)
      expect(m.findMin()!.key).toBe('beta')
      expect(m.findMax()!.key).toBe('alpha')
    })
  })

  describe('set and get', () => {
    it('sets and gets a single entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'one')
      expect(m.get(1)).toBe('one')
      expect(m.size()).toBe(1)
    })

    it('sets and gets multiple entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
      expect(m.get(3)).toBe('three')
      expect(m.size()).toBe(3)
    })

    it('overwrites value for existing key', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'one')
      m.set(1, 'ONE')
      expect(m.get(1)).toBe('ONE')
      expect(m.size()).toBe(1)
    })

    it('overwrites value does not change size', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(1, 'c')
      expect(m.size()).toBe(2)
    })

    it('returns undefined for nonexistent key', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.get(999)).toBeUndefined()
    })

    it('handles string keys', () => {
      const m = new IntervalHeapMap<string, number>()
      m.set('hello', 1)
      m.set('world', 2)
      expect(m.get('hello')).toBe(1)
      expect(m.get('world')).toBe(2)
    })

    it('handles object values', () => {
      const m = new IntervalHeapMap<number, { name: string }>()
      m.set(1, { name: 'a' })
      m.set(2, { name: 'b' })
      expect(m.get(1)).toEqual({ name: 'a' })
      expect(m.get(2)).toEqual({ name: 'b' })
    })

    it('set many entries in ascending order', () => {
      const m = new IntervalHeapMap<number, string>()
      for (let i = 1; i <= 50; i++) {
        m.set(i, `v${i}`)
      }
      expect(m.size()).toBe(50)
      expect(m.findMin()!.key).toBe(1)
      expect(m.findMax()!.key).toBe(50)
    })

    it('set many entries in descending order', () => {
      const m = new IntervalHeapMap<number, string>()
      for (let i = 50; i >= 1; i--) {
        m.set(i, `v${i}`)
      }
      expect(m.size()).toBe(50)
      expect(m.findMin()!.key).toBe(1)
      expect(m.findMax()!.key).toBe(50)
    })

    it('set entries with duplicate keys retains last value', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(1, 'b')
      m.set(1, 'c')
      expect(m.get(1)).toBe('c')
      expect(m.size()).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'one')
      expect(m.has(1)).toBe(true)
    })

    it('returns false for nonexistent key', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.has(1)).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'one')
      m.delete(1)
      expect(m.has(1)).toBe(false)
    })

    it('returns true for all keys after multiple sets', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.has(1)).toBe(true)
      expect(m.has(2)).toBe(true)
      expect(m.has(3)).toBe(true)
      expect(m.has(4)).toBe(false)
    })
  })

  describe('findMin', () => {
    it('returns undefined on empty map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.findMin()).toBeUndefined()
    })

    it('returns the only entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(5, 'five')
      expect(m.findMin()).toEqual({ key: 5, value: 'five' })
    })

    it('returns min of two entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      expect(m.findMin()).toEqual({ key: 3, value: 'three' })
    })

    it('returns min of two entries in reverse order', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(3, 'three')
      m.set(5, 'five')
      expect(m.findMin()).toEqual({ key: 3, value: 'three' })
    })

    it('returns min of many entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(10, 'a')
      m.set(5, 'b')
      m.set(20, 'c')
      m.set(1, 'd')
      m.set(15, 'e')
      expect(m.findMin()).toEqual({ key: 1, value: 'd' })
    })

    it('returns correct min after deletions', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(1)
      expect(m.findMin()).toEqual({ key: 2, value: 'b' })
    })

    it('findMin does not remove the entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.findMin()
      expect(m.size()).toBe(2)
      expect(m.has(1)).toBe(true)
    })
  })

  describe('findMax', () => {
    it('returns undefined on empty map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.findMax()).toBeUndefined()
    })

    it('returns the only entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(5, 'five')
      expect(m.findMax()).toEqual({ key: 5, value: 'five' })
    })

    it('returns max of two entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      expect(m.findMax()).toEqual({ key: 5, value: 'five' })
    })

    it('returns max of many entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(10, 'a')
      m.set(5, 'b')
      m.set(20, 'c')
      m.set(1, 'd')
      m.set(15, 'e')
      expect(m.findMax()).toEqual({ key: 20, value: 'c' })
    })

    it('returns correct max after deletions', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(3)
      expect(m.findMax()).toEqual({ key: 2, value: 'b' })
    })

    it('findMax does not remove the entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.findMax()
      expect(m.size()).toBe(2)
      expect(m.has(2)).toBe(true)
    })
  })

  describe('deleteMin', () => {
    it('returns undefined on empty map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.deleteMin()).toBeUndefined()
    })

    it('deletes and returns the only entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'one')
      const result = m.deleteMin()
      expect(result).toEqual({ key: 1, value: 'one' })
      expect(m.size()).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('deletes min of two entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.deleteMin()).toEqual({ key: 1, value: 'a' })
      expect(m.size()).toBe(1)
      expect(m.findMin()).toEqual({ key: 2, value: 'b' })
    })

    it('deletes min from many entries preserving heap property', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(5, 'a')
      m.set(3, 'b')
      m.set(8, 'c')
      m.set(1, 'd')
      m.set(9, 'e')
      expect(m.deleteMin()).toEqual({ key: 1, value: 'd' })
      expect(m.size()).toBe(4)
      expect(m.findMin()).toEqual({ key: 3, value: 'b' })
      expect(m.findMax()).toEqual({ key: 9, value: 'e' })
    })

    it('deleteMin removes key from map', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.deleteMin()
      expect(m.has(1)).toBe(false)
      expect(m.has(2)).toBe(true)
    })

    it('repeated deleteMin returns sorted order', () => {
      const m = new IntervalHeapMap<number, string>()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) m.set(v, `v${v}`)
      const sorted: number[] = []
      while (!m.isEmpty()) {
        sorted.push(m.deleteMin()!.key)
      }
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('deleteMin then set still works', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.deleteMin()
      m.set(3, 'c')
      expect(m.size()).toBe(2)
      expect(m.findMin()).toEqual({ key: 2, value: 'b' })
      expect(m.findMax()).toEqual({ key: 3, value: 'c' })
    })
  })

  describe('deleteMax', () => {
    it('returns undefined on empty map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.deleteMax()).toBeUndefined()
    })

    it('deletes and returns the only entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'one')
      const result = m.deleteMax()
      expect(result).toEqual({ key: 1, value: 'one' })
      expect(m.size()).toBe(0)
    })

    it('deletes max of two entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.deleteMax()).toEqual({ key: 2, value: 'b' })
      expect(m.size()).toBe(1)
      expect(m.findMax()).toEqual({ key: 1, value: 'a' })
    })

    it('deletes max from many entries preserving heap property', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(5, 'a')
      m.set(3, 'b')
      m.set(8, 'c')
      m.set(1, 'd')
      m.set(9, 'e')
      expect(m.deleteMax()).toEqual({ key: 9, value: 'e' })
      expect(m.size()).toBe(4)
      expect(m.findMin()).toEqual({ key: 1, value: 'd' })
      expect(m.findMax()).toEqual({ key: 8, value: 'c' })
    })

    it('deleteMax removes key from map', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.deleteMax()
      expect(m.has(2)).toBe(false)
      expect(m.has(1)).toBe(true)
    })

    it('repeated deleteMax returns descending order', () => {
      const m = new IntervalHeapMap<number, string>()
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      for (const v of values) m.set(v, `v${v}`)
      const sorted: number[] = []
      while (!m.isEmpty()) {
        sorted.push(m.deleteMax()!.key)
      }
      expect(sorted).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    })

    it('deleteMax then set still works', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.deleteMax()
      m.set(3, 'c')
      expect(m.size()).toBe(2)
      expect(m.findMin()).toEqual({ key: 1, value: 'a' })
      expect(m.findMax()).toEqual({ key: 3, value: 'c' })
    })
  })

  describe('delete', () => {
    it('returns false for nonexistent key', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.delete(1)).toBe(false)
    })

    it('deletes the only entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      expect(m.delete(1)).toBe(true)
      expect(m.size()).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('deletes from two entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.delete(1)).toBe(true)
      expect(m.size()).toBe(1)
      expect(m.has(1)).toBe(false)
      expect(m.has(2)).toBe(true)
    })

    it('deletes max entry from two', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.delete(2)).toBe(true)
      expect(m.size()).toBe(1)
      expect(m.findMin()).toEqual({ key: 1, value: 'a' })
      expect(m.findMax()).toEqual({ key: 1, value: 'a' })
    })

    it('deletes middle element preserving heap property', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(5, 'a')
      m.set(3, 'b')
      m.set(8, 'c')
      m.set(1, 'd')
      m.set(9, 'e')
      expect(m.delete(5)).toBe(true)
      expect(m.size()).toBe(4)
      expect(m.findMin()).toEqual({ key: 1, value: 'd' })
      expect(m.findMax()).toEqual({ key: 9, value: 'e' })
    })

    it('deletes min from many', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(5, 'a')
      m.set(3, 'b')
      m.set(8, 'c')
      m.set(1, 'd')
      expect(m.delete(1)).toBe(true)
      expect(m.findMin()).toEqual({ key: 3, value: 'b' })
    })

    it('deletes max from many', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(5, 'a')
      m.set(3, 'b')
      m.set(8, 'c')
      m.set(1, 'd')
      expect(m.delete(8)).toBe(true)
      expect(m.findMax()).toEqual({ key: 5, value: 'a' })
    })

    it('delete same key twice returns false second time', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      expect(m.delete(1)).toBe(true)
      expect(m.delete(1)).toBe(false)
    })

    it('delete all entries one by one', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.set(4, 'd')
      m.set(5, 'e')
      expect(m.delete(3)).toBe(true)
      expect(m.delete(1)).toBe(true)
      expect(m.delete(5)).toBe(true)
      expect(m.delete(2)).toBe(true)
      expect(m.delete(4)).toBe(true)
      expect(m.isEmpty()).toBe(true)
    })

    it('delete preserves other entries values', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(2)
      expect(m.get(1)).toBe('a')
      expect(m.get(3)).toBe('c')
    })
  })

  describe('update', () => {
    it('returns false for nonexistent key', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.update(1, 'x')).toBe(false)
    })

    it('updates value for existing key', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      expect(m.update(1, 'b')).toBe(true)
      expect(m.get(1)).toBe('b')
    })

    it('update does not change size', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.update(1, 'c')
      expect(m.size()).toBe(2)
    })

    it('update does not change key ordering', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.update(2, 'B')
      expect(m.findMin()).toEqual({ key: 1, value: 'a' })
      expect(m.findMax()).toEqual({ key: 3, value: 'c' })
      expect(m.get(2)).toBe('B')
    })

    it('update on min key updates value', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'b')
      m.update(1, 'A')
      expect(m.findMin()).toEqual({ key: 1, value: 'A' })
    })

    it('update on max key updates value', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'b')
      m.update(5, 'B')
      expect(m.findMax()).toEqual({ key: 5, value: 'B' })
    })

    it('set then update is equivalent to set with new value', () => {
      const m1 = new IntervalHeapMap<number, string>()
      m1.set(1, 'a')
      m1.set(1, 'b')

      const m2 = new IntervalHeapMap<number, string>()
      m2.set(1, 'a')
      m2.update(1, 'b')

      expect(m1.get(1)).toBe(m2.get(1))
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for new map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.size()).toBe(0)
    })

    it('isEmpty is true for new map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(m.isEmpty()).toBe(true)
    })

    it('size increments on set', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      expect(m.size()).toBe(1)
      m.set(2, 'b')
      expect(m.size()).toBe(2)
    })

    it('size does not increment on overwrite', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(1, 'b')
      expect(m.size()).toBe(1)
    })

    it('size decrements on delete', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.delete(1)
      expect(m.size()).toBe(1)
    })

    it('size decrements on deleteMin', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.deleteMin()
      expect(m.size()).toBe(1)
    })

    it('size decrements on deleteMax', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.deleteMax()
      expect(m.size()).toBe(1)
    })

    it('isEmpty after clearing all entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.delete(1)
      m.delete(2)
      expect(m.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears an empty map', () => {
      const m = new IntervalHeapMap<number, string>()
      m.clear()
      expect(m.size()).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('clears a populated map', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.clear()
      expect(m.size()).toBe(0)
      expect(m.isEmpty()).toBe(true)
      expect(m.findMin()).toBeUndefined()
      expect(m.findMax()).toBeUndefined()
    })

    it('map is usable after clear', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.clear()
      m.set(2, 'b')
      expect(m.size()).toBe(1)
      expect(m.get(2)).toBe('b')
    })

    it('old keys are not accessible after clear', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.clear()
      expect(m.get(1)).toBeUndefined()
      expect(m.has(2)).toBe(false)
    })
  })

  describe('keys', () => {
    it('returns empty iterator for empty map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect([...m.keys()]).toEqual([])
    })

    it('returns keys for single entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      expect([...m.keys()]).toEqual([1])
    })

    it('returns all keys', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      const keys = [...m.keys()]
      expect(keys).toHaveLength(3)
      expect(keys).toContain(1)
      expect(keys).toContain(2)
      expect(keys).toContain(3)
    })
  })

  describe('values', () => {
    it('returns empty iterator for empty map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect([...m.values()]).toEqual([])
    })

    it('returns values for single entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      expect([...m.values()]).toEqual(['a'])
    })

    it('returns all values', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      const vals = [...m.values()]
      expect(vals).toHaveLength(3)
      expect(vals).toContain('a')
      expect(vals).toContain('b')
      expect(vals).toContain('c')
    })
  })

  describe('entries', () => {
    it('returns empty iterator for empty map', () => {
      const m = new IntervalHeapMap<number, string>()
      expect([...m.entries()]).toEqual([])
    })

    it('returns entries for single entry', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      const entries = [...m.entries()]
      expect(entries).toEqual([{ key: 1, value: 'a' }])
    })

    it('returns all entries', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      const entries = [...m.entries()]
      expect(entries).toHaveLength(3)
      const keys = entries.map((e) => e.key)
      const vals = entries.map((e) => e.value)
      expect(keys).toContain(1)
      expect(keys).toContain(2)
      expect(keys).toContain(3)
      expect(vals).toContain('a')
      expect(vals).toContain('b')
      expect(vals).toContain('c')
    })

    it('entries reflect updates', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.update(1, 'z')
      const entries = [...m.entries()]
      expect(entries[0]!.value).toBe('z')
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(-5, 'a')
      m.set(-10, 'b')
      m.set(0, 'c')
      m.set(5, 'd')
      expect(m.findMin()).toEqual({ key: -10, value: 'b' })
      expect(m.findMax()).toEqual({ key: 5, value: 'd' })
    })

    it('handles zero key', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(0, 'zero')
      expect(m.get(0)).toBe('zero')
      expect(m.findMin()).toEqual({ key: 0, value: 'zero' })
      expect(m.findMax()).toEqual({ key: 0, value: 'zero' })
    })

    it('handles null value', () => {
      const m = new IntervalHeapMap<number, string | null>()
      m.set(1, null)
      expect(m.get(1)).toBeNull()
    })

    it('handles undefined value', () => {
      const m = new IntervalHeapMap<number, string | undefined>()
      m.set(1, undefined)
      expect(m.get(1)).toBeUndefined()
    })

    it('handles empty string key', () => {
      const m = new IntervalHeapMap<string, number>()
      m.set('', 0)
      expect(m.get('')).toBe(0)
    })

    it('handles very large numbers', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(Number.MAX_SAFE_INTEGER, 'max')
      m.set(Number.MIN_SAFE_INTEGER, 'min')
      expect(m.findMin()).toEqual({ key: Number.MIN_SAFE_INTEGER, value: 'min' })
      expect(m.findMax()).toEqual({ key: Number.MAX_SAFE_INTEGER, value: 'max' })
    })

    it('handles equal keys being set twice', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'first')
      m.set(1, 'second')
      expect(m.size()).toBe(1)
      expect(m.get(1)).toBe('second')
    })

    it('handles alternating min and max deletes', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.set(4, 'd')
      m.set(5, 'e')
      expect(m.deleteMin()).toEqual({ key: 1, value: 'a' })
      expect(m.deleteMax()).toEqual({ key: 5, value: 'e' })
      expect(m.deleteMin()).toEqual({ key: 2, value: 'b' })
      expect(m.deleteMax()).toEqual({ key: 4, value: 'd' })
      expect(m.deleteMin()).toEqual({ key: 3, value: 'c' })
      expect(m.isEmpty()).toBe(true)
    })

    it('operations on empty map do not throw', () => {
      const m = new IntervalHeapMap<number, string>()
      expect(() => m.findMin()).not.toThrow()
      expect(() => m.findMax()).not.toThrow()
      expect(() => m.deleteMin()).not.toThrow()
      expect(() => m.deleteMax()).not.toThrow()
      expect(() => m.delete(1)).not.toThrow()
      expect(() => m.get(1)).not.toThrow()
      expect(() => m.has(1)).not.toThrow()
      expect(() => m.update(1, 'x')).not.toThrow()
    })

    it('handles setting same value twice', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(1, 'a')
      expect(m.size()).toBe(1)
      expect(m.get(1)).toBe('a')
    })
  })

  describe('custom comparator', () => {
    it('reverse comparator', () => {
      const m = new IntervalHeapMap<number, string>({
        comparator: (a, b) => b - a,
      })
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.findMin()).toEqual({ key: 3, value: 'c' })
      expect(m.findMax()).toEqual({ key: 1, value: 'a' })
    })

    it('string comparator with locale', () => {
      const m = new IntervalHeapMap<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      })
      m.set('cherry', 1)
      m.set('apple', 2)
      m.set('banana', 3)
      expect(m.findMin()).toEqual({ key: 'apple', value: 2 })
      expect(m.findMax()).toEqual({ key: 'cherry', value: 1 })
    })

    it('custom comparator with delete operations', () => {
      const m = new IntervalHeapMap<number, string>({
        comparator: (a, b) => b - a,
      })
      m.set(1, 'a')
      m.set(5, 'b')
      m.set(3, 'c')
      expect(m.deleteMin()).toEqual({ key: 5, value: 'b' })
      expect(m.deleteMax()).toEqual({ key: 1, value: 'a' })
      expect(m.findMin()).toEqual({ key: 3, value: 'c' })
    })
  })

  describe('stress tests', () => {
    it('handles 1000 insertions and extractions', () => {
      const m = new IntervalHeapMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        m.set(i, i * 10)
      }
      expect(m.size()).toBe(1000)
      expect(m.findMin()!.key).toBe(0)
      expect(m.findMax()!.key).toBe(999)

      for (let i = 0; i < 1000; i++) {
        const min = m.deleteMin()!
        expect(min.key).toBe(i)
        expect(min.value).toBe(i * 10)
      }
      expect(m.isEmpty()).toBe(true)
    })

    it('handles 1000 reverse insertions', () => {
      const m = new IntervalHeapMap<number, number>()
      for (let i = 999; i >= 0; i--) {
        m.set(i, i * 10)
      }
      for (let i = 0; i < 1000; i++) {
        expect(m.deleteMin()!.key).toBe(i)
      }
    })

    it('handles random insertions sorted extraction', () => {
      const m = new IntervalHeapMap<number, number>()
      const shuffled = Array.from({ length: 100 }, (_, i) => i)
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
      }
      for (const v of shuffled) {
        m.set(v, v)
      }
      for (let i = 0; i < 100; i++) {
        expect(m.deleteMin()!.key).toBe(i)
      }
    })

    it('handles mixed deleteMin and deleteMax', () => {
      const m = new IntervalHeapMap<number, number>()
      for (let i = 0; i < 100; i++) {
        m.set(i, i)
      }
      const result: number[] = []
      let low = 0
      let high = 99
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          result.push(m.deleteMin()!.key)
          expect(result[result.length - 1]).toBe(low)
          low++
        } else {
          result.push(m.deleteMax()!.key)
          expect(result[result.length - 1]).toBe(high)
          high--
        }
      }
      expect(m.isEmpty()).toBe(true)
    })

    it('handles random deletions', () => {
      const m = new IntervalHeapMap<number, number>()
      const keys = Array.from({ length: 50 }, (_, i) => i)
      for (const k of keys) m.set(k, k * 2)
      const shuffled = [...keys]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
      }
      for (const k of shuffled) {
        expect(m.delete(k)).toBe(true)
      }
      expect(m.isEmpty()).toBe(true)
    })

    it('handles insert delete insert pattern', () => {
      const m = new IntervalHeapMap<number, string>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 20; i++) {
          m.set(round * 20 + i, `v${round * 20 + i}`)
        }
        for (let i = 0; i < 10; i++) {
          m.deleteMin()
        }
      }
      expect(m.size()).toBe(50)
    })

    it('handles overwrite during large set', () => {
      const m = new IntervalHeapMap<number, string>()
      for (let i = 0; i < 100; i++) {
        m.set(i, `a${i}`)
      }
      for (let i = 0; i < 100; i++) {
        m.set(i, `b${i}`)
      }
      expect(m.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(m.get(i)).toBe(`b${i}`)
      }
    })
  })

  describe('heap invariant verification', () => {
    it('min-max property holds after many operations', () => {
      const m = new IntervalHeapMap<number, string>()
      const ops = [3, 7, 1, 9, 4, 6, 2, 8, 5, 10]
      for (const v of ops) m.set(v, `v${v}`)

      for (let i = 0; i < 5; i++) {
        const min = m.findMin()!
        const max = m.findMax()!
        expect(min.key).toBeLessThanOrEqual(max.key)
        m.deleteMin()
        m.deleteMax()
      }
      expect(m.isEmpty()).toBe(true)
    })

    it('findMin always returns smallest after deletions', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(10, 'a')
      m.set(20, 'b')
      m.set(30, 'c')
      m.set(40, 'd')
      m.set(50, 'e')

      m.delete(10)
      expect(m.findMin()!.key).toBe(20)
      m.delete(20)
      expect(m.findMin()!.key).toBe(30)
      m.delete(30)
      expect(m.findMin()!.key).toBe(40)
    })

    it('findMax always returns largest after deletions', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(10, 'a')
      m.set(20, 'b')
      m.set(30, 'c')
      m.set(40, 'd')
      m.set(50, 'e')

      m.delete(50)
      expect(m.findMax()!.key).toBe(40)
      m.delete(40)
      expect(m.findMax()!.key).toBe(30)
      m.delete(30)
      expect(m.findMax()!.key).toBe(20)
    })

    it('all entries retrievable after complex operations', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      m.set(4, 'four')
      m.set(5, 'five')

      m.delete(3)
      m.set(6, 'six')
      m.update(1, 'ONE')
      m.deleteMin()

      expect(m.get(2)).toBe('two')
      expect(m.get(4)).toBe('four')
      expect(m.get(5)).toBe('five')
      expect(m.get(6)).toBe('six')
      expect(m.has(1)).toBe(false)
      expect(m.has(3)).toBe(false)
      expect(m.size()).toBe(4)
    })

    it('keys values entries iterators match', () => {
      const m = new IntervalHeapMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')

      const keys = [...m.keys()]
      const values = [...m.values()]
      const entries = [...m.entries()]

      expect(keys.length).toBe(values.length)
      expect(keys.length).toBe(entries.length)
      for (let i = 0; i < entries.length; i++) {
        expect(entries[i]!.key).toBe(keys[i])
        expect(entries[i]!.value).toBe(values[i])
      }
    })

    it('get returns correct value after heap restructuring', () => {
      const m = new IntervalHeapMap<number, string>()
      for (let i = 1; i <= 20; i++) {
        m.set(i, `v${i}`)
      }
      for (let i = 0; i < 10; i++) {
        m.deleteMin()
      }
      for (let i = 11; i <= 20; i++) {
        expect(m.get(i)).toBe(`v${i}`)
      }
    })

    it('delete specific key after many insertions', () => {
      const m = new IntervalHeapMap<number, string>()
      for (let i = 1; i <= 50; i++) m.set(i, `v${i}`)
      expect(m.delete(25)).toBe(true)
      expect(m.has(25)).toBe(false)
      expect(m.size()).toBe(49)
      for (let i = 1; i <= 50; i++) {
        if (i !== 25) {
          expect(m.has(i)).toBe(true)
        }
      }
    })
  })

  describe('type exports', () => {
    it('exports IntervalHeapMapOptions type', () => {
      const opts: import('../../src/core/interval-heap-map/interval-heap-map.js').IntervalHeapMapOptions<number> = {
        comparator: (a, b) => a - b,
      }
      expect(opts.comparator).toBeDefined()
    })

    it('exports IntervalHeapNode type', () => {
      const node: import('../../src/core/interval-heap-map/interval-heap-map.js').IntervalHeapNode<number, string> = {
        minKey: 1,
        minValue: 'a',
        maxKey: null,
        maxValue: null,
      }
      expect(node.minKey).toBe(1)
    })
  })
})
