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

  it('handles zero count item', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, 0)
    const result = tracker.top()
    expect(result.length).toBe(1)
    expect(result[0]!.count).toBe(0)
  })

  it('handles k equal to 1', () => {
    const tracker = new TopK2<number>(1)
    tracker.add(1, 5)
    tracker.add(2, 3)
    const result = tracker.top()
    expect(result.length).toBe(1)
    expect(result[0]!.item).toBe(1)
  })

  it('handles items with same count', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, 5)
    tracker.add(2, 5)
    tracker.add(3, 5)
    const result = tracker.top()
    expect(result.length).toBe(3)
    expect(result.every((x) => x.count === 5)).toBe(true)
  })

  it('handles array items', () => {
    const tracker = new TopK2<number[]>(3)
    tracker.add([1, 2], 5)
    tracker.add([3, 4], 3)
    const result = tracker.top()
    expect(result[0]!.item).toEqual([1, 2])
  })

  it('handles null item', () => {
    const tracker = new TopK2<null>(3)
    tracker.add(null, 5)
    const result = tracker.top()
    expect(result[0]!.item).toBe(null)
  })

  it('handles undefined item', () => {
    const tracker = new TopK2<undefined>(3)
    tracker.add(undefined, 5)
    const result = tracker.top()
    expect(result[0]!.item).toBe(undefined)
  })

  it('handles very large count values', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, Number.MAX_SAFE_INTEGER)
    const result = tracker.top()
    expect(result[0]!.count).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('handles negative count items', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, -5)
    const result = tracker.top()
    expect(result[0]!.count).toBe(-5)
  })

  it('handles complex nested objects', () => {
    const tracker = new TopK2<{ nested: { deep: { value: number } } }>(3)
    tracker.add({ nested: { deep: { value: 42 } } }, 5)
    const result = tracker.top()
    expect(result[0]!.item.nested.deep.value).toBe(42)
  })

  it('handles empty object items', () => {
    const tracker = new TopK2<{}>(3)
    tracker.add({}, 5)
    const result = tracker.top()
    expect(result.length).toBe(1)
  })

  it('handles boolean items', () => {
    const tracker = new TopK2<boolean>(3)
    tracker.add(true, 5)
    tracker.add(false, 3)
    const result = tracker.top()
    expect(result.length).toBe(2)
  })

  it('handles date items', () => {
    const tracker = new TopK2<Date>(3)
    const date1 = new Date('2024-01-01')
    const date2 = new Date('2024-01-02')
    tracker.add(date1, 5)
    tracker.add(date2, 3)
    const result = tracker.top()
    expect(result.length).toBe(2)
  })

  it('handles multiple resets', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, 5)
    tracker.reset()
    tracker.add(2, 3)
    tracker.reset()
    expect(tracker.size).toBe(0)
  })

  it('does not replace item when count equals minimum at capacity', () => {
    const tracker = new TopK2<number>(2)
    tracker.add(1, 5)
    tracker.add(2, 5)
    tracker.add(3, 5)
    const result = tracker.top()
    expect(result.length).toBe(2)
    expect(result.some((x) => x.item === 3)).toBe(false)
  })

  it('handles adding same item multiple times before capacity', () => {
    const tracker = new TopK2<number>(5)
    tracker.add(1, 1)
    tracker.add(1, 1)
    tracker.add(1, 1)
    const result = tracker.top()
    expect(result.length).toBe(1)
    expect(result[0]!.count).toBe(3)
  })

  it('handles capacity of 100', () => {
    const tracker = new TopK2<number>(100)
    for (let i = 0; i < 50; i++) {
      tracker.add(i, 1)
    }
    expect(tracker.size).toBe(50)
  })

  it('handles mixed positive and negative counts', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, 10)
    tracker.add(2, -5)
    tracker.add(3, 0)
    const result = tracker.top()
    expect(result.length).toBe(3)
  })

  it('handles adding with fractional counts', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, 5.5)
    tracker.add(2, 3.7)
    const result = tracker.top()
    expect(result[0]!.count).toBe(5.5)
  })

  it('handles items that JSON.stringify the same way', () => {
    const tracker = new TopK2<{ x: number }>(3)
    tracker.add({ x: 1 }, 5)
    tracker.add({ x: 1 }, 3)
    const result = tracker.top()
    expect(result.length).toBe(1)
    expect(result[0]!.count).toBe(8)
  })

  it('handles symbol items', () => {
    const tracker = new TopK2<symbol>(3)
    const sym1 = Symbol('test1')
    tracker.add(sym1, 5)
    const result = tracker.top()
    expect(result.length).toBe(1)
  })

  it('handles very large k value', () => {
    const tracker = new TopK2<number>(10000)
    tracker.add(1, 5)
    expect(tracker.capacity).toBe(10000)
  })

  it('maintains capacity after reset', () => {
    const tracker = new TopK2<number>(5)
    tracker.add(1, 5)
    tracker.reset()
    expect(tracker.capacity).toBe(5)
  })

  it('handles NaN count', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, NaN)
    const result = tracker.top()
    expect(result.length).toBe(1)
    expect(result[0]!.count).toBeNaN()
  })

  it('handles Infinity count', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, Infinity)
    const result = tracker.top()
    expect(result[0]!.count).toBe(Infinity)
  })

  it('handles -Infinity count', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, -Infinity)
    const result = tracker.top()
    expect(result[0]!.count).toBe(-Infinity)
  })

  it('handles items that are numbers with same value but different objects', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, 5)
    tracker.add(1, 3)
    const result = tracker.top()
    expect(result.length).toBe(1)
    expect(result[0]!.count).toBe(8)
  })

  it('handles adding zero after some items exist', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, 5)
    tracker.add(2, 0)
    const result = tracker.top()
    expect(result.length).toBe(2)
    expect(result.some((x) => x.item === 2 && x.count === 0)).toBe(true)
  })

  it('replaces item when new count strictly greater than min count', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, 2)
    tracker.add(2, 5)
    tracker.add(3, 3)
    tracker.add(4, 4)
    const result = tracker.top()
    expect(result.length).toBe(3)
    expect(result.some((x) => x.item === 4)).toBe(true)
    expect(result.some((x) => x.item === 1)).toBe(false)
  })

  it('adding duplicate with zero count increments correctly', () => {
    const tracker = new TopK2<number>(3)
    tracker.add(1, 5)
    tracker.add(1, 0)
    const result = tracker.top()
    expect(result.length).toBe(1)
    expect(result[0]!.count).toBe(5)
  })

  it('reset then add returns expected size', () => {
    const tracker = new TopK2<number>(5)
    tracker.add(1, 10)
    tracker.add(2, 5)
    tracker.reset()
    tracker.add(3, 8)
    tracker.add(4, 3)
    expect(tracker.size).toBe(2)
  })

  it('maintains top order after multiple increments', () => {
    const tracker = new TopK2<number>(5)
    tracker.add(1, 10)
    tracker.add(2, 5)
    tracker.add(2, 10)
    const result = tracker.top()
    expect(result[0]!.item).toBe(2)
    expect(result[0]!.count).toBe(15)
  })

  it('handles very small k value (k=2)', () => {
    const tracker = new TopK2<number>(2)
    tracker.add(1, 1)
    tracker.add(2, 2)
    tracker.add(3, 3)
    tracker.add(4, 4)
    const result = tracker.top()
    expect(result.length).toBe(2)
    expect(result[0]!.count).toBe(4)
    expect(result[1]!.count).toBe(3)
  })
})