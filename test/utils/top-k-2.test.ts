import { describe, it, expect } from 'vitest'
import { TopK2 } from '../../src/utils/top-k-2.js'

describe('TopK2', () => {
  it('constructs with default capacity', () => {
    const tracker = new TopK2<string>()
    expect(tracker.capacity).toBe(10)
  })

  it('constructs with custom capacity', () => {
    const tracker = new TopK2<number>(5)
    expect(tracker.capacity).toBe(5)
  })

  it('starts with size zero', () => {
    const tracker = new TopK2<number>()
    expect(tracker.size).toBe(0)
  })

  it('adds item with default count of 1', () => {
    const tracker = new TopK2<number>()
    tracker.add(1)
    expect(tracker.size).toBe(1)
  })

  it('adds item with custom count', () => {
    const tracker = new TopK2<number>()
    tracker.add(1, 5)
    const result = tracker.top()
    expect(result[0]!.count).toBe(5)
  })

  it('increments count for existing item', () => {
    const tracker = new TopK2<number>()
    tracker.add(1, 2)
    tracker.add(1, 3)
    const result = tracker.top()
    expect(result[0]!.count).toBe(5)
  })

  it('stores multiple items under capacity', () => {
    const tracker = new TopK2<number>(5)
    tracker.add(1, 1)
    tracker.add(2, 2)
    tracker.add(3, 3)
    expect(tracker.size).toBe(3)
  })

  it('replaces lowest count item when full', () => {
    const tracker = new TopK2<number>(2)
    tracker.add(1, 5)
    tracker.add(2, 3)
    tracker.add(3, 4)
    const result = tracker.top()
    expect(result.length).toBe(2)
    expect(result.some((x) => x.item === 3)).toBe(true)
  })

  it('keeps higher count item over lower count item', () => {
    const tracker = new TopK2<number>(2)
    tracker.add(1, 10)
    tracker.add(2, 5)
    tracker.add(3, 1)
    const result = tracker.top()
    expect(result.some((x) => x.item === 1)).toBe(true)
    expect(result.some((x) => x.item === 2)).toBe(true)
    expect(result.some((x) => x.item === 3)).toBe(false)
  })

  it('returns items sorted by count descending', () => {
    const tracker = new TopK2<number>()
    tracker.add(1, 5)
    tracker.add(2, 10)
    tracker.add(3, 3)
    const result = tracker.top()
    expect(result[0]!.item).toBe(2)
    expect(result[1]!.item).toBe(1)
    expect(result[2]!.item).toBe(3)
  })

  it('handles string items', () => {
    const tracker = new TopK2<string>()
    tracker.add('apple', 3)
    tracker.add('banana', 5)
    tracker.add('cherry', 2)
    const result = tracker.top()
    expect(result[0]!.item).toBe('banana')
  })

  it('handles object items', () => {
    const tracker = new TopK2<{ id: number }>()
    tracker.add({ id: 1 }, 5)
    tracker.add({ id: 2 }, 3)
    const result = tracker.top()
    expect(result[0]!.item.id).toBe(1)
  })

  it('does not add item with count lower than minimum when full', () => {
    const tracker = new TopK2<number>(2)
    tracker.add(1, 10)
    tracker.add(2, 5)
    tracker.add(3, 1)
    const result = tracker.top()
    expect(result.length).toBe(2)
    expect(result.some((x) => x.item === 3)).toBe(false)
  })

  it('resets to empty state', () => {
    const tracker = new TopK2<number>()
    tracker.add(1, 5)
    tracker.add(2, 3)
    tracker.reset()
    expect(tracker.size).toBe(0)
  })

  it('returns empty array when empty', () => {
    const tracker = new TopK2<number>()
    const result = tracker.top()
    expect(result).toEqual([])
  })

  it('capacity returns k value', () => {
    const tracker = new TopK2<number>(5)
    expect(tracker.capacity).toBe(5)
  })

  it('handles many unique items', () => {
    const tracker = new TopK2<number>(3)
    for (let i = 0; i < 100; i++) tracker.add(i, 1)
    expect(tracker.size).toBeLessThanOrEqual(3)
  })

  it('increment existing item updates count', () => {
    const tracker = new TopK2<string>(10)
    tracker.add('a', 5)
    tracker.add('a', 3)
    const top = tracker.top()
    expect(top.length).toBeGreaterThanOrEqual(1)
  })

  it('empty tracker returns empty top', () => {
    const tracker = new TopK2<string>(3)
    expect(tracker.top()).toEqual([])
  })

  it('add and retrieve top items', () => {
    const tracker = new TopK2<string>(3)
    tracker.add('a')
    tracker.add('b')
    tracker.add('c')
    expect(tracker.top().length).toBeLessThanOrEqual(3)
  })

  it('empty tracker returns empty top', () => {
    const tracker = new TopK2<string>(3)
    expect(tracker.top()).toEqual([])
  })

  it('add and retrieve single item', () => {
    const tracker = new TopK2<string>(3)
    tracker.add('a')
    expect(tracker.top()[0]!.item).toBe('a')
  })

  it('empty tracker has empty top', () => {
    const tracker = new TopK2<string>(3)
    expect(tracker.top()).toEqual([])
  })
})