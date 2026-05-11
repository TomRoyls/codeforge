import { describe, it, expect } from 'vitest'
import { Treap } from '../../src/core/treap-2/index.js'

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

describe('Treap', () => {
  describe('constructor', () => {
    it('creates empty treap', () => {
      const t = new Treap<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('accepts custom comparator', () => {
      const t = new Treap<number>({ compare: (a, b) => b - a })
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('accepts string comparator', () => {
      const t = new Treap<string>({ compare: (a, b) => a.localeCompare(b) })
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('accepts reverse string comparator', () => {
      const t = new Treap<string>({ compare: (a, b) => b.localeCompare(a) })
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.toArray()).toEqual(['cherry', 'banana', 'apple'])
    })

    it('works with default comparator for numbers', () => {
      const t = new Treap<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('insert', () => {
    it('inserts single element', () => {
      const t = new Treap<number>()
      t.insert(5)
      expect(t.size).toBe(1)
      expect(t.has(5)).toBe(true)
    })

    it('inserts multiple elements', () => {
      const t = new Treap<number>()
      t.insert(5)
      t.insert(3)
      t.insert(7)
      expect(t.size).toBe(3)
      expect(t.toArray()).toEqual([3, 5, 7])
    })

    it('inserts duplicate keys (replaces)', () => {
      const t = new Treap<number, string>()
      t.insert(5, 'first')
      t.insert(5, 'second')
      expect(t.size).toBe(1)
      expect(t.get(5)).toBe('second')
    })

    it('inserts in reverse order', () => {
      const t = new Treap<number>()
      for (let i = 100; i >= 1; i--) t.insert(i)
      expect(t.size).toBe(100)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    })

    it('inserts in sorted order', () => {
      const t = new Treap<number>()
      for (let i = 1; i <= 100; i++) t.insert(i)
      expect(t.size).toBe(100)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    })

    it('inserts shuffled elements', () => {
      const t = new Treap<number>()
      const nums = shuffle(Array.from({ length: 50 }, (_, i) => i + 1))
      for (const n of nums) t.insert(n)
      expect(t.size).toBe(50)
      expect(t.toArray()).toEqual(sorted(nums))
    })

    it('handles negative numbers', () => {
      const t = new Treap<number>()
      t.insert(-5)
      t.insert(-10)
      t.insert(0)
      t.insert(10)
      t.insert(5)
      expect(t.toArray()).toEqual([-10, -5, 0, 5, 10])
    })

    it('handles floating point numbers', () => {
      const t = new Treap<number>()
      t.insert(1.5)
      t.insert(0.5)
      t.insert(2.5)
      expect(t.toArray()).toEqual([0.5, 1.5, 2.5])
    })

    it('inserts with values', () => {
      const t = new Treap<number, string>()
      t.insert(1, 'one')
      t.insert(2, 'two')
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
    })

    it('inserts string keys', () => {
      const t = new Treap<string>()
      t.insert('delta')
      t.insert('alpha')
      t.insert('charlie')
      t.insert('bravo')
      expect(t.toArray()).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
    })

    it('inserts many elements preserving order', () => {
      const t = new Treap<number>()
      const count = 1000
      const nums = shuffle(Array.from({ length: count }, (_, i) => i))
      for (const n of nums) t.insert(n)
      expect(t.toArray()).toEqual(sorted(nums))
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const t = new Treap<number>()
      t.insert(5)
      expect(t.delete(5)).toBe(true)
      expect(t.has(5)).toBe(false)
      expect(t.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const t = new Treap<number>()
      t.insert(5)
      expect(t.delete(3)).toBe(false)
      expect(t.size).toBe(1)
    })

    it('deletes from empty treap', () => {
      const t = new Treap<number>()
      expect(t.delete(1)).toBe(false)
    })

    it('deletes all elements', () => {
      const t = new Treap<number>()
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
      const t = new Treap<number>()
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
      const t = new Treap<number>()
      t.insert(5)
      t.insert(3)
      t.insert(7)
      expect(t.delete(3)).toBe(true)
      expect(t.toArray()).toEqual([5, 7])
    })

    it('deletes and reinserts', () => {
      const t = new Treap<number>()
      t.insert(5)
      t.delete(5)
      t.insert(5)
      expect(t.has(5)).toBe(true)
      expect(t.size).toBe(1)
    })

    it('deletes many elements maintaining order', () => {
      const t = new Treap<number>()
      const nums = Array.from({ length: 100 }, (_, i) => i)
      for (const n of shuffle(nums)) t.insert(n)
      const toDelete = [10, 20, 30, 40, 50]
      for (const d of toDelete) t.delete(d)
      const remaining = nums.filter((n) => !toDelete.includes(n))
      expect(t.toArray()).toEqual(remaining)
      expect(t.size).toBe(95)
    })

    it('deletes alternating from front and back', () => {
      const t = new Treap<number>()
      for (let i = 0; i < 20; i++) t.insert(i)
      for (let i = 0; i < 10; i++) {
        t.delete(i)
        t.delete(19 - i)
      }
      expect(t.size).toBe(0)
    })
  })

  describe('has', () => {
    it('returns false for empty treap', () => {
      const t = new Treap<number>()
      expect(t.has(1)).toBe(false)
    })

    it('returns true for existing key', () => {
      const t = new Treap<number>()
      t.insert(5)
      expect(t.has(5)).toBe(true)
    })

    it('returns false for missing key', () => {
      const t = new Treap<number>()
      t.insert(5)
      expect(t.has(3)).toBe(false)
    })

    it('finds keys after many insertions', () => {
      const t = new Treap<number>()
      for (let i = 0; i < 100; i++) t.insert(i)
      for (let i = 0; i < 100; i++) expect(t.has(i)).toBe(true)
      expect(t.has(100)).toBe(false)
      expect(t.has(-1)).toBe(false)
    })

    it('returns false after deletion', () => {
      const t = new Treap<number>()
      t.insert(5)
      t.delete(5)
      expect(t.has(5)).toBe(false)
    })
  })

  describe('get', () => {
    it('returns undefined for empty treap', () => {
      const t = new Treap<number, string>()
      expect(t.get(1)).toBe(undefined)
    })

    it('returns value for existing key', () => {
      const t = new Treap<number, string>()
      t.insert(5, 'five')
      expect(t.get(5)).toBe('five')
    })

    it('returns undefined for missing key', () => {
      const t = new Treap<number, string>()
      t.insert(5, 'five')
      expect(t.get(3)).toBe(undefined)
    })

    it('returns updated value after reinsert', () => {
      const t = new Treap<number, string>()
      t.insert(5, 'old')
      t.insert(5, 'new')
      expect(t.get(5)).toBe('new')
    })

    it('returns undefined for key without value', () => {
      const t = new Treap<number>()
      t.insert(5)
      expect(t.get(5)).toBe(undefined)
    })

    it('returns values for many keys', () => {
      const t = new Treap<number, string>()
      for (let i = 0; i < 50; i++) t.insert(i, `v${i}`)
      for (let i = 0; i < 50; i++) expect(t.get(i)).toBe(`v${i}`)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty', () => {
      const t = new Treap<number>()
      expect(t.size).toBe(0)
    })

    it('size increments on insert', () => {
      const t = new Treap<number>()
      t.insert(1)
      expect(t.size).toBe(1)
      t.insert(2)
      expect(t.size).toBe(2)
    })

    it('size does not increment on duplicate insert', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(1)
      expect(t.size).toBe(1)
    })

    it('size decrements on delete', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.delete(1)
      expect(t.size).toBe(1)
    })

    it('isEmpty returns true for empty', () => {
      const t = new Treap<number>()
      expect(t.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insert', () => {
      const t = new Treap<number>()
      t.insert(1)
      expect(t.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after clearing all', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.delete(1)
      t.delete(2)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty treap', () => {
      const t = new Treap<number>()
      t.clear()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('clears non-empty treap', () => {
      const t = new Treap<number>()
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
      const t = new Treap<number>()
      t.insert(1)
      t.clear()
      t.insert(2)
      expect(t.size).toBe(1)
      expect(t.has(2)).toBe(true)
    })
  })

  describe('min and max', () => {
    it('min returns undefined for empty', () => {
      const t = new Treap<number>()
      expect(t.min()).toBe(undefined)
    })

    it('max returns undefined for empty', () => {
      const t = new Treap<number>()
      expect(t.max()).toBe(undefined)
    })

    it('min returns single element', () => {
      const t = new Treap<number>()
      t.insert(5)
      expect(t.min()).toBe(5)
    })

    it('max returns single element', () => {
      const t = new Treap<number>()
      t.insert(5)
      expect(t.max()).toBe(5)
    })

    it('min returns smallest after many inserts', () => {
      const t = new Treap<number>()
      for (let i = 50; i >= 1; i--) t.insert(i)
      expect(t.min()).toBe(1)
    })

    it('max returns largest after many inserts', () => {
      const t = new Treap<number>()
      for (let i = 1; i <= 50; i++) t.insert(i)
      expect(t.max()).toBe(50)
    })

    it('min updates after deletion', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.delete(1)
      expect(t.min()).toBe(2)
    })

    it('max updates after deletion', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.delete(3)
      expect(t.max()).toBe(2)
    })
  })

  describe('floor and ceiling', () => {
    it('floor returns undefined for empty', () => {
      const t = new Treap<number>()
      expect(t.floor(5)).toBe(undefined)
    })

    it('ceiling returns undefined for empty', () => {
      const t = new Treap<number>()
      expect(t.ceiling(5)).toBe(undefined)
    })

    it('floor returns exact match', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.floor(20)).toBe(20)
    })

    it('ceiling returns exact match', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.ceiling(20)).toBe(20)
    })

    it('floor returns largest smaller key', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.floor(25)).toBe(20)
    })

    it('ceiling returns smallest larger key', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.ceiling(25)).toBe(30)
    })

    it('floor returns undefined when all keys larger', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      expect(t.floor(5)).toBe(undefined)
    })

    it('ceiling returns undefined when all keys smaller', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      expect(t.ceiling(25)).toBe(undefined)
    })

    it('floor returns max when key exceeds all', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      expect(t.floor(100)).toBe(20)
    })

    it('ceiling returns min when key below all', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      expect(t.ceiling(0)).toBe(10)
    })
  })

  describe('lower and higher', () => {
    it('lower returns undefined for empty', () => {
      const t = new Treap<number>()
      expect(t.lower(5)).toBe(undefined)
    })

    it('higher returns undefined for empty', () => {
      const t = new Treap<number>()
      expect(t.higher(5)).toBe(undefined)
    })

    it('lower returns strict predecessor', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.lower(20)).toBe(10)
    })

    it('higher returns strict successor', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.higher(20)).toBe(30)
    })

    it('lower returns undefined when no smaller key', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      expect(t.lower(5)).toBe(undefined)
    })

    it('higher returns undefined when no larger key', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      expect(t.higher(25)).toBe(undefined)
    })

    it('lower works with non-existent key', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(30)
      expect(t.lower(25)).toBe(10)
    })

    it('higher works with non-existent key', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(30)
      expect(t.higher(25)).toBe(30)
    })

    it('lower returns undefined when key equals min', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      expect(t.lower(10)).toBe(undefined)
    })

    it('higher returns undefined when key equals max', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      expect(t.higher(20)).toBe(undefined)
    })
  })

  describe('range', () => {
    it('returns empty for empty treap', () => {
      const t = new Treap<number>()
      expect(t.range(1, 10)).toEqual([])
    })

    it('returns empty when lo > hi', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.range(3, 1)).toEqual([])
    })

    it('returns keys in range', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.insert(4)
      t.insert(5)
      expect(t.range(2, 4)).toEqual([2, 3, 4])
    })

    it('returns single key range', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.range(2, 2)).toEqual([2])
    })

    it('returns all keys for full range', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.range(1, 3)).toEqual([1, 2, 3])
    })

    it('returns empty for gap range', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(5)
      t.insert(10)
      expect(t.range(2, 4)).toEqual([])
    })

    it('range is inclusive on both ends', () => {
      const t = new Treap<number>()
      for (let i = 0; i < 10; i++) t.insert(i)
      const r = t.range(3, 7)
      expect(r[0]).toBe(3)
      expect(r[r.length - 1]).toBe(7)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty treap', () => {
      const t = new Treap<number>()
      expect(t.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const t = new Treap<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('returns all elements', () => {
      const t = new Treap<number>()
      for (let i = 0; i < 50; i++) t.insert(i)
      expect(t.toArray().length).toBe(50)
    })

    it('returns sorted after mixed operations', () => {
      const t = new Treap<number>()
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
    it('does nothing for empty treap', () => {
      const t = new Treap<number>()
      let count = 0
      t.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates all elements in order', () => {
      const t = new Treap<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      const result: number[] = []
      t.forEach((k) => result.push(k))
      expect(result).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const t = new Treap<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      const indices: number[] = []
      t.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('iterator', () => {
    it('produces no values for empty treap', () => {
      const t = new Treap<number>()
      const result: number[] = []
      for (const k of t) result.push(k)
      expect(result).toEqual([])
    })

    it('iterates in sorted order', () => {
      const t = new Treap<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      const result: number[] = []
      for (const k of t) result.push(k)
      expect(result).toEqual([1, 2, 3])
    })

    it('spread works', () => {
      const t = new Treap<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect([...t]).toEqual([1, 2, 3])
    })

    it('Array.from works', () => {
      const t = new Treap<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(Array.from(t)).toEqual([1, 2, 3])
    })
  })

  describe('splitByKey', () => {
    it('splits empty treap', () => {
      const t = new Treap<number>()
      const [left, right] = t.splitByKey(5)
      expect(left.size).toBe(0)
      expect(right.size).toBe(0)
    })

    it('splits into two valid treaps', () => {
      const t = new Treap<number>()
      for (let i = 1; i <= 10; i++) t.insert(i)
      const [left, right] = t.splitByKey(5)
      expect(left.toArray()).toEqual([1, 2, 3, 4])
      expect(right.toArray()).toEqual([5, 6, 7, 8, 9, 10])
    })

    it('splits with all keys going left', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      const [left, right] = t.splitByKey(10)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.size).toBe(0)
    })

    it('splits with all keys going right', () => {
      const t = new Treap<number>()
      t.insert(5)
      t.insert(6)
      t.insert(7)
      const [left, right] = t.splitByKey(0)
      expect(left.size).toBe(0)
      expect(right.toArray()).toEqual([5, 6, 7])
    })

    it('original treap is empty after split', () => {
      const t = new Treap<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.splitByKey(2)
      expect(t.size).toBe(0)
    })

    it('split treaps can be used independently', () => {
      const t = new Treap<number>()
      for (let i = 1; i <= 6; i++) t.insert(i)
      const [left, right] = t.splitByKey(4)
      left.insert(0)
      right.insert(10)
      expect(left.toArray()).toEqual([0, 1, 2, 3])
      expect(right.toArray()).toEqual([4, 5, 6, 10])
    })
  })

  describe('mergeOther', () => {
    it('merges two empty treaps', () => {
      const t1 = new Treap<number>()
      const t2 = new Treap<number>()
      t1.mergeOther(t2)
      expect(t1.size).toBe(0)
      expect(t2.size).toBe(0)
    })

    it('merges empty into non-empty', () => {
      const t1 = new Treap<number>()
      t1.insert(1)
      t1.insert(2)
      const t2 = new Treap<number>()
      t1.mergeOther(t2)
      expect(t1.toArray()).toEqual([1, 2])
    })

    it('merges non-empty into empty', () => {
      const t1 = new Treap<number>()
      const t2 = new Treap<number>()
      t2.insert(1)
      t2.insert(2)
      t1.mergeOther(t2)
      expect(t1.toArray()).toEqual([1, 2])
    })

    it('merges two non-empty treaps', () => {
      const t1 = new Treap<number>()
      t1.insert(1)
      t1.insert(3)
      t1.insert(5)
      const t2 = new Treap<number>()
      t2.insert(2)
      t2.insert(4)
      t2.insert(6)
      t1.mergeOther(t2)
      expect(t1.toArray()).toEqual([1, 2, 3, 4, 5, 6])
      expect(t2.size).toBe(0)
    })

    it('source treap is empty after merge', () => {
      const t1 = new Treap<number>()
      t1.insert(1)
      const t2 = new Treap<number>()
      t2.insert(2)
      t1.mergeOther(t2)
      expect(t2.size).toBe(0)
      expect(t2.isEmpty()).toBe(true)
    })

    it('split and merge roundtrip', () => {
      const t = new Treap<number>()
      for (let i = 1; i <= 10; i++) t.insert(i)
      const [left, right] = t.splitByKey(6)
      const merged = new Treap<number>()
      merged.mergeOther(left)
      merged.mergeOther(right)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })

  describe('Treap.from', () => {
    it('creates treap from key array', () => {
      const t = Treap.from([3, 1, 2])
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('creates empty treap from empty array', () => {
      const t = Treap.from<number>([])
      expect(t.size).toBe(0)
    })

    it('creates treap with values', () => {
      const t = Treap.from<number, string>([1, 2, 3], {
        values: ['one', 'two', 'three'],
      })
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
      expect(t.get(3)).toBe('three')
    })

    it('creates treap with custom comparator', () => {
      const t = Treap.from([1, 2, 3], { compare: (a, b) => b - a })
      expect(t.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('stress tests', () => {
    it('handles 10000 random operations', () => {
      const t = new Treap<number>()
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
        const t = new Treap<number>()
        const nums = shuffle(Array.from({ length: 100 }, (_, i) => i))
        for (const n of nums) t.insert(n)
        expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
      }
    })

    it('maintains BST order after interleaved insert/delete', () => {
      const t = new Treap<number>()
      for (let i = 0; i < 200; i++) t.insert(i)
      for (let i = 0; i < 100; i++) t.delete(i * 2)
      const arr = t.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('handles single element operations', () => {
      const t = new Treap<number>()
      t.insert(42)
      expect(t.min()).toBe(42)
      expect(t.max()).toBe(42)
      expect(t.floor(42)).toBe(42)
      expect(t.ceiling(42)).toBe(42)
      expect(t.lower(42)).toBe(undefined)
      expect(t.higher(42)).toBe(undefined)
    })

    it('handles string keys', () => {
      const t = new Treap<string>()
      t.insert('b')
      t.insert('a')
      t.insert('c')
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
      expect(t.min()).toBe('a')
      expect(t.max()).toBe('c')
    })

    it('handles object-like keys with comparator', () => {
      type Item = { id: number; name: string }
      const t = new Treap<Item>({
        compare: (a, b) => a.id - b.id,
      })
      t.insert({ id: 3, name: 'c' })
      t.insert({ id: 1, name: 'a' })
      t.insert({ id: 2, name: 'b' })
      expect(t.toArray().map((x) => x.name)).toEqual(['a', 'b', 'c'])
    })

    it('handles zero as key', () => {
      const t = new Treap<number>()
      t.insert(0)
      expect(t.has(0)).toBe(true)
      expect(t.min()).toBe(0)
      expect(t.max()).toBe(0)
    })

    it('handles negative range', () => {
      const t = new Treap<number>()
      t.insert(-10)
      t.insert(-5)
      t.insert(0)
      t.insert(5)
      t.insert(10)
      expect(t.range(-5, 5)).toEqual([-5, 0, 5])
    })
  })
})
