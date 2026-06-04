import { describe, it, expect } from 'vitest'
import { weightedIntervalSchedule, greedyIntervalSchedule } from '../../src/utils/interval-scheduler.js'

describe('weightedIntervalSchedule', () => {
  it('returns empty for empty input', () => {
    const result = weightedIntervalSchedule([])
    expect(result.selected).toEqual([])
    expect(result.totalWeight).toBe(0)
  })

  it('selects single interval', () => {
    const intervals = [{ start: 0, end: 5, weight: 10 }]
    const result = weightedIntervalSchedule(intervals)
    expect(result.selected).toEqual(intervals)
    expect(result.totalWeight).toBe(10)
  })

  it('selects non-overlapping intervals', () => {
    const intervals = [
      { start: 0, end: 3, weight: 5 },
      { start: 3, end: 6, weight: 7 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(12)
    expect(result.selected.length).toBe(2)
  })

  it('skips overlapping for better weight', () => {
    const intervals = [
      { start: 0, end: 5, weight: 10 },
      { start: 1, end: 3, weight: 6 },
      { start: 4, end: 6, weight: 7 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(13)
  })

  it('handles three non-overlapping intervals', () => {
    const intervals = [
      { start: 0, end: 2, weight: 3 },
      { start: 2, end: 4, weight: 4 },
      { start: 4, end: 6, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(12)
    expect(result.selected.length).toBe(3)
  })

  it('picks higher weight over more intervals', () => {
    const intervals = [
      { start: 0, end: 10, weight: 20 },
      { start: 0, end: 3, weight: 5 },
      { start: 3, end: 6, weight: 5 },
      { start: 6, end: 9, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(20)
  })

  it('handles intervals with zero weight', () => {
    const intervals = [
      { start: 0, end: 2, weight: 0 },
      { start: 2, end: 4, weight: 5 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(5)
  })

  it('handles all equal intervals', () => {
    const intervals = [
      { start: 0, end: 5, weight: 3 },
      { start: 0, end: 5, weight: 3 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(3)
  })
})

describe('greedyIntervalSchedule', () => {
  it('returns empty for empty input', () => {
    expect(greedyIntervalSchedule([])).toEqual([])
  })

  it('selects single interval', () => {
    const intervals = [{ start: 0, end: 5 }]
    expect(greedyIntervalSchedule(intervals)).toEqual(intervals)
  })

  it('selects maximum non-overlapping intervals', () => {
    const intervals = [
      { start: 0, end: 3 },
      { start: 2, end: 5 },
      { start: 4, end: 7 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual({ start: 0, end: 3 })
    expect(result[1]).toEqual({ start: 4, end: 7 })
  })

  it('selects all non-overlapping', () => {
    const intervals = [
      { start: 0, end: 1 },
      { start: 1, end: 2 },
      { start: 2, end: 3 },
    ]
    expect(greedyIntervalSchedule(intervals).length).toBe(3)
  })

  it('selects from overlapping set', () => {
    const intervals = [
      { start: 0, end: 6 },
      { start: 1, end: 4 },
      { start: 3, end: 5 },
      { start: 5, end: 7 },
      { start: 8, end: 9 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(3)
  })

  it('greedy handles single element', () => {
    const intervals = [{ start: 5, end: 10 }]
    expect(greedyIntervalSchedule(intervals)).toEqual(intervals)
  })

  it('greedy handles identical endpoints', () => {
    const intervals = [
      { start: 0, end: 2 },
      { start: 2, end: 4 },
      { start: 2, end: 5 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
  })

  it('weighted handles large weight difference', () => {
    const intervals = [
      { start: 0, end: 100, weight: 1000 },
      { start: 0, end: 1, weight: 1 },
      { start: 1, end: 2, weight: 1 },
    ]
    const result = weightedIntervalSchedule(intervals)
    expect(result.totalWeight).toBe(1000)
  })

  it('greedy handles empty input', () => {
    expect(greedyIntervalSchedule([])).toEqual([])
  })

  it('weighted handles empty input', () => {
    const result = weightedIntervalSchedule([])
    expect(result.selected).toEqual([])
    expect(result.totalWeight).toBe(0)
  })

  it('greedy selects earliest finishing', () => {
    const intervals = [
      { start: 0, end: 3 },
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ]
    const result = greedyIntervalSchedule(intervals)
    expect(result.length).toBe(2)
  })

  it('no intervals returns empty', () => {
    const result = greedyIntervalSchedule([])
    expect(result).toEqual([])
  })

  it('single interval returns it', () => {
    const result = greedyIntervalSchedule([{ start: 0, end: 5 }])
    expect(result.length).toBe(1)
  })

  it('overlapping picks earliest end', () => {
    const result = greedyIntervalSchedule([
      { start: 0, end: 10 },
      { start: 5, end: 7 },
    ])
    expect(result.length).toBe(1)
    expect(result[0]!.end).toBe(7)
  })

  it('greedy with empty returns empty', () => {
    expect(greedyIntervalSchedule([])).toEqual([])
  })

  it('single interval returns itself', () => {
    expect(greedyIntervalSchedule([{ start: 0, end: 5 }])).toEqual([{ start: 0, end: 5 }])
  })
})
