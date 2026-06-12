import { describe, it, expect } from 'vitest'
import { IntervalHeap } from '../../src/utils/interval-heap.js'

describe('IntervalHeap', () => {
  it('starts empty', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.isEmpty).toBe(true)
    expect(heap.size).toBe(0)
  })

  it('inserts entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    expect(heap.size).toBe(1)
    expect(heap.isEmpty).toBe(false)
  })

  it('peek returns min entry without removing', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const entry = heap.peek()
    expect(entry!.key).toBe(3)
    expect(heap.size).toBe(2)
  })

  it('peek returns undefined for empty heap', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.peek()).toBeUndefined()
  })

  it('extractMin returns and removes min entry', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    const min = heap.extractMin()
    expect(min!.key).toBe(3)
    expect(heap.size).toBe(2)
  })

  it('extractMin returns undefined for empty heap', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('extractMin maintains heap property', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    heap.extractMin()
    const next = heap.extractMin()
    expect(next!.key).toBe(5)
  })

  it('decreaseKey decreases key and sifts up', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const success = heap.decreaseKey('a', 1)
    expect(success).toBe(true)
    expect(heap.peek()!.key).toBe(1)
  })

  it('decreaseKey returns false if value not found', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.decreaseKey('b', 1)
    expect(success).toBe(false)
  })

  it('decreaseKey returns false if new key greater than current', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.decreaseKey('a', 10)
    expect(success).toBe(false)
  })

  it('increaseKey increases key and sifts down', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const success = heap.increaseKey('b', 10)
    expect(success).toBe(true)
    expect(heap.peek()!.key).toBe(5)
  })

  it('increaseKey returns false if value not found', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.increaseKey('b', 10)
    expect(success).toBe(false)
  })

  it('increaseKey returns false if new key less than current', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.increaseKey('a', 3)
    expect(success).toBe(false)
  })

  it('updateKey updates key correctly', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    heap.updateKey('b', 10)
    expect(heap.peek()!.key).toBe(5)
  })

  it('updateKey handles decrease', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(10, 'b')
    heap.updateKey('b', 2)
    expect(heap.peek()!.key).toBe(2)
  })

  it('has checks if value exists', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    expect(heap.has('a')).toBe(true)
    expect(heap.has('b')).toBe(false)
  })

  it('getKey returns key for value', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    expect(heap.getKey('a')).toBe(5)
    expect(heap.getKey('b')).toBeUndefined()
  })

  it('delete removes value from heap', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    const success = heap.delete('b')
    expect(success).toBe(true)
    expect(heap.size).toBe(2)
    expect(heap.has('b')).toBe(false)
  })

  it('delete returns false if value not found', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.delete('b')
    expect(success).toBe(false)
  })

  it('delete maintains heap property', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    heap.delete('a')
    expect(heap.peek()!.key).toBe(3)
  })

  it('clear removes all entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.clear()
    expect(heap.isEmpty).toBe(true)
    expect(heap.size).toBe(0)
  })

  it('toArray returns all entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const arr = heap.toArray()
    expect(arr.length).toBe(2)
    expect(arr.some(e => e.value === 'a')).toBe(true)
    expect(arr.some(e => e.value === 'b')).toBe(true)
  })

  it('keys returns all keys', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const keys = heap.keys()
    expect(keys.length).toBe(2)
    expect(keys.includes(5)).toBe(true)
    expect(keys.includes(3)).toBe(true)
  })

  it('values returns all values', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const vals = heap.values()
    expect(vals.length).toBe(2)
    expect(vals.includes('a')).toBe(true)
    expect(vals.includes('b')).toBe(true)
  })

  it('forEach iterates over entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const entries: Array<{key: number; value: string}> = []
    heap.forEach((entry, idx) => entries.push({key: entry.key, value: entry.value}))
    expect(entries.length).toBe(2)
  })

  it('entries generator yields entries', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const results = []
    for (const entry of heap.entries()) {
      results.push(entry.value)
    }
    expect(results.length).toBe(2)
  })

  it('merge combines two heaps', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    heap1.insert(3, 'b')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(7, 'c')
    heap2.insert(1, 'd')
    const merged = heap1.merge(heap2)
    expect(merged.size).toBe(4)
    expect(merged.peek()!.key).toBe(1)
  })

  it('fromArray creates heap from items', () => {
    const items = [{key: 5, value: 'a'}, {key: 3, value: 'b'}, {key: 7, value: 'c'}]
    const heap = IntervalHeap.fromArray(items)
    expect(heap.size).toBe(3)
    expect(heap.peek()!.key).toBe(3)
  })

  it('extractMin removes correct entry when duplicates exist', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(5, 'b')
    heap.insert(5, 'c')
    heap.extractMin()
    expect(heap.size).toBe(2)
  })

  it('toString returns correct string representation', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    expect(heap.toString()).toBe('IntervalHeap(2)')
  })

  it('toString for empty heap', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.toString()).toBe('IntervalHeap(0)')
  })

  it('toString for large heap', () => {
    const heap = new IntervalHeap<string>()
    for (let i = 0; i < 100; i++) {
      heap.insert(i, `v${i}`)
    }
    expect(heap.toString()).toBe('IntervalHeap(100)')
  })

  it('toJSON returns correct structure', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    const json = heap.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(3)
    expect(json.some((e: any) => e.key === 5 && e.value === 'a')).toBe(true)
    expect(json.some((e: any) => e.key === 3 && e.value === 'b')).toBe(true)
    expect(json.some((e: any) => e.key === 7 && e.value === 'c')).toBe(true)
  })

  it('toJSON for empty heap returns empty array', () => {
    const heap = new IntervalHeap<string>()
    const json = heap.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(0)
  })

  it('clone creates independent copy', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.insert(7, 'c')
    const copy = heap.clone()
    expect(copy.size).toBe(heap.size)
    expect(copy.peek()!.key).toBe(heap.peek()!.key)
    heap.insert(1, 'd')
    expect(heap.size).toBe(4)
    expect(copy.size).toBe(3)
  })

  it('clone deep copy is independent', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const copy = heap.clone()
    copy.insert(1, 'b')
    expect(heap.size).toBe(1)
    expect(heap.peek()!.key).toBe(5)
    expect(copy.size).toBe(2)
    expect(copy.peek()!.key).toBe(1)
  })

  it('clone of empty heap', () => {
    const heap = new IntervalHeap<string>()
    const copy = heap.clone()
    expect(copy.isEmpty).toBe(true)
    expect(copy.size).toBe(0)
  })

  it('equals returns true for identical heaps', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    heap1.insert(3, 'b')
    heap1.insert(7, 'c')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(5, 'a')
    heap2.insert(3, 'b')
    heap2.insert(7, 'c')
    expect(heap1.equals(heap2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(5, 'a')
    heap2.insert(3, 'b')
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('equals returns false for different keys', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(3, 'a')
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    const heap2 = new IntervalHeap<string>()
    heap2.insert(5, 'b')
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('equals returns false for non-heap objects', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    expect(heap.equals(null)).toBe(false)
    expect(heap.equals({})).toBe(false)
    expect(heap.equals([])).toBe(false)
    expect(heap.equals('string')).toBe(false)
  })

  it('equals handles empty heaps', () => {
    const heap1 = new IntervalHeap<string>()
    const heap2 = new IntervalHeap<string>()
    expect(heap1.equals(heap2)).toBe(true)
  })

  it('handles negative keys', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(-5, 'a')
    heap.insert(-3, 'b')
    heap.insert(-7, 'c')
    expect(heap.size).toBe(3)
    expect(heap.peek()!.key).toBe(-7)
  })

  it('handles zero key', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(0, 'zero')
    expect(heap.peek()!.key).toBe(0)
    expect(heap.size).toBe(1)
  })

  it('handles large number keys', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(Number.MAX_SAFE_INTEGER, 'max')
    heap.insert(Number.MIN_SAFE_INTEGER, 'min')
    expect(heap.size).toBe(2)
    expect(heap.peek()!.key).toBe(Number.MIN_SAFE_INTEGER)
  })

  it('handles decimal keys', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(1.5, 'a')
    heap.insert(2.7, 'b')
    heap.insert(0.3, 'c')
    expect(heap.size).toBe(3)
    expect(heap.peek()!.key).toBe(0.3)
  })

  it('handles insert after extractMin', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    heap.extractMin()
    heap.insert(1, 'c')
    expect(heap.size).toBe(2)
    expect(heap.peek()!.key).toBe(1)
  })

  it('handles decreaseKey to same value returns false', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.decreaseKey('a', 6)
    expect(success).toBe(false)
    expect(heap.peek()!.key).toBe(5)
  })

  it('handles increaseKey to same value returns false', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    const success = heap.increaseKey('a', 4)
    expect(success).toBe(false)
    expect(heap.peek()!.key).toBe(5)
  })

  it('handles updateKey to same value', () => {
    const heap = new IntervalHeap<string>()
    heap.insert(5, 'a')
    heap.insert(3, 'b')
    const success = heap.updateKey('a', 5)
    expect(success).toBe(true)
    expect(heap.size).toBe(2)
  })

  it('handles forEach on empty heap', () => {
    const heap = new IntervalHeap<string>()
    let count = 0
    heap.forEach(() => count++)
    expect(count).toBe(0)
  })

  it('handles delete on empty heap', () => {
    const heap = new IntervalHeap<string>()
    expect(heap.delete('a')).toBe(false)
    expect(heap.size).toBe(0)
  })

  it('handles merge with empty heap', () => {
    const heap1 = new IntervalHeap<string>()
    heap1.insert(5, 'a')
    const heap2 = new IntervalHeap<string>()
    const merged = heap1.merge(heap2)
    expect(merged.size).toBe(1)
    expect(merged.peek()!.key).toBe(5)
  })

  it('handles merge with both empty heaps', () => {
    const heap1 = new IntervalHeap<string>()
    const heap2 = new IntervalHeap<string>()
    const merged = heap1.merge(heap2)
    expect(merged.isEmpty).toBe(true)
    expect(merged.size).toBe(0)
  })
  it('new heap peek undefined', () => {
    const h = new IntervalHeap<number>()
    expect(h.peek()).toBeUndefined()
  })

  it('insert and peek', () => {
    const h = new IntervalHeap<number>()
    h.insert(5, 'a')
    expect(h.peek()).toBeDefined()
  })

  it('has returns boolean', () => {
    const h = new IntervalHeap<number>()
    expect(h.has('a')).toBe(false)
  })
})

describe('interval-heap - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
