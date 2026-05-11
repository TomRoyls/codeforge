import { describe, it, expect, beforeEach } from 'vitest'
import { WaveletStack } from '../../src/core/wavelet-stack/index.js'

describe('WaveletStack', () => {
  describe('constructor', () => {
    it('should create stack with default options', () => {
      const s = new WaveletStack<number>()
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.capacity).toBe(1024)
    })

    it('should create stack with custom alphabetSize', () => {
      const s = new WaveletStack<number>({ alphabetSize: 256 })
      expect(s.capacity).toBe(256)
    })

    it('should create stack with no options', () => {
      const s = new WaveletStack<string>()
      expect(s.capacity).toBe(1024)
      expect(s.size()).toBe(0)
    })

    it('should create stack with empty options', () => {
      const s = new WaveletStack<number>({})
      expect(s.capacity).toBe(1024)
    })

    it('should handle alphabetSize of 0', () => {
      const s = new WaveletStack<number>({ alphabetSize: 0 })
      expect(s.capacity).toBe(0)
    })
  })

  describe('push', () => {
    let s: WaveletStack<number>

    beforeEach(() => {
      s = new WaveletStack<number>()
    })

    it('should push a single item', () => {
      s.push(1)
      expect(s.size()).toBe(1)
    })

    it('should push multiple items', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.size()).toBe(3)
    })

    it('should push duplicate items', () => {
      s.push(1)
      s.push(1)
      s.push(1)
      expect(s.size()).toBe(3)
    })

    it('should update peek after push', () => {
      s.push(1)
      expect(s.peek()).toBe(1)
      s.push(2)
      expect(s.peek()).toBe(2)
    })

    it('should update toArray after push', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should update isEmpty after push', () => {
      expect(s.isEmpty()).toBe(true)
      s.push(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('should update count after push', () => {
      s.push(1)
      expect(s.count(1)).toBe(1)
      s.push(1)
      expect(s.count(1)).toBe(2)
    })

    it('should grow capacity when exceeding initial size', () => {
      const tiny = new WaveletStack<number>({ alphabetSize: 2 })
      tiny.push(1)
      tiny.push(2)
      expect(tiny.capacity).toBe(2)
      tiny.push(3)
      expect(tiny.capacity).toBe(6)
    })

    it('should handle pushing undefined values', () => {
      const su = new WaveletStack<number | undefined>()
      su.push(undefined)
      expect(su.size()).toBe(1)
      expect(su.peek()).toBeUndefined()
    })

    it('should handle pushing null values', () => {
      const sn = new WaveletStack<number | null>()
      sn.push(null)
      expect(sn.size()).toBe(1)
      expect(sn.peek()).toBeNull()
    })
  })

  describe('pop', () => {
    let s: WaveletStack<number>

    beforeEach(() => {
      s = new WaveletStack<number>()
    })

    it('should pop the top element', () => {
      s.push(1)
      s.push(2)
      expect(s.pop()).toBe(2)
    })

    it('should pop in LIFO order', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.pop()).toBe(3)
      expect(s.pop()).toBe(2)
      expect(s.pop()).toBe(1)
    })

    it('should decrease size on pop', () => {
      s.push(1)
      s.push(2)
      s.pop()
      expect(s.size()).toBe(1)
    })

    it('should throw on empty stack pop', () => {
      expect(() => s.pop()).toThrow('Cannot pop from empty stack')
    })

    it('should throw on pop after clear', () => {
      s.push(1)
      s.clear()
      expect(() => s.pop()).toThrow('Cannot pop from empty stack')
    })

    it('should update count after pop', () => {
      s.push(1)
      s.push(1)
      s.push(1)
      s.pop()
      expect(s.count(1)).toBe(2)
    })

    it('should remove count entry when count reaches 0', () => {
      s.push(1)
      s.pop()
      expect(s.count(1)).toBe(0)
    })

    it('should allow push after popping all', () => {
      s.push(1)
      s.pop()
      s.push(2)
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(2)
    })

    it('should handle multiple pops', () => {
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      s.pop()
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(1)
    })
  })

  describe('peek', () => {
    it('should throw on empty stack peek', () => {
      const s = new WaveletStack<number>()
      expect(() => s.peek()).toThrow('Cannot peek empty stack')
    })

    it('should return top of stack', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      expect(s.peek()).toBe(2)
    })

    it('should not remove element on peek', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.peek()
      expect(s.size()).toBe(1)
    })

    it('should return last pushed element', () => {
      const s = new WaveletStack<number>()
      s.push(10)
      s.push(20)
      s.push(30)
      expect(s.peek()).toBe(30)
    })

    it('should update after pop', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      expect(s.peek()).toBe(2)
    })

    it('should throw after clearing', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.clear()
      expect(() => s.peek()).toThrow('Cannot peek empty stack')
    })

    it('should work with single element', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      expect(s.peek()).toBe(42)
    })
  })

  describe('size', () => {
    it('should be 0 on empty stack', () => {
      const s = new WaveletStack<number>()
      expect(s.size()).toBe(0)
    })

    it('should track size through operations', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      expect(s.size()).toBe(1)
      s.push(2)
      expect(s.size()).toBe(2)
      s.pop()
      expect(s.size()).toBe(1)
    })

    it('should be 0 after clear', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.size()).toBe(0)
    })

    it('should reflect push-pop cycles', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 10; i++) s.push(i)
      for (let i = 0; i < 5; i++) s.pop()
      expect(s.size()).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new stack', () => {
      const s = new WaveletStack<number>()
      expect(s.isEmpty()).toBe(true)
    })

    it('should be false after push', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('should be true after popping all', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.pop()
      expect(s.isEmpty()).toBe(true)
    })

    it('should be true after clear', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })

    it('should toggle with push and pop', () => {
      const s = new WaveletStack<number>()
      expect(s.isEmpty()).toBe(true)
      s.push(1)
      expect(s.isEmpty()).toBe(false)
      s.pop()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear the stack', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      s.clear()
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should allow push after clear', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.clear()
      s.push(2)
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(2)
    })

    it('should clear empty stack without error', () => {
      const s = new WaveletStack<number>()
      s.clear()
      expect(s.size()).toBe(0)
    })

    it('should result in empty toArray', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.toArray()).toEqual([])
    })

    it('should reset counts', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.count(1)).toBe(0)
      expect(s.count(2)).toBe(0)
    })

    it('should result in empty histogram', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.clear()
      expect(s.histogram().size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty stack', () => {
      const s = new WaveletStack<number>()
      expect(s.toArray()).toEqual([])
    })

    it('should return items bottom to top', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('should return a copy', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      const arr = s.toArray()
      arr.push(99)
      expect(s.size()).toBe(1)
    })

    it('should reflect state after pop', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      expect(s.toArray()).toEqual([1, 2])
    })

    it('should reflect state after multiple pops', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      s.pop()
      expect(s.toArray()).toEqual([1])
    })

    it('should work with string values', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('c')
      expect(s.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('clone', () => {
    it('should clone the stack', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      const c = s.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('should not affect original on clone modification', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      const c = s.clone()
      c.push(3)
      expect(s.size()).toBe(2)
      expect(c.size()).toBe(3)
    })

    it('should clone empty stack', () => {
      const s = new WaveletStack<number>()
      const c = s.clone()
      expect(c.size()).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('should preserve capacity in clone', () => {
      const s = new WaveletStack<number>({ alphabetSize: 256 })
      s.push(1)
      const c = s.clone()
      expect(c.capacity).toBe(256)
    })

    it('should preserve counts in clone', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(1)
      s.push(2)
      const c = s.clone()
      expect(c.count(1)).toBe(2)
      expect(c.count(2)).toBe(1)
    })

    it('should allow independent pop on clone', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      const c = s.clone()
      c.pop()
      expect(s.size()).toBe(2)
      expect(c.size()).toBe(1)
    })

    it('should clone histogram independently', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      const c = s.clone()
      c.push(3)
      expect(s.histogram().size).toBe(2)
      expect(c.histogram().size).toBe(3)
    })

    it('should handle clone with single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      const c = s.clone()
      expect(c.peek()).toBe(42)
      expect(c.size()).toBe(1)
    })
  })

  describe('count', () => {
    it('should return 0 for item not in stack', () => {
      const s = new WaveletStack<number>()
      expect(s.count(1)).toBe(0)
    })

    it('should return count of item in stack', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(1)
      s.push(1)
      expect(s.count(1)).toBe(3)
    })

    it('should return 1 for single occurrence', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.count(2)).toBe(1)
    })

    it('should update after pop', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(1)
      s.pop()
      expect(s.count(1)).toBe(1)
    })

    it('should return 0 after clearing', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(1)
      s.clear()
      expect(s.count(1)).toBe(0)
    })

    it('should count distinct items separately', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('a')
      s.push('c')
      s.push('a')
      expect(s.count('a')).toBe(3)
      expect(s.count('b')).toBe(1)
      expect(s.count('c')).toBe(1)
      expect(s.count('d')).toBe(0)
    })

    it('should work with objects by reference', () => {
      const s = new WaveletStack<{ id: number }>()
      const obj = { id: 1 }
      s.push(obj)
      s.push(obj)
      expect(s.count(obj)).toBe(2)
      expect(s.count({ id: 1 })).toBe(0)
    })
  })

  describe('rank', () => {
    it('should count occurrences up to position inclusive', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(1)
      s.push(3)
      s.push(1)
      expect(s.rank(0, 1)).toBe(1)
      expect(s.rank(2, 1)).toBe(2)
      expect(s.rank(4, 1)).toBe(3)
    })

    it('should return 0 for item not in range', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(1)
      s.push(1)
      expect(s.rank(2, 99)).toBe(0)
    })

    it('should throw for negative position', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      expect(() => s.rank(-1, 1)).toThrow()
    })

    it('should throw for position >= size', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      expect(() => s.rank(1, 1)).toThrow()
    })

    it('should return 1 for single item at position 0', () => {
      const s = new WaveletStack<number>()
      s.push(5)
      expect(s.rank(0, 5)).toBe(1)
    })

    it('should handle rank with all same items', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 5; i++) s.push(7)
      expect(s.rank(0, 7)).toBe(1)
      expect(s.rank(2, 7)).toBe(3)
      expect(s.rank(4, 7)).toBe(5)
    })

    it('should handle rank with no matching items in prefix', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.rank(1, 3)).toBe(0)
    })

    it('should work with string items', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('a')
      expect(s.rank(2, 'a')).toBe(2)
    })
  })

  describe('select', () => {
    it('should return position of first occurrence', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(1)
      expect(s.select(0, 1)).toBe(0)
    })

    it('should return position of second occurrence', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(1)
      expect(s.select(1, 1)).toBe(2)
    })

    it('should throw for negative occurrence', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      expect(() => s.select(-1, 1)).toThrow()
    })

    it('should throw for occurrence beyond count', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(1)
      expect(() => s.select(2, 1)).toThrow()
    })

    it('should throw for item not in stack', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      expect(() => s.select(0, 99)).toThrow()
    })

    it('should work with all same items', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 5; i++) s.push(7)
      expect(s.select(0, 7)).toBe(0)
      expect(s.select(2, 7)).toBe(2)
      expect(s.select(4, 7)).toBe(4)
    })

    it('should work with string items', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('a')
      s.push('c')
      s.push('a')
      expect(s.select(0, 'a')).toBe(0)
      expect(s.select(1, 'a')).toBe(2)
      expect(s.select(2, 'a')).toBe(4)
      expect(s.select(0, 'b')).toBe(1)
      expect(s.select(0, 'c')).toBe(3)
    })

    it('should work with single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      expect(s.select(0, 42)).toBe(0)
    })
  })

  describe('access', () => {
    it('should return item at position', () => {
      const s = new WaveletStack<number>()
      s.push(10)
      s.push(20)
      s.push(30)
      expect(s.access(0)).toBe(10)
      expect(s.access(1)).toBe(20)
      expect(s.access(2)).toBe(30)
    })

    it('should throw for negative position', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      expect(() => s.access(-1)).toThrow()
    })

    it('should throw for position >= size', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      expect(() => s.access(1)).toThrow()
    })

    it('should throw for empty stack', () => {
      const s = new WaveletStack<number>()
      expect(() => s.access(0)).toThrow()
    })

    it('should work with position 0 for single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      expect(s.access(0)).toBe(42)
    })

    it('should work with string values', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('c')
      expect(s.access(0)).toBe('a')
      expect(s.access(2)).toBe('c')
    })
  })

  describe('histogram', () => {
    it('should return empty map for empty stack', () => {
      const s = new WaveletStack<number>()
      expect(s.histogram().size).toBe(0)
    })

    it('should return frequency of each item', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(1)
      s.push(3)
      s.push(1)
      const h = s.histogram()
      expect(h.get(1)).toBe(3)
      expect(h.get(2)).toBe(1)
      expect(h.get(3)).toBe(1)
    })

    it('should return a copy', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      const h = s.histogram()
      h.set(99, 100)
      expect(s.count(99)).toBe(0)
    })

    it('should update after push', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      expect(s.histogram().get(1)).toBe(1)
      s.push(1)
      expect(s.histogram().get(1)).toBe(2)
    })

    it('should update after pop', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(1)
      s.pop()
      expect(s.histogram().get(1)).toBe(1)
    })

    it('should work with strings', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('a')
      const h = s.histogram()
      expect(h.get('a')).toBe(2)
      expect(h.get('b')).toBe(1)
    })

    it('should handle all unique items', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      const h = s.histogram()
      expect(h.size).toBe(3)
    })
  })

  describe('capacity', () => {
    it('should return default capacity', () => {
      const s = new WaveletStack<number>()
      expect(s.capacity).toBe(1024)
    })

    it('should return custom capacity', () => {
      const s = new WaveletStack<number>({ alphabetSize: 256 })
      expect(s.capacity).toBe(256)
    })

    it('should grow when items exceed capacity', () => {
      const s = new WaveletStack<number>({ alphabetSize: 4 })
      s.push(1)
      s.push(2)
      s.push(3)
      s.push(4)
      expect(s.capacity).toBe(4)
      s.push(5)
      expect(s.capacity).toBe(10)
    })

    it('should not shrink after pop', () => {
      const s = new WaveletStack<number>({ alphabetSize: 4 })
      for (let i = 0; i < 5; i++) s.push(i)
      const capAfterGrow = s.capacity
      s.pop()
      expect(s.capacity).toBe(capAfterGrow)
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over empty stack', () => {
      const s = new WaveletStack<number>()
      const result: number[] = []
      for (const item of s) {
        result.push(item)
      }
      expect(result).toEqual([])
    })

    it('should iterate bottom to top', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      const result: number[] = []
      for (const item of s) {
        result.push(item)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with spread operator', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      expect([...s]).toEqual([1, 2])
    })

    it('should work with Array.from', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('c')
      expect(Array.from(s)).toEqual(['a', 'b', 'c'])
    })

    it('should reflect current state', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      s.pop()
      expect([...s]).toEqual([1, 2])
    })
  })

  describe('edge cases - empty stack', () => {
    it('should handle all operations on empty stack', () => {
      const s = new WaveletStack<number>()
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.toArray()).toEqual([])
      expect(s.count(1)).toBe(0)
      expect(s.histogram().size).toBe(0)
      expect([...s]).toEqual([])
    })

    it('should throw on pop of empty stack', () => {
      const s = new WaveletStack<number>()
      expect(() => s.pop()).toThrow()
    })

    it('should throw on peek of empty stack', () => {
      const s = new WaveletStack<number>()
      expect(() => s.peek()).toThrow()
    })

    it('should throw on access of empty stack', () => {
      const s = new WaveletStack<number>()
      expect(() => s.access(0)).toThrow()
    })
  })

  describe('edge cases - single item', () => {
    it('should handle push and pop of single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(42)
      expect(s.pop()).toBe(42)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle rank on single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      expect(s.rank(0, 42)).toBe(1)
      expect(s.rank(0, 99)).toBe(0)
    })

    it('should handle select on single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      expect(s.select(0, 42)).toBe(0)
    })

    it('should handle access on single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      expect(s.access(0)).toBe(42)
    })

    it('should handle count on single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      expect(s.count(42)).toBe(1)
    })

    it('should handle histogram on single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      const h = s.histogram()
      expect(h.size).toBe(1)
      expect(h.get(42)).toBe(1)
    })

    it('should handle clone of single item', () => {
      const s = new WaveletStack<number>()
      s.push(42)
      const c = s.clone()
      expect(c.peek()).toBe(42)
      expect(c.size()).toBe(1)
    })
  })

  describe('edge cases - all same items', () => {
    it('should handle push and pop of all same items', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 5; i++) s.push(7)
      expect(s.size()).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(s.pop()).toBe(7)
      }
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle count with all same items', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 10; i++) s.push(3)
      expect(s.count(3)).toBe(10)
      expect(s.count(5)).toBe(0)
    })

    it('should handle rank with all same items', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 5; i++) s.push(1)
      for (let i = 0; i < 5; i++) {
        expect(s.rank(i, 1)).toBe(i + 1)
      }
    })

    it('should handle select with all same items', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 5; i++) s.push(1)
      for (let i = 0; i < 5; i++) {
        expect(s.select(i, 1)).toBe(i)
      }
    })

    it('should handle histogram with all same items', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 5; i++) s.push(1)
      const h = s.histogram()
      expect(h.size).toBe(1)
      expect(h.get(1)).toBe(5)
    })
  })

  describe('edge cases - push-pop-push cycles', () => {
    it('should handle push-pop-push cycle', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.pop()
      s.push(2)
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(2)
    })

    it('should handle multiple push-pop cycles', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.pop()
      s.push(2)
      s.pop()
      s.push(3)
      expect(s.size()).toBe(1)
      expect(s.peek()).toBe(3)
      expect(s.count(1)).toBe(0)
      expect(s.count(2)).toBe(0)
      expect(s.count(3)).toBe(1)
    })

    it('should handle alternating push and pop', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 50; i++) {
        s.push(i)
        s.pop()
      }
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('should maintain counts correctly through cycles', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(1)
      s.pop()
      expect(s.count(1)).toBe(1)
      s.push(1)
      expect(s.count(1)).toBe(2)
      s.pop()
      s.pop()
      expect(s.count(1)).toBe(0)
    })

    it('should handle rank/select after cycles', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(1)
      s.pop()
      s.push(3)
      expect(s.toArray()).toEqual([1, 2, 3])
      expect(s.rank(2, 1)).toBe(1)
      expect(s.rank(2, 2)).toBe(1)
      expect(s.rank(2, 3)).toBe(1)
      expect(s.select(0, 1)).toBe(0)
      expect(s.select(0, 3)).toBe(2)
    })
  })

  describe('large stacks', () => {
    it('should handle 10000 push operations', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 10000; i++) {
        s.push(i)
      }
      expect(s.size()).toBe(10000)
      expect(s.peek()).toBe(9999)
    })

    it('should handle 10000 push and pop', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 5000; i++) {
        s.push(i)
      }
      for (let i = 4999; i >= 0; i--) {
        expect(s.pop()).toBe(i)
      }
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle count on large stack', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 1000; i++) {
        s.push(i % 10)
      }
      expect(s.count(0)).toBe(100)
      expect(s.count(5)).toBe(100)
    })

    it('should handle rank on large stack', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 1000; i++) {
        s.push(i % 5)
      }
      expect(s.rank(99, 0)).toBe(20)
      expect(s.rank(999, 0)).toBe(200)
    })

    it('should handle select on large stack', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 1000; i++) {
        s.push(i % 5)
      }
      expect(s.select(0, 0)).toBe(0)
      expect(s.select(1, 0)).toBe(5)
      expect(s.select(199, 0)).toBe(995)
    })

    it('should handle access on large stack', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 1000; i++) {
        s.push(i)
      }
      expect(s.access(0)).toBe(0)
      expect(s.access(500)).toBe(500)
      expect(s.access(999)).toBe(999)
    })

    it('should handle histogram on large stack', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 1000; i++) {
        s.push(i % 10)
      }
      const h = s.histogram()
      expect(h.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(h.get(i)).toBe(100)
      }
    })

    it('should handle clone on large stack', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 5000; i++) {
        s.push(i)
      }
      const c = s.clone()
      expect(c.size()).toBe(5000)
      expect(c.peek()).toBe(4999)
      expect(c.access(0)).toBe(0)
    })

    it('should handle iterator on large stack', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 1000; i++) {
        s.push(i)
      }
      const arr = [...s]
      expect(arr.length).toBe(1000)
      expect(arr[0]).toBe(0)
      expect(arr[999]).toBe(999)
    })

    it('should handle toArray on large stack', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 1000; i++) {
        s.push(i)
      }
      const arr = s.toArray()
      expect(arr.length).toBe(1000)
    })

    it('should handle clear on large stack', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 10000; i++) {
        s.push(i)
      }
      s.clear()
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
      expect(s.histogram().size).toBe(0)
    })
  })

  describe('string values', () => {
    it('should work with string items', () => {
      const s = new WaveletStack<string>()
      s.push('hello')
      s.push('world')
      expect(s.peek()).toBe('world')
      expect(s.pop()).toBe('world')
      expect(s.peek()).toBe('hello')
    })

    it('should count string items', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('a')
      expect(s.count('a')).toBe(2)
      expect(s.count('b')).toBe(1)
    })

    it('should rank string items', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('a')
      expect(s.rank(2, 'a')).toBe(2)
    })

    it('should select string items', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('a')
      expect(s.select(0, 'a')).toBe(0)
      expect(s.select(1, 'a')).toBe(2)
    })

    it('should access string items', () => {
      const s = new WaveletStack<string>()
      s.push('x')
      s.push('y')
      s.push('z')
      expect(s.access(1)).toBe('y')
    })
  })

  describe('object references', () => {
    it('should work with objects', () => {
      const s = new WaveletStack<{ id: number }>()
      const a = { id: 1 }
      const b = { id: 2 }
      s.push(a)
      s.push(b)
      expect(s.peek()).toBe(b)
      expect(s.pop()).toBe(b)
      expect(s.peek()).toBe(a)
    })

    it('should count by reference', () => {
      const s = new WaveletStack<{ id: number }>()
      const obj = { id: 1 }
      s.push(obj)
      s.push(obj)
      expect(s.count(obj)).toBe(2)
      expect(s.count({ id: 1 })).toBe(0)
    })

    it('should histogram by reference', () => {
      const s = new WaveletStack<{ id: number }>()
      const a = { id: 1 }
      const b = { id: 2 }
      s.push(a)
      s.push(b)
      s.push(a)
      const h = s.histogram()
      expect(h.get(a)).toBe(2)
      expect(h.get(b)).toBe(1)
    })
  })

  describe('integration - rank and select inverses', () => {
    it('rank and select should be inverses', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(1)
      s.push(3)
      s.push(1)
      const pos = s.select(1, 1)
      expect(pos).toBe(2)
      expect(s.rank(pos, 1)).toBe(2)
    })

    it('select(rank(pos, item), item) should return pos for first occurrence at pos', () => {
      const s = new WaveletStack<string>()
      s.push('a')
      s.push('b')
      s.push('a')
      s.push('a')
      const pos = 2
      const r = s.rank(pos, 'a')
      const sel = s.select(r - 1, 'a')
      expect(sel).toBeLessThanOrEqual(pos)
    })

    it('rank and access should be consistent', () => {
      const s = new WaveletStack<number>()
      s.push(3)
      s.push(1)
      s.push(4)
      s.push(1)
      s.push(5)
      for (let i = 0; i < 5; i++) {
        const item = s.access(i)
        const r = s.rank(i, item)
        expect(r).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe('integration - multiple operations', () => {
    it('should handle complex operation sequence', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.size()).toBe(3)
      expect(s.peek()).toBe(3)
      expect(s.access(0)).toBe(1)
      expect(s.count(2)).toBe(1)
      s.pop()
      expect(s.size()).toBe(2)
      expect(s.peek()).toBe(2)
      s.clear()
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle clone then modify both', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      const c = s.clone()
      s.push(3)
      c.push(4)
      expect(s.toArray()).toEqual([1, 2, 3])
      expect(c.toArray()).toEqual([1, 2, 4])
    })

    it('should handle histogram after complex operations', () => {
      const s = new WaveletStack<number>()
      s.push(1)
      s.push(2)
      s.push(1)
      s.pop()
      s.push(1)
      s.push(3)
      const h = s.histogram()
      expect(h.get(1)).toBe(2)
      expect(h.get(2)).toBe(1)
      expect(h.get(3)).toBe(1)
    })

    it('should handle clear and rebuild', () => {
      const s = new WaveletStack<number>()
      for (let i = 0; i < 10; i++) s.push(i)
      s.clear()
      expect(s.size()).toBe(0)
      for (let i = 0; i < 5; i++) s.push(i * 10)
      expect(s.size()).toBe(5)
      expect(s.peek()).toBe(40)
      expect(s.count(0)).toBe(1)
      expect(s.count(10)).toBe(1)
    })
  })
})
