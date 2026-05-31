import { describe, expect, it } from 'vitest'
import { PairHeap } from '../../src/utils/pair-heap.js'

describe('PairHeap', () => {
  it('push and pop in order', () => {
    const h = new PairHeap<number>()
    h.push(3)
    h.push(1)
    h.push(2)
    expect(h.pop()).toBe(1)
    expect(h.pop()).toBe(2)
    expect(h.pop()).toBe(3)
  })

  it('peek returns min without removing', () => {
    const h = new PairHeap<number>()
    h.push(5)
    h.push(3)
    expect(h.peek()).toBe(3)
    expect(h.size).toBe(2)
  })

  it('handles empty pop', () => {
    const h = new PairHeap<number>()
    expect(h.pop()).toBeUndefined()
    expect(h.peek()).toBeUndefined()
  })

  it('tracks size', () => {
    const h = new PairHeap<number>()
    expect(h.isEmpty).toBe(true)
    h.push(1)
    expect(h.size).toBe(1)
    expect(h.isEmpty).toBe(false)
  })

  it('handles many elements', () => {
    const h = new PairHeap<number>()
    for (let i = 100; i >= 0; i--) h.push(i)
    for (let i = 0; i <= 100; i++) expect(h.pop()).toBe(i)
  })

  it('supports max heap via comparator', () => {
    const h = new PairHeap<number>((a, b) => b - a)
    h.push(1)
    h.push(3)
    h.push(2)
    expect(h.pop()).toBe(3)
    expect(h.pop()).toBe(2)
    expect(h.pop()).toBe(1)
  })

  it('handles duplicates', () => {
    const h = new PairHeap<number>()
    h.push(5)
    h.push(5)
    h.push(5)
    expect(h.pop()).toBe(5)
    expect(h.size).toBe(2)
  })

  it('handles strings', () => {
    const h = new PairHeap<string>((a, b) => a.localeCompare(b))
    h.push('banana')
    h.push('apple')
    h.push('cherry')
    expect(h.pop()).toBe('apple')
  })

  it('pop decreases size', () => {
    const h = new PairHeap<number>()
    h.push(1)
    h.push(2)
    h.pop()
    expect(h.size).toBe(1)
  })

  it('single element push pop', () => {
    const h = new PairHeap<number>()
    h.push(42)
    expect(h.pop()).toBe(42)
    expect(h.size).toBe(0)
  })
})
