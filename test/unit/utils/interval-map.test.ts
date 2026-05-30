import { describe, expect, it } from 'vitest'
import { IntervalMap } from '../../../src/utils/interval-map.js'

describe('IntervalMap', () => {
  describe('set', () => {
    it('throws RangeError when start > end', () => {
      const map = new IntervalMap<string>()
      expect(() => map.set(10, 5, 'value')).toThrow(RangeError)
      expect(() => map.set(10, 5, 'value')).toThrow('start (10) must be <= end (5)')
    })

    it('sets a valid interval', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      expect(map.size).toBe(1)
    })

    it('allows start == end', () => {
      const map = new IntervalMap<number>()
      map.set(5, 5, 42)
      expect(map.get(5)).toBe(42)
    })

    it('maintains entries sorted by start', () => {
      const map = new IntervalMap<string>()
      map.set(10, 20, 'third')
      map.set(0, 5, 'first')
      map.set(6, 9, 'second')
      const all = map.getAll()
      expect(all[0].start).toBe(0)
      expect(all[1].start).toBe(6)
      expect(all[2].start).toBe(10)
    })

    it('stores overlapping intervals', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      map.set(5, 15, 'second')
      expect(map.size).toBe(2)
    })
  })

  describe('get', () => {
    it('returns undefined for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.get(5)).toBeUndefined()
    })

    it('returns value for point within interval', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'value')
      expect(map.get(5)).toBe('value')
    })

    it('returns value at interval start', () => {
      const map = new IntervalMap<string>()
      map.set(5, 10, 'value')
      expect(map.get(5)).toBe('value')
    })

    it('returns value at interval end', () => {
      const map = new IntervalMap<string>()
      map.set(5, 10, 'value')
      expect(map.get(10)).toBe('value')
    })

    it('returns undefined for point before interval', () => {
      const map = new IntervalMap<string>()
      map.set(5, 10, 'value')
      expect(map.get(4)).toBeUndefined()
    })

    it('returns undefined for point after interval', () => {
      const map = new IntervalMap<string>()
      map.set(5, 10, 'value')
      expect(map.get(11)).toBeUndefined()
    })

    it('returns first matching value for overlapping intervals', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      map.set(5, 15, 'second')
      expect(map.get(7)).toBe('first')
    })
  })

  describe('has', () => {
    it('returns false for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.has(5)).toBe(false)
    })

    it('returns true for point within interval', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'value')
      expect(map.has(5)).toBe(true)
    })

    it('returns false for point outside interval', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'value')
      expect(map.has(11)).toBe(false)
    })

    it('returns true at interval boundaries', () => {
      const map = new IntervalMap<string>()
      map.set(5, 10, 'value')
      expect(map.has(5)).toBe(true)
      expect(map.has(10)).toBe(true)
    })
  })

  describe('getRange', () => {
    it('returns empty array for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.getRange(0, 10)).toEqual([])
    })

    it('returns empty array when no overlaps', () => {
      const map = new IntervalMap<string>()
      map.set(20, 30, 'value')
      expect(map.getRange(0, 10)).toEqual([])
    })

    it('returns values for overlapping intervals', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      map.set(15, 25, 'second')
      map.set(5, 20, 'third')
      const result = map.getRange(0, 15)
      expect(result).toEqual(['first', 'third', 'second'])
    })

    it('includes intervals that start before and end after query range', () => {
      const map = new IntervalMap<string>()
      map.set(0, 20, 'value')
      const result = map.getRange(5, 15)
      expect(result).toEqual(['value'])
    })

    it('includes intervals contained within query range', () => {
      const map = new IntervalMap<string>()
      map.set(5, 15, 'value')
      const result = map.getRange(0, 20)
      expect(result).toEqual(['value'])
    })
  })

  describe('getAll', () => {
    it('returns empty array for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.getAll()).toEqual([])
    })

    it('returns copy of all entries sorted by start', () => {
      const map = new IntervalMap<string>()
      map.set(10, 20, 'third')
      map.set(0, 5, 'first')
      map.set(6, 9, 'second')
      const all = map.getAll()
      expect(all.length).toBe(3)
      expect(all[0].start).toBe(0)
      expect(all[1].start).toBe(6)
      expect(all[2].start).toBe(10)
    })

    it('returns independent copy', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'value')
      const all = map.getAll()
      all.push({ start: 20, end: 30, value: 'new' } as any)
      expect(map.size).toBe(1)
    })
  })

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.size).toBe(0)
    })

    it('increments with each set', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      expect(map.size).toBe(1)
      map.set(20, 30, 'second')
      expect(map.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.isEmpty).toBe(true)
    })

    it('returns false after adding entry', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'value')
      expect(map.isEmpty).toBe(false)
    })
  })

  describe('delete', () => {
    it('returns false for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.delete(5)).toBe(false)
    })

    it('returns false when point not in any interval', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'value')
      expect(map.delete(15)).toBe(false)
    })

    it('deletes interval containing point', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'value')
      expect(map.delete(5)).toBe(true)
      expect(map.size).toBe(0)
    })

    it('deletes interval at boundary', () => {
      const map = new IntervalMap<string>()
      map.set(5, 10, 'value')
      expect(map.delete(5)).toBe(true)
      expect(map.size).toBe(0)
    })

    it('only deletes first matching interval', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      map.set(5, 15, 'second')
      map.delete(7)
      expect(map.size).toBe(1)
      expect(map.get(7)).toBe('second')
    })
  })

  describe('deleteRange', () => {
    it('returns 0 for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.deleteRange(0, 10)).toBe(0)
    })

    it('returns 0 when no overlaps', () => {
      const map = new IntervalMap<string>()
      map.set(20, 30, 'value')
      expect(map.deleteRange(0, 10)).toBe(0)
      expect(map.size).toBe(1)
    })

    it('removes all overlapping intervals', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      map.set(15, 25, 'second')
      map.set(5, 20, 'third')
      expect(map.deleteRange(0, 15)).toBe(3)
      expect(map.size).toBe(0)
    })

    it('removes interval completely within range', () => {
      const map = new IntervalMap<string>()
      map.set(5, 15, 'value')
      expect(map.deleteRange(0, 20)).toBe(1)
      expect(map.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('empties the map', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      map.set(20, 30, 'second')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('works on empty map', () => {
      const map = new IntervalMap<string>()
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  describe('getMinStart', () => {
    it('returns undefined for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.getMinStart()).toBeUndefined()
    })

    it('returns minimum start value', () => {
      const map = new IntervalMap<string>()
      map.set(10, 20, 'third')
      map.set(0, 5, 'first')
      map.set(6, 9, 'second')
      expect(map.getMinStart()).toBe(0)
    })
  })

  describe('getMaxEnd', () => {
    it('returns undefined for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.getMaxEnd()).toBeUndefined()
    })

    it('returns maximum end value', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      map.set(20, 30, 'third')
      map.set(5, 25, 'second')
      expect(map.getMaxEnd()).toBe(30)
    })
  })

  describe('forEach', () => {
    it('does nothing on empty map', () => {
      const map = new IntervalMap<string>()
      let called = false
      map.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })

    it('calls callback for each entry with correct index', () => {
      const map = new IntervalMap<string>()
      map.set(0, 5, 'first')
      map.set(10, 15, 'second')
      const entries: Array<{ start: number; end: number; value: string; index: number }> = []
      map.forEach((entry, index) => {
        entries.push({ start: entry.start, end: entry.end, value: entry.value, index })
      })
      expect(entries[0].index).toBe(0)
      expect(entries[0].value).toBe('first')
      expect(entries[1].index).toBe(1)
      expect(entries[1].value).toBe('second')
    })
  })

  describe('Symbol.iterator', () => {
    it('allows for...of iteration', () => {
      const map = new IntervalMap<string>()
      map.set(0, 5, 'first')
      map.set(10, 15, 'second')
      const entries: Array<{ start: number; value: string }> = []
      for (const entry of map) {
        entries.push({ start: entry.start, value: entry.value })
      }
      expect(entries.length).toBe(2)
      expect(entries[0].value).toBe('first')
      expect(entries[1].value).toBe('second')
    })

    it('returns iterator from entries', () => {
      const map = new IntervalMap<string>()
      map.set(0, 5, 'value')
      const iterator = map[Symbol.iterator]()
      const result = iterator.next()
      expect(result.done).toBe(false)
      expect(result.value.value).toBe('value')
    })
  })

  describe('overlaps', () => {
    it('returns false for empty map', () => {
      const map = new IntervalMap<string>()
      expect(map.overlaps(0, 10)).toBe(false)
    })

    it('returns false when no overlaps', () => {
      const map = new IntervalMap<string>()
      map.set(20, 30, 'value')
      expect(map.overlaps(0, 10)).toBe(false)
    })

    it('returns true when intervals overlap', () => {
      const map = new IntervalMap<string>()
      map.set(5, 15, 'value')
      expect(map.overlaps(0, 10)).toBe(true)
    })

    it('returns true for adjacent intervals', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'value')
      expect(map.overlaps(10, 20)).toBe(true)
    })

    it('returns true for contained interval', () => {
      const map = new IntervalMap<string>()
      map.set(5, 10, 'value')
      expect(map.overlaps(0, 20)).toBe(true)
    })

    it('returns true for containing interval', () => {
      const map = new IntervalMap<string>()
      map.set(0, 20, 'value')
      expect(map.overlaps(5, 10)).toBe(true)
    })
  })

  describe('clone', () => {
    it('creates independent copy of empty map', () => {
      const map = new IntervalMap<string>()
      const clone = map.clone()
      clone.set(0, 10, 'value')
      expect(map.size).toBe(0)
    })

    it('creates independent copy with data', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      map.set(20, 30, 'second')
      const clone = map.clone()
      map.set(40, 50, 'third')
      expect(clone.size).toBe(2)
      expect(map.size).toBe(3)
    })

    it('clone has same entries as original', () => {
      const map = new IntervalMap<string>()
      map.set(0, 10, 'first')
      map.set(20, 30, 'second')
      const clone = map.clone()
      const originalEntries = map.getAll()
      const cloneEntries = clone.getAll()
      expect(cloneEntries.length).toBe(originalEntries.length)
      expect(cloneEntries[0].value).toBe(originalEntries[0].value)
      expect(cloneEntries[1].value).toBe(originalEntries[1].value)
    })
  })
})