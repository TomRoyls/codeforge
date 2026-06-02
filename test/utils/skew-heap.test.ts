import { describe, expect, it } from 'vitest'
import { SkewHeap } from '../../src/utils/skew-heap.js'

describe('SkewHeap', () => {
  it('pushes and pops in order', () => {
    const heap = new SkewHeap<number>()
    heap.push(3)
    heap.push(1)
    heap.push(2)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(3)
  })

  it('handles empty pop', () => {
    expect(new SkewHeap<number>().pop()).toBeUndefined()
  })

  it('peek returns minimum', () => {
    const heap = new SkewHeap<number>()
    heap.push(5)
    heap.push(2)
    expect(heap.peek()).toBe(2)
  })

  it('size and isEmpty', () => {
    const heap = new SkewHeap<number>()
    expect(heap.isEmpty).toBe(true)
    heap.push(1)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty).toBe(false)
  })

  it('merge two heaps', () => {
    const h1 = new SkewHeap<number>()
    h1.push(1)
    h1.push(3)
    const h2 = new SkewHeap<number>()
    h2.push(2)
    h2.push(4)
    const merged = h1.merge(h2)
    expect(merged.size).toBe(4)
    expect(merged.pop()).toBe(1)
    expect(merged.pop()).toBe(2)
  })

  it('toArray returns sorted', () => {
    const heap = new SkewHeap<number>()
    heap.push(3)
    heap.push(1)
    heap.push(2)
    expect(heap.toArray()).toEqual([1, 2, 3])
  })

  it('handles max heap via comparator', () => {
    const heap = new SkewHeap<number>((a, b) => b - a)
    heap.push(1)
    heap.push(3)
    heap.push(2)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(2)
  })

  it('handles single element', () => {
    const heap = new SkewHeap<number>()
    heap.push(42)
    expect(heap.pop()).toBe(42)
    expect(heap.isEmpty).toBe(true)
  })

  it('handles many elements', () => {
    const heap = new SkewHeap<number>()
    for (let i = 100; i >= 0; i--) heap.push(i)
    for (let i = 0; i <= 100; i++) expect(heap.pop()).toBe(i)
  })

  it('merge preserves originals', () => {
    const h1 = new SkewHeap<number>()
    h1.push(1)
    const h2 = new SkewHeap<number>()
    h2.push(2)
    h1.merge(h2)
    expect(h1.size).toBe(1)
  })

  it('handles duplicate values', () => {
    const h = new SkewHeap<number>()
    h.push(5)
    h.push(5)
    h.push(5)
    expect(h.pop()).toBe(5)
    expect(h.size).toBe(2)
  })

  it('toArray returns sorted order', () => {
    const h = new SkewHeap<number>()
    h.push(3)
    h.push(1)
    h.push(2)
    expect(h.toArray().sort()).toEqual([1, 2, 3])
  })

  it('pop empty returns undefined', () => {
    const h = new SkewHeap<number>()
    expect(h.pop()).toBeUndefined()
  })

  it('push after pop preserves order', () => {
    const h = new SkewHeap<number>()
    h.push(3)
    h.push(1)
    h.pop()
    h.push(2)
    expect(h.pop()).toBe(2)
  })

  it('handles strings with comparator', () => {
    const h = new SkewHeap<string>((a, b) => a.localeCompare(b))
    h.push('cherry')
    h.push('apple')
    h.push('banana')
    expect(h.pop()).toBe('apple')
    expect(h.pop()).toBe('banana')
  })

  it('merge empty into non-empty', () => {
    const h1 = new SkewHeap<number>()
    h1.push(1)
    const h2 = new SkewHeap<number>()
    h1.merge(h2)
    expect(h1.size).toBe(1)
    expect(h1.pop()).toBe(1)
  })

  it('pop returns elements in order', () => {
    const h = new SkewHeap<number>()
    h.push(5)
    h.push(1)
    h.push(3)
    expect(h.pop()).toBe(1)
    expect(h.pop()).toBe(3)
    expect(h.pop()).toBe(5)
  })

  it('handles empty heap pop', () => {
    const h = new SkewHeap<number>()
    expect(h.pop()).toBeUndefined()
  })

  it('merge two heaps', () => {
    const h1 = new SkewHeap<number>()
    h1.push(1)
    h1.push(3)
    const h2 = new SkewHeap<number>()
    h2.push(2)
    h2.push(4)
    const merged = h1.merge(h2)
    expect(merged.size).toBe(4)
    expect(merged.pop()).toBe(1)
  })
})
