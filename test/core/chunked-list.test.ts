import { describe, it, expect, beforeEach } from 'vitest'
import { ChunkedList } from '../../src/core/chunked-list/chunked-list.js'
import { DEFAULT_CHUNK_SIZE } from '../../src/core/chunked-list/types.js'
import type { ChunkedListOptions, ChunkedListStats } from '../../src/core/chunked-list/types.js'

describe('ChunkedList', () => {
  describe('constructor', () => {
    it('should create empty list with default chunk size', () => {
      const list = new ChunkedList<number>()
      expect(list.length).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.chunkCount).toBe(0)
    })

    it('should create list with custom chunk size via number', () => {
      const list = new ChunkedList<number>(4)
      expect(list.length).toBe(0)
    })

    it('should create list with options object', () => {
      const list = new ChunkedList<number>({ chunkSize: 8 })
      expect(list.length).toBe(0)
    })

    it('should clamp chunk size to 1 when given 0', () => {
      const list = new ChunkedList<number>(0)
      list.append(1)
      list.append(2)
      expect(list.toArray()).toEqual([1, 2])
      expect(list.chunkCount).toBe(2)
    })

    it('should clamp chunk size to 1 when given negative', () => {
      const list = new ChunkedList<number>(-5)
      list.append(1)
      list.append(2)
      expect(list.chunkCount).toBe(2)
    })

    it('should use DEFAULT_CHUNK_SIZE constant', () => {
      expect(DEFAULT_CHUNK_SIZE).toBe(64)
    })

    it('should use default chunk size when no args', () => {
      const list = new ChunkedList<number>()
      for (let i = 0; i < DEFAULT_CHUNK_SIZE; i++) list.append(i)
      expect(list.chunkCount).toBe(1)
      list.append(DEFAULT_CHUNK_SIZE)
      expect(list.chunkCount).toBe(2)
    })

    it('should work with no generic type parameter', () => {
      const list = new ChunkedList()
      list.append('hello')
      expect(list.length).toBe(1)
    })

    it('should use default chunk size with empty options object', () => {
      const list = new ChunkedList<number>({})
      expect(list.length).toBe(0)
      for (let i = 0; i < DEFAULT_CHUNK_SIZE; i++) list.append(i)
      expect(list.chunkCount).toBe(1)
    })
  })

  describe('append', () => {
    let list: ChunkedList<number>

    beforeEach(() => {
      list = new ChunkedList<number>(4)
    })

    it('should append a single element', () => {
      list.append(1)
      expect(list.length).toBe(1)
      expect(list.get(0)).toBe(1)
    })

    it('should append multiple elements to same chunk', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.length).toBe(3)
      expect(list.chunkCount).toBe(1)
    })

    it('should create new chunk when current is full', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      expect(list.chunkCount).toBe(1)
      list.append(5)
      expect(list.chunkCount).toBe(2)
    })

    it('should fill multiple chunks correctly', () => {
      for (let i = 0; i < 12; i++) list.append(i)
      expect(list.length).toBe(12)
      expect(list.chunkCount).toBe(3)
    })

    it('should maintain correct order after multiple appends', () => {
      for (let i = 0; i < 10; i++) list.append(i)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should handle append on empty list', () => {
      expect(list.isEmpty()).toBe(true)
      list.append(42)
      expect(list.isEmpty()).toBe(false)
    })
  })

  describe('prepend', () => {
    let list: ChunkedList<number>

    beforeEach(() => {
      list = new ChunkedList<number>(4)
    })

    it('should prepend to empty list', () => {
      list.prepend(1)
      expect(list.length).toBe(1)
      expect(list.get(0)).toBe(1)
    })

    it('should prepend to non-empty list', () => {
      list.append(2)
      list.prepend(1)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('should prepend multiple elements', () => {
      list.prepend(3)
      list.prepend(2)
      list.prepend(1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should create new chunk when first chunk is full', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      expect(list.chunkCount).toBe(1)
      list.prepend(0)
      expect(list.chunkCount).toBe(2)
    })

    it('should maintain order with mixed prepend and append', () => {
      list.append(3)
      list.prepend(1)
      list.append(4)
      list.prepend(0)
      expect(list.toArray()).toEqual([0, 1, 3, 4])
    })
  })

  describe('get', () => {
    let list: ChunkedList<number>

    beforeEach(() => {
      list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
    })

    it('should get first element', () => {
      expect(list.get(0)).toBe(0)
    })

    it('should get last element', () => {
      expect(list.get(9)).toBe(9)
    })

    it('should get element at chunk boundary', () => {
      expect(list.get(3)).toBe(3)
      expect(list.get(4)).toBe(4)
    })

    it('should get element in middle chunk', () => {
      expect(list.get(5)).toBe(5)
    })

    it('should return undefined for negative index', () => {
      expect(list.get(-1)).toBeUndefined()
    })

    it('should return undefined for index >= length', () => {
      expect(list.get(10)).toBeUndefined()
      expect(list.get(100)).toBeUndefined()
    })

    it('should return undefined for empty list', () => {
      const empty = new ChunkedList<number>()
      expect(empty.get(0)).toBeUndefined()
    })
  })

  describe('set', () => {
    let list: ChunkedList<number>

    beforeEach(() => {
      list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
    })

    it('should set value at valid index', () => {
      list.set(0, 100)
      expect(list.get(0)).toBe(100)
    })

    it('should set value at chunk boundary', () => {
      list.set(3, 300)
      list.set(4, 400)
      expect(list.get(3)).toBe(300)
      expect(list.get(4)).toBe(400)
    })

    it('should set value at last index', () => {
      list.set(9, 900)
      expect(list.get(9)).toBe(900)
    })

    it('should throw RangeError for negative index', () => {
      expect(() => list.set(-1, 0)).toThrow(RangeError)
    })

    it('should throw RangeError for index >= length', () => {
      expect(() => list.set(10, 0)).toThrow(RangeError)
      expect(() => list.set(100, 0)).toThrow(RangeError)
    })

    it('should throw RangeError on empty list', () => {
      const empty = new ChunkedList<number>()
      expect(() => empty.set(0, 1)).toThrow(RangeError)
    })
  })

  describe('insert', () => {
    let list: ChunkedList<number>

    beforeEach(() => {
      list = new ChunkedList<number>(4)
    })

    it('should insert at index 0 (delegates to prepend)', () => {
      list.append(1)
      list.append(2)
      list.insert(0, 0)
      expect(list.toArray()).toEqual([0, 1, 2])
    })

    it('should insert at end (delegates to append)', () => {
      list.append(1)
      list.append(2)
      list.insert(2, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert in middle of chunk with room', () => {
      list.append(1)
      list.append(3)
      list.append(4)
      list.insert(1, 2)
      expect(list.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should insert in middle of full chunk (splits chunk)', () => {
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      list.insert(2, 99)
      expect(list.toArray()).toEqual([1, 2, 99, 3, 4])
    })

    it('should throw RangeError for negative index', () => {
      expect(() => list.insert(-1, 0)).toThrow(RangeError)
    })

    it('should throw RangeError for index > length', () => {
      list.append(1)
      expect(() => list.insert(2, 0)).toThrow(RangeError)
    })

    it('should insert into empty list at index 0', () => {
      list.insert(0, 1)
      expect(list.toArray()).toEqual([1])
    })

    it('should maintain correct length after insert', () => {
      list.append(1)
      list.append(3)
      list.insert(1, 2)
      expect(list.length).toBe(3)
    })
  })

  describe('remove', () => {
    let list: ChunkedList<number>

    beforeEach(() => {
      list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
    })

    it('should remove first element', () => {
      const removed = list.remove(0)
      expect(removed).toBe(0)
      expect(list.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should remove last element', () => {
      const removed = list.remove(9)
      expect(removed).toBe(9)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('should remove middle element', () => {
      const removed = list.remove(5)
      expect(removed).toBe(5)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 6, 7, 8, 9])
    })

    it('should remove element at chunk boundary', () => {
      const removed = list.remove(3)
      expect(removed).toBe(3)
    })

    it('should return undefined for negative index', () => {
      expect(list.remove(-1)).toBeUndefined()
    })

    it('should return undefined for index >= length', () => {
      expect(list.remove(10)).toBeUndefined()
      expect(list.remove(100)).toBeUndefined()
    })

    it('should decrease length after removal', () => {
      expect(list.length).toBe(10)
      list.remove(0)
      expect(list.length).toBe(9)
    })

    it('should remove empty chunk when last element removed', () => {
      const small = new ChunkedList<number>(2)
      small.append(1)
      small.append(2)
      expect(small.chunkCount).toBe(1)
      small.remove(1)
      expect(small.chunkCount).toBe(1)
      small.remove(0)
      expect(small.chunkCount).toBe(0)
    })

    it('should handle removing all elements', () => {
      for (let i = 0; i < 10; i++) list.remove(0)
      expect(list.length).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.chunkCount).toBe(0)
    })
  })

  describe('indexOf', () => {
    let list: ChunkedList<number>

    beforeEach(() => {
      list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
    })

    it('should find existing element', () => {
      expect(list.indexOf(0)).toBe(0)
      expect(list.indexOf(5)).toBe(5)
      expect(list.indexOf(9)).toBe(9)
    })

    it('should find element at chunk boundary', () => {
      expect(list.indexOf(3)).toBe(3)
      expect(list.indexOf(4)).toBe(4)
    })

    it('should return -1 for non-existing element', () => {
      expect(list.indexOf(100)).toBe(-1)
    })

    it('should return -1 in empty list', () => {
      const empty = new ChunkedList<number>()
      expect(empty.indexOf(1)).toBe(-1)
    })

    it('should use default comparison for strings', () => {
      const strList = new ChunkedList<string>(3)
      strList.append('a')
      strList.append('b')
      strList.append('c')
      expect(strList.indexOf('b')).toBe(1)
    })

    it('should find first occurrence of duplicate', () => {
      list.append(5)
      expect(list.indexOf(5)).toBe(5)
    })
  })

  describe('contains', () => {
    it('should return true for existing element', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      expect(list.contains(1)).toBe(true)
      expect(list.contains(2)).toBe(true)
    })

    it('should return false for non-existing element', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      expect(list.contains(99)).toBe(false)
    })

    it('should return false for empty list', () => {
      const list = new ChunkedList<number>()
      expect(list.contains(1)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new ChunkedList<number>()
      expect(list.toArray()).toEqual([])
    })

    it('should return all elements in order', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should return copy of elements', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      const arr = list.toArray()
      arr.push(2)
      expect(list.length).toBe(1)
    })
  })

  describe('length getter', () => {
    it('should return 0 for empty list', () => {
      const list = new ChunkedList<number>()
      expect(list.length).toBe(0)
    })

    it('should return correct length after appends', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      expect(list.length).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new list', () => {
      expect(new ChunkedList<number>().isEmpty()).toBe(true)
    })

    it('should return false after appending', () => {
      const list = new ChunkedList<number>()
      list.append(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      const list = new ChunkedList<number>()
      list.append(1)
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty list', () => {
      const list = new ChunkedList<number>()
      list.clear()
      expect(list.length).toBe(0)
      expect(list.chunkCount).toBe(0)
    })

    it('should clear non-empty list', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
      list.clear()
      expect(list.length).toBe(0)
      expect(list.chunkCount).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.toArray()).toEqual([])
    })

    it('should allow operations after clear', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.clear()
      list.append(2)
      expect(list.toArray()).toEqual([2])
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
      const result: number[] = []
      list.forEach((item) => result.push(item))
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should provide correct indices', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 5; i++) list.append(i)
      const indices: number[] = []
      list.forEach((_item, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1, 2, 3, 4])
    })

    it('should not call callback for empty list', () => {
      const list = new ChunkedList<number>()
      let called = false
      list.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('map', () => {
    it('should transform all elements', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 5; i++) list.append(i)
      const mapped = list.map((x) => x * 2)
      expect(mapped.toArray()).toEqual([0, 2, 4, 6, 8])
    })

    it('should return ChunkedList instance', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      const mapped = list.map((x) => x.toString())
      expect(mapped).toBeInstanceOf(ChunkedList)
    })

    it('should provide correct indices', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 3; i++) list.append(i)
      const indices: number[] = []
      list.map((_item, idx) => { indices.push(idx); return _item })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle empty list', () => {
      const list = new ChunkedList<number>()
      const mapped = list.map((x) => x * 2)
      expect(mapped.length).toBe(0)
    })
  })

  describe('filter', () => {
    it('should filter elements', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
      const filtered = list.filter((x) => x % 2 === 0)
      expect(filtered.toArray()).toEqual([0, 2, 4, 6, 8])
    })

    it('should return ChunkedList instance', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      const filtered = list.filter(() => true)
      expect(filtered).toBeInstanceOf(ChunkedList)
    })

    it('should return empty list when no match', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 5; i++) list.append(i)
      const filtered = list.filter(() => false)
      expect(filtered.length).toBe(0)
    })

    it('should provide correct indices', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 5; i++) list.append(i)
      const indices: number[] = []
      list.filter((_item, idx) => { indices.push(idx); return true })
      expect(indices).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('reduce', () => {
    it('should sum elements', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 5; i++) list.append(i)
      const sum = list.reduce((acc, x) => acc + x, 0)
      expect(sum).toBe(10)
    })

    it('should build a string', () => {
      const list = new ChunkedList<string>(4)
      list.append('a')
      list.append('b')
      list.append('c')
      const result = list.reduce((acc, x) => acc + x, '')
      expect(result).toBe('abc')
    })

    it('should return initial value for empty list', () => {
      const list = new ChunkedList<number>()
      const result = list.reduce((acc, x) => acc + x, 42)
      expect(result).toBe(42)
    })

    it('should provide correct indices', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 3; i++) list.append(i)
      const indices: number[] = []
      list.reduce((_acc, _item, idx) => { indices.push(idx); return _acc }, 0)
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should iterate over all elements', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
      const result: number[] = []
      for (const item of list) result.push(item)
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should work with spread operator', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      expect([...list]).toEqual([1, 2])
    })

    it('should work with empty list', () => {
      const list = new ChunkedList<number>()
      const result = [...list]
      expect(result).toEqual([])
    })

    it('should work with Array.from', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 5; i++) list.append(i)
      expect(Array.from(list)).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('chunkCount', () => {
    it('should return 0 for empty list', () => {
      const list = new ChunkedList<number>(4)
      expect(list.chunkCount).toBe(0)
    })

    it('should return 1 for partial chunk', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      expect(list.chunkCount).toBe(1)
    })

    it('should return 1 for exactly full chunk', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 4; i++) list.append(i)
      expect(list.chunkCount).toBe(1)
    })

    it('should return 2 for overflow', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 5; i++) list.append(i)
      expect(list.chunkCount).toBe(2)
    })
  })

  describe('getChunk', () => {
    it('should return chunk elements by index', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
      expect(list.getChunk(0)).toEqual([0, 1, 2, 3])
      expect(list.getChunk(1)).toEqual([4, 5, 6, 7])
      expect(list.getChunk(2)).toEqual([8, 9])
    })

    it('should return undefined for negative index', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      expect(list.getChunk(-1)).toBeUndefined()
    })

    it('should return undefined for out of range', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      expect(list.getChunk(1)).toBeUndefined()
    })

    it('should return a copy of the chunk', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      const chunk = list.getChunk(0)!
      chunk.push(99)
      expect(list.get(0)).toBe(1)
      expect(list.length).toBe(1)
    })

    it('should return undefined for empty list', () => {
      const list = new ChunkedList<number>(4)
      expect(list.getChunk(0)).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should return stats for empty list', () => {
      const list = new ChunkedList<number>(4)
      const stats = list.getStats()
      expect(stats.totalChunks).toBe(0)
      expect(stats.utilizedChunks).toBe(0)
      expect(stats.utilizationRatio).toBe(0)
    })

    it('should return stats for partial chunk', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      const stats = list.getStats()
      expect(stats.totalChunks).toBe(1)
      expect(stats.utilizedChunks).toBe(1)
      expect(stats.utilizationRatio).toBe(0.5)
    })

    it('should return stats for full chunks', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 8; i++) list.append(i)
      const stats = list.getStats()
      expect(stats.totalChunks).toBe(2)
      expect(stats.utilizedRatio).toBeUndefined()
      expect(stats.utilizationRatio).toBe(1)
    })

    it('should return stats for mixed chunks', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
      const stats = list.getStats()
      expect(stats.totalChunks).toBe(3)
      expect(stats.utilizationRatio).toBeCloseTo(10 / 12)
    })
  })

  describe('edge cases', () => {
    it('should handle single element', () => {
      const list = new ChunkedList<number>(4)
      list.append(42)
      expect(list.length).toBe(1)
      expect(list.get(0)).toBe(42)
      expect(list.chunkCount).toBe(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('should handle chunk size of 1', () => {
      const list = new ChunkedList<number>(1)
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.length).toBe(3)
      expect(list.chunkCount).toBe(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should handle chunk size of 2', () => {
      const list = new ChunkedList<number>(2)
      for (let i = 0; i < 5; i++) list.append(i)
      expect(list.chunkCount).toBe(3)
      expect(list.getChunk(0)).toEqual([0, 1])
      expect(list.getChunk(1)).toEqual([2, 3])
      expect(list.getChunk(2)).toEqual([4])
    })

    it('should handle string type', () => {
      const list = new ChunkedList<string>(3)
      list.append('hello')
      list.append('world')
      expect(list.toArray()).toEqual(['hello', 'world'])
    })

    it('should handle object type', () => {
      const list = new ChunkedList<{ id: number }>(2)
      list.append({ id: 1 })
      list.append({ id: 2 })
      expect(list.length).toBe(2)
      expect(list.get(0)!.id).toBe(1)
    })

    it('should handle null values', () => {
      const list = new ChunkedList<number | null>(4)
      list.append(1)
      list.append(null)
      list.append(3)
      expect(list.get(1)).toBeNull()
      expect(list.length).toBe(3)
    })

    it('should handle undefined values in list', () => {
      const list = new ChunkedList<number | undefined>(4)
      list.append(1)
      list.append(undefined)
      list.append(3)
      expect(list.get(1)).toBeUndefined()
      expect(list.length).toBe(3)
    })
  })

  describe('large data', () => {
    it('should handle 1000 elements with chunk size 10', () => {
      const list = new ChunkedList<number>(10)
      for (let i = 0; i < 1000; i++) list.append(i)
      expect(list.length).toBe(1000)
      expect(list.chunkCount).toBe(100)
      expect(list.get(0)).toBe(0)
      expect(list.get(999)).toBe(999)
      expect(list.get(500)).toBe(500)
    })

    it('should handle 10000 elements with default chunk size', () => {
      const list = new ChunkedList<number>()
      for (let i = 0; i < 10000; i++) list.append(i)
      expect(list.length).toBe(10000)
      expect(list.chunkCount).toBe(Math.ceil(10000 / DEFAULT_CHUNK_SIZE))
    })

    it('should correctly remove from large list', () => {
      const list = new ChunkedList<number>(10)
      for (let i = 0; i < 100; i++) list.append(i)
      list.remove(50)
      expect(list.length).toBe(99)
      expect(list.get(50)).toBe(51)
    })

    it('should correctly indexOf in large list', () => {
      const list = new ChunkedList<number>(10)
      for (let i = 0; i < 100; i++) list.append(i)
      expect(list.indexOf(99)).toBe(99)
      expect(list.indexOf(0)).toBe(0)
      expect(list.indexOf(50)).toBe(50)
    })

    it('should iterate large list correctly', () => {
      const list = new ChunkedList<number>(10)
      for (let i = 0; i < 200; i++) list.append(i)
      let count = 0
      let sum = 0
      for (const item of list) {
        count++
        sum += item
      }
      expect(count).toBe(200)
      expect(sum).toBe(19900)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_CHUNK_SIZE', () => {
      expect(DEFAULT_CHUNK_SIZE).toBe(64)
    })

    it('should export ChunkedListOptions type', () => {
      const opts: ChunkedListOptions = { chunkSize: 32 }
      expect(opts.chunkSize).toBe(32)
    })

    it('should export ChunkedListStats type', () => {
      const stats: ChunkedListStats = {
        totalChunks: 1,
        utilizedChunks: 1,
        utilizationRatio: 0.5,
      }
      expect(stats.totalChunks).toBe(1)
    })
  })

  describe('mixed operations', () => {
    it('should handle append then prepend cycle', () => {
      const list = new ChunkedList<number>(4)
      list.append(2)
      list.prepend(1)
      list.append(3)
      list.prepend(0)
      expect(list.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should handle insert and remove sequence', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(3)
      list.insert(1, 2)
      list.remove(0)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('should handle map then filter', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 8; i++) list.append(i)
      const result = list.map((x) => x * 10).filter((x) => x > 30)
      expect(result.toArray()).toEqual([40, 50, 60, 70])
    })

    it('should handle reduce after filter', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 10; i++) list.append(i)
      const evenSum = list.filter((x) => x % 2 === 0).reduce((acc, x) => acc + x, 0)
      expect(evenSum).toBe(20)
    })

    it('should maintain consistency after many operations', () => {
      const list = new ChunkedList<number>(3)
      list.append(1)
      list.append(2)
      list.append(3)
      list.prepend(0)
      list.insert(2, 99)
      list.remove(0)
      expect(list.toArray()).toEqual([1, 99, 2, 3])
    })

    it('should handle clear and rebuild', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 100; i++) list.append(i)
      list.clear()
      expect(list.length).toBe(0)
      list.append(42)
      expect(list.toArray()).toEqual([42])
      expect(list.chunkCount).toBe(1)
    })
  })

  describe('prepend into full first chunk creates new chunk', () => {
    it('should create a new leading chunk when first is full', () => {
      const list = new ChunkedList<number>(3)
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.chunkCount).toBe(1)
      list.prepend(0)
      expect(list.chunkCount).toBe(2)
      expect(list.toArray()).toEqual([0, 1, 2, 3])
    })
  })

  describe('insert splits chunk correctly', () => {
    it('should split full chunk and distribute elements', () => {
      const list = new ChunkedList<number>(3)
      list.append(1)
      list.append(2)
      list.append(3)
      list.insert(1, 99)
      expect(list.toArray()).toEqual([1, 99, 2, 3])
      expect(list.chunkCount).toBe(2)
    })

    it('should insert at beginning of full chunk', () => {
      const list = new ChunkedList<number>(3)
      list.append(1)
      list.append(2)
      list.append(3)
      list.insert(0, 0)
      expect(list.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should insert at end (last position)', () => {
      const list = new ChunkedList<number>(3)
      list.append(1)
      list.append(2)
      list.insert(2, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('remove across chunk boundaries', () => {
    it('should remove from first chunk of multi-chunk list', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      list.remove(0)
      expect(list.toArray()).toEqual([2, 3, 4])
    })

    it('should remove from second chunk', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      list.remove(2)
      expect(list.toArray()).toEqual([1, 2, 4])
    })

    it('should collapse empty chunk after removal', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      expect(list.chunkCount).toBe(1)
      list.remove(1)
      list.remove(0)
      expect(list.chunkCount).toBe(0)
    })
  })

  describe('get after mixed operations', () => {
    it('should return correct values after prepend and append', () => {
      const list = new ChunkedList<number>(3)
      list.append(2)
      list.append(3)
      list.prepend(1)
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(3)
    })

    it('should return correct values after insert into non-uniform chunks', () => {
      const list = new ChunkedList<number>(3)
      list.append(1)
      list.append(2)
      list.append(3)
      list.prepend(0)
      list.insert(2, 99)
      expect(list.get(0)).toBe(0)
      expect(list.get(1)).toBe(1)
      expect(list.get(2)).toBe(99)
      expect(list.get(3)).toBe(2)
      expect(list.get(4)).toBe(3)
    })
  })

  describe('set after structural changes', () => {
    it('should set value after prepend', () => {
      const list = new ChunkedList<number>(3)
      list.append(1)
      list.append(2)
      list.prepend(0)
      list.set(1, 100)
      expect(list.toArray()).toEqual([0, 100, 2])
    })
  })

  describe('indexOf after prepend', () => {
    it('should find element prepended to new chunk', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      list.prepend(0)
      expect(list.indexOf(0)).toBe(0)
      expect(list.indexOf(1)).toBe(1)
      expect(list.indexOf(2)).toBe(2)
    })
  })

  describe('forEach with non-uniform chunks', () => {
    it('should visit all elements after prepend', () => {
      const list = new ChunkedList<number>(2)
      list.append(2)
      list.append(3)
      list.prepend(1)
      const result: number[] = []
      list.forEach((item) => result.push(item))
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('reduce with different types', () => {
    it('should build array via reduce', () => {
      const list = new ChunkedList<number>(3)
      for (let i = 0; i < 6; i++) list.append(i)
      const arr = list.reduce<number[]>((acc, x) => { acc.push(x); return acc }, [])
      expect(arr).toEqual([0, 1, 2, 3, 4, 5])
    })
  })

  describe('map produces correct chunk size', () => {
    it('should preserve chunk size in mapped result', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 8; i++) list.append(i)
      const mapped = list.map((x) => x * 2)
      expect(mapped.chunkCount).toBe(2)
      expect(mapped.toArray()).toEqual([0, 2, 4, 6, 8, 10, 12, 14])
    })
  })

  describe('filter preserves chunk size', () => {
    it('should use same chunk size for filtered list', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 8; i++) list.append(i)
      const filtered = list.filter((x) => x < 3)
      expect(filtered.toArray()).toEqual([0, 1, 2])
    })
  })

  describe('sequential removal from front', () => {
    it('should remove from front one by one', () => {
      const list = new ChunkedList<number>(3)
      for (let i = 0; i < 6; i++) list.append(i)
      expect(list.remove(0)).toBe(0)
      expect(list.remove(0)).toBe(1)
      expect(list.remove(0)).toBe(2)
      expect(list.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('sequential removal from back', () => {
    it('should remove from back one by one', () => {
      const list = new ChunkedList<number>(3)
      for (let i = 0; i < 6; i++) list.append(i)
      expect(list.remove(5)).toBe(5)
      expect(list.remove(4)).toBe(4)
      expect(list.toArray()).toEqual([0, 1, 2, 3])
    })
  })

  describe('large insert at various positions', () => {
    it('should insert at start, middle, and end', () => {
      const list = new ChunkedList<number>(5)
      for (let i = 0; i < 10; i++) list.append(i)
      list.insert(0, -1)
      list.insert(5, 50)
      list.insert(12, 100)
      expect(list.length).toBe(13)
      expect(list.get(0)).toBe(-1)
      expect(list.get(5)).toBe(50)
      expect(list.get(12)).toBe(100)
    })
  })

  describe('iterator after modifications', () => {
    it('should iterate correctly after prepend and remove', () => {
      const list = new ChunkedList<number>(3)
      list.append(2)
      list.append(3)
      list.prepend(1)
      list.remove(1)
      expect([...list]).toEqual([1, 3])
    })
  })

  describe('contains with object references', () => {
    it('should find same reference', () => {
      const obj = { id: 1 }
      const list = new ChunkedList<{ id: number }>(4)
      list.append(obj)
      expect(list.contains(obj)).toBe(true)
    })

    it('should find equal object via defaultCompare', () => {
      const list = new ChunkedList<number>(4)
      list.append(42)
      expect(list.contains(42)).toBe(true)
    })
  })

  describe('getStats after modifications', () => {
    it('should reflect stats after removal', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 8; i++) list.append(i)
      list.remove(0)
      const stats = list.getStats()
      expect(stats.totalChunks).toBe(2)
      expect(stats.utilizationRatio).toBeCloseTo(7 / 8)
    })

    it('should reflect stats after clear', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 5; i++) list.append(i)
      list.clear()
      const stats = list.getStats()
      expect(stats.totalChunks).toBe(0)
      expect(stats.utilizationRatio).toBe(0)
    })
  })

  describe('chunk boundary operations', () => {
    it('should get elements at exact chunk boundaries', () => {
      const list = new ChunkedList<number>(3)
      for (let i = 0; i < 9; i++) list.append(i)
      expect(list.get(0)).toBe(0)
      expect(list.get(2)).toBe(2)
      expect(list.get(3)).toBe(3)
      expect(list.get(5)).toBe(5)
      expect(list.get(6)).toBe(6)
      expect(list.get(8)).toBe(8)
    })

    it('should set values at chunk boundaries', () => {
      const list = new ChunkedList<number>(3)
      for (let i = 0; i < 6; i++) list.append(i)
      list.set(2, 200)
      list.set(3, 300)
      expect(list.get(2)).toBe(200)
      expect(list.get(3)).toBe(300)
    })
  })

  describe('stress test', () => {
    it('should handle alternating append and prepend', () => {
      const list = new ChunkedList<number>(4)
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) list.append(i)
        else list.prepend(i)
      }
      expect(list.length).toBe(50)
    })

    it('should handle many insertions and removals', () => {
      const list = new ChunkedList<number>(5)
      for (let i = 0; i < 20; i++) list.append(i)
      for (let i = 0; i < 10; i++) list.remove(0)
      expect(list.length).toBe(10)
      expect(list.toArray()).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
    })
  })

  describe('boolean type', () => {
    it('should work with boolean values', () => {
      const list = new ChunkedList<boolean>(2)
      list.append(true)
      list.append(false)
      list.append(true)
      expect(list.toArray()).toEqual([true, false, true])
    })
  })

  describe('defaultCompare edge cases', () => {
    it('should handle string comparison correctly', () => {
      const list = new ChunkedList<string>(3)
      list.append('apple')
      list.append('banana')
      list.append('cherry')
      expect(list.indexOf('banana')).toBe(1)
      expect(list.indexOf('grape')).toBe(-1)
    })

    it('should find duplicate values at first occurrence', () => {
      const list = new ChunkedList<number>(3)
      list.append(5)
      list.append(5)
      list.append(5)
      expect(list.indexOf(5)).toBe(0)
    })
  })
})
