import { describe, it, expect, beforeEach } from 'vitest'
import { PaginatedSkipList } from '../../src/core/paginated-skip-list/paginated-skip-list.js'
import { DEFAULT_MAX_LEVEL, DEFAULT_PROBABILITY } from '../../src/core/paginated-skip-list/types.js'
import type {
  PaginatedSkipListOptions,
  PageInfo,
  CursorPage,
  RangePage,
} from '../../src/core/paginated-skip-list/types.js'

describe('PaginatedSkipList', () => {
  let list: PaginatedSkipList<number>

  beforeEach(() => {
    list = new PaginatedSkipList<number>()
  })

  describe('constructor', () => {
    it('should create an empty list with defaults', () => {
      const sl = new PaginatedSkipList<number>()
      expect(sl.isEmpty()).toBe(true)
      expect(sl.size()).toBe(0)
    })

    it('should create with custom maxLevel', () => {
      const sl = new PaginatedSkipList<number>({ maxLevel: 8 })
      expect(sl.size()).toBe(0)
    })

    it('should create with custom probability', () => {
      const sl = new PaginatedSkipList<number>({ probability: 0.25 })
      expect(sl.size()).toBe(0)
    })

    it('should create with custom comparator', () => {
      const cmp = (a: number, b: number) => b - a
      const sl = new PaginatedSkipList<number>({ comparator: cmp })
      sl.insert(1)
      sl.insert(3)
      sl.insert(2)
      expect(sl.toArray()).toEqual([3, 2, 1])
    })

    it('should create with initial values', () => {
      const sl = new PaginatedSkipList<number>({ initialValues: [3, 1, 2] })
      expect(sl.size()).toBe(3)
      expect(sl.toArray()).toEqual([1, 2, 3])
    })

    it('should create with all options combined', () => {
      const sl = new PaginatedSkipList<number>({
        maxLevel: 8,
        probability: 0.3,
        initialValues: [5, 3, 1],
        comparator: (a, b) => a - b,
      })
      expect(sl.size()).toBe(3)
      expect(sl.toArray()).toEqual([1, 3, 5])
    })

    it('should handle empty initial values', () => {
      const sl = new PaginatedSkipList<number>({ initialValues: [] })
      expect(sl.isEmpty()).toBe(true)
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      list.insert(5)
      expect(list.size()).toBe(1)
    })

    it('should insert multiple elements', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.size()).toBe(3)
    })

    it('should handle duplicate insert by updating', () => {
      list.insert(1)
      list.insert(1)
      expect(list.size()).toBe(1)
    })

    it('should maintain sorted order', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert negative numbers', () => {
      list.insert(-5)
      list.insert(-10)
      list.insert(0)
      expect(list.toArray()).toEqual([-10, -5, 0])
    })

    it('should insert in reverse order', () => {
      list.insert(5)
      list.insert(4)
      list.insert(3)
      list.insert(2)
      list.insert(1)
      expect(list.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should insert zero', () => {
      list.insert(0)
      expect(list.contains(0)).toBe(true)
    })
  })

  describe('remove', () => {
    it('should remove an existing element', () => {
      list.insert(1)
      expect(list.remove(1)).toBe(true)
      expect(list.size()).toBe(0)
    })

    it('should return false for non-existing', () => {
      expect(list.remove(99)).toBe(false)
    })

    it('should return false on empty list', () => {
      expect(list.remove(1)).toBe(false)
    })

    it('should remove from head', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.remove(1)).toBe(true)
      expect(list.getMin()).toBe(2)
    })

    it('should remove from tail', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.remove(3)).toBe(true)
      expect(list.getMax()).toBe(2)
    })

    it('should remove from middle', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      expect(list.remove(2)).toBe(true)
      expect(list.toArray()).toEqual([1, 3])
    })

    it('should handle removing all elements', () => {
      list.insert(1)
      list.insert(2)
      list.remove(1)
      list.remove(2)
      expect(list.isEmpty()).toBe(true)
    })

    it('should not affect other elements after removal', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.remove(2)
      expect(list.contains(1)).toBe(true)
      expect(list.contains(3)).toBe(true)
    })
  })

  describe('contains', () => {
    it('should return true for existing element', () => {
      list.insert(5)
      expect(list.contains(5)).toBe(true)
    })

    it('should return false for non-existing', () => {
      list.insert(5)
      expect(list.contains(10)).toBe(false)
    })

    it('should return false on empty list', () => {
      expect(list.contains(1)).toBe(false)
    })

    it('should return false after removal', () => {
      list.insert(5)
      list.remove(5)
      expect(list.contains(5)).toBe(false)
    })
  })

  describe('getPage', () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) {
        list.insert(i)
      }
    })

    it('should return first page', () => {
      const page = list.getPage(1, 3)
      expect(page.items).toEqual([1, 2, 3])
      expect(page.pageNumber).toBe(1)
      expect(page.pageSize).toBe(3)
      expect(page.totalItems).toBe(10)
      expect(page.totalPages).toBe(4)
      expect(page.hasNext).toBe(true)
      expect(page.hasPrev).toBe(false)
    })

    it('should return middle page', () => {
      const page = list.getPage(2, 3)
      expect(page.items).toEqual([4, 5, 6])
      expect(page.hasNext).toBe(true)
      expect(page.hasPrev).toBe(true)
    })

    it('should return last page with remaining items', () => {
      const page = list.getPage(4, 3)
      expect(page.items).toEqual([10])
      expect(page.hasNext).toBe(false)
      expect(page.hasPrev).toBe(true)
    })

    it('should return empty for page beyond range', () => {
      const page = list.getPage(5, 3)
      expect(page.items).toEqual([])
      expect(page.hasNext).toBe(false)
      expect(page.hasPrev).toBe(true)
    })

    it('should return empty for negative page number', () => {
      const page = list.getPage(-1, 3)
      expect(page.items).toEqual([])
    })

    it('should return empty for page zero', () => {
      const page = list.getPage(0, 3)
      expect(page.items).toEqual([])
    })

    it('should handle page size 1', () => {
      const page = list.getPage(1, 1)
      expect(page.items).toEqual([1])
      expect(page.totalPages).toBe(10)
    })

    it('should handle page size larger than list', () => {
      const page = list.getPage(1, 100)
      expect(page.items.length).toBe(10)
      expect(page.totalPages).toBe(1)
      expect(page.hasNext).toBe(false)
    })

    it('should handle page size equal to list size', () => {
      const page = list.getPage(1, 10)
      expect(page.items.length).toBe(10)
      expect(page.hasNext).toBe(false)
    })

    it('should return empty for page size 0', () => {
      const page = list.getPage(1, 0)
      expect(page.items).toEqual([])
    })

    it('should return empty for negative page size', () => {
      const page = list.getPage(1, -5)
      expect(page.items).toEqual([])
    })
  })

  describe('getPage on empty list', () => {
    it('should return empty info', () => {
      const page = list.getPage(1, 10)
      expect(page.items).toEqual([])
      expect(page.totalItems).toBe(0)
      expect(page.totalPages).toBe(0)
    })
  })

  describe('getCursorPage', () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) {
        list.insert(i)
      }
    })

    it('should return first page with null cursor', () => {
      const page = list.getCursorPage(null, 3)
      expect(page.items).toEqual([1, 2, 3])
      expect(page.cursor).toBe(3)
      expect(page.hasMore).toBe(true)
    })

    it('should return second page using cursor', () => {
      const page = list.getCursorPage(3, 3)
      expect(page.items).toEqual([4, 5, 6])
      expect(page.cursor).toBe(6)
      expect(page.hasMore).toBe(true)
    })

    it('should return last page', () => {
      const page = list.getCursorPage(9, 3)
      expect(page.items).toEqual([10])
      expect(page.cursor).toBe(null)
      expect(page.hasMore).toBe(false)
    })

    it('should handle page size larger than list', () => {
      const page = list.getCursorPage(null, 100)
      expect(page.items.length).toBe(10)
      expect(page.cursor).toBe(null)
      expect(page.hasMore).toBe(false)
    })

    it('should handle cursor for non-existing value', () => {
      const page = list.getCursorPage(5, 3)
      expect(page.items).toEqual([6, 7, 8])
      expect(page.hasMore).toBe(true)
    })

    it('should handle page size 1', () => {
      const page = list.getCursorPage(null, 1)
      expect(page.items).toEqual([1])
      expect(page.hasMore).toBe(true)
    })

    it('should return empty for page size 0', () => {
      const page = list.getCursorPage(null, 0)
      expect(page.items).toEqual([])
      expect(page.hasMore).toBe(false)
    })

    it('should return empty for negative page size', () => {
      const page = list.getCursorPage(null, -1)
      expect(page.items).toEqual([])
    })
  })

  describe('getCursorPage on empty list', () => {
    it('should return empty with null cursor', () => {
      const page = list.getCursorPage(null, 10)
      expect(page.items).toEqual([])
      expect(page.cursor).toBe(null)
      expect(page.hasMore).toBe(false)
    })
  })

  describe('getRange', () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) {
        list.insert(i)
      }
    })

    it('should return elements in full range', () => {
      expect(list.getRange(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should return partial range', () => {
      expect(list.getRange(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('should return single element range', () => {
      expect(list.getRange(5, 5)).toEqual([5])
    })

    it('should return empty for no match', () => {
      expect(list.getRange(11, 20)).toEqual([])
    })

    it('should return empty for inverted range', () => {
      expect(list.getRange(7, 3)).toEqual([])
    })

    it('should include boundary elements', () => {
      expect(list.getRange(2, 4)).toEqual([2, 3, 4])
    })

    it('should return empty on empty list', () => {
      const empty = new PaginatedSkipList<number>()
      expect(empty.getRange(1, 10)).toEqual([])
    })

    it('should handle range spanning beyond list', () => {
      expect(list.getRange(8, 100)).toEqual([8, 9, 10])
    })
  })

  describe('getRangePage', () => {
    beforeEach(() => {
      for (let i = 1; i <= 20; i++) {
        list.insert(i)
      }
    })

    it('should return first page of range', () => {
      const rp = list.getRangePage(5, 15, 1, 3)
      expect(rp.items).toEqual([5, 6, 7])
      expect(rp.rangeStart).toBe(5)
      expect(rp.rangeEnd).toBe(15)
    })

    it('should return second page of range', () => {
      const rp = list.getRangePage(5, 15, 2, 3)
      expect(rp.items).toEqual([8, 9, 10])
    })

    it('should return last partial page of range', () => {
      const rp = list.getRangePage(5, 15, 4, 3)
      expect(rp.items).toEqual([14, 15])
    })

    it('should return empty for page beyond range', () => {
      const rp = list.getRangePage(5, 15, 10, 3)
      expect(rp.items).toEqual([])
    })

    it('should return empty for negative page', () => {
      const rp = list.getRangePage(5, 15, -1, 3)
      expect(rp.items).toEqual([])
    })

    it('should return empty for page size 0', () => {
      const rp = list.getRangePage(5, 15, 1, 0)
      expect(rp.items).toEqual([])
    })

    it('should handle empty range result', () => {
      const rp = list.getRangePage(25, 30, 1, 3)
      expect(rp.items).toEqual([])
    })
  })

  describe('getMin/getMax', () => {
    it('should return undefined for empty list', () => {
      expect(list.getMin()).toBeUndefined()
      expect(list.getMax()).toBeUndefined()
    })

    it('should return single element', () => {
      list.insert(42)
      expect(list.getMin()).toBe(42)
      expect(list.getMax()).toBe(42)
    })

    it('should return min and max after multiple inserts', () => {
      list.insert(5)
      list.insert(1)
      list.insert(10)
      expect(list.getMin()).toBe(1)
      expect(list.getMax()).toBe(10)
    })

    it('should update min after removal', () => {
      list.insert(1)
      list.insert(5)
      list.remove(1)
      expect(list.getMin()).toBe(5)
    })

    it('should update max after removal', () => {
      list.insert(1)
      list.insert(10)
      list.remove(10)
      expect(list.getMax()).toBe(1)
    })

    it('should return undefined after clearing', () => {
      list.insert(1)
      list.clear()
      expect(list.getMin()).toBeUndefined()
      expect(list.getMax()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('should return empty for empty list', () => {
      expect(list.toArray()).toEqual([])
    })

    it('should return sorted elements', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should reflect removals', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.remove(2)
      expect(list.toArray()).toEqual([1, 3])
    })
  })

  describe('atIndex', () => {
    beforeEach(() => {
      list.insert(10)
      list.insert(20)
      list.insert(30)
    })

    it('should return element at valid index', () => {
      expect(list.atIndex(0)).toBe(10)
      expect(list.atIndex(1)).toBe(20)
      expect(list.atIndex(2)).toBe(30)
    })

    it('should return undefined for negative index', () => {
      expect(list.atIndex(-1)).toBeUndefined()
    })

    it('should return undefined for out of bounds', () => {
      expect(list.atIndex(3)).toBeUndefined()
      expect(list.atIndex(100)).toBeUndefined()
    })

    it('should return undefined on empty list', () => {
      const empty = new PaginatedSkipList<number>()
      expect(empty.atIndex(0)).toBeUndefined()
    })
  })

  describe('indexOf', () => {
    beforeEach(() => {
      list.insert(10)
      list.insert(20)
      list.insert(30)
    })

    it('should return index of existing element', () => {
      expect(list.indexOf(10)).toBe(0)
      expect(list.indexOf(20)).toBe(1)
      expect(list.indexOf(30)).toBe(2)
    })

    it('should return -1 for non-existing', () => {
      expect(list.indexOf(99)).toBe(-1)
    })

    it('should return -1 on empty list', () => {
      const empty = new PaginatedSkipList<number>()
      expect(empty.indexOf(1)).toBe(-1)
    })
  })

  describe('rank/findByRank', () => {
    beforeEach(() => {
      list.insert(10)
      list.insert(20)
      list.insert(30)
      list.insert(40)
      list.insert(50)
    })

    it('should return rank of existing elements', () => {
      expect(list.rank(10)).toBe(0)
      expect(list.rank(30)).toBe(2)
      expect(list.rank(50)).toBe(4)
    })

    it('should return -1 for non-existing rank', () => {
      expect(list.rank(99)).toBe(-1)
    })

    it('should find element by rank', () => {
      expect(list.findByRank(0)).toBe(10)
      expect(list.findByRank(4)).toBe(50)
    })

    it('should return undefined for invalid rank', () => {
      expect(list.findByRank(-1)).toBeUndefined()
      expect(list.findByRank(5)).toBeUndefined()
    })

    it('rank and findByRank should be inverse', () => {
      for (let i = 0; i < 5; i++) {
        const val = list.findByRank(i)
        expect(val).not.toBeUndefined()
        expect(list.rank(val!)).toBe(i)
      }
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      const cloned = list.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
      expect(cloned.size()).toBe(3)

      cloned.remove(2)
      expect(list.size()).toBe(3)
      expect(cloned.size()).toBe(2)
    })

    it('should clone empty list', () => {
      const cloned = list.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve comparator', () => {
      const rev = new PaginatedSkipList<number>({ comparator: (a, b) => b - a })
      rev.insert(1)
      rev.insert(2)
      rev.insert(3)
      const cloned = rev.clone()
      expect(cloned.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('merge', () => {
    it('should merge two non-empty lists', () => {
      list.insert(1)
      list.insert(3)
      list.insert(5)
      const other = new PaginatedSkipList<number>()
      other.insert(2)
      other.insert(4)
      other.insert(6)
      const merged = list.merge(other)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
      expect(merged.size()).toBe(6)
    })

    it('should merge with overlapping elements', () => {
      list.insert(1)
      list.insert(2)
      const other = new PaginatedSkipList<number>()
      other.insert(2)
      other.insert(3)
      const merged = list.merge(other)
      expect(merged.toArray()).toEqual([1, 2, 3])
      expect(merged.size()).toBe(3)
    })

    it('should merge with empty list', () => {
      list.insert(1)
      list.insert(2)
      const empty = new PaginatedSkipList<number>()
      const merged = list.merge(empty)
      expect(merged.toArray()).toEqual([1, 2])
    })

    it('should merge empty with non-empty', () => {
      const other = new PaginatedSkipList<number>()
      other.insert(1)
      const merged = list.merge(other)
      expect(merged.toArray()).toEqual([1])
    })

    it('should not modify original lists', () => {
      list.insert(1)
      const other = new PaginatedSkipList<number>()
      other.insert(2)
      list.merge(other)
      expect(list.size()).toBe(1)
      expect(other.size()).toBe(1)
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements in order', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      const result: number[] = []
      list.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('should not iterate on empty list', () => {
      let count = 0
      list.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide correct indices', () => {
      list.insert(10)
      list.insert(20)
      list.insert(30)
      const indices: number[] = []
      list.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('iterator', () => {
    it('should iterate with for-of', () => {
      list.insert(3)
      list.insert(1)
      list.insert(2)
      const result: number[] = []
      for (const v of list) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('should produce nothing for empty list', () => {
      const result: number[] = []
      for (const v of list) {
        result.push(v)
      }
      expect(result).toEqual([])
    })

    it('should work with spread operator', () => {
      list.insert(1)
      list.insert(2)
      expect([...list]).toEqual([1, 2])
    })
  })

  describe('large dataset', () => {
    it('should handle 1000 elements with correct pagination totals', () => {
      const big = new PaginatedSkipList<number>()
      for (let i = 1; i <= 1000; i++) {
        big.insert(i)
      }
      expect(big.size()).toBe(1000)
      const page = big.getPage(1, 50)
      expect(page.totalItems).toBe(1000)
      expect(page.totalPages).toBe(20)
      expect(page.items.length).toBe(50)
    })

    it('should verify page correctness across all pages', () => {
      const big = new PaginatedSkipList<number>()
      for (let i = 1; i <= 100; i++) {
        big.insert(i)
      }
      for (let p = 1; p <= 10; p++) {
        const page = big.getPage(p, 10)
        const expectedStart = (p - 1) * 10 + 1
        for (let j = 0; j < 10; j++) {
          expect(page.items[j]).toBe(expectedStart + j)
        }
      }
    })

    it('should handle cursor-based pagination through entire dataset', () => {
      const big = new PaginatedSkipList<number>()
      for (let i = 1; i <= 100; i++) {
        big.insert(i)
      }
      let cursor: number | null = null
      const allItems: number[] = []
      let iterations = 0
      while (iterations < 20) {
        const page = big.getCursorPage(cursor, 10)
        allItems.push(...page.items)
        if (!page.hasMore) break
        cursor = page.cursor
        iterations++
      }
      expect(allItems.length).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(allItems[i]).toBe(i + 1)
      }
    })

    it('should handle range query on large dataset', () => {
      const big = new PaginatedSkipList<number>()
      for (let i = 1; i <= 1000; i++) {
        big.insert(i)
      }
      const range = big.getRange(100, 200)
      expect(range.length).toBe(101)
      expect(range[0]).toBe(100)
      expect(range[100]).toBe(200)
    })

    it('should handle range pagination on large dataset', () => {
      const big = new PaginatedSkipList<number>()
      for (let i = 1; i <= 1000; i++) {
        big.insert(i)
      }
      const rp = big.getRangePage(100, 200, 2, 25)
      expect(rp.items[0]).toBe(125)
      expect(rp.items.length).toBe(25)
    })

    it('should handle indexOf on large dataset', () => {
      const big = new PaginatedSkipList<number>()
      for (let i = 0; i < 1000; i++) {
        big.insert(i)
      }
      expect(big.indexOf(500)).toBe(500)
      expect(big.indexOf(999)).toBe(999)
      expect(big.indexOf(0)).toBe(0)
    })
  })

  describe('custom comparator (reverse order)', () => {
    it('should maintain reverse sorted order', () => {
      const rev = new PaginatedSkipList<number>({
        comparator: (a, b) => b - a,
      })
      rev.insert(1)
      rev.insert(5)
      rev.insert(3)
      expect(rev.toArray()).toEqual([5, 3, 1])
    })

    it('should paginate in reverse order', () => {
      const rev = new PaginatedSkipList<number>({
        comparator: (a, b) => b - a,
        initialValues: [1, 2, 3, 4, 5],
      })
      const page = rev.getPage(1, 3)
      expect(page.items).toEqual([5, 4, 3])
    })

    it('should getMin/getMax in reverse order', () => {
      const rev = new PaginatedSkipList<number>({
        comparator: (a, b) => b - a,
        initialValues: [1, 5, 3],
      })
      expect(rev.getMin()).toBe(5)
      expect(rev.getMax()).toBe(1)
    })

    it('should handle range in reverse order', () => {
      const rev = new PaginatedSkipList<number>({
        comparator: (a, b) => b - a,
        initialValues: [1, 2, 3, 4, 5],
      })
      expect(rev.getRange(4, 2)).toEqual([4, 3, 2])
    })
  })

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      expect(list.size()).toBe(0)
      list.insert(1)
      expect(list.size()).toBe(1)
      list.insert(2)
      expect(list.size()).toBe(2)
      list.remove(1)
      expect(list.size()).toBe(1)
    })

    it('should track isEmpty correctly', () => {
      expect(list.isEmpty()).toBe(true)
      list.insert(1)
      expect(list.isEmpty()).toBe(false)
      list.remove(1)
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      list.insert(1)
      list.insert(2)
      list.insert(3)
      list.clear()
      expect(list.size()).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.toArray()).toEqual([])
    })

    it('should allow inserts after clear', () => {
      list.insert(1)
      list.clear()
      list.insert(2)
      expect(list.size()).toBe(1)
      expect(list.contains(2)).toBe(true)
      expect(list.contains(1)).toBe(false)
    })

    it('should handle clearing empty list', () => {
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_MAX_LEVEL and DEFAULT_PROBABILITY', () => {
      expect(DEFAULT_MAX_LEVEL).toBe(16)
      expect(DEFAULT_PROBABILITY).toBe(0.5)
    })

    it('should support PaginatedSkipListOptions interface', () => {
      const opts: PaginatedSkipListOptions<number> = {
        maxLevel: 8,
        probability: 0.3,
        comparator: (a, b) => a - b,
        initialValues: [1, 2, 3],
      }
      expect(opts.maxLevel).toBe(8)
    })

    it('should support PageInfo interface', () => {
      const info: PageInfo<number> = {
        items: [1, 2, 3],
        pageNumber: 1,
        pageSize: 3,
        totalItems: 10,
        totalPages: 4,
        hasNext: true,
        hasPrev: false,
      }
      expect(info.items.length).toBe(3)
    })

    it('should support CursorPage interface', () => {
      const cursor: CursorPage<number> = {
        items: [1, 2],
        cursor: 2,
        hasMore: true,
      }
      expect(cursor.hasMore).toBe(true)
    })

    it('should support RangePage interface', () => {
      const range: RangePage<number> = {
        items: [3, 4, 5],
        rangeStart: 3,
        rangeEnd: 5,
      }
      expect(range.items.length).toBe(3)
    })
  })

  describe('string values', () => {
    it('should work with string values', () => {
      const sl = new PaginatedSkipList<string>()
      sl.insert('cherry')
      sl.insert('apple')
      sl.insert('banana')
      expect(sl.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should paginate string values', () => {
      const sl = new PaginatedSkipList<string>({
        initialValues: ['a', 'b', 'c', 'd', 'e'],
      })
      const page = sl.getPage(1, 2)
      expect(page.items).toEqual(['a', 'b'])
    })
  })

  describe('edge cases', () => {
    it('should handle reinsert after removal', () => {
      list.insert(1)
      list.remove(1)
      list.insert(1)
      expect(list.contains(1)).toBe(true)
      expect(list.size()).toBe(1)
    })

    it('should handle many duplicates gracefully', () => {
      list.insert(1)
      list.insert(1)
      list.insert(1)
      expect(list.size()).toBe(1)
    })

    it('should handle single element pagination', () => {
      list.insert(42)
      const page = list.getPage(1, 10)
      expect(page.items).toEqual([42])
      expect(page.totalPages).toBe(1)
    })

    it('should handle cursor at last element', () => {
      list.insert(1)
      list.insert(2)
      const page = list.getCursorPage(2, 10)
      expect(page.items).toEqual([])
      expect(page.hasMore).toBe(false)
      expect(page.cursor).toBe(null)
    })

    it('should handle atIndex on single element', () => {
      list.insert(99)
      expect(list.atIndex(0)).toBe(99)
    })

    it('should handle rank of single element', () => {
      list.insert(50)
      expect(list.rank(50)).toBe(0)
    })

    it('should handle findByRank of single element', () => {
      list.insert(50)
      expect(list.findByRank(0)).toBe(50)
    })

    it('should handle clone with single element', () => {
      list.insert(77)
      const c = list.clone()
      expect(c.size()).toBe(1)
      expect(c.contains(77)).toBe(true)
    })

    it('should handle merge with single elements each', () => {
      list.insert(1)
      const other = new PaginatedSkipList<number>()
      other.insert(2)
      const m = list.merge(other)
      expect(m.toArray()).toEqual([1, 2])
    })

    it('should handle getRangePage with single element in range', () => {
      list.insert(5)
      const rp = list.getRangePage(5, 5, 1, 10)
      expect(rp.items).toEqual([5])
    })

    it('should handle large maxLevel', () => {
      const sl = new PaginatedSkipList<number>({ maxLevel: 32 })
      for (let i = 0; i < 100; i++) {
        sl.insert(i)
      }
      expect(sl.size()).toBe(100)
    })

    it('should handle low maxLevel', () => {
      const sl = new PaginatedSkipList<number>({ maxLevel: 2 })
      for (let i = 0; i < 50; i++) {
        sl.insert(i)
      }
      expect(sl.size()).toBe(50)
    })
  })
})
