import { describe, expect, it } from 'vitest'
import { SlidingWindowMedian } from '../../../src/utils/sliding-window-median.js'

describe('SlidingWindowMedian', () => {
  it('constructor accepts valid windowSize', () => {
    const swm = new SlidingWindowMedian(5)
    expect(swm.size).toBe(0)
    expect(swm.totalPushed).toBe(0)
    expect(swm.isFull).toBe(false)
  })

  it('constructor throws for windowSize < 1', () => {
    expect(() => new SlidingWindowMedian(0)).toThrow(RangeError)
    expect(() => new SlidingWindowMedian(-1)).toThrow(RangeError)
  })

  it('constructor accepts windowSize = 1', () => {
    const swm = new SlidingWindowMedian(1)
    expect(swm.size).toBe(0)
    swm.push(5)
    expect(swm.size).toBe(1)
    expect(swm.median()).toBe(5)
  })

  it('median throws when no values added yet', () => {
    const swm = new SlidingWindowMedian(5)
    expect(() => swm.median()).toThrow('No values added yet')
  })

  it('min throws when no values added yet', () => {
    const swm = new SlidingWindowMedian(5)
    expect(() => swm.min()).toThrow('No values added yet')
  })

  it('max throws when no values added yet', () => {
    const swm = new SlidingWindowMedian(5)
    expect(() => swm.max()).toThrow('No values added yet')
  })

  it('mean throws when no values added yet', () => {
    const swm = new SlidingWindowMedian(5)
    expect(() => swm.mean()).toThrow('No values added yet')
  })

  it('percentile throws when no values added yet', () => {
    const swm = new SlidingWindowMedian(5)
    expect(() => swm.percentile(50)).toThrow('No values added yet')
  })

  it('percentile throws for value < 0', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    expect(() => swm.percentile(-1)).toThrow(RangeError)
  })

  it('percentile throws for value > 100', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    expect(() => swm.percentile(101)).toThrow(RangeError)
  })

  it('push updates size when window not full', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    expect(swm.size).toBe(1)
    swm.push(2)
    expect(swm.size).toBe(2)
    swm.push(3)
    expect(swm.size).toBe(3)
  })

  it('push keeps size constant when window is full', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    expect(swm.size).toBe(3)
    swm.push(4)
    expect(swm.size).toBe(3)
    swm.push(5)
    expect(swm.size).toBe(3)
  })

  it('push updates totalPushed', () => {
    const swm = new SlidingWindowMedian(3)
    expect(swm.totalPushed).toBe(0)
    swm.push(1)
    expect(swm.totalPushed).toBe(1)
    swm.push(2)
    expect(swm.totalPushed).toBe(2)
    swm.push(3)
    expect(swm.totalPushed).toBe(3)
    swm.push(4)
    expect(swm.totalPushed).toBe(4)
  })

  it('isFull returns false when window not full', () => {
    const swm = new SlidingWindowMedian(5)
    expect(swm.isFull).toBe(false)
    swm.push(1)
    expect(swm.isFull).toBe(false)
    swm.push(2)
    expect(swm.isFull).toBe(false)
  })

  it('isFull returns true when window is full', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    expect(swm.isFull).toBe(true)
    swm.push(4)
    expect(swm.isFull).toBe(true)
  })

  it('median returns exact middle for odd window size', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    swm.push(3)
    swm.push(5)
    swm.push(2)
    swm.push(4)
    expect(swm.median()).toBe(3)
  })

  it('median returns average of two middle values for even window size', () => {
    const swm = new SlidingWindowMedian(4)
    swm.push(1)
    swm.push(4)
    swm.push(2)
    swm.push(3)
    expect(swm.median()).toBe(2.5)
  })

  it('median with fewer values than windowSize (odd count)', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    swm.push(3)
    swm.push(5)
    expect(swm.median()).toBe(3)
  })

  it('median with fewer values than windowSize (even count)', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    swm.push(4)
    swm.push(2)
    swm.push(3)
    expect(swm.median()).toBe(2.5)
  })

  it('min returns smallest value', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(5)
    swm.push(2)
    swm.push(8)
    swm.push(1)
    swm.push(9)
    expect(swm.min()).toBe(1)
  })

  it('max returns largest value', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(5)
    swm.push(2)
    swm.push(8)
    swm.push(1)
    swm.push(9)
    expect(swm.max()).toBe(9)
  })

  it('mean calculates average correctly', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    expect(swm.mean()).toBe(2)
  })

  it('percentile(0) returns min', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    swm.push(5)
    swm.push(3)
    expect(swm.percentile(0)).toBe(1)
  })

  it('percentile(100) returns max', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    swm.push(5)
    swm.push(3)
    expect(swm.percentile(100)).toBe(5)
  })

  it('percentile(50) returns median for odd count', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    swm.push(3)
    swm.push(5)
    expect(swm.percentile(50)).toBe(3)
  })

  it('percentile(50) returns value at position for even count', () => {
    const swm = new SlidingWindowMedian(4)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    swm.push(4)
    expect(swm.percentile(50)).toBe(2)
  })

  it('sliding window correctly updates median as old values leave', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    expect(swm.median()).toBe(2)
    swm.push(4)
    expect(swm.median()).toBe(3)
    swm.push(5)
    expect(swm.median()).toBe(4)
  })

  it('toArray returns values in insertion order', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(5)
    swm.push(2)
    swm.push(8)
    swm.push(1)
    swm.push(9)
    expect(swm.toArray()).toEqual([5, 2, 8, 1, 9])
  })

  it('toArray returns recent values when window full and wrapped', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    swm.push(4)
    expect(swm.toArray()).toEqual([2, 3, 4])
    swm.push(5)
    expect(swm.toArray()).toEqual([3, 4, 5])
  })

  it('clear resets size and totalPushed', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    swm.clear()
    expect(swm.size).toBe(0)
    expect(swm.totalPushed).toBe(0)
    expect(swm.isFull).toBe(false)
  })

  it('clear allows median to throw again', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(1)
    swm.push(2)
    expect(swm.median()).toBe(1.5)
    swm.clear()
    expect(() => swm.median()).toThrow('No values added yet')
  })

  it('handles same values repeated', () => {
    const swm = new SlidingWindowMedian(5)
    swm.push(5)
    swm.push(5)
    swm.push(5)
    swm.push(5)
    swm.push(5)
    expect(swm.median()).toBe(5)
    expect(swm.min()).toBe(5)
    expect(swm.max()).toBe(5)
    expect(swm.mean()).toBe(5)
  })

  it('handles negative numbers', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(-5)
    swm.push(-2)
    swm.push(-8)
    expect(swm.min()).toBe(-8)
    expect(swm.max()).toBe(-2)
    expect(swm.median()).toBe(-5)
  })

  it('handles decimal values', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1.5)
    swm.push(2.5)
    swm.push(3.5)
    expect(swm.median()).toBe(2.5)
    expect(swm.mean()).toBe(2.5)
  })
})