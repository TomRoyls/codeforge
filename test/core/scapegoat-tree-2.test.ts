import { describe, it, expect } from 'vitest'
import { ScapegoatTree } from '../../src/core/scapegoat-tree-2/index.js'

function sorted<T>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

describe('ScapegoatTree', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const t = new ScapegoatTree<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('accepts custom comparator', () => {
      const t = new ScapegoatTree<number>({ compare: (a, b) => b - a })
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('accepts custom alpha', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.5 })
      expect(t.size).toBe(0)
    })

    it('accepts string comparator', () => {
      const t = new ScapegoatTree<string>({ compare: (a, b) => a.localeCompare(b) })
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('accepts reverse string comparator', () => {
      const t = new ScapegoatTree<string>({ compare: (a, b) => b.localeCompare(a) })
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.toArray()).toEqual(['cherry', 'banana', 'apple'])
    })

    it('works with default comparator for numbers', () => {
      const t = new ScapegoatTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('insert', () => {
    it('inserts single element', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      expect(t.size).toBe(1)
      expect(t.has(5)).toBe(true)
    })

    it('inserts multiple elements', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      t.insert(3)
      t.insert(7)
      expect(t.size).toBe(3)
      expect(t.toArray()).toEqual([3, 5, 7])
    })

    it('inserts duplicate keys (replaces)', () => {
      const t = new ScapegoatTree<number, string>()
      t.insert(5, 'first')
      t.insert(5, 'second')
      expect(t.size).toBe(1)
      expect(t.get(5)).toBe('second')
    })

    it('inserts in reverse order', () => {
      const t = new ScapegoatTree<number>()
      for (let i = 100; i >= 1; i--) t.insert(i)
      expect(t.size).toBe(100)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    })

    it('inserts in sorted order', () => {
      const t = new ScapegoatTree<number>()
      for (let i = 1; i <= 100; i++) t.insert(i)
      expect(t.size).toBe(100)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    })

    it('inserts shuffled elements', () => {
      const t = new ScapegoatTree<number>()
      const nums = shuffle(Array.from({ length: 50 }, (_, i) => i + 1))
      for (const n of nums) t.insert(n)
      expect(t.size).toBe(50)
      expect(t.toArray()).toEqual(sorted(nums))
    })

    it('handles negative numbers', () => {
      const t = new ScapegoatTree<number>()
      t.insert(-5)
      t.insert(-10)
      t.insert(0)
      t.insert(10)
      t.insert(5)
      expect(t.toArray()).toEqual([-10, -5, 0, 5, 10])
    })

    it('handles floating point numbers', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1.5)
      t.insert(0.5)
      t.insert(2.5)
      expect(t.toArray()).toEqual([0.5, 1.5, 2.5])
    })

    it('inserts with values', () => {
      const t = new ScapegoatTree<number, string>()
      t.insert(1, 'one')
      t.insert(2, 'two')
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
    })

    it('inserts string keys', () => {
      const t = new ScapegoatTree<string>()
      t.insert('delta')
      t.insert('alpha')
      t.insert('charlie')
      t.insert('bravo')
      expect(t.toArray()).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
    })

    it('inserts many elements preserving order', () => {
      const t = new ScapegoatTree<number>()
      const count = 1000
      const nums = shuffle(Array.from({ length: count }, (_, i) => i))
      for (const n of nums) t.insert(n)
      expect(t.toArray()).toEqual(sorted(nums))
    })

    it('inserts with alpha 0.5 triggers rebuilds', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.5 })
      for (let i = 0; i < 100; i++) t.insert(i)
      expect(t.size).toBe(100)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })

    it('inserts with alpha 0.9 minimal rebuilds', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.9 })
      for (let i = 0; i < 100; i++) t.insert(i)
      expect(t.size).toBe(100)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      expect(t.delete(5)).toBe(true)
      expect(t.has(5)).toBe(false)
      expect(t.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      expect(t.delete(3)).toBe(false)
      expect(t.size).toBe(1)
    })

    it('deletes from empty tree', () => {
      const t = new ScapegoatTree<number>()
      expect(t.delete(1)).toBe(false)
    })

    it('deletes all elements', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.delete(2)).toBe(true)
      expect(t.delete(1)).toBe(true)
      expect(t.delete(3)).toBe(true)
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('deletes root', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      t.insert(3)
      t.insert(7)
      expect(t.delete(5)).toBe(true)
      expect(t.size).toBe(2)
      expect(t.has(5)).toBe(false)
      expect(t.has(3)).toBe(true)
      expect(t.has(7)).toBe(true)
    })

    it('deletes leaf', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      t.insert(3)
      t.insert(7)
      expect(t.delete(3)).toBe(true)
      expect(t.toArray()).toEqual([5, 7])
    })

    it('deletes and reinserts', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      t.delete(5)
      t.insert(5)
      expect(t.has(5)).toBe(true)
      expect(t.size).toBe(1)
    })

    it('deletes many elements maintaining order', () => {
      const t = new ScapegoatTree<number>()
      const nums = Array.from({ length: 100 }, (_, i) => i)
      for (const n of shuffle(nums)) t.insert(n)
      const toDelete = [10, 20, 30, 40, 50]
      for (const d of toDelete) t.delete(d)
      const remaining = nums.filter((n) => !toDelete.includes(n))
      expect(t.toArray()).toEqual(remaining)
      expect(t.size).toBe(95)
    })

    it('deletes alternating from front and back', () => {
      const t = new ScapegoatTree<number>()
      for (let i = 0; i < 20; i++) t.insert(i)
      for (let i = 0; i < 10; i++) {
        t.delete(i)
        t.delete(19 - i)
      }
      expect(t.size).toBe(0)
    })

    it('deletes triggers global rebuild', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.7 })
      for (let i = 0; i < 100; i++) t.insert(i)
      for (let i = 0; i < 60; i++) t.delete(i)
      expect(t.toArray()).toEqual(Array.from({ length: 40 }, (_, i) => i + 60))
    })
  })

  describe('has', () => {
    it('returns false for empty tree', () => {
      const t = new ScapegoatTree<number>()
      expect(t.has(1)).toBe(false)
    })

    it('returns true for existing key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      expect(t.has(5)).toBe(true)
    })

    it('returns false for missing key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      expect(t.has(3)).toBe(false)
    })

    it('finds keys after many insertions', () => {
      const t = new ScapegoatTree<number>()
      for (let i = 0; i < 100; i++) t.insert(i)
      for (let i = 0; i < 100; i++) expect(t.has(i)).toBe(true)
      expect(t.has(100)).toBe(false)
      expect(t.has(-1)).toBe(false)
    })

    it('returns false after deletion', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      t.delete(5)
      expect(t.has(5)).toBe(false)
    })
  })

  describe('find and get', () => {
    it('find returns undefined for empty tree', () => {
      const t = new ScapegoatTree<number, string>()
      expect(t.find(1)).toBe(undefined)
    })

    it('get returns undefined for empty tree', () => {
      const t = new ScapegoatTree<number, string>()
      expect(t.get(1)).toBe(undefined)
    })

    it('find returns value for existing key', () => {
      const t = new ScapegoatTree<number, string>()
      t.insert(5, 'five')
      expect(t.find(5)).toBe('five')
    })

    it('get returns value for existing key', () => {
      const t = new ScapegoatTree<number, string>()
      t.insert(5, 'five')
      expect(t.get(5)).toBe('five')
    })

    it('returns undefined for missing key', () => {
      const t = new ScapegoatTree<number, string>()
      t.insert(5, 'five')
      expect(t.find(3)).toBe(undefined)
    })

    it('returns updated value after reinsert', () => {
      const t = new ScapegoatTree<number, string>()
      t.insert(5, 'old')
      t.insert(5, 'new')
      expect(t.get(5)).toBe('new')
    })

    it('returns undefined for key without value', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      expect(t.get(5)).toBe(undefined)
    })

    it('returns values for many keys', () => {
      const t = new ScapegoatTree<number, string>()
      for (let i = 0; i < 50; i++) t.insert(i, `v${i}`)
      for (let i = 0; i < 50; i++) expect(t.get(i)).toBe(`v${i}`)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty', () => {
      const t = new ScapegoatTree<number>()
      expect(t.size).toBe(0)
    })

    it('size increments on insert', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      expect(t.size).toBe(1)
      t.insert(2)
      expect(t.size).toBe(2)
    })

    it('size does not increment on duplicate insert', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(1)
      expect(t.size).toBe(1)
    })

    it('size decrements on delete', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.delete(1)
      expect(t.size).toBe(1)
    })

    it('isEmpty returns true for empty', () => {
      const t = new ScapegoatTree<number>()
      expect(t.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insert', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      expect(t.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after clearing all', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.delete(1)
      t.delete(2)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty tree', () => {
      const t = new ScapegoatTree<number>()
      t.clear()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('clears non-empty tree', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.clear()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
      expect(t.has(1)).toBe(false)
      expect(t.has(2)).toBe(false)
      expect(t.has(3)).toBe(false)
    })

    it('allows insert after clear', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.clear()
      t.insert(2)
      expect(t.size).toBe(1)
      expect(t.has(2)).toBe(true)
    })
  })

  describe('min and max', () => {
    it('min returns undefined for empty', () => {
      const t = new ScapegoatTree<number>()
      expect(t.min()).toBe(undefined)
    })

    it('max returns undefined for empty', () => {
      const t = new ScapegoatTree<number>()
      expect(t.max()).toBe(undefined)
    })

    it('min returns single element', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      expect(t.min()).toBe(5)
    })

    it('max returns single element', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      expect(t.max()).toBe(5)
    })

    it('min returns smallest after many inserts', () => {
      const t = new ScapegoatTree<number>()
      for (let i = 50; i >= 1; i--) t.insert(i)
      expect(t.min()).toBe(1)
    })

    it('max returns largest after many inserts', () => {
      const t = new ScapegoatTree<number>()
      for (let i = 1; i <= 50; i++) t.insert(i)
      expect(t.max()).toBe(50)
    })

    it('min updates after deletion', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.delete(1)
      expect(t.min()).toBe(2)
    })

    it('max updates after deletion', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.delete(3)
      expect(t.max()).toBe(2)
    })
  })

  describe('floor and ceiling', () => {
    it('floor returns undefined for empty', () => {
      const t = new ScapegoatTree<number>()
      expect(t.floor(5)).toBe(undefined)
    })

    it('ceiling returns undefined for empty', () => {
      const t = new ScapegoatTree<number>()
      expect(t.ceiling(5)).toBe(undefined)
    })

    it('floor returns exact match', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.floor(20)).toBe(20)
    })

    it('ceiling returns exact match', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.ceiling(20)).toBe(20)
    })

    it('floor returns largest smaller key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.floor(25)).toBe(20)
    })

    it('ceiling returns smallest larger key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.ceiling(25)).toBe(30)
    })

    it('floor returns undefined when all keys larger', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.floor(5)).toBe(undefined)
    })

    it('ceiling returns undefined when all keys smaller', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.ceiling(25)).toBe(undefined)
    })

    it('floor returns max when key exceeds all', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.floor(100)).toBe(20)
    })

    it('ceiling returns min when key below all', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.ceiling(0)).toBe(10)
    })
  })

  describe('lower and higher', () => {
    it('lower returns undefined for empty', () => {
      const t = new ScapegoatTree<number>()
      expect(t.lower(5)).toBe(undefined)
    })

    it('higher returns undefined for empty', () => {
      const t = new ScapegoatTree<number>()
      expect(t.higher(5)).toBe(undefined)
    })

    it('lower returns strict predecessor', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.lower(20)).toBe(10)
    })

    it('higher returns strict successor', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.higher(20)).toBe(30)
    })

    it('lower returns undefined when no smaller key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.lower(5)).toBe(undefined)
    })

    it('higher returns undefined when no larger key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.higher(25)).toBe(undefined)
    })

    it('lower works with non-existent key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(30)
      expect(t.lower(25)).toBe(10)
    })

    it('higher works with non-existent key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(30)
      expect(t.higher(25)).toBe(30)
    })

    it('lower returns undefined when key equals min', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.lower(10)).toBe(undefined)
    })

    it('higher returns undefined when key equals max', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.higher(20)).toBe(undefined)
    })
  })

  describe('range', () => {
    it('returns empty for empty tree', () => {
      const t = new ScapegoatTree<number>()
      expect(t.range(1, 10)).toEqual([])
    })

    it('returns empty when lo > hi', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.range(3, 1)).toEqual([])
    })

    it('returns keys in range', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.insert(4)
      t.insert(5)
      expect(t.range(2, 4)).toEqual([2, 3, 4])
    })

    it('returns single key range', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.range(2, 2)).toEqual([2])
    })

    it('returns all keys for full range', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.range(1, 3)).toEqual([1, 2, 3])
    })

    it('returns empty for gap range', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(5)
      t.insert(10)
      expect(t.range(2, 4)).toEqual([])
    })

    it('range is inclusive on both ends', () => {
      const t = new ScapegoatTree<number>()
      for (let i = 0; i < 10; i++) t.insert(i)
      const r = t.range(3, 7)
      expect(r[0]).toBe(3)
      expect(r[r.length - 1]).toBe(7)
    })
  })

  describe('rank', () => {
    it('returns -1 for empty tree', () => {
      const t = new ScapegoatTree<number>()
      expect(t.rank(5)).toBe(-1)
    })

    it('returns 0 for min element', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.rank(10)).toBe(0)
    })

    it('returns correct rank for middle element', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.rank(20)).toBe(1)
    })

    it('returns correct rank for max element', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.rank(30)).toBe(2)
    })

    it('returns -1 for missing key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.rank(15)).toBe(-1)
    })

    it('returns correct ranks for many elements', () => {
      const t = new ScapegoatTree<number>()
      const nums = shuffle(Array.from({ length: 50 }, (_, i) => i))
      for (const n of nums) t.insert(n)
      for (let i = 0; i < 50; i++) {
        expect(t.rank(i)).toBe(i)
      }
    })
  })

  describe('select', () => {
    it('returns undefined for empty tree', () => {
      const t = new ScapegoatTree<number>()
      expect(t.select(0)).toBe(undefined)
    })

    it('returns undefined for negative index', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      expect(t.select(-1)).toBe(undefined)
    })

    it('returns undefined for out of bounds index', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      expect(t.select(1)).toBe(undefined)
    })

    it('returns first element at index 0', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.select(0)).toBe(10)
    })

    it('returns last element at last index', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.select(2)).toBe(30)
    })

    it('returns correct elements for all indices', () => {
      const t = new ScapegoatTree<number>()
      const nums = shuffle(Array.from({ length: 50 }, (_, i) => i))
      for (const n of nums) t.insert(n)
      for (let i = 0; i < 50; i++) {
        expect(t.select(i)).toBe(i)
      }
    })
  })

  describe('rank and select roundtrip', () => {
    it('select(rank(k)) === k for all keys', () => {
      const t = new ScapegoatTree<number>()
      const nums = shuffle(Array.from({ length: 100 }, (_, i) => i))
      for (const n of nums) t.insert(n)
      for (let i = 0; i < 100; i++) {
        expect(t.select(t.rank(i))).toBe(i)
      }
    })

    it('rank(select(i)) === i for all indices', () => {
      const t = new ScapegoatTree<number>()
      const nums = shuffle(Array.from({ length: 100 }, (_, i) => i))
      for (const n of nums) t.insert(n)
      for (let i = 0; i < 100; i++) {
        expect(t.rank(t.select(i)!)).toBe(i)
      }
    })
  })

  describe('keys, values, entries', () => {
    it('keys returns sorted keys', () => {
      const t = new ScapegoatTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.keys()).toEqual([1, 2, 3])
    })

    it('values returns values in key order', () => {
      const t = new ScapegoatTree<number, string>()
      t.insert(3, 'c')
      t.insert(1, 'a')
      t.insert(2, 'b')
      expect(t.values()).toEqual(['a', 'b', 'c'])
    })

    it('entries returns key-value pairs in key order', () => {
      const t = new ScapegoatTree<number, string>()
      t.insert(3, 'c')
      t.insert(1, 'a')
      t.insert(2, 'b')
      expect(t.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('keys returns empty for empty tree', () => {
      const t = new ScapegoatTree<number>()
      expect(t.keys()).toEqual([])
    })

    it('values returns empty for empty tree', () => {
      const t = new ScapegoatTree<number, string>()
      expect(t.values()).toEqual([])
    })

    it('entries returns empty for empty tree', () => {
      const t = new ScapegoatTree<number, string>()
      expect(t.entries()).toEqual([])
    })

    it('values includes undefined for keys without values', () => {
      const t = new ScapegoatTree<number>()
      t.insert(1)
      t.insert(2)
      expect(t.values()).toEqual([undefined, undefined])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const t = new ScapegoatTree<number>()
      expect(t.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const t = new ScapegoatTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('returns all elements', () => {
      const t = new ScapegoatTree<number>()
      for (let i = 0; i < 50; i++) t.insert(i)
      expect(t.toArray().length).toBe(50)
    })

    it('returns sorted after mixed operations', () => {
      const t = new ScapegoatTree<number>()
      t.insert(5)
      t.insert(3)
      t.insert(7)
      t.delete(5)
      t.insert(1)
      t.insert(9)
      expect(t.toArray()).toEqual([1, 3, 7, 9])
    })
  })

  describe('forEach', () => {
    it('does nothing for empty tree', () => {
      const t = new ScapegoatTree<number>()
      let count = 0
      t.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates all elements in order', () => {
      const t = new ScapegoatTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      const result: number[] = []
      t.forEach((k) => result.push(k))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const t = new ScapegoatTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      const indices: number[] = []
      t.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('iterator', () => {
    it('produces no values for empty tree', () => {
      const t = new ScapegoatTree<number>()
      const result: number[] = []
      for (const k of t) result.push(k)
      expect(result).toEqual([])
    })

    it('iterates in sorted order', () => {
      const t = new ScapegoatTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      const result: number[] = []
      for (const k of t) result.push(k)
      expect(result).toEqual([1, 2, 3])
    })

    it('spread works', () => {
      const t = new ScapegoatTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect([...t]).toEqual([1, 2, 3])
    })

    it('Array.from works', () => {
      const t = new ScapegoatTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(Array.from(t)).toEqual([1, 2, 3])
    })
  })

  describe('ScapegoatTree.from', () => {
    it('creates tree from key array', () => {
      const t = ScapegoatTree.from([3, 1, 2])
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('creates empty tree from empty array', () => {
      const t = ScapegoatTree.from<number>([])
      expect(t.size).toBe(0)
    })

    it('creates tree with values', () => {
      const t = ScapegoatTree.from<number, string>([1, 2, 3], {
        values: ['one', 'two', 'three'],
      })
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
      expect(t.get(3)).toBe('three')
    })

    it('creates tree with custom comparator', () => {
      const t = ScapegoatTree.from([1, 2, 3], { compare: (a, b) => b - a })
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('creates tree with custom alpha', () => {
      const t = ScapegoatTree.from([5, 3, 1, 4, 2], { alpha: 0.5 })
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('stress tests', () => {
    it('handles 10000 random operations', () => {
      const t = new ScapegoatTree<number>()
      const reference = new Set<number>()
      const rng = (seed: number) => () => {
        seed = (seed * 16807) % 2147483647
        return (seed - 1) / 2147483646
      }
      const rand = rng(42)
      for (let i = 0; i < 10000; i++) {
        const op = Math.floor(rand() * 3)
        const key = Math.floor(rand() * 500)
        if (op === 0) {
          t.insert(key)
          reference.add(key)
        } else if (op === 1) {
          const del = t.delete(key)
          expect(del).toBe(reference.has(key))
          reference.delete(key)
        } else {
          expect(t.has(key)).toBe(reference.has(key))
        }
      }
      expect(t.size).toBe(reference.size)
      const sortedRef = [...reference].sort((a, b) => a - b)
      expect(t.toArray()).toEqual(sortedRef)
    })

    it('insertion order does not affect sorted output', () => {
      for (let trial = 0; trial < 10; trial++) {
        const t = new ScapegoatTree<number>()
        const nums = shuffle(Array.from({ length: 100 }, (_, i) => i))
        for (const n of nums) t.insert(n)
        expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
      }
    })

    it('maintains BST order after interleaved insert/delete', () => {
      const t = new ScapegoatTree<number>()
      for (let i = 0; i < 200; i++) t.insert(i)
      for (let i = 0; i < 100; i++) t.delete(i * 2)
      const arr = t.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('handles heavy insert then heavy delete', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.6 })
      for (let i = 0; i < 1000; i++) t.insert(i)
      expect(t.size).toBe(1000)
      for (let i = 0; i < 900; i++) t.delete(i)
      expect(t.size).toBe(100)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 900))
    })

    it('rank and select work after many operations', () => {
      const t = new ScapegoatTree<number>({ alpha: 0.6 })
      for (let i = 0; i < 200; i++) t.insert(i)
      for (let i = 0; i < 100; i++) t.delete(i * 2)
      const arr = t.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(t.rank(arr[i]!)).toBe(i)
        expect(t.select(i)).toBe(arr[i])
      }
    })
  })

  describe('edge cases', () => {
    it('handles single element operations', () => {
      const t = new ScapegoatTree<number>()
      t.insert(42)
      expect(t.min()).toBe(42)
      expect(t.max()).toBe(42)
      expect(t.floor(42)).toBe(42)
      expect(t.ceiling(42)).toBe(42)
      expect(t.lower(42)).toBe(undefined)
      expect(t.higher(42)).toBe(undefined)
    })

    it('handles string keys', () => {
      const t = new ScapegoatTree<string>()
      t.insert('b')
      t.insert('a')
      t.insert('c')
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
      expect(t.min()).toBe('a')
      expect(t.max()).toBe('c')
    })

    it('handles object-like keys with comparator', () => {
      type Item = { id: number; name: string }
      const t = new ScapegoatTree<Item>({
        compare: (a, b) => a.id - b.id,
      })
      t.insert({ id: 3, name: 'c' })
      t.insert({ id: 1, name: 'a' })
      t.insert({ id: 2, name: 'b' })
      expect(t.toArray().map((x) => x.name)).toEqual(['a', 'b', 'c'])
    })

    it('handles zero as key', () => {
      const t = new ScapegoatTree<number>()
      t.insert(0)
      expect(t.has(0)).toBe(true)
      expect(t.min()).toBe(0)
      expect(t.max()).toBe(0)
    })

    it('handles negative range', () => {
      const t = new ScapegoatTree<number>()
      t.insert(-10)
      t.insert(-5)
      t.insert(0)
      t.insert(5)
      t.insert(10)
      expect(t.range(-5, 5)).toEqual([-5, 0, 5])
    })

    it('insert delete insert cycle', () => {
      const t = new ScapegoatTree<number>()
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 50; i++) t.insert(i)
        expect(t.size).toBe(50)
        for (let i = 0; i < 50; i++) t.delete(i)
        expect(t.size).toBe(0)
      }
    })

    it('handles alpha at boundary values', () => {
      const t5 = new ScapegoatTree<number>({ alpha: 0.5 })
      for (let i = 0; i < 50; i++) t5.insert(i)
      expect(t5.size).toBe(50)

      const t9 = new ScapegoatTree<number>({ alpha: 0.9 })
      for (let i = 0; i < 50; i++) t9.insert(i)
      expect(t9.size).toBe(50)
    })
  })
})
