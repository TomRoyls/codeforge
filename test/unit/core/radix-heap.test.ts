import { describe, expect, it } from 'vitest'
import { RadixHeap } from '../../../src/core/radix-heap/radix-heap.js'

describe('RadixHeap', () => {
  it('push adds elements to heap', () => {
    const heap = new RadixHeap()
    heap.push(5, 100)
    expect(heap.size()).toBe(1)
    expect(heap.isEmpty()).toBe(false)
  })

  it('push throws error for non-integer keys', () => {
    const heap = new RadixHeap()
    expect(() => heap.push(1.5, 100)).toThrow('Key must be an integer')
  })

  it('push throws error for negative keys', () => {
    const heap = new RadixHeap()
    expect(() => heap.push(-1, 100)).toThrow('Key -1 is less than last popped key 0')
  })

  it('push throws error for keys less than last popped key', () => {
    const heap = new RadixHeap()
    heap.push(10, 100)
    heap.pop()
    expect(() => heap.push(5, 200)).toThrow('Key 5 is less than last popped key 10')
  })

  it('pop returns undefined from empty heap', () => {
    const heap = new RadixHeap()
    expect(heap.pop()).toBe(undefined)
  })

  it('pop returns minimum element', () => {
    const heap = new RadixHeap()
    heap.push(10, 100)
    heap.push(5, 50)
    heap.push(15, 150)
    const result = heap.pop()
    expect(result).toEqual({ key: 5, value: 50 })
    expect(heap.size()).toBe(2)
  })

  it('pop maintains heap order', () => {
    const heap = new RadixHeap()
    heap.push(10, 100)
    heap.push(5, 50)
    heap.push(15, 150)
    heap.push(8, 80)
    const first = heap.pop()
    const second = heap.pop()
    const third = heap.pop()
    const fourth = heap.pop()
    expect(first).toEqual({ key: 5, value: 50 })
    expect(second).toEqual({ key: 8, value: 80 })
    expect(third).toEqual({ key: 10, value: 100 })
    expect(fourth).toEqual({ key: 15, value: 150 })
  })

  it('isEmpty returns true for empty heap', () => {
    const heap = new RadixHeap()
    expect(heap.isEmpty()).toBe(true)
  })

  it('isEmpty returns false for non-empty heap', () => {
    const heap = new RadixHeap()
    heap.push(1, 10)
    expect(heap.isEmpty()).toBe(false)
  })

  it('size returns correct size after multiple operations', () => {
    const heap = new RadixHeap()
    expect(heap.size()).toBe(0)
    heap.push(1, 10)
    expect(heap.size()).toBe(1)
    heap.push(2, 20)
    expect(heap.size()).toBe(2)
    heap.pop()
    expect(heap.size()).toBe(1)
    heap.pop()
    expect(heap.size()).toBe(0)
  })

  it('peek returns minimum without removing', () => {
    const heap = new RadixHeap()
    heap.push(10, 100)
    heap.push(5, 50)
    heap.push(15, 150)
    const result = heap.peek()
    expect(result).toEqual({ key: 5, value: 50 })
    expect(heap.size()).toBe(3)
  })

  it('peek returns undefined for empty heap', () => {
    const heap = new RadixHeap()
    expect(heap.peek()).toBe(undefined)
  })

  it('peek does not modify heap state', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    const firstPeek = heap.peek()
    const secondPeek = heap.peek()
    expect(firstPeek).toEqual(secondPeek)
    expect(heap.size()).toBe(2)
  })

  it('update changes value for existing key', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.update(5, 100)
    expect(heap.get(5)).toBe(100)
  })

  it('update does nothing for non-existent key', () => {
    const heap = new RadixHeap()
    heap.update(999, 100)
    expect(heap.size()).toBe(0)
  })

  it('has returns true for existing key', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    expect(heap.has(5)).toBe(true)
  })

  it('has returns false for non-existent key', () => {
    const heap = new RadixHeap()
    expect(heap.has(999)).toBe(false)
  })

  it('get returns value for existing key', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    expect(heap.get(5)).toBe(50)
  })

  it('get returns undefined for non-existent key', () => {
    const heap = new RadixHeap()
    expect(heap.get(999)).toBe(undefined)
  })

  it('clear removes all elements', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    heap.clear()
    expect(heap.size()).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('clear allows new inserts after clearing', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.clear()
    heap.push(10, 100)
    expect(heap.size()).toBe(1)
    expect(heap.get(10)).toBe(100)
  })

  it('keys returns all keys in heap', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    heap.push(15, 150)
    const keys = heap.keys()
    expect(keys).toContain(5)
    expect(keys).toContain(10)
    expect(keys).toContain(15)
    expect(keys.length).toBe(3)
  })

  it('values returns all values in heap', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    heap.push(15, 150)
    const values = heap.values()
    expect(values).toContain(50)
    expect(values).toContain(100)
    expect(values).toContain(150)
    expect(values.length).toBe(3)
  })

  it('entries returns all key-value pairs', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    const entries = heap.entries()
    expect(entries).toContainEqual([5, 50])
    expect(entries).toContainEqual([10, 100])
    expect(entries.length).toBe(2)
  })

  it('toArray returns all entries in sorted order', () => {
    const heap = new RadixHeap()
    heap.push(10, 100)
    heap.push(5, 50)
    heap.push(15, 150)
    const arr = heap.toArray()
    expect(arr[0]).toEqual({ key: 5, value: 50 })
    expect(arr[1]).toEqual({ key: 10, value: 100 })
    expect(arr[2]).toEqual({ key: 15, value: 150 })
    expect(heap.size()).toBe(3)
  })

  it('toArray does not modify original heap', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    const sizeBefore = heap.size()
    heap.toArray()
    expect(heap.size()).toBe(sizeBefore)
  })

  it('clone creates independent copy', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    const clone = heap.clone()
    clone.push(15, 150)
    expect(heap.size()).toBe(2)
    expect(clone.size()).toBe(3)
    expect(heap.get(15)).toBe(undefined)
    expect(clone.get(15)).toBe(150)
  })

  it('minKey returns minimum key', () => {
    const heap = new RadixHeap()
    heap.push(10, 100)
    heap.push(5, 50)
    heap.push(15, 150)
    expect(heap.minKey()).toBe(5)
  })

  it('minKey returns undefined for empty heap', () => {
    const heap = new RadixHeap()
    expect(heap.minKey()).toBe(undefined)
  })

  it('maxKey returns maximum key', () => {
    const heap = new RadixHeap()
    heap.push(10, 100)
    heap.push(5, 50)
    heap.push(15, 150)
    expect(heap.maxKey()).toBe(15)
  })

  it('maxKey returns undefined for empty heap', () => {
    const heap = new RadixHeap()
    expect(heap.maxKey()).toBe(undefined)
  })

  it('drain removes and returns all elements in sorted order', () => {
    const heap = new RadixHeap()
    heap.push(10, 100)
    heap.push(5, 50)
    heap.push(15, 150)
    const drained = heap.drain()
    expect(drained[0]).toEqual({ key: 5, value: 50 })
    expect(drained[1]).toEqual({ key: 10, value: 100 })
    expect(drained[2]).toEqual({ key: 15, value: 150 })
    expect(heap.isEmpty()).toBe(true)
  })

  it('fromEntries creates heap from entries', () => {
    const entries: [number, number][] = [[5, 50], [10, 100], [15, 150]]
    const heap = RadixHeap.fromEntries(entries)
    expect(heap.size()).toBe(3)
    expect(heap.get(5)).toBe(50)
    expect(heap.get(10)).toBe(100)
    expect(heap.get(15)).toBe(150)
  })

  it('fromEntries with empty array creates empty heap', () => {
    const heap = RadixHeap.fromEntries([])
    expect(heap.size()).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles single element', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    expect(heap.size()).toBe(1)
    expect(heap.peek()).toEqual({ key: 5, value: 50 })
    expect(heap.pop()).toEqual({ key: 5, value: 50 })
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles monotone keys', () => {
    const heap = new RadixHeap()
    heap.push(1, 10)
    heap.push(2, 20)
    heap.push(3, 30)
    heap.push(4, 40)
    expect(heap.pop()).toEqual({ key: 1, value: 10 })
    expect(heap.pop()).toEqual({ key: 2, value: 20 })
    expect(heap.pop()).toEqual({ key: 3, value: 30 })
    expect(heap.pop()).toEqual({ key: 4, value: 40 })
  })

  it('handles large keys', () => {
    const heap = new RadixHeap()
    heap.push(1000000, 100)
    heap.push(500000, 50)
    heap.push(2000000, 200)
    expect(heap.pop()).toEqual({ key: 500000, value: 50 })
    expect(heap.pop()).toEqual({ key: 1000000, value: 100 })
    expect(heap.pop()).toEqual({ key: 2000000, value: 200 })
  })

  it('handles sequential insertion', () => {
    const heap = new RadixHeap()
    for (let i = 1; i <= 100; i++) {
      heap.push(i * 10, i)
    }
    expect(heap.size()).toBe(100)
    let expectedKey = 10
    for (let i = 0; i < 100; i++) {
      const result = heap.pop()
      expect(result?.key).toBe(expectedKey)
      expectedKey += 10
    }
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles zero key', () => {
    const heap = new RadixHeap()
    heap.push(0, 0)
    expect(heap.size()).toBe(1)
    expect(heap.get(0)).toBe(0)
  })

  it('handles duplicate keys with different values', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    heap.push(5, 55)
    expect(heap.size()).toBe(3)
  })

  it('update reflects in toArray', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    heap.update(10, 200)
    const arr = heap.toArray()
    const updatedEntry = arr.find(e => e.key === 10)
    expect(updatedEntry?.value).toBe(200)
  })

  it('clone preserves update changes', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.update(5, 100)
    const clone = heap.clone()
    expect(clone.get(5)).toBe(100)
  })

  it('peek after pop returns next minimum', () => {
    const heap = new RadixHeap()
    heap.push(10, 100)
    heap.push(5, 50)
    heap.push(15, 150)
    heap.pop()
    expect(heap.peek()).toEqual({ key: 10, value: 100 })
  })

  it('size after drain is zero', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(10, 100)
    heap.drain()
    expect(heap.size()).toBe(0)
  })

  it('maxKey on single element returns that element', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    expect(heap.maxKey()).toBe(5)
  })

  it('minKey on single element returns that element', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    expect(heap.minKey()).toBe(5)
  })

  it('handles same key monotone insertion', () => {
    const heap = new RadixHeap()
    heap.push(5, 50)
    heap.push(5, 55)
    heap.push(5, 60)
    expect(heap.size()).toBe(3)
  })
})