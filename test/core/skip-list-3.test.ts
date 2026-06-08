import { describe, it, expect } from 'vitest'
import { SkipList3 } from '../../src/core/skip-list-3/index.js'

function createFilled(items: number[]): SkipList3<number> {
  const list = new SkipList3<number>()
  for (const k of items) {
    list.insert(k)
  }
  return list
}

describe('SkipList3', () => {
  describe('constructor', () => {
    it('creates empty list', () => {
      const list = new SkipList3()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('accepts custom maxLevel', () => {
      const list = new SkipList3<number>({ maxLevel: 16 })
      expect(list.size).toBe(0)
    })

    it('accepts custom probability', () => {
      const list = new SkipList3<number>({ probability: 0.25 })
      expect(list.size).toBe(0)
    })

    it('accepts custom comparator', () => {
      const reverseComp = (a: number, b: number): number => b - a
      const list = new SkipList3<number>({ comparator: reverseComp })
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const list = new SkipList3<number>()
      list.insert(1)
      expect(list.size).toBe(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('inserts multiple elements maintaining sorted order', () => {
      const list = createFilled([3, 1, 2])
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('ignores duplicate insertions', () => {
      const list = new SkipList3<number>()
      list.insert(1)
      list.insert(1)
      list.insert(1)
      expect(list.size).toBe(1)
    })

    it('handles many insertions', () => {
      const list = new SkipList3<number>()
      const count = 200
      for (let i = count; i >= 1; i--) {
        list.insert(i)
      }
      expect(list.size).toBe(count)
      const arr = list.toArray()
      for (let i = 0; i < count; i++) {
        expect(arr[i]).toBe(i + 1)
      }
    })

    it('handles negative numbers', () => {
      const list = createFilled([-3, 0, -1, 2, -2])
      expect(list.toArray()).toEqual([-3, -2, -1, 0, 2])
    })

    it('handles string keys', () => {
      const list = new SkipList3<string>()
      list.insert('cherry')
      list.insert('apple')
      list.insert('banana')
      expect(list.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles zero as key', () => {
      const list = new SkipList3<number>()
      list.insert(0)
      expect(list.has(0)).toBe(true)
      expect(list.size).toBe(1)
    })

    it('inserts in ascending order', () => {
      const list = new SkipList3<number>()
      for (let i = 1; i <= 50; i++) {
        list.insert(i)
      }
      expect(list.size).toBe(50)
      expect(list.toArray()).toEqual(
        Array.from({ length: 50 }, (_, i) => i + 1)
      )
    })

    it('inserts with gaps', () => {
      const list = createFilled([1, 10, 100, 1000])
      expect(list.toArray()).toEqual([1, 10, 100, 1000])
    })
  })

  describe('delete', () => {
    it('deletes an existing element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.delete(2)).toBe(true)
      expect(list.size).toBe(2)
      expect(list.has(2)).toBe(false)
    })

    it('returns false for missing element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.delete(99)).toBe(false)
      expect(list.size).toBe(3)
    })

    it('deletes first element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.delete(1)).toBe(true)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('deletes last element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.delete(3)).toBe(true)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('deletes single element list', () => {
      const list = createFilled([42])
      expect(list.delete(42)).toBe(true)
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('deletes all elements one by one', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      for (let i = 1; i <= 5; i++) {
        expect(list.delete(i)).toBe(true)
      }
      expect(list.size).toBe(0)
    })

    it('deletes in reverse order', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      for (let i = 5; i >= 1; i--) {
        expect(list.delete(i)).toBe(true)
      }
      expect(list.size).toBe(0)
    })

    it('maintains order after deletions', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      list.delete(2)
      list.delete(4)
      expect(list.toArray()).toEqual([1, 3, 5])
    })

    it('handles deleting non-existent from empty list', () => {
      const list = new SkipList3<number>()
      expect(list.delete(1)).toBe(false)
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.has(2)).toBe(true)
    })

    it('returns false for missing element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.has(99)).toBe(false)
    })

    it('returns false on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.has(1)).toBe(false)
    })

    it('finds first element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.has(1)).toBe(true)
    })

    it('finds last element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.has(3)).toBe(true)
    })
  })

  describe('get', () => {
    it('returns key for existing element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.get(2)).toBe(2)
    })

    it('returns undefined for missing element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.get(99)).toBeUndefined()
    })

    it('returns undefined on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.get(1)).toBeUndefined()
    })
  })

  describe('rank', () => {
    it('returns 0 for first element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.rank(1)).toBe(0)
    })

    it('returns correct rank for middle element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.rank(2)).toBe(1)
    })

    it('returns last index for last element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.rank(3)).toBe(2)
    })

    it('returns -1 for missing element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.rank(99)).toBe(-1)
    })

    it('returns -1 on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.rank(1)).toBe(-1)
    })

    it('returns correct ranks after deletion', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      list.delete(3)
      expect(list.rank(1)).toBe(0)
      expect(list.rank(2)).toBe(1)
      expect(list.rank(4)).toBe(2)
      expect(list.rank(5)).toBe(3)
    })

    it('returns correct ranks for many elements', () => {
      const list = createFilled([10, 20, 30, 40, 50])
      expect(list.rank(10)).toBe(0)
      expect(list.rank(20)).toBe(1)
      expect(list.rank(30)).toBe(2)
      expect(list.rank(40)).toBe(3)
      expect(list.rank(50)).toBe(4)
    })
  })

  describe('at', () => {
    it('returns element at index 0', () => {
      const list = createFilled([1, 2, 3])
      expect(list.at(0)).toBe(1)
    })

    it('returns element at last index', () => {
      const list = createFilled([1, 2, 3])
      expect(list.at(2)).toBe(3)
    })

    it('returns element at middle index', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      expect(list.at(2)).toBe(3)
    })

    it('returns undefined for negative index', () => {
      const list = createFilled([1, 2, 3])
      expect(list.at(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      const list = createFilled([1, 2, 3])
      expect(list.at(3)).toBeUndefined()
      expect(list.at(100)).toBeUndefined()
    })

    it('returns undefined on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.at(0)).toBeUndefined()
    })

    it('returns correct elements for many elements', () => {
      const list = new SkipList3<number>()
      for (let i = 1; i <= 100; i++) {
        list.insert(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(list.at(i)).toBe(i + 1)
      }
    })

    it('returns correct elements after deletion', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      list.delete(3)
      expect(list.at(0)).toBe(1)
      expect(list.at(1)).toBe(2)
      expect(list.at(2)).toBe(4)
      expect(list.at(3)).toBe(5)
    })
  })

  describe('indexOf', () => {
    it('returns correct index for existing element', () => {
      const list = createFilled([10, 20, 30])
      expect(list.indexOf(10)).toBe(0)
      expect(list.indexOf(20)).toBe(1)
      expect(list.indexOf(30)).toBe(2)
    })

    it('returns -1 for missing element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.indexOf(99)).toBe(-1)
    })

    it('returns -1 on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.indexOf(1)).toBe(-1)
    })

    it('is consistent with rank', () => {
      const list = createFilled([5, 3, 1, 4, 2])
      for (const key of [1, 2, 3, 4, 5]) {
        expect(list.indexOf(key)).toBe(list.rank(key))
      }
    })
  })

  describe('select', () => {
    it('returns element at given index', () => {
      const list = createFilled([10, 20, 30])
      expect(list.select(0)).toBe(10)
      expect(list.select(1)).toBe(20)
      expect(list.select(2)).toBe(30)
    })

    it('returns undefined for invalid index', () => {
      const list = createFilled([1, 2, 3])
      expect(list.select(-1)).toBeUndefined()
      expect(list.select(3)).toBeUndefined()
    })

    it('is consistent with at', () => {
      const list = createFilled([5, 3, 1, 4, 2])
      for (let i = 0; i < 5; i++) {
        expect(list.select(i)).toBe(list.at(i))
      }
    })
  })

  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const list = new SkipList3<number>()
      expect(list.size).toBe(0)
      list.insert(1)
      expect(list.size).toBe(1)
      list.insert(2)
      expect(list.size).toBe(2)
      list.delete(1)
      expect(list.size).toBe(1)
    })

    it('isEmpty reflects state', () => {
      const list = new SkipList3<number>()
      expect(list.isEmpty()).toBe(true)
      list.insert(1)
      expect(list.isEmpty()).toBe(false)
      list.delete(1)
      expect(list.isEmpty()).toBe(true)
    })

    it('size does not change on duplicate insert', () => {
      const list = new SkipList3<number>()
      list.insert(1)
      list.insert(1)
      expect(list.size).toBe(1)
    })

    it('size does not change on failed delete', () => {
      const list = createFilled([1, 2, 3])
      list.delete(99)
      expect(list.size).toBe(3)
    })
  })

  describe('clear', () => {
    it('clears the list', () => {
      const list = createFilled([1, 2, 3])
      list.clear()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('can insert after clear', () => {
      const list = createFilled([1, 2, 3])
      list.clear()
      list.insert(10)
      expect(list.size).toBe(1)
      expect(list.has(10)).toBe(true)
    })

    it('clear on empty list is no-op', () => {
      const list = new SkipList3<number>()
      list.clear()
      expect(list.size).toBe(0)
    })
  })

  describe('min and max', () => {
    it('min returns smallest element', () => {
      const list = createFilled([3, 1, 2])
      expect(list.min()).toBe(1)
    })

    it('max returns largest element', () => {
      const list = createFilled([3, 1, 2])
      expect(list.max()).toBe(3)
    })

    it('min returns undefined on empty', () => {
      const list = new SkipList3<number>()
      expect(list.min()).toBeUndefined()
    })

    it('max returns undefined on empty', () => {
      const list = new SkipList3<number>()
      expect(list.max()).toBeUndefined()
    })

    it('min equals max for single element', () => {
      const list = createFilled([42])
      expect(list.min()).toBe(42)
      expect(list.max()).toBe(42)
    })

    it('min and max correct after deletion', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      list.delete(1)
      list.delete(5)
      expect(list.min()).toBe(2)
      expect(list.max()).toBe(4)
    })
  })

  describe('floor', () => {
    it('returns exact match', () => {
      const list = createFilled([1, 3, 5])
      expect(list.floor(3)).toBe(3)
    })

    it('returns largest element less than key', () => {
      const list = createFilled([1, 3, 5])
      expect(list.floor(4)).toBe(3)
    })

    it('returns undefined if all elements greater', () => {
      const list = createFilled([5, 10, 15])
      expect(list.floor(3)).toBeUndefined()
    })

    it('returns undefined on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.floor(5)).toBeUndefined()
    })

    it('returns last element when key is large', () => {
      const list = createFilled([1, 3, 5])
      expect(list.floor(100)).toBe(5)
    })

    it('returns first element when key equals first', () => {
      const list = createFilled([1, 3, 5])
      expect(list.floor(1)).toBe(1)
    })
  })

  describe('ceiling', () => {
    it('returns exact match', () => {
      const list = createFilled([1, 3, 5])
      expect(list.ceiling(3)).toBe(3)
    })

    it('returns smallest element greater than key', () => {
      const list = createFilled([1, 3, 5])
      expect(list.ceiling(2)).toBe(3)
    })

    it('returns undefined if all elements smaller', () => {
      const list = createFilled([1, 3, 5])
      expect(list.ceiling(100)).toBeUndefined()
    })

    it('returns undefined on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.ceiling(5)).toBeUndefined()
    })

    it('returns first element when key is small', () => {
      const list = createFilled([5, 10, 15])
      expect(list.ceiling(1)).toBe(5)
    })
  })

  describe('lower', () => {
    it('returns element strictly less than key', () => {
      const list = createFilled([1, 3, 5])
      expect(list.lower(3)).toBe(1)
    })

    it('returns element less than key when no exact match', () => {
      const list = createFilled([1, 3, 5])
      expect(list.lower(4)).toBe(3)
    })

    it('returns undefined if no smaller element', () => {
      const list = createFilled([5, 10, 15])
      expect(list.lower(3)).toBeUndefined()
    })

    it('returns undefined on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.lower(5)).toBeUndefined()
    })

    it('returns largest element when key is large', () => {
      const list = createFilled([1, 3, 5])
      expect(list.lower(100)).toBe(5)
    })

    it('returns undefined when key equals first element', () => {
      const list = createFilled([1, 3, 5])
      expect(list.lower(1)).toBeUndefined()
    })
  })

  describe('higher', () => {
    it('returns element strictly greater than key', () => {
      const list = createFilled([1, 3, 5])
      expect(list.higher(3)).toBe(5)
    })

    it('returns element greater than key when no exact match', () => {
      const list = createFilled([1, 3, 5])
      expect(list.higher(2)).toBe(3)
    })

    it('returns undefined if no greater element', () => {
      const list = createFilled([1, 3, 5])
      expect(list.higher(100)).toBeUndefined()
    })

    it('returns undefined on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.higher(5)).toBeUndefined()
    })

    it('returns first element when key is small', () => {
      const list = createFilled([5, 10, 15])
      expect(list.higher(1)).toBe(5)
    })

    it('returns undefined when key equals last element', () => {
      const list = createFilled([1, 3, 5])
      expect(list.higher(5)).toBeUndefined()
    })
  })

  describe('range', () => {
    it('returns elements in range inclusive', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      expect([...list.range(2, 4)]).toEqual([2, 3, 4])
    })

    it('returns single element range', () => {
      const list = createFilled([1, 2, 3])
      expect([...list.range(2, 2)]).toEqual([2])
    })

    it('returns empty for non-overlapping range', () => {
      const list = createFilled([1, 2, 3])
      expect([...list.range(10, 20)]).toEqual([])
    })

    it('returns all elements for full range', () => {
      const list = createFilled([1, 2, 3])
      expect([...list.range(1, 3)]).toEqual([1, 2, 3])
    })

    it('returns empty on empty list', () => {
      const list = new SkipList3<number>()
      expect([...list.range(1, 5)]).toEqual([])
    })

    it('returns partial range at start', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      expect([...list.range(0, 2)]).toEqual([1, 2])
    })

    it('returns partial range at end', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      expect([...list.range(4, 100)]).toEqual([4, 5])
    })

    it('returns empty when lo > hi', () => {
      const list = createFilled([1, 2, 3])
      expect([...list.range(3, 1)]).toEqual([])
    })
  })

  describe('count', () => {
    it('counts elements in range', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      expect(list.count(2, 4)).toBe(3)
    })

    it('counts single element', () => {
      const list = createFilled([1, 2, 3])
      expect(list.count(2, 2)).toBe(1)
    })

    it('counts 0 for non-overlapping range', () => {
      const list = createFilled([1, 2, 3])
      expect(list.count(10, 20)).toBe(0)
    })

    it('counts all elements', () => {
      const list = createFilled([1, 2, 3])
      expect(list.count(1, 3)).toBe(3)
    })

    it('counts 0 on empty list', () => {
      const list = new SkipList3<number>()
      expect(list.count(1, 5)).toBe(0)
    })

    it('counts correctly after deletion', () => {
      const list = createFilled([1, 2, 3, 4, 5])
      list.delete(3)
      expect(list.count(2, 4)).toBe(2)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const list = createFilled([1, 2, 3])
      const collected: number[] = []
      list.forEach((key) => collected.push(key))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const list = createFilled([10, 20, 30])
      const indices: number[] = []
      list.forEach((_key, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does not call on empty list', () => {
      const list = new SkipList3<number>()
      let callCount = 0
      list.forEach(() => callCount++)
      expect(callCount).toBe(0)
    })

    it('provides list reference', () => {
      const list = createFilled([1, 2])
      let ref: SkipList3<number> | undefined
      list.forEach((_k, _i, l) => { ref = l })
      expect(ref).toBe(list)
    })
  })

  describe('toArray', () => {
    it('returns sorted array', () => {
      const list = createFilled([3, 1, 2])
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty list', () => {
      const list = new SkipList3<number>()
      expect(list.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const list = createFilled([42])
      expect(list.toArray()).toEqual([42])
    })
  })

  describe('keys', () => {
    it('returns all keys in order', () => {
      const list = createFilled([3, 1, 2])
      expect([...list.keys()]).toEqual([1, 2, 3])
    })

    it('returns empty on empty list', () => {
      const list = new SkipList3<number>()
      expect([...list.keys()]).toEqual([])
    })
  })

  describe('values', () => {
    it('returns all values in order', () => {
      const list = createFilled([3, 1, 2])
      expect([...list.values()]).toEqual([1, 2, 3])
    })

    it('returns empty on empty list', () => {
      const list = new SkipList3<number>()
      expect([...list.values()]).toEqual([])
    })
  })

  describe('entries', () => {
    it('returns index-key pairs', () => {
      const list = createFilled([10, 20, 30])
      expect([...list.entries()]).toEqual([[0, 10], [1, 20], [2, 30]])
    })

    it('returns empty on empty list', () => {
      const list = new SkipList3<number>()
      expect([...list.entries()]).toEqual([])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const list = createFilled([1, 2, 3])
      const result = [...list]
      expect(result).toEqual([1, 2, 3])
    })

    it('works with for-of', () => {
      const list = createFilled([1, 2, 3])
      const collected: number[] = []
      for (const key of list) {
        collected.push(key)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('returns empty for empty list', () => {
      const list = new SkipList3<number>()
      expect([...list]).toEqual([])
    })
  })

  describe('rank and at consistency', () => {
    it('at(rank(key)) returns key for all elements', () => {
      const list = createFilled([5, 3, 1, 4, 2])
      for (const key of [1, 2, 3, 4, 5]) {
        const r = list.rank(key)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(list.at(r!)).toBe(key)
      }
    })

    it('rank(at(i)) returns i for all indices', () => {
      const list = createFilled([5, 3, 1, 4, 2])
      for (let i = 0; i < list.size; i++) {
        const key = list.at(i)
        expect(key).toBeDefined()
        expect(list.rank(key!)).toBe(i)
      }
    })

    it('maintains consistency after mixed operations', () => {
      const list = new SkipList3<number>()
      for (let i = 1; i <= 50; i++) {
        list.insert(i)
      }
      for (let i = 10; i <= 20; i++) {
        list.delete(i)
      }
      const arr = list.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(list.rank(arr[i]!)).toBe(i)
        expect(list.at(i)).toBe(arr[i])
      }
    })
  })

  describe('large-scale operations', () => {
    it('handles 500 elements', () => {
      const list = new SkipList3<number>()
      const count = 500
      for (let i = count; i >= 1; i--) {
        list.insert(i)
      }
      expect(list.size).toBe(count)
      expect(list.min()).toBe(1)
      expect(list.max()).toBe(count)
      expect(list.at(0)).toBe(1)
      expect(list.at(count - 1)).toBe(count)
      expect(list.rank(1)).toBe(0)
      expect(list.rank(count)).toBe(count - 1)
    })

    it('handles random insert and delete', () => {
      const list = new SkipList3<number>()
      const inserted = new Set<number>()
      for (let i = 0; i < 100; i++) {
        const val = Math.floor(Math.random() * 200)
        list.insert(val)
        inserted.add(val)
      }
      expect(list.size).toBe(inserted.size)
      for (const val of inserted) {
        expect(list.has(val)).toBe(true)
      }
      for (const val of inserted) {
        list.delete(val)
      }
      expect(list.size).toBe(0)
    })

    it('handles alternating insert and delete', () => {
      const list = new SkipList3<number>()
      for (let i = 1; i <= 50; i++) {
        list.insert(i)
      }
      for (let i = 1; i <= 25; i++) {
        list.delete(i)
      }
      expect(list.size).toBe(25)
      expect(list.min()).toBe(26)
      expect(list.max()).toBe(50)
    })
  })

  describe('edge cases', () => {
    it('handles floating point keys', () => {
      const list = new SkipList3<number>()
      list.insert(1.5)
      list.insert(2.7)
      list.insert(0.3)
      expect(list.toArray()).toEqual([0.3, 1.5, 2.7])
    })

    it('handles large key values', () => {
      const list = new SkipList3<number>()
      list.insert(Number.MAX_SAFE_INTEGER)
      list.insert(Number.MIN_SAFE_INTEGER)
      list.insert(0)
      expect(list.toArray()).toEqual([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
    })

    it('handles single element operations', () => {
      const list = createFilled([42])
      expect(list.has(42)).toBe(true)
      expect(list.rank(42)).toBe(0)
      expect(list.at(0)).toBe(42)
      expect(list.min()).toBe(42)
      expect(list.max()).toBe(42)
      expect(list.floor(42)).toBe(42)
      expect(list.ceiling(42)).toBe(42)
      expect(list.lower(42)).toBeUndefined()
      expect(list.higher(42)).toBeUndefined()
    })

    it('handles two elements', () => {
      const list = createFilled([1, 2])
      expect(list.rank(1)).toBe(0)
      expect(list.rank(2)).toBe(1)
      expect(list.at(0)).toBe(1)
      expect(list.at(1)).toBe(2)
      expect(list.lower(2)).toBe(1)
      expect(list.higher(1)).toBe(2)
    })
  })

  describe('custom comparator', () => {
    it('works with reverse comparator', () => {
      const list = new SkipList3<number>({ comparator: (a, b) => b - a })
      list.insert(1)
      list.insert(5)
      list.insert(3)
      expect(list.toArray()).toEqual([5, 3, 1])
      expect(list.min()).toBe(5)
      expect(list.max()).toBe(1)
    })

    it('works with string comparator', () => {
      const list = new SkipList3<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      list.insert('cherry')
      list.insert('apple')
      list.insert('banana')
      expect(list.toArray()).toEqual(['apple', 'banana', 'cherry'])
      expect(list.rank('banana')).toBe(1)
    })

    it('works with object keys via custom comparator', () => {
      interface Point {
        x: number
        y: number
      }
      const list = new SkipList3<Point>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      list.insert({ x: 3, y: 1 })
      list.insert({ x: 1, y: 2 })
      list.insert({ x: 2, y: 0 })
      const arr = list.toArray()
      expect(arr[0]!.x).toBe(1)
      expect(arr[1]!.x).toBe(2)
      expect(arr[2]!.x).toBe(3)
    })
  })

  describe('range edge cases', () => {
    it('range with lo smaller than all elements', () => {
      const list = createFilled([5, 10, 15])
      expect([...list.range(0, 10)]).toEqual([5, 10])
    })

    it('range with hi larger than all elements', () => {
      const list = createFilled([5, 10, 15])
      expect([...list.range(10, 100)]).toEqual([10, 15])
    })

    it('count with partial overlap at start', () => {
      const list = createFilled([5, 10, 15])
      expect(list.count(0, 7)).toBe(1)
    })

    it('count with partial overlap at end', () => {
      const list = createFilled([5, 10, 15])
      expect(list.count(12, 100)).toBe(1)
    })
  })

  describe('insert and delete interleaved', () => {
    it('insert after delete maintains integrity', () => {
      const list = createFilled([1, 2, 3])
      list.delete(2)
      list.insert(4)
      expect(list.toArray()).toEqual([1, 3, 4])
      expect(list.size).toBe(3)
    })

    it('re-insert deleted element', () => {
      const list = createFilled([1, 2, 3])
      list.delete(2)
      list.insert(2)
      expect(list.toArray()).toEqual([1, 2, 3])
      expect(list.size).toBe(3)
    })
  })
})
