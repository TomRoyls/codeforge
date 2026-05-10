import { describe, it, expect, beforeEach } from 'vitest'
import { BlockList } from '../../src/core/block-list/block-list.js'
import { DEFAULT_BLOCK_SIZE } from '../../src/core/block-list/types.js'
import type { BlockListOptions } from '../../src/core/block-list/types.js'

describe('BlockList', () => {
  describe('constructor', () => {
    it('should create empty list with default block size', () => {
      const list = new BlockList<number>()
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.blockCount).toBe(0)
    })

    it('should create list with custom block size via number', () => {
      const list = new BlockList<number>(4)
      expect(list.size).toBe(0)
    })

    it('should create list with options object', () => {
      const list = new BlockList<number>({ blockSize: 8 })
      expect(list.size).toBe(0)
    })

    it('should clamp block size to 2 when given 0', () => {
      const list = new BlockList<number>(0)
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.toArray()).toEqual([1, 2, 3])
      expect(list.blockCount).toBe(2)
    })

    it('should clamp block size to 2 when given 1', () => {
      const list = new BlockList<number>(1)
      list.push(1)
      list.push(2)
      expect(list.toArray()).toEqual([1, 2])
      expect(list.blockCount).toBe(1)
    })

    it('should clamp block size to 2 when given negative', () => {
      const list = new BlockList<number>(-5)
      list.push(1)
      list.push(2)
      expect(list.blockCount).toBe(1)
    })

    it('should use DEFAULT_BLOCK_SIZE constant', () => {
      expect(DEFAULT_BLOCK_SIZE).toBe(32)
    })

    it('should use default block size when no args', () => {
      const list = new BlockList<number>()
      for (let i = 0; i < DEFAULT_BLOCK_SIZE; i++) list.push(i)
      expect(list.blockCount).toBe(1)
      list.push(DEFAULT_BLOCK_SIZE)
      expect(list.blockCount).toBe(2)
    })

    it('should work with no generic type parameter', () => {
      const list = new BlockList()
      list.push('hello')
      expect(list.size).toBe(1)
    })

    it('should use default block size with empty options object', () => {
      const list = new BlockList<number>({})
      expect(list.size).toBe(0)
      for (let i = 0; i < DEFAULT_BLOCK_SIZE; i++) list.push(i)
      expect(list.blockCount).toBe(1)
    })

    it('should export BlockListOptions type', () => {
      const opts: BlockListOptions = { blockSize: 32 }
      expect(opts.blockSize).toBe(32)
    })
  })

  describe('push', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
    })

    it('should push a single element', () => {
      list.push(1)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(1)
    })

    it('should push multiple elements to same block', () => {
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.size).toBe(3)
      expect(list.blockCount).toBe(1)
    })

    it('should create new block when current is full', () => {
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      expect(list.blockCount).toBe(1)
      list.push(5)
      expect(list.blockCount).toBe(2)
    })

    it('should fill multiple blocks correctly', () => {
      for (let i = 0; i < 12; i++) list.push(i)
      expect(list.size).toBe(12)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      expect(list.blockCount).toBeGreaterThan(1)
    })

    it('should maintain correct order after multiple pushes', () => {
      for (let i = 0; i < 10; i++) list.push(i)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should handle push on empty list', () => {
      expect(list.isEmpty()).toBe(true)
      list.push(42)
      expect(list.isEmpty()).toBe(false)
    })

    it('should split block when exceeding blockSize', () => {
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.push(5)
      expect(list.size).toBe(5)
      expect(list.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('pop', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
    })

    it('should pop the last element', () => {
      expect(list.pop()).toBe(9)
      expect(list.size).toBe(9)
    })

    it('should pop all elements', () => {
      for (let i = 9; i >= 0; i--) {
        expect(list.pop()).toBe(i)
      }
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should return undefined for empty list', () => {
      const empty = new BlockList<number>()
      expect(empty.pop()).toBeUndefined()
    })

    it('should remove empty block after popping last element', () => {
      const small = new BlockList<number>(4)
      small.push(1)
      small.push(2)
      small.push(3)
      small.push(4)
      small.push(5)
      expect(small.blockCount).toBe(2)
      small.pop()
      small.pop()
      small.pop()
      small.pop()
      small.pop()
      expect(small.blockCount).toBe(0)
    })

    it('should maintain order after pops', () => {
      list.pop()
      list.pop()
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })
  })

  describe('unshift', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
    })

    it('should unshift to empty list', () => {
      list.unshift(1)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(1)
    })

    it('should unshift to non-empty list', () => {
      list.push(2)
      list.unshift(1)
      expect(list.toArray()).toEqual([1, 2])
    })

    it('should unshift multiple elements', () => {
      list.unshift(3)
      list.unshift(2)
      list.unshift(1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should split first block when exceeding blockSize', () => {
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.unshift(0)
      expect(list.size).toBe(5)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should maintain order with mixed unshift and push', () => {
      list.push(3)
      list.unshift(1)
      list.push(4)
      list.unshift(0)
      expect(list.toArray()).toEqual([0, 1, 3, 4])
    })
  })

  describe('shift', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
    })

    it('should shift the first element', () => {
      expect(list.shift()).toBe(0)
      expect(list.size).toBe(9)
    })

    it('should shift all elements', () => {
      for (let i = 0; i < 10; i++) {
        expect(list.shift()).toBe(i)
      }
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should return undefined for empty list', () => {
      const empty = new BlockList<number>()
      expect(empty.shift()).toBeUndefined()
    })

    it('should remove empty block after shifting last element of block', () => {
      const small = new BlockList<number>(4)
      small.push(1)
      small.push(2)
      small.push(3)
      small.push(4)
      small.push(5)
      small.shift()
      small.shift()
      small.shift()
      small.shift()
      expect(small.size).toBe(1)
    })

    it('should merge adjacent small blocks after shift', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      bl.push(3)
      bl.push(4)
      bl.push(5)
      bl.shift()
      bl.shift()
      bl.shift()
      expect(bl.size).toBe(2)
      expect(bl.toArray()).toEqual([4, 5])
    })
  })

  describe('get', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
    })

    it('should get first element', () => {
      expect(list.get(0)).toBe(0)
    })

    it('should get last element', () => {
      expect(list.get(9)).toBe(9)
    })

    it('should get element at block boundary', () => {
      expect(list.get(3)).toBe(3)
      expect(list.get(4)).toBe(4)
    })

    it('should get element in middle block', () => {
      expect(list.get(5)).toBe(5)
    })

    it('should return undefined for negative index', () => {
      expect(list.get(-1)).toBeUndefined()
    })

    it('should return undefined for index >= size', () => {
      expect(list.get(10)).toBeUndefined()
      expect(list.get(100)).toBeUndefined()
    })

    it('should return undefined for empty list', () => {
      const empty = new BlockList<number>()
      expect(empty.get(0)).toBeUndefined()
    })
  })

  describe('set', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
    })

    it('should set value at valid index', () => {
      list.set(0, 100)
      expect(list.get(0)).toBe(100)
    })

    it('should set value at block boundary', () => {
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

    it('should throw RangeError for index >= size', () => {
      expect(() => list.set(10, 0)).toThrow(RangeError)
      expect(() => list.set(100, 0)).toThrow(RangeError)
    })

    it('should throw RangeError on empty list', () => {
      const empty = new BlockList<number>()
      expect(() => empty.set(0, 1)).toThrow(RangeError)
    })
  })

  describe('insert', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
    })

    it('should insert at index 0 (delegates to unshift)', () => {
      list.push(1)
      list.push(2)
      list.insert(0, 0)
      expect(list.toArray()).toEqual([0, 1, 2])
    })

    it('should insert at end (delegates to push)', () => {
      list.push(1)
      list.push(2)
      list.insert(2, 3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should insert in middle of block with room', () => {
      list.push(1)
      list.push(3)
      list.push(4)
      list.insert(1, 2)
      expect(list.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should insert in middle of full block (splits block)', () => {
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.insert(2, 99)
      expect(list.toArray()).toEqual([1, 2, 99, 3, 4])
    })

    it('should throw RangeError for negative index', () => {
      expect(() => list.insert(-1, 0)).toThrow(RangeError)
    })

    it('should throw RangeError for index > size', () => {
      list.push(1)
      expect(() => list.insert(2, 0)).toThrow(RangeError)
    })

    it('should insert into empty list at index 0', () => {
      list.insert(0, 1)
      expect(list.toArray()).toEqual([1])
    })

    it('should maintain correct size after insert', () => {
      list.push(1)
      list.push(3)
      list.insert(1, 2)
      expect(list.size).toBe(3)
    })

    it('should split block when insert causes overflow', () => {
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.insert(1, 99)
      expect(list.toArray()).toEqual([1, 99, 2, 3, 4])
      expect(list.size).toBe(5)
    })
  })

  describe('remove', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
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

    it('should remove element at block boundary', () => {
      const removed = list.remove(3)
      expect(removed).toBe(3)
    })

    it('should return undefined for negative index', () => {
      expect(list.remove(-1)).toBeUndefined()
    })

    it('should return undefined for index >= size', () => {
      expect(list.remove(10)).toBeUndefined()
      expect(list.remove(100)).toBeUndefined()
    })

    it('should decrease size after removal', () => {
      expect(list.size).toBe(10)
      list.remove(0)
      expect(list.size).toBe(9)
    })

    it('should remove empty block when last element removed', () => {
      const small = new BlockList<number>(4)
      small.push(1)
      small.push(2)
      small.push(3)
      small.push(4)
      small.push(5)
      small.remove(4)
      small.remove(3)
      small.remove(2)
      small.remove(1)
      small.remove(0)
      expect(small.blockCount).toBe(0)
    })

    it('should handle removing all elements', () => {
      for (let i = 0; i < 10; i++) list.remove(0)
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.blockCount).toBe(0)
    })

    it('should merge adjacent small blocks after removal', () => {
      const bl = new BlockList<number>(4)
      bl.push(1)
      bl.push(2)
      bl.push(3)
      bl.push(4)
      bl.push(5)
      bl.push(6)
      bl.remove(1)
      bl.remove(1)
      expect(bl.size).toBe(4)
      expect(bl.toArray()).toEqual([1, 4, 5, 6])
    })
  })

  describe('size', () => {
    it('should return 0 for empty list', () => {
      const list = new BlockList<number>()
      expect(list.size).toBe(0)
    })

    it('should return correct size after pushes', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      expect(list.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new list', () => {
      expect(new BlockList<number>().isEmpty()).toBe(true)
    })

    it('should return false after pushing', () => {
      const list = new BlockList<number>()
      list.push(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      const list = new BlockList<number>()
      list.push(1)
      list.clear()
      expect(list.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear empty list', () => {
      const list = new BlockList<number>()
      list.clear()
      expect(list.size).toBe(0)
      expect(list.blockCount).toBe(0)
    })

    it('should clear non-empty list', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
      list.clear()
      expect(list.size).toBe(0)
      expect(list.blockCount).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.toArray()).toEqual([])
    })

    it('should allow operations after clear', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.clear()
      list.push(2)
      expect(list.toArray()).toEqual([2])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new BlockList<number>()
      expect(list.toArray()).toEqual([])
    })

    it('should return all elements in order', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should return copy of elements', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      const arr = list.toArray()
      arr.push(2)
      expect(list.size).toBe(1)
    })
  })

  describe('indexOf', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
    })

    it('should find existing element', () => {
      expect(list.indexOf(0)).toBe(0)
      expect(list.indexOf(5)).toBe(5)
      expect(list.indexOf(9)).toBe(9)
    })

    it('should find element at block boundary', () => {
      expect(list.indexOf(3)).toBe(3)
      expect(list.indexOf(4)).toBe(4)
    })

    it('should return -1 for non-existing element', () => {
      expect(list.indexOf(100)).toBe(-1)
    })

    it('should return -1 in empty list', () => {
      const empty = new BlockList<number>()
      expect(empty.indexOf(1)).toBe(-1)
    })

    it('should find first occurrence of duplicate', () => {
      list.push(5)
      expect(list.indexOf(5)).toBe(5)
    })

    it('should use strict equality for objects', () => {
      const obj = { id: 1 }
      const objList = new BlockList<{ id: number }>(4)
      objList.push(obj)
      expect(objList.indexOf(obj)).toBe(0)
      expect(objList.indexOf({ id: 1 })).toBe(-1)
    })
  })

  describe('includes', () => {
    it('should return true for existing element', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      expect(list.includes(1)).toBe(true)
      expect(list.includes(2)).toBe(true)
    })

    it('should return false for non-existing element', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      expect(list.includes(99)).toBe(false)
    })

    it('should return false for empty list', () => {
      const list = new BlockList<number>()
      expect(list.includes(1)).toBe(false)
    })

    it('should use strict equality', () => {
      const obj = { id: 1 }
      const list = new BlockList<{ id: number }>(4)
      list.push(obj)
      expect(list.includes(obj)).toBe(true)
      expect(list.includes({ id: 1 })).toBe(false)
    })
  })

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
      const result: number[] = []
      list.forEach((item) => result.push(item))
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should provide correct indices', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) list.push(i)
      const indices: number[] = []
      list.forEach((_item, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1, 2, 3, 4])
    })

    it('should not call callback for empty list', () => {
      const list = new BlockList<number>()
      let called = false
      list.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('map', () => {
    it('should transform all elements', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) list.push(i)
      const mapped = list.map((x) => x * 2)
      expect(mapped.toArray()).toEqual([0, 2, 4, 6, 8])
    })

    it('should return BlockList instance', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      const mapped = list.map((x) => x.toString())
      expect(mapped).toBeInstanceOf(BlockList)
    })

    it('should provide correct indices', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 3; i++) list.push(i)
      const indices: number[] = []
      list.map((_item, idx) => { indices.push(idx); return _item })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should handle empty list', () => {
      const list = new BlockList<number>()
      const mapped = list.map((x) => x * 2)
      expect(mapped.size).toBe(0)
    })

    it('should change type', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      const mapped = list.map((x) => `item-${x}`)
      expect(mapped.toArray()).toEqual(['item-1', 'item-2'])
    })
  })

  describe('filter', () => {
    it('should filter elements', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
      const filtered = list.filter((x) => x % 2 === 0)
      expect(filtered.toArray()).toEqual([0, 2, 4, 6, 8])
    })

    it('should return BlockList instance', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      const filtered = list.filter(() => true)
      expect(filtered).toBeInstanceOf(BlockList)
    })

    it('should return empty list when no match', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) list.push(i)
      const filtered = list.filter(() => false)
      expect(filtered.size).toBe(0)
    })

    it('should provide correct indices', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) list.push(i)
      const indices: number[] = []
      list.filter((_item, idx) => { indices.push(idx); return true })
      expect(indices).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('slice', () => {
    let list: BlockList<number>

    beforeEach(() => {
      list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
    })

    it('should slice entire list with no args', () => {
      const sliced = list.slice(0)
      expect(sliced.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should slice from start to end', () => {
      const sliced = list.slice(2, 7)
      expect(sliced.toArray()).toEqual([2, 3, 4, 5, 6])
    })

    it('should slice from start to end of list', () => {
      const sliced = list.slice(5)
      expect(sliced.toArray()).toEqual([5, 6, 7, 8, 9])
    })

    it('should handle negative start', () => {
      const sliced = list.slice(-3)
      expect(sliced.toArray()).toEqual([7, 8, 9])
    })

    it('should handle negative end', () => {
      const sliced = list.slice(0, -2)
      expect(sliced.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('should handle both negative', () => {
      const sliced = list.slice(-5, -2)
      expect(sliced.toArray()).toEqual([5, 6, 7])
    })

    it('should return empty for out of range', () => {
      const sliced = list.slice(20, 30)
      expect(sliced.toArray()).toEqual([])
    })

    it('should clamp start to 0 when negative exceeds size', () => {
      const sliced = list.slice(-100)
      expect(sliced.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should return BlockList instance', () => {
      const sliced = list.slice(0, 5)
      expect(sliced).toBeInstanceOf(BlockList)
    })

    it('should not modify original list', () => {
      list.slice(0, 5)
      expect(list.size).toBe(10)
    })

    it('should handle empty list', () => {
      const empty = new BlockList<number>()
      expect(empty.slice(0).toArray()).toEqual([])
    })
  })

  describe('concat', () => {
    it('should concat two non-empty lists', () => {
      const a = new BlockList<number>(4)
      a.push(1)
      a.push(2)
      const b = new BlockList<number>(4)
      b.push(3)
      b.push(4)
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should concat with empty left list', () => {
      const a = new BlockList<number>(4)
      const b = new BlockList<number>(4)
      b.push(1)
      b.push(2)
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('should concat with empty right list', () => {
      const a = new BlockList<number>(4)
      a.push(1)
      a.push(2)
      const b = new BlockList<number>(4)
      const result = a.concat(b)
      expect(result.toArray()).toEqual([1, 2])
    })

    it('should concat two empty lists', () => {
      const a = new BlockList<number>(4)
      const b = new BlockList<number>(4)
      const result = a.concat(b)
      expect(result.toArray()).toEqual([])
    })

    it('should return BlockList instance', () => {
      const a = new BlockList<number>(4)
      a.push(1)
      const b = new BlockList<number>(4)
      b.push(2)
      expect(a.concat(b)).toBeInstanceOf(BlockList)
    })

    it('should not modify original lists', () => {
      const a = new BlockList<number>(4)
      a.push(1)
      const b = new BlockList<number>(4)
      b.push(2)
      a.concat(b)
      expect(a.toArray()).toEqual([1])
      expect(b.toArray()).toEqual([2])
    })
  })

  describe('reverse', () => {
    it('should reverse a list', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) list.push(i)
      const reversed = list.reverse()
      expect(reversed.toArray()).toEqual([4, 3, 2, 1, 0])
    })

    it('should return BlockList instance', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      expect(list.reverse()).toBeInstanceOf(BlockList)
    })

    it('should handle empty list', () => {
      const list = new BlockList<number>()
      const reversed = list.reverse()
      expect(reversed.toArray()).toEqual([])
    })

    it('should handle single element', () => {
      const list = new BlockList<number>(4)
      list.push(42)
      expect(list.reverse().toArray()).toEqual([42])
    })

    it('should not modify original list', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) list.push(i)
      list.reverse()
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle two elements', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      expect(list.reverse().toArray()).toEqual([2, 1])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should iterate over all elements', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 10; i++) list.push(i)
      const result: number[] = []
      for (const item of list) result.push(item)
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should work with spread operator', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      expect([...list]).toEqual([1, 2])
    })

    it('should work with empty list', () => {
      const list = new BlockList<number>()
      const result = [...list]
      expect(result).toEqual([])
    })

    it('should work with Array.from', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) list.push(i)
      expect(Array.from(list)).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('blockCount', () => {
    it('should return 0 for empty list', () => {
      const list = new BlockList<number>(4)
      expect(list.blockCount).toBe(0)
    })

    it('should return 1 for partial block', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      expect(list.blockCount).toBe(1)
    })

    it('should return 1 for exactly full block', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 4; i++) list.push(i)
      expect(list.blockCount).toBe(1)
    })

    it('should return 2 for overflow', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 5; i++) list.push(i)
      expect(list.blockCount).toBe(2)
    })
  })

  describe('block split behavior', () => {
    it('should split block at midpoint when exceeding blockSize via push', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.push(5)
      expect(list.blockCount).toBe(2)
      expect(list.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('should split block at midpoint when exceeding blockSize via unshift', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.unshift(0)
      expect(list.blockCount).toBe(2)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should split block on insert overflow', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.insert(2, 99)
      expect(list.toArray()).toEqual([1, 2, 99, 3, 4])
    })
  })

  describe('block merge behavior', () => {
    it('should merge adjacent small blocks after remove', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      list.push(3)
      list.push(4)
      list.push(5)
      list.push(6)
      list.remove(1)
      list.remove(1)
      expect(list.size).toBe(4)
    })

    it('should not merge blocks if only one is small', () => {
      const list = new BlockList<number>(8)
      for (let i = 0; i < 8; i++) list.push(i)
      list.push(9)
      expect(list.blockCount).toBe(2)
      list.remove(8)
      expect(list.blockCount).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle single element', () => {
      const list = new BlockList<number>(4)
      list.push(42)
      expect(list.size).toBe(1)
      expect(list.get(0)).toBe(42)
      expect(list.blockCount).toBe(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('should handle block size of 2 (minimum)', () => {
      const list = new BlockList<number>(2)
      list.push(1)
      list.push(2)
      list.push(3)
      expect(list.size).toBe(3)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('should handle string type', () => {
      const list = new BlockList<string>(3)
      list.push('hello')
      list.push('world')
      expect(list.toArray()).toEqual(['hello', 'world'])
    })

    it('should handle object type', () => {
      const list = new BlockList<{ id: number }>(2)
      list.push({ id: 1 })
      list.push({ id: 2 })
      expect(list.size).toBe(2)
      expect(list.get(0)!.id).toBe(1)
    })

    it('should handle null values', () => {
      const list = new BlockList<number | null>(4)
      list.push(1)
      list.push(null)
      list.push(3)
      expect(list.get(1)).toBeNull()
      expect(list.size).toBe(3)
    })

    it('should handle undefined values', () => {
      const list = new BlockList<number | undefined>(4)
      list.push(1)
      list.push(undefined)
      list.push(3)
      expect(list.get(1)).toBeUndefined()
      expect(list.size).toBe(3)
    })

    it('should handle boolean type', () => {
      const list = new BlockList<boolean>(2)
      list.push(true)
      list.push(false)
      list.push(true)
      expect(list.toArray()).toEqual([true, false, true])
    })

    it('should handle indexOf with duplicates', () => {
      const list = new BlockList<number>(3)
      list.push(5)
      list.push(5)
      list.push(5)
      expect(list.indexOf(5)).toBe(0)
    })
  })

  describe('mixed operations', () => {
    it('should handle push then unshift cycle', () => {
      const list = new BlockList<number>(4)
      list.push(2)
      list.unshift(1)
      list.push(3)
      list.unshift(0)
      expect(list.toArray()).toEqual([0, 1, 2, 3])
    })

    it('should handle insert and remove sequence', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(3)
      list.insert(1, 2)
      list.remove(0)
      expect(list.toArray()).toEqual([2, 3])
    })

    it('should handle map then filter', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 8; i++) list.push(i)
      const result = list.map((x) => x * 10).filter((x) => x > 30)
      expect(result.toArray()).toEqual([40, 50, 60, 70])
    })

    it('should handle reverse then slice', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 8; i++) list.push(i)
      const result = list.reverse().slice(0, 4)
      expect(result.toArray()).toEqual([7, 6, 5, 4])
    })

    it('should handle concat then reverse', () => {
      const a = new BlockList<number>(4)
      a.push(1)
      a.push(2)
      const b = new BlockList<number>(4)
      b.push(3)
      b.push(4)
      const result = a.concat(b).reverse()
      expect(result.toArray()).toEqual([4, 3, 2, 1])
    })

    it('should maintain consistency after many operations', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      list.push(3)
      list.unshift(0)
      list.insert(2, 99)
      list.remove(0)
      expect(list.toArray()).toEqual([1, 99, 2, 3])
    })

    it('should handle clear and rebuild', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 100; i++) list.push(i)
      list.clear()
      expect(list.size).toBe(0)
      list.push(42)
      expect(list.toArray()).toEqual([42])
      expect(list.blockCount).toBe(1)
    })
  })

  describe('get after mixed operations', () => {
    it('should return correct values after unshift and push', () => {
      const list = new BlockList<number>(4)
      list.push(2)
      list.push(3)
      list.unshift(1)
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(3)
    })

    it('should return correct values after insert into non-uniform blocks', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      list.push(3)
      list.unshift(0)
      list.insert(2, 99)
      expect(list.get(0)).toBe(0)
      expect(list.get(1)).toBe(1)
      expect(list.get(2)).toBe(99)
      expect(list.get(3)).toBe(2)
      expect(list.get(4)).toBe(3)
    })
  })

  describe('set after structural changes', () => {
    it('should set value after unshift', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      list.unshift(0)
      list.set(1, 100)
      expect(list.toArray()).toEqual([0, 100, 2])
    })
  })

  describe('indexOf after unshift', () => {
    it('should find element unshifted to new block', () => {
      const list = new BlockList<number>(4)
      list.push(1)
      list.push(2)
      list.unshift(0)
      expect(list.indexOf(0)).toBe(0)
      expect(list.indexOf(1)).toBe(1)
      expect(list.indexOf(2)).toBe(2)
    })
  })

  describe('forEach with non-uniform blocks', () => {
    it('should visit all elements after unshift', () => {
      const list = new BlockList<number>(4)
      list.push(2)
      list.push(3)
      list.unshift(1)
      const result: number[] = []
      list.forEach((item) => result.push(item))
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('sequential removal from front', () => {
    it('should remove from front one by one', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 8; i++) list.push(i)
      expect(list.remove(0)).toBe(0)
      expect(list.remove(0)).toBe(1)
      expect(list.remove(0)).toBe(2)
      expect(list.toArray()).toEqual([3, 4, 5, 6, 7])
    })
  })

  describe('sequential removal from back', () => {
    it('should remove from back one by one', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 8; i++) list.push(i)
      expect(list.remove(7)).toBe(7)
      expect(list.remove(6)).toBe(6)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5])
    })
  })

  describe('large insert at various positions', () => {
    it('should insert at start, middle, and end', () => {
      const list = new BlockList<number>(5)
      for (let i = 0; i < 10; i++) list.push(i)
      list.insert(0, -1)
      list.insert(5, 50)
      list.insert(12, 100)
      expect(list.size).toBe(13)
      expect(list.get(0)).toBe(-1)
      expect(list.get(5)).toBe(50)
      expect(list.get(12)).toBe(100)
    })
  })

  describe('iterator after modifications', () => {
    it('should iterate correctly after unshift and remove', () => {
      const list = new BlockList<number>(4)
      list.push(2)
      list.push(3)
      list.unshift(1)
      list.remove(1)
      expect([...list]).toEqual([1, 3])
    })
  })

  describe('stress test', () => {
    it('should handle 1000 elements with block size 10', () => {
      const list = new BlockList<number>(10)
      for (let i = 0; i < 1000; i++) list.push(i)
      expect(list.size).toBe(1000)
      expect(list.get(0)).toBe(0)
      expect(list.get(999)).toBe(999)
      expect(list.get(500)).toBe(500)
    })

    it('should handle 10000 elements with default block size', () => {
      const list = new BlockList<number>()
      for (let i = 0; i < 10000; i++) list.push(i)
      expect(list.size).toBe(10000)
    })

    it('should correctly remove from large list', () => {
      const list = new BlockList<number>(10)
      for (let i = 0; i < 100; i++) list.push(i)
      list.remove(50)
      expect(list.size).toBe(99)
      expect(list.get(50)).toBe(51)
    })

    it('should correctly indexOf in large list', () => {
      const list = new BlockList<number>(10)
      for (let i = 0; i < 100; i++) list.push(i)
      expect(list.indexOf(99)).toBe(99)
      expect(list.indexOf(0)).toBe(0)
      expect(list.indexOf(50)).toBe(50)
    })

    it('should iterate large list correctly', () => {
      const list = new BlockList<number>(10)
      for (let i = 0; i < 200; i++) list.push(i)
      let count = 0
      let sum = 0
      for (const item of list) {
        count++
        sum += item
      }
      expect(count).toBe(200)
      expect(sum).toBe(19900)
    })

    it('should handle alternating push and unshift', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) list.push(i)
        else list.unshift(i)
      }
      expect(list.size).toBe(50)
    })

    it('should handle many insertions and removals', () => {
      const list = new BlockList<number>(5)
      for (let i = 0; i < 20; i++) list.push(i)
      for (let i = 0; i < 10; i++) list.remove(0)
      expect(list.size).toBe(10)
      expect(list.toArray()).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
    })

    it('should handle push-pop cycles', () => {
      const list = new BlockList<number>(4)
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 20; i++) list.push(i)
        for (let i = 0; i < 20; i++) list.pop()
      }
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should handle unshift-shift cycles', () => {
      const list = new BlockList<number>(4)
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 20; i++) list.unshift(i)
        for (let i = 0; i < 20; i++) list.shift()
      }
      expect(list.size).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('should handle slice of large list', () => {
      const list = new BlockList<number>(8)
      for (let i = 0; i < 100; i++) list.push(i)
      const sliced = list.slice(20, 40)
      expect(sliced.size).toBe(20)
      expect(sliced.get(0)).toBe(20)
      expect(sliced.get(19)).toBe(39)
    })

    it('should handle concat of large lists', () => {
      const a = new BlockList<number>(8)
      const b = new BlockList<number>(8)
      for (let i = 0; i < 100; i++) a.push(i)
      for (let i = 100; i < 200; i++) b.push(i)
      const result = a.concat(b)
      expect(result.size).toBe(200)
      expect(result.get(0)).toBe(0)
      expect(result.get(199)).toBe(199)
    })

    it('should handle reverse of large list', () => {
      const list = new BlockList<number>(8)
      for (let i = 0; i < 100; i++) list.push(i)
      const reversed = list.reverse()
      expect(reversed.get(0)).toBe(99)
      expect(reversed.get(99)).toBe(0)
      expect(reversed.size).toBe(100)
    })

    it('should handle filter on large list', () => {
      const list = new BlockList<number>(8)
      for (let i = 0; i < 100; i++) list.push(i)
      const evens = list.filter((x) => x % 2 === 0)
      expect(evens.size).toBe(50)
      expect(evens.get(0)).toBe(0)
      expect(evens.get(49)).toBe(98)
    })

    it('should handle map on large list', () => {
      const list = new BlockList<number>(8)
      for (let i = 0; i < 100; i++) list.push(i)
      const doubled = list.map((x) => x * 2)
      expect(doubled.size).toBe(100)
      expect(doubled.get(0)).toBe(0)
      expect(doubled.get(99)).toBe(198)
    })
  })

  describe('block boundary operations', () => {
    it('should get elements at exact block boundaries', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 12; i++) list.push(i)
      expect(list.get(0)).toBe(0)
      expect(list.get(3)).toBe(3)
      expect(list.get(4)).toBe(4)
      expect(list.get(7)).toBe(7)
      expect(list.get(8)).toBe(8)
      expect(list.get(11)).toBe(11)
    })

    it('should set values at block boundaries', () => {
      const list = new BlockList<number>(4)
      for (let i = 0; i < 8; i++) list.push(i)
      list.set(3, 300)
      list.set(4, 400)
      expect(list.get(3)).toBe(300)
      expect(list.get(4)).toBe(400)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_BLOCK_SIZE', () => {
      expect(DEFAULT_BLOCK_SIZE).toBe(32)
    })
  })
})
