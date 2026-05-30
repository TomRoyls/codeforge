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
})