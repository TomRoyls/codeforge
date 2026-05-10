import { describe, it, expect } from 'vitest'
import { HashedHeap } from '../../src/core/hashed-heap/hashed-heap.js'

describe('HashedHeap', () => {
  describe('constructor', () => {
    it('creates empty heap with default comparator (min-heap)', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates heap with custom comparator (max-heap)', () => {
      const heap = new HashedHeap<string, number>({
        comparator: (a, b) => b - a,
      })
      heap.insert('a', 1, 5)
      heap.insert('b', 2, 10)
      expect(heap.peek()!.priority).toBe(10)
    })

    it('creates heap with empty options', () => {
      const heap = new HashedHeap<string, number>({})
      expect(heap.size).toBe(0)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 100, 1)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('inserts multiple elements in any order', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('c', 3, 3)
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      expect(heap.peek()!.key).toBe('a')
    })

    it('maintains min-heap property', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('d', 4, 4)
      heap.insert('b', 2, 2)
      heap.insert('a', 1, 1)
      heap.insert('c', 3, 3)
      heap.insert('e', 5, 5)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin()!.priority)
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('throws on duplicate key', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      expect(() => heap.insert('a', 2, 2)).toThrow('Duplicate key: a')
    })

    it('handles negative priorities', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, -5)
      heap.insert('b', 2, 10)
      heap.insert('c', 3, -10)
      expect(heap.peek()!.key).toBe('c')
    })

    it('handles zero priority', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 0)
      heap.insert('b', 2, -1)
      heap.insert('c', 3, 1)
      expect(heap.peek()!.key).toBe('b')
    })

    it('handles decimal priorities', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1.5)
      heap.insert('b', 2, 0.5)
      heap.insert('c', 3, 2.5)
      expect(heap.peek()!.key).toBe('b')
    })

    it('supports numeric keys', () => {
      const heap = new HashedHeap<number, string>()
      heap.insert(1, 'one', 3)
      heap.insert(2, 'two', 1)
      heap.insert(3, 'three', 2)
      expect(heap.peek()!.key).toBe(2)
    })

    it('supports object values', () => {
      const heap = new HashedHeap<string, { name: string }>()
      heap.insert('a', { name: 'Alice' }, 1)
      heap.insert('b', { name: 'Bob' }, 2)
      expect(heap.get('a')).toEqual({ name: 'Alice' })
    })
  })

  describe('extractMin', () => {
    it('returns undefined on empty heap', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('extracts the minimum element', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 3)
      heap.insert('b', 2, 1)
      heap.insert('c', 3, 2)
      expect(heap.extractMin()!.key).toBe('b')
    })

    it('removes extracted element from heap', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.extractMin()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('removes extracted element from index map', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.extractMin()
      expect(heap.has('a')).toBe(false)
      expect(heap.has('b')).toBe(true)
    })

    it('extracts all elements in sorted order', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('c', 3, 3)
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.insert('e', 5, 5)
      heap.insert('d', 4, 4)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin()!.priority)
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('extracts from single element heap', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 42)
      const result = heap.extractMin()
      expect(result).toEqual({ key: 'a', value: 1, priority: 42 })
      expect(heap.isEmpty).toBe(true)
    })

    it('handles extract in max-heap mode (extracts max)', () => {
      const heap = new HashedHeap<string, number>({
        comparator: (a, b) => b - a,
      })
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 5)
      heap.insert('c', 3, 3)
      expect(heap.extractMin()!.priority).toBe(5)
      expect(heap.extractMin()!.priority).toBe(3)
      expect(heap.extractMin()!.priority).toBe(1)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty heap', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.peek()).toBeUndefined()
    })

    it('returns minimum without removing it', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 3)
      heap.insert('b', 2, 1)
      heap.insert('c', 3, 2)
      expect(heap.peek()!.key).toBe('b')
      expect(heap.size).toBe(3)
    })

    it('returns the same element on repeated calls', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      expect(heap.peek()).toEqual(heap.peek())
    })
  })

  describe('has', () => {
    it('returns false for non-existent key', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.has('a')).toBe(false)
    })

    it('returns true for existing key', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      expect(heap.has('a')).toBe(true)
    })

    it('returns false after deletion', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.delete('a')
      expect(heap.has('a')).toBe(false)
    })

    it('returns false after extraction', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.extractMin()
      expect(heap.has('a')).toBe(false)
    })

    it('works with numeric keys', () => {
      const heap = new HashedHeap<number, string>()
      heap.insert(42, 'answer', 1)
      expect(heap.has(42)).toBe(true)
      expect(heap.has(99)).toBe(false)
    })
  })

  describe('get', () => {
    it('returns undefined for non-existent key', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.get('a')).toBeUndefined()
    })

    it('returns value for existing key', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 42, 1)
      expect(heap.get('a')).toBe(42)
    })

    it('returns updated value after updateValue', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.updateValue('a', 99)
      expect(heap.get('a')).toBe(99)
    })

    it('returns undefined after deletion', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.delete('a')
      expect(heap.get('a')).toBeUndefined()
    })
  })

  describe('getPriority', () => {
    it('returns undefined for non-existent key', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.getPriority('a')).toBeUndefined()
    })

    it('returns priority for existing key', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 42)
      expect(heap.getPriority('a')).toBe(42)
    })

    it('returns updated priority after update', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 10)
      heap.update('a', 5)
      expect(heap.getPriority('a')).toBe(5)
    })
  })

  describe('update', () => {
    it('returns false for non-existent key', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.update('a', 1)).toBe(false)
    })

    it('updates priority and rebalances (decrease)', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 10)
      heap.insert('b', 2, 5)
      heap.update('a', 1)
      expect(heap.peek()!.key).toBe('a')
    })

    it('updates priority and rebalances (increase)', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 5)
      heap.update('a', 10)
      expect(heap.peek()!.key).toBe('b')
    })

    it('no-op when priority unchanged', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      heap.update('a', 5)
      expect(heap.getPriority('a')).toBe(5)
      expect(heap.size).toBe(1)
    })

    it('maintains heap property after multiple updates', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 3)
      heap.insert('b', 2, 1)
      heap.insert('c', 3, 2)
      heap.update('a', 0)
      const result: string[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin()!.key)
      }
      expect(result).toEqual(['a', 'b', 'c'])
    })
  })

  describe('updateValue', () => {
    it('returns false for non-existent key', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.updateValue('a', 99)).toBe(false)
    })

    it('updates value without changing priority', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      heap.updateValue('a', 99)
      expect(heap.get('a')).toBe(99)
      expect(heap.getPriority('a')).toBe(5)
    })

    it('does not affect heap order', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.insert('c', 3, 3)
      heap.updateValue('b', 99)
      expect(heap.peek()!.key).toBe('a')
      expect(heap.extractMin()!.key).toBe('a')
      expect(heap.extractMin()!.value).toBe(99)
    })
  })

  describe('delete', () => {
    it('returns false for non-existent key', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.delete('a')).toBe(false)
    })

    it('deletes the root element', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.insert('c', 3, 3)
      heap.delete('a')
      expect(heap.has('a')).toBe(false)
      expect(heap.peek()!.key).toBe('b')
    })

    it('deletes a leaf element', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.insert('c', 3, 3)
      heap.delete('c')
      expect(heap.has('c')).toBe(false)
      expect(heap.size).toBe(2)
    })

    it('deletes a middle element', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.insert('c', 3, 3)
      heap.delete('b')
      expect(heap.has('b')).toBe(false)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin()!.priority)
      }
      expect(result).toEqual([1, 3])
    })

    it('deletes single element', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.delete('a')
      expect(heap.isEmpty).toBe(true)
      expect(heap.has('a')).toBe(false)
    })

    it('maintains heap property after deletion', () => {
      const heap = new HashedHeap<string, number>()
      for (let i = 10; i >= 1; i--) {
        heap.insert(`k${i}`, i, i)
      }
      heap.delete('k5')
      heap.delete('k3')
      heap.delete('k7')
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin()!.priority)
      }
      const expected = [1, 2, 4, 6, 8, 9, 10]
      expect(result).toEqual(expected)
    })

    it('works with numeric keys', () => {
      const heap = new HashedHeap<number, string>()
      heap.insert(1, 'a', 1)
      heap.insert(2, 'b', 2)
      heap.delete(1)
      expect(heap.has(1)).toBe(false)
      expect(heap.peek()!.key).toBe(2)
    })
  })

  describe('decreaseKey', () => {
    it('returns false for non-existent key', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.decreaseKey('a', 1)).toBe(false)
    })

    it('returns false if new priority is not lower', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      expect(heap.decreaseKey('a', 5)).toBe(false)
      expect(heap.decreaseKey('a', 10)).toBe(false)
    })

    it('decreases key and rebalances', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 10)
      heap.insert('b', 2, 5)
      heap.decreaseKey('a', 1)
      expect(heap.peek()!.key).toBe('a')
    })

    it('decreases key from middle of heap', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 5)
      heap.insert('c', 3, 3)
      heap.decreaseKey('b', 0)
      expect(heap.peek()!.key).toBe('b')
    })
  })

  describe('increaseKey', () => {
    it('returns false for non-existent key', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.increaseKey('a', 1)).toBe(false)
    })

    it('returns false if new priority is not higher', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      expect(heap.increaseKey('a', 5)).toBe(false)
      expect(heap.increaseKey('a', 1)).toBe(false)
    })

    it('increases key and rebalances', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 5)
      heap.increaseKey('a', 10)
      expect(heap.peek()!.key).toBe('b')
    })

    it('increases key from middle of heap', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.insert('c', 3, 3)
      heap.increaseKey('b', 10)
      expect(heap.extractMin()!.key).toBe('a')
      expect(heap.extractMin()!.key).toBe('c')
      expect(heap.extractMin()!.key).toBe('b')
    })
  })

  describe('clear', () => {
    it('clears empty heap', () => {
      const heap = new HashedHeap<string, number>()
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('clears heap with elements', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.insert('c', 3, 3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
      expect(heap.has('a')).toBe(false)
      expect(heap.peek()).toBeUndefined()
    })

    it('allows insertion after clear', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.clear()
      heap.insert('a', 2, 10)
      expect(heap.size).toBe(1)
      expect(heap.get('a')).toBe(2)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns copy of entries', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      const arr = heap.toArray()
      expect(arr.length).toBe(2)
      arr[0]!.priority = 99
      expect(heap.getPriority('a')).not.toBe(99)
    })

    it('returns all entries', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 3)
      heap.insert('b', 2, 1)
      heap.insert('c', 3, 2)
      const arr = heap.toArray()
      expect(arr.length).toBe(3)
      const keys = arr.map((e) => e.key).sort()
      expect(keys).toEqual(['a', 'b', 'c'])
    })
  })

  describe('keys', () => {
    it('returns empty array for empty heap', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.keys()).toEqual([])
    })

    it('returns all keys', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.insert('c', 3, 3)
      const keys = heap.keys().sort()
      expect(keys).toEqual(['a', 'b', 'c'])
    })

    it('returns numeric keys', () => {
      const heap = new HashedHeap<number, string>()
      heap.insert(1, 'a', 1)
      heap.insert(2, 'b', 2)
      const keys = heap.keys().sort()
      expect(keys).toEqual([1, 2])
    })
  })

  describe('values', () => {
    it('returns empty array for empty heap', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.values()).toEqual([])
    })

    it('returns all values', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 10, 1)
      heap.insert('b', 20, 2)
      heap.insert('c', 30, 3)
      const vals = heap.values().sort()
      expect(vals).toEqual([10, 20, 30])
    })
  })

  describe('empty operations', () => {
    it('extractMin on empty returns undefined', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('peek on empty returns undefined', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.peek()).toBeUndefined()
    })

    it('get on empty returns undefined', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.get('a')).toBeUndefined()
    })

    it('getPriority on empty returns undefined', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.getPriority('a')).toBeUndefined()
    })

    it('has on empty returns false', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.has('a')).toBe(false)
    })

    it('update on empty returns false', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.update('a', 1)).toBe(false)
    })

    it('updateValue on empty returns false', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.updateValue('a', 1)).toBe(false)
    })

    it('delete on empty returns false', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.delete('a')).toBe(false)
    })

    it('decreaseKey on empty returns false', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.decreaseKey('a', 1)).toBe(false)
    })

    it('increaseKey on empty returns false', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.increaseKey('a', 1)).toBe(false)
    })
  })

  describe('single element', () => {
    it('insert and extract single element', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 42, 1)
      const result = heap.extractMin()
      expect(result).toEqual({ key: 'a', value: 42, priority: 1 })
      expect(heap.isEmpty).toBe(true)
    })

    it('delete single element', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      expect(heap.delete('a')).toBe(true)
      expect(heap.isEmpty).toBe(true)
    })

    it('update single element priority', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      heap.update('a', 10)
      expect(heap.getPriority('a')).toBe(10)
    })

    it('updateValue single element', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      heap.updateValue('a', 99)
      expect(heap.get('a')).toBe(99)
    })
  })

  describe('many elements', () => {
    it('handles 10000 insertions and extractions', () => {
      const heap = new HashedHeap<number, number>()
      for (let i = 10000; i >= 1; i--) {
        heap.insert(i, i, i)
      }
      expect(heap.size).toBe(10000)
      for (let i = 1; i <= 10000; i++) {
        const entry = heap.extractMin()!
        expect(entry.priority).toBe(i)
      }
      expect(heap.isEmpty).toBe(true)
    })

    it('handles 10000 random insertions', () => {
      const heap = new HashedHeap<number, number>()
      const values: number[] = []
      for (let i = 0; i < 10000; i++) {
        const v = Math.floor(Math.random() * 100000)
        values.push(v)
        heap.insert(i, v, v)
      }
      values.sort((a, b) => a - b)
      for (const v of values) {
        expect(heap.extractMin()!.priority).toBe(v)
      }
    })

    it('handles 10000 elements with mixed operations', () => {
      const heap = new HashedHeap<number, number>()
      for (let i = 0; i < 5000; i++) {
        heap.insert(i * 2, i * 2, i * 2)
      }
      for (let i = 0; i < 1000; i++) {
        heap.delete(i * 2)
      }
      for (let i = 0; i < 1000; i++) {
        heap.update((i + 1000) * 2, i)
      }
      expect(heap.size).toBe(4000)
    })
  })

  describe('duplicate priorities', () => {
    it('handles duplicate priorities with different keys', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      heap.insert('b', 2, 5)
      heap.insert('c', 3, 5)
      expect(heap.size).toBe(3)
      const keys = new Set<string>()
      while (!heap.isEmpty) {
        keys.add(heap.extractMin()!.key)
      }
      expect(keys).toEqual(new Set(['a', 'b', 'c']))
    })

    it('maintains all entries with same priority', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('x', 1, 1)
      heap.insert('y', 2, 1)
      heap.insert('z', 3, 1)
      expect(heap.has('x')).toBe(true)
      expect(heap.has('y')).toBe(true)
      expect(heap.has('z')).toBe(true)
    })
  })

  describe('update non-existent key', () => {
    it('update returns false', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      expect(heap.update('b', 5)).toBe(false)
    })

    it('updateValue returns false', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      expect(heap.updateValue('b', 5)).toBe(false)
    })

    it('decreaseKey returns false', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      expect(heap.decreaseKey('b', 1)).toBe(false)
    })

    it('increaseKey returns false', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      expect(heap.increaseKey('b', 10)).toBe(false)
    })
  })

  describe('delete non-existent key', () => {
    it('returns false on empty heap', () => {
      const heap = new HashedHeap<string, number>()
      expect(heap.delete('a')).toBe(false)
    })

    it('returns false for missing key', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      expect(heap.delete('b')).toBe(false)
    })

    it('returns false for already deleted key', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.delete('a')
      expect(heap.delete('a')).toBe(false)
    })

    it('returns false for already extracted key', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.extractMin()
      expect(heap.delete('a')).toBe(false)
    })
  })

  describe('interleaved operations', () => {
    it('insert, delete, insert, extract', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 10)
      heap.insert('b', 2, 5)
      heap.insert('c', 3, 15)
      heap.delete('b')
      heap.insert('d', 4, 1)
      expect(heap.extractMin()!.key).toBe('d')
      expect(heap.extractMin()!.key).toBe('a')
      expect(heap.extractMin()!.key).toBe('c')
    })

    it('insert, update, delete, insert', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 3)
      heap.insert('b', 2, 1)
      heap.update('a', 0)
      heap.delete('b')
      heap.insert('c', 3, 5)
      expect(heap.extractMin()!.key).toBe('a')
      expect(heap.extractMin()!.key).toBe('c')
    })

    it('rapid interleaved operations', () => {
      const heap = new HashedHeap<number, number>()
      heap.insert(1, 1, 10)
      heap.insert(2, 2, 20)
      heap.insert(3, 3, 30)
      heap.decreaseKey(3, 5)
      heap.increaseKey(1, 25)
      heap.delete(2)
      heap.insert(4, 4, 1)
      heap.update(3, 15)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin()!.key)
      }
      expect(result).toEqual([4, 3, 1])
    })

    it('insert extract mix', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 5)
      expect(heap.extractMin()!.key).toBe('a')
      heap.insert('b', 2, 3)
      heap.insert('c', 3, 7)
      expect(heap.extractMin()!.key).toBe('b')
      heap.insert('d', 4, 1)
      expect(heap.extractMin()!.key).toBe('d')
      expect(heap.extractMin()!.key).toBe('c')
    })

    it('update and delete interleaved', () => {
      const heap = new HashedHeap<string, number>()
      for (let i = 0; i < 20; i++) {
        heap.insert(`k${i}`, i, i)
      }
      heap.update('k10', 0)
      heap.delete('k5')
      heap.update('k15', 100)
      heap.delete('k0')
      expect(heap.peek()!.key).toBe('k10')
    })

    it('clear and reuse', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.clear()
      heap.insert('c', 3, 10)
      heap.insert('d', 4, 5)
      expect(heap.extractMin()!.key).toBe('d')
      expect(heap.extractMin()!.key).toBe('c')
    })
  })

  describe('custom comparator (max-heap)', () => {
    it('extracts in descending order', () => {
      const heap = new HashedHeap<string, number>({
        comparator: (a, b) => b - a,
      })
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 5)
      heap.insert('c', 3, 3)
      heap.insert('d', 4, 2)
      heap.insert('e', 5, 4)
      const result: number[] = []
      while (!heap.isEmpty) {
        result.push(heap.extractMin()!.priority)
      }
      expect(result).toEqual([5, 4, 3, 2, 1])
    })

    it('decreaseKey works correctly in max-heap', () => {
      const heap = new HashedHeap<string, number>({
        comparator: (a, b) => b - a,
      })
      heap.insert('a', 1, 5)
      heap.insert('b', 2, 3)
      heap.decreaseKey('b', 1)
      expect(heap.peek()!.key).toBe('a')
    })

    it('increaseKey works correctly in max-heap', () => {
      const heap = new HashedHeap<string, number>({
        comparator: (a, b) => b - a,
      })
      heap.insert('a', 1, 5)
      heap.insert('b', 2, 3)
      expect(heap.increaseKey('b', 10)).toBe(false)
      heap.update('b', 10)
      expect(heap.peek()!.key).toBe('b')
    })

    it('delete works correctly in max-heap', () => {
      const heap = new HashedHeap<string, number>({
        comparator: (a, b) => b - a,
      })
      heap.insert('a', 1, 5)
      heap.insert('b', 2, 3)
      heap.insert('c', 3, 7)
      heap.delete('c')
      expect(heap.peek()!.key).toBe('a')
    })

    it('update works correctly in max-heap', () => {
      const heap = new HashedHeap<string, number>({
        comparator: (a, b) => b - a,
      })
      heap.insert('a', 1, 5)
      heap.insert('b', 2, 3)
      heap.update('b', 10)
      expect(heap.peek()!.key).toBe('b')
    })
  })

  describe('heap property invariants', () => {
    it('parent priority <= children priorities (min-heap)', () => {
      const heap = new HashedHeap<number, number>()
      for (let i = 0; i < 100; i++) {
        heap.insert(i, i, Math.floor(Math.random() * 1000))
      }
      const arr = heap.toArray()
      for (let i = 0; i < arr.length; i++) {
        const left = 2 * i + 1
        const right = 2 * i + 2
        if (left < arr.length) {
          expect(arr[i]!.priority).toBeLessThanOrEqual(arr[left]!.priority)
        }
        if (right < arr.length) {
          expect(arr[i]!.priority).toBeLessThanOrEqual(arr[right]!.priority)
        }
      }
    })

    it('parent priority >= children priorities (max-heap)', () => {
      const heap = new HashedHeap<number, number>({
        comparator: (a, b) => b - a,
      })
      for (let i = 0; i < 100; i++) {
        heap.insert(i, i, Math.floor(Math.random() * 1000))
      }
      const arr = heap.toArray()
      for (let i = 0; i < arr.length; i++) {
        const left = 2 * i + 1
        const right = 2 * i + 2
        if (left < arr.length) {
          expect(arr[i]!.priority).toBeGreaterThanOrEqual(arr[left]!.priority)
        }
        if (right < arr.length) {
          expect(arr[i]!.priority).toBeGreaterThanOrEqual(arr[right]!.priority)
        }
      }
    })

    it('index map stays consistent after all operations', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 10)
      heap.insert('b', 2, 5)
      heap.insert('c', 3, 15)
      heap.insert('d', 4, 3)
      heap.insert('e', 5, 8)

      heap.update('a', 1)
      heap.delete('c')
      heap.decreaseKey('e', 2)

      const arr = heap.toArray()
      for (const entry of arr) {
        expect(heap.has(entry.key)).toBe(true)
        expect(heap.getPriority(entry.key)).toBe(entry.priority)
      }
      expect(arr.length).toBe(4)
      expect(heap.size).toBe(4)
    })

    it('all keys unique in toArray', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 3)
      heap.insert('b', 2, 1)
      heap.insert('c', 3, 2)
      const keys = heap.toArray().map((e) => e.key)
      expect(new Set(keys).size).toBe(keys.length)
    })
  })

  describe('keys() returns all keys', () => {
    it('returns every key after inserts', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('x', 1, 5)
      heap.insert('y', 2, 3)
      heap.insert('z', 3, 7)
      const keys = heap.keys().sort()
      expect(keys).toEqual(['x', 'y', 'z'])
    })

    it('returns keys after deletion', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.insert('c', 3, 3)
      heap.delete('b')
      const keys = heap.keys().sort()
      expect(keys).toEqual(['a', 'c'])
    })
  })

  describe('values() returns all values', () => {
    it('returns every value after inserts', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 10, 1)
      heap.insert('b', 20, 2)
      heap.insert('c', 30, 3)
      const vals = heap.values().sort()
      expect(vals).toEqual([10, 20, 30])
    })

    it('returns values after updateValue', () => {
      const heap = new HashedHeap<string, number>()
      heap.insert('a', 1, 1)
      heap.insert('b', 2, 2)
      heap.updateValue('a', 99)
      const vals = heap.values().sort()
      expect(vals).toEqual([2, 99])
    })
  })
})
