import { describe, it, expect, beforeEach } from 'vitest'
import { SkipList2 } from '../../src/core/skip-list-2/skip-list-2.js'
import { DEFAULT_SKIPLIST2_OPTIONS } from '../../src/core/skip-list-2/types.js'
import type { SkipList2Options, SkipNode2 } from '../../src/core/skip-list-2/types.js'

describe('SkipList2', () => {
  let list: SkipList2<string>

  beforeEach(() => {
    list = new SkipList2<string>()
  })

  describe('constructor', () => {
    it('should create an empty skip list with default options', () => {
      const sl = new SkipList2<string>()
      expect(sl.isEmpty()).toBe(true)
      expect(sl.size()).toBe(0)
    })

    it('should accept custom maxLevel', () => {
      const sl = new SkipList2<string>({ maxLevel: 8 })
      expect(sl.isEmpty()).toBe(true)
    })

    it('should accept custom probability', () => {
      const sl = new SkipList2<string>({ probability: 0.25 })
      expect(sl.isEmpty()).toBe(true)
    })

    it('should accept partial options with defaults', () => {
      const sl = new SkipList2<string>({ maxLevel: 4 })
      expect(sl.isEmpty()).toBe(true)
      sl.insert(1, 'test')
      expect(sl.size()).toBe(1)
    })

    it('should accept all options combined', () => {
      const sl = new SkipList2<string>({ maxLevel: 10, probability: 0.3 })
      sl.insert(1, 'test')
      expect(sl.search(1)).toBe('test')
    })

    it('should create list with no arguments', () => {
      const sl = new SkipList2()
      expect(sl.size()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      list.insert(1, 'one')
      expect(list.size()).toBe(1)
    })

    it('should insert multiple elements', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.size()).toBe(3)
    })

    it('should update value for duplicate key', () => {
      list.insert(1, 'one')
      list.insert(1, 'updated')
      expect(list.size()).toBe(1)
      expect(list.search(1)).toBe('updated')
    })

    it('should insert elements with negative keys', () => {
      list.insert(-5, 'negative')
      expect(list.search(-5)).toBe('negative')
    })

    it('should insert elements with zero key', () => {
      list.insert(0, 'zero')
      expect(list.search(0)).toBe('zero')
    })

    it('should insert elements with large keys', () => {
      list.insert(Number.MAX_SAFE_INTEGER, 'max')
      expect(list.search(Number.MAX_SAFE_INTEGER)).toBe('max')
    })

    it('should insert elements in reverse order', () => {
      list.insert(3, 'three')
      list.insert(2, 'two')
      list.insert(1, 'one')
      expect(list.size()).toBe(3)
      expect(list.search(1)).toBe('one')
      expect(list.search(2)).toBe('two')
      expect(list.search(3)).toBe('three')
    })

    it('should insert elements in random order', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(3, 'three')
      list.insert(2, 'two')
      list.insert(4, 'four')
      expect(list.size()).toBe(5)
      const arr = list.toArray()
      expect(arr[0]!.key).toBe(1)
      expect(arr[4]!.key).toBe(5)
    })

    it('should maintain doubly-linked prev pointers after insert', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      const arr = list.toArray()
      expect(arr.length).toBe(3)
    })

    it('should handle multiple duplicate key updates', () => {
      list.insert(1, 'first')
      list.insert(1, 'second')
      list.insert(1, 'third')
      expect(list.size()).toBe(1)
      expect(list.search(1)).toBe('third')
    })
  })

  describe('search', () => {
    it('should find an inserted element', () => {
      list.insert(1, 'one')
      expect(list.search(1)).toBe('one')
    })

    it('should return undefined for missing key', () => {
      expect(list.search(99)).toBeUndefined()
    })

    it('should return undefined for search on empty list', () => {
      expect(list.search(1)).toBeUndefined()
    })

    it('should find elements after multiple inserts', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.search(1)).toBe('one')
      expect(list.search(2)).toBe('two')
      expect(list.search(3)).toBe('three')
    })

    it('should find element after value update', () => {
      list.insert(1, 'old')
      list.insert(1, 'new')
      expect(list.search(1)).toBe('new')
    })

    it('should find elements with negative keys', () => {
      list.insert(-10, 'neg')
      expect(list.search(-10)).toBe('neg')
    })

    it('should find element at the beginning', () => {
      list.insert(1, 'first')
      list.insert(100, 'last')
      expect(list.search(1)).toBe('first')
    })

    it('should find element at the end', () => {
      list.insert(1, 'first')
      list.insert(100, 'last')
      expect(list.search(100)).toBe('last')
    })
  })

  describe('delete', () => {
    it('should delete an existing element', () => {
      list.insert(1, 'one')
      expect(list.delete(1)).toBe(true)
      expect(list.size()).toBe(0)
    })

    it('should return false for missing key', () => {
      expect(list.delete(99)).toBe(false)
    })

    it('should return false for delete on empty list', () => {
      expect(list.delete(1)).toBe(false)
    })

    it('should delete from middle of list', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.delete(2)).toBe(true)
      expect(list.size()).toBe(2)
      expect(list.search(2)).toBeUndefined()
    })

    it('should delete from beginning of list', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.delete(1)).toBe(true)
      expect(list.getMin()?.key).toBe(2)
    })

    it('should delete from end of list', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.delete(2)).toBe(true)
      expect(list.getMax()?.key).toBe(1)
    })

    it('should handle deleting all elements', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      list.delete(2)
      expect(list.isEmpty()).toBe(true)
    })

    it('should not affect other elements after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      list.delete(2)
      expect(list.search(1)).toBe('one')
      expect(list.search(3)).toBe('three')
    })

    it('should handle deleting reinserted element', () => {
      list.insert(1, 'one')
      list.delete(1)
      list.insert(1, 'new one')
      expect(list.search(1)).toBe('new one')
    })

    it('should maintain prev pointers after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      list.delete(2)
      const arr = list.toArray()
      expect(arr).toEqual([{ key: 1, value: 'one' }, { key: 3, value: 'three' }])
    })

    it('should handle deleting only element', () => {
      list.insert(1, 'one')
      expect(list.delete(1)).toBe(true)
      expect(list.isEmpty()).toBe(true)
      expect(list.search(1)).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      list.insert(1, 'one')
      expect(list.has(1)).toBe(true)
    })

    it('should return false for missing key', () => {
      list.insert(1, 'one')
      expect(list.has(2)).toBe(false)
    })

    it('should return false on empty list', () => {
      expect(list.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      list.insert(1, 'one')
      list.delete(1)
      expect(list.has(1)).toBe(false)
    })
  })

  describe('getMin', () => {
    it('should return undefined for empty list', () => {
      expect(list.getMin()).toBeUndefined()
    })

    it('should return the minimum key and value', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(10, 'ten')
      expect(list.getMin()).toEqual({ key: 1, value: 'one' })
    })

    it('should update min after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      expect(list.getMin()).toEqual({ key: 2, value: 'two' })
    })

    it('should return the only element', () => {
      list.insert(42, 'forty-two')
      expect(list.getMin()).toEqual({ key: 42, value: 'forty-two' })
    })

    it('should return element with negative key as min', () => {
      list.insert(5, 'five')
      list.insert(-3, 'neg')
      list.insert(10, 'ten')
      expect(list.getMin()).toEqual({ key: -3, value: 'neg' })
    })
  })

  describe('getMax', () => {
    it('should return undefined for empty list', () => {
      expect(list.getMax()).toBeUndefined()
    })

    it('should return the maximum key and value', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(10, 'ten')
      expect(list.getMax()).toEqual({ key: 10, value: 'ten' })
    })

    it('should update max after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(2)
      expect(list.getMax()).toEqual({ key: 1, value: 'one' })
    })

    it('should return the only element', () => {
      list.insert(42, 'forty-two')
      expect(list.getMax()).toEqual({ key: 42, value: 'forty-two' })
    })
  })

  describe('range', () => {
    it('should return empty array for no matches', () => {
      list.insert(1, 'one')
      expect(list.range(5, 10)).toEqual([])
    })

    it('should return matching elements in range', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      list.insert(4, 'four')
      list.insert(5, 'five')
      expect(list.range(2, 4)).toEqual([
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
        { key: 4, value: 'four' },
      ])
    })

    it('should return single element range', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.range(1, 1)).toEqual([{ key: 1, value: 'one' }])
    })

    it('should return all elements for full range', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.range(1, 3)).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should return empty array on empty list', () => {
      expect(list.range(1, 10)).toEqual([])
    })

    it('should handle range with no elements in bounds', () => {
      list.insert(1, 'one')
      list.insert(10, 'ten')
      expect(list.range(3, 7)).toEqual([])
    })

    it('should include boundary elements', () => {
      list.insert(1, 'one')
      list.insert(5, 'five')
      list.insert(10, 'ten')
      expect(list.range(1, 5)).toEqual([
        { key: 1, value: 'one' },
        { key: 5, value: 'five' },
      ])
    })

    it('should handle range where min equals max and key exists', () => {
      list.insert(5, 'five')
      expect(list.range(5, 5)).toEqual([{ key: 5, value: 'five' }])
    })

    it('should handle range where min equals max and key does not exist', () => {
      list.insert(5, 'five')
      expect(list.range(3, 3)).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements in order', () => {
      list.insert(3, 'three')
      list.insert(1, 'one')
      list.insert(2, 'two')
      const result: string[] = []
      list.forEach((_key, value) => result.push(value))
      expect(result).toEqual(['one', 'two', 'three'])
    })

    it('should not iterate on empty list', () => {
      let count = 0
      list.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide correct key and value', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      const pairs: Array<{ key: number; value: string }> = []
      list.forEach((key, value) => pairs.push({ key, value }))
      expect(pairs).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
      ])
    })

    it('should iterate single element', () => {
      list.insert(1, 'one')
      const result: string[] = []
      list.forEach((_key, value) => result.push(value))
      expect(result).toEqual(['one'])
    })

    it('should iterate keys in ascending order', () => {
      list.insert(5, 'five')
      list.insert(1, 'one')
      list.insert(3, 'three')
      const keys: number[] = []
      list.forEach((key) => keys.push(key))
      expect(keys).toEqual([1, 3, 5])
    })
  })

  describe('size', () => {
    it('should return 0 for empty list', () => {
      expect(list.size()).toBe(0)
    })

    it('should return correct size after inserts', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.size()).toBe(2)
    })

    it('should return correct size after deletion', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      expect(list.size()).toBe(1)
    })

    it('should not change size on duplicate insert', () => {
      list.insert(1, 'one')
      list.insert(1, 'updated')
      expect(list.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new list', () => {
      expect(list.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      list.insert(1, 'one')
      expect(list.isEmpty()).toBe(false)
    })

    it('should return true after deleting all elements', () => {
      list.insert(1, 'one')
      list.delete(1)
      expect(list.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      list.insert(1, 'one')
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.clear()
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should allow inserts after clear', () => {
      list.insert(1, 'one')
      list.clear()
      list.insert(2, 'two')
      expect(list.size()).toBe(1)
      expect(list.search(2)).toBe('two')
    })

    it('should handle clearing an empty list', () => {
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })

    it('should make search return undefined after clear', () => {
      list.insert(1, 'one')
      list.clear()
      expect(list.search(1)).toBeUndefined()
    })

    it('should allow range after clear', () => {
      list.insert(1, 'one')
      list.clear()
      expect(list.range(1, 10)).toEqual([])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      expect(list.toArray()).toEqual([])
    })

    it('should return all elements in order', () => {
      list.insert(3, 'three')
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.toArray()).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should return single element', () => {
      list.insert(1, 'one')
      expect(list.toArray()).toEqual([{ key: 1, value: 'one' }])
    })

    it('should reflect deletions', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      list.delete(2)
      expect(list.toArray()).toEqual([
        { key: 1, value: 'one' },
        { key: 3, value: 'three' },
      ])
    })

    it('should reflect updates', () => {
      list.insert(1, 'old')
      list.insert(1, 'new')
      expect(list.toArray()).toEqual([{ key: 1, value: 'new' }])
    })
  })

  describe('containsRange', () => {
    it('should return false for empty list', () => {
      expect(list.containsRange(1, 5)).toBe(false)
    })

    it('should return true when all keys in range exist', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      expect(list.containsRange(1, 3)).toBe(true)
    })

    it('should return false when a key is missing from range', () => {
      list.insert(1, 'one')
      list.insert(3, 'three')
      expect(list.containsRange(1, 3)).toBe(false)
    })

    it('should return true for single key range that exists', () => {
      list.insert(5, 'five')
      expect(list.containsRange(5, 5)).toBe(true)
    })

    it('should return false for single key range that does not exist', () => {
      list.insert(5, 'five')
      expect(list.containsRange(3, 3)).toBe(false)
    })

    it('should return false when min > max', () => {
      list.insert(1, 'one')
      expect(list.containsRange(5, 1)).toBe(false)
    })

    it('should return false when range extends beyond list', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.containsRange(1, 5)).toBe(false)
    })

    it('should return true for contiguous subset', () => {
      for (let i = 1; i <= 10; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.containsRange(3, 7)).toBe(true)
    })

    it('should return false when gap exists in subset', () => {
      for (let i = 1; i <= 10; i++) {
        if (i !== 5) list.insert(i, `val-${i}`)
      }
      expect(list.containsRange(3, 7)).toBe(false)
    })

    it('should return true for full range of all elements', () => {
      list.insert(1, 'a')
      list.insert(2, 'b')
      list.insert(3, 'c')
      expect(list.containsRange(1, 3)).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_SKIPLIST2_OPTIONS', () => {
      expect(DEFAULT_SKIPLIST2_OPTIONS.maxLevel).toBe(16)
      expect(DEFAULT_SKIPLIST2_OPTIONS.probability).toBe(0.5)
    })

    it('should support SkipList2Options interface', () => {
      const opts: SkipList2Options = {
        maxLevel: 10,
        probability: 0.3,
      }
      expect(opts.maxLevel).toBe(10)
    })

    it('should support SkipNode2 interface structure', () => {
      const node: SkipNode2<string> = {
        key: 1,
        value: 'test',
        prev: [null],
        next: [null],
        level: 1,
      }
      expect(node.key).toBe(1)
      expect(node.value).toBe('test')
      expect(node.level).toBe(1)
    })
  })

  describe('doubly-linked behavior', () => {
    it('should maintain list integrity after sequential inserts', () => {
      for (let i = 1; i <= 5; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.toArray().length).toBe(5)
    })

    it('should maintain list integrity after interleaved deletes', () => {
      for (let i = 1; i <= 6; i++) {
        list.insert(i, `val-${i}`)
      }
      list.delete(2)
      list.delete(4)
      list.delete(6)
      expect(list.toArray()).toEqual([
        { key: 1, value: 'val-1' },
        { key: 3, value: 'val-3' },
        { key: 5, value: 'val-5' },
      ])
    })

    it('should handle insert after delete in middle', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.insert(3, 'three')
      list.delete(2)
      list.insert(2, 'new-two')
      expect(list.toArray()).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'new-two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should handle delete head then insert new head', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      list.insert(0, 'zero')
      expect(list.getMin()).toEqual({ key: 0, value: 'zero' })
    })

    it('should handle delete tail then insert new tail', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(2)
      list.insert(3, 'three')
      expect(list.getMax()).toEqual({ key: 3, value: 'three' })
    })
  })

  describe('large datasets', () => {
    it('should handle 1000 inserts', () => {
      for (let i = 0; i < 1000; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.size()).toBe(1000)
      expect(list.search(0)).toBe('val-0')
      expect(list.search(999)).toBe('val-999')
    })

    it('should handle 1000 inserts and searches', () => {
      for (let i = 0; i < 1000; i++) {
        list.insert(i, `val-${i}`)
      }
      for (let i = 0; i < 1000; i++) {
        expect(list.has(i)).toBe(true)
      }
    })

    it('should handle insert delete reinsert cycle', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, `val-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        list.delete(i)
      }
      expect(list.size()).toBe(50)
      for (let i = 0; i < 50; i++) {
        list.insert(i, `new-${i}`)
      }
      expect(list.size()).toBe(100)
    })

    it('should maintain sort order for random inserts', () => {
      const keys = [5, 2, 8, 1, 9, 3, 7, 4, 6, 10]
      for (const k of keys) {
        list.insert(k, `val-${k}`)
      }
      const arr = list.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]!.key).toBeGreaterThan(arr[i - 1]!.key)
      }
    })

    it('should handle range queries on large dataset', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(i, `val-${i}`)
      }
      const result = list.range(20, 30)
      expect(result.length).toBe(11)
      expect(result[0]!.key).toBe(20)
      expect(result[10]!.key).toBe(30)
    })

    it('should handle containsRange on large contiguous dataset', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.containsRange(0, 49)).toBe(true)
      expect(list.containsRange(0, 50)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle number values', () => {
      const numList = new SkipList2<number>()
      numList.insert(1, 100)
      numList.insert(2, 200)
      expect(numList.search(1)).toBe(100)
    })

    it('should handle object values', () => {
      const objList = new SkipList2<{ name: string }>()
      objList.insert(1, { name: 'test' })
      expect(objList.search(1)?.name).toBe('test')
    })

    it('should handle null value', () => {
      const nullList = new SkipList2<null>()
      nullList.insert(1, null)
      expect(nullList.search(1)).toBeNull()
    })

    it('should handle undefined value', () => {
      const undefList = new SkipList2<undefined>()
      undefList.insert(1, undefined)
      expect(undefList.search(1)).toBeUndefined()
      expect(undefList.has(1)).toBe(true)
    })

    it('should handle sequential keys', () => {
      for (let i = 0; i < 10; i++) {
        list.insert(i, `val-${i}`)
      }
      expect(list.size()).toBe(10)
      expect(list.getMin()).toEqual({ key: 0, value: 'val-0' })
      expect(list.getMax()).toEqual({ key: 9, value: 'val-9' })
    })

    it('should handle getMin and getMax on single element', () => {
      list.insert(5, 'five')
      expect(list.getMin()).toEqual({ key: 5, value: 'five' })
      expect(list.getMax()).toEqual({ key: 5, value: 'five' })
    })

    it('should handle deleting non-existent key from populated list', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      expect(list.delete(3)).toBe(false)
      expect(list.size()).toBe(2)
    })

    it('should work with low maxLevel', () => {
      const sl = new SkipList2<string>({ maxLevel: 2, probability: 0.5 })
      for (let i = 0; i < 10; i++) {
        sl.insert(i, `val-${i}`)
      }
      expect(sl.size()).toBe(10)
      expect(sl.search(5)).toBe('val-5')
    })

    it('should work with high probability', () => {
      const sl = new SkipList2<string>({ maxLevel: 4, probability: 0.99 })
      for (let i = 0; i < 10; i++) {
        sl.insert(i, `val-${i}`)
      }
      expect(sl.size()).toBe(10)
    })

    it('should handle range on single element in range', () => {
      list.insert(5, 'five')
      expect(list.range(1, 10)).toEqual([{ key: 5, value: 'five' }])
    })

    it('should handle range on single element outside range', () => {
      list.insert(5, 'five')
      expect(list.range(6, 10)).toEqual([])
    })

    it('should handle getMin/getMax after all deletes', () => {
      list.insert(1, 'one')
      list.insert(2, 'two')
      list.delete(1)
      list.delete(2)
      expect(list.getMin()).toBeUndefined()
      expect(list.getMax()).toBeUndefined()
    })

    it('should handle forEach on large ordered set', () => {
      for (let i = 0; i < 50; i++) {
        list.insert(i, `val-${i}`)
      }
      let count = 0
      list.forEach(() => count++)
      expect(count).toBe(50)
    })
  })
})
