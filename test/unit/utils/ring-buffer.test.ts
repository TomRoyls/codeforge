import { describe, expect, it } from 'vitest'
import { RingBuffer } from '../../../src/utils/ring-buffer.js'

describe('RingBuffer', () => {
  it('should create a RingBuffer with number capacity', () => {
    const buffer = new RingBuffer<number>(5)
    expect(buffer.capacity).toBe(5)
    expect(buffer.size).toBe(0)
    expect(buffer.isEmpty()).toBe(true)
    expect(buffer.isFull()).toBe(false)
  })

  it('should create a RingBuffer with options', () => {
    const buffer = new RingBuffer<number>({ capacity: 10 })
    expect(buffer.capacity).toBe(10)
    expect(buffer.size).toBe(0)
  })

  it('should throw error for capacity < 1', () => {
    expect(() => new RingBuffer<number>(0)).toThrow(RangeError)
    expect(() => new RingBuffer<number>(-1)).toThrow(RangeError)
  })

  it('should push values', () => {
    const buffer = new RingBuffer<number>(3)
    expect(buffer.push(1)).toBe(true)
    expect(buffer.push(2)).toBe(true)
    expect(buffer.push(3)).toBe(true)
    expect(buffer.size).toBe(3)
  })

  it('should pop values', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    expect(buffer.pop()).toBe(3)
    expect(buffer.pop()).toBe(2)
    expect(buffer.size).toBe(1)
  })

  it('should shift values', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    expect(buffer.shift()).toBe(1)
    expect(buffer.shift()).toBe(2)
    expect(buffer.size).toBe(1)
  })

  it('should peek at first element', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    expect(buffer.peek()).toBe(1)
    expect(buffer.size).toBe(2)
  })

  it('should peekLast at last element', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    expect(buffer.peekLast()).toBe(2)
    expect(buffer.size).toBe(2)
  })

  it('should return undefined for peek on empty buffer', () => {
    const buffer = new RingBuffer<number>(3)
    expect(buffer.peek()).toBeUndefined()
    expect(buffer.peekLast()).toBeUndefined()
  })

  it('should handle push and pop order', () => {
    const buffer = new RingBuffer<number>(5)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    expect(buffer.pop()).toBe(3)
    expect(buffer.pop()).toBe(2)
    expect(buffer.pop()).toBe(1)
  })

  it('should handle overwrite mode by default', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    expect(buffer.push(4)).toBe(true)
    expect(buffer.size).toBe(3)
    expect(buffer.shift()).toBe(2)
  })

  it('should handle non-overwrite mode', () => {
    const buffer = new RingBuffer<number>({ capacity: 3, allowOverwrite: false })
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    expect(buffer.push(4)).toBe(false)
    expect(buffer.size).toBe(3)
    expect(buffer.shift()).toBe(1)
  })

  it('should return undefined for pop on empty buffer', () => {
    const buffer = new RingBuffer<number>(3)
    expect(buffer.pop()).toBeUndefined()
    expect(buffer.shift()).toBeUndefined()
  })

  it('should check isEmpty correctly', () => {
    const buffer = new RingBuffer<number>(3)
    expect(buffer.isEmpty()).toBe(true)
    buffer.push(1)
    expect(buffer.isEmpty()).toBe(false)
  })

  it('should check isFull correctly', () => {
    const buffer = new RingBuffer<number>(3)
    expect(buffer.isFull()).toBe(false)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    expect(buffer.isFull()).toBe(true)
  })

  it('should clear all values', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    buffer.clear()
    expect(buffer.size).toBe(0)
    expect(buffer.isEmpty()).toBe(true)
    expect(buffer.peek()).toBeUndefined()
  })

  it('should convert to array', () => {
    const buffer = new RingBuffer<number>(5)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    const array = buffer.toArray()
    expect(array).toEqual([1, 2, 3])
  })

  it('should get element by index', () => {
    const buffer = new RingBuffer<number>(5)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    expect(buffer.get(0)).toBe(1)
    expect(buffer.get(1)).toBe(2)
    expect(buffer.get(2)).toBe(3)
  })

  it('should return undefined for out of range index', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    expect(buffer.get(-1)).toBeUndefined()
    expect(buffer.get(5)).toBeUndefined()
  })

  it('should wrap correctly after overwrites', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    buffer.push(4)
    buffer.push(5)
    const array = buffer.toArray()
    expect(array).toEqual([3, 4, 5])
  })

  it('should handle wrap with toArray', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    buffer.push(4)
    const array = buffer.toArray()
    expect(array).toEqual([2, 3, 4])
  })

  it('should iterate with forEach', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    const results: number[] = []
    buffer.forEach((value, index) => {
      results.push(value)
    })
    expect(results).toEqual([1, 2, 3])
  })

  it('should be iterable with for...of', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    const results: number[] = []
    for (const value of buffer) {
      results.push(value)
    }
    expect(results).toEqual([1, 2, 3])
  })

  it('should create from array with fromArray', () => {
    const buffer = RingBuffer.fromArray([1, 2, 3, 4, 5])
    expect(buffer.capacity).toBe(5)
    expect(buffer.size).toBe(5)
    expect(buffer.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('should create from array with custom capacity', () => {
    const buffer = RingBuffer.fromArray([1, 2, 3, 4, 5], { capacity: 10, allowOverwrite: false })
    expect(buffer.capacity).toBe(10)
    expect(buffer.size).toBe(5)
  })

  it('should handle string values', () => {
    const buffer = new RingBuffer<string>(3)
    buffer.push('a')
    buffer.push('b')
    buffer.push('c')
    expect(buffer.toArray()).toEqual(['a', 'b', 'c'])
  })

  it('should handle object values', () => {
    const buffer = new RingBuffer<{ id: number }>(3)
    buffer.push({ id: 1 })
    buffer.push({ id: 2 })
    expect(buffer.get(0)?.id).toBe(1)
  })

  it('should handle mixed push and shift operations', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.shift()
    buffer.push(3)
    buffer.push(4)
    expect(buffer.toArray()).toEqual([2, 3, 4])
  })

  it('should handle capacity of 1', () => {
    const buffer = new RingBuffer<number>(1)
    expect(buffer.push(1)).toBe(true)
    expect(buffer.isFull()).toBe(true)
    expect(buffer.push(2)).toBe(true)
    expect(buffer.peek()).toBe(2)
  })
})