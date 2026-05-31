import { describe, expect, it } from 'vitest'
import { RadixHeap } from '../../src/utils/radix-heap.js'

describe('RadixHeap', () => {
  it('push and pop in order', () => {
    const h = new RadixHeap()
    h.push(5)
    h.push(3)
    h.push(7)
    h.push(1)
    expect(h.pop()).toBe(1)
    expect(h.pop()).toBe(3)
    expect(h.pop()).toBe(5)
    expect(h.pop()).toBe(7)
  })

  it('handles duplicate values', () => {
    const h = new RadixHeap()
    h.push(3)
    h.push(3)
    expect(h.pop()).toBe(3)
    expect(h.pop()).toBe(3)
  })

  it('tracks size', () => {
    const h = new RadixHeap()
    expect(h.size).toBe(0)
    expect(h.isEmpty).toBe(true)
    h.push(1)
    expect(h.size).toBe(1)
  })

  it('pop empty returns undefined', () => {
    const h = new RadixHeap()
    expect(h.pop()).toBeUndefined()
  })

  it('handles single element', () => {
    const h = new RadixHeap()
    h.push(42)
    expect(h.pop()).toBe(42)
  })

  it('handles large range', () => {
    const h = new RadixHeap()
    h.push(1000000)
    h.push(1)
    h.push(500000)
    expect(h.pop()).toBe(1)
    expect(h.pop()).toBe(500000)
    expect(h.pop()).toBe(1000000)
  })

  it('handles already sorted input', () => {
    const h = new RadixHeap()
    for (let i = 0; i < 10; i++) h.push(i)
    for (let i = 0; i < 10; i++) expect(h.pop()).toBe(i)
  })

  it('handles reverse sorted input', () => {
    const h = new RadixHeap()
    for (let i = 9; i >= 0; i--) h.push(i)
    for (let i = 0; i < 10; i++) expect(h.pop()).toBe(i)
  })

  it('size decreases after pop', () => {
    const h = new RadixHeap()
    h.push(1)
    h.push(2)
    h.pop()
    expect(h.size).toBe(1)
  })

  it('handles zeros', () => {
    const h = new RadixHeap()
    h.push(0)
    h.push(0)
    expect(h.pop()).toBe(0)
  })

  it('handles sequential pushes', () => {
    const h = new RadixHeap()
    for (let i = 0; i < 50; i++) h.push(i)
    for (let i = 0; i < 50; i++) {
      expect(h.pop()).toBe(i)
    }
  })

  it('isEmpty after draining', () => {
    const h = new RadixHeap()
    h.push(1)
    h.pop()
    expect(h.isEmpty).toBe(true)
  })

  it('handles large values', () => {
    const h = new RadixHeap()
    h.push(1000000)
    h.push(1000001)
    expect(h.pop()).toBe(1000000)
    expect(h.pop()).toBe(1000001)
  })
})
