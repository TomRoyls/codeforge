import { describe, it, expect } from 'vitest'
import { TimeSeriesBuffer } from '../../src/utils/time-series-buffer.js'

describe('TimeSeriesBuffer', () => {
  it('throws on maxSize < 1', () => {
    expect(() => new TimeSeriesBuffer(0)).toThrow(RangeError)
  })

  it('starts empty', () => {
    const tsb = new TimeSeriesBuffer()
    expect(tsb.isEmpty).toBe(true)
    expect(tsb.size).toBe(0)
  })

  it('push and size', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(1000, 10)
    tsb.push(2000, 20)
    expect(tsb.size).toBe(2)
    expect(tsb.isEmpty).toBe(false)
  })

  it('queryRange returns entries in range', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(100, 1)
    tsb.push(200, 2)
    tsb.push(300, 3)
    tsb.push(400, 4)
    tsb.push(500, 5)
    const result = tsb.queryRange(200, 400)
    expect(result).toEqual([
      { timestamp: 200, value: 2 },
      { timestamp: 300, value: 3 },
      { timestamp: 400, value: 4 },
    ])
  })

  it('queryRange returns empty for no matches', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(100, 1)
    tsb.push(200, 2)
    expect(tsb.queryRange(300, 400)).toEqual([])
  })

  it('stats for full buffer', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(100, 10)
    tsb.push(200, 20)
    tsb.push(300, 30)
    const s = tsb.stats()
    expect(s.count).toBe(3)
    expect(s.min).toBe(10)
    expect(s.max).toBe(30)
    expect(s.sum).toBe(60)
    expect(s.mean).toBeCloseTo(20)
  })

  it('stats for range', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(100, 10)
    tsb.push(200, 20)
    tsb.push(300, 30)
    tsb.push(400, 40)
    const s = tsb.stats(200, 300)
    expect(s.count).toBe(2)
    expect(s.sum).toBe(50)
  })

  it('stats for empty buffer', () => {
    const tsb = new TimeSeriesBuffer()
    const s = tsb.stats()
    expect(s.count).toBe(0)
    expect(s.mean).toBe(0)
  })

  it('earliest and latest', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(300, 30)
    tsb.push(100, 10)
    tsb.push(200, 20)
    expect(tsb.earliest()).toEqual({ timestamp: 100, value: 10 })
    expect(tsb.latest()).toEqual({ timestamp: 300, value: 30 })
  })

  it('earliest/latest on empty buffer return undefined', () => {
    const tsb = new TimeSeriesBuffer()
    expect(tsb.earliest()).toBeUndefined()
    expect(tsb.latest()).toBeUndefined()
  })

  it('handles out-of-order inserts', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(300, 3)
    tsb.push(100, 1)
    tsb.push(200, 2)
    const arr = tsb.toArray()
    expect(arr).toEqual([
      { timestamp: 100, value: 1 },
      { timestamp: 200, value: 2 },
      { timestamp: 300, value: 3 },
    ])
  })

  it('queryRange after out-of-order insert', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(300, 3)
    tsb.push(100, 1)
    tsb.push(200, 2)
    const result = tsb.queryRange(150, 250)
    expect(result).toEqual([{ timestamp: 200, value: 2 }])
  })

  it('clear empties buffer', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(100, 1)
    tsb.push(200, 2)
    tsb.clear()
    expect(tsb.isEmpty).toBe(true)
    expect(tsb.size).toBe(0)
  })

  it('maxSize limits entries (evicts oldest)', () => {
    const tsb = new TimeSeriesBuffer(3)
    tsb.push(100, 1)
    tsb.push(200, 2)
    tsb.push(300, 3)
    tsb.push(400, 4)
    expect(tsb.size).toBe(3)
    expect(tsb.earliest()).toEqual({ timestamp: 200, value: 2 })
    expect(tsb.latest()).toEqual({ timestamp: 400, value: 4 })
  })

  it('maxSize getter', () => {
    const tsb = new TimeSeriesBuffer(50)
    expect(tsb.maxSize).toBe(50)
  })

  it('default maxSize is Infinity', () => {
    const tsb = new TimeSeriesBuffer()
    expect(tsb.maxSize).toBe(Infinity)
  })

  it('stats with negative values', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(100, -5)
    tsb.push(200, 10)
    tsb.push(300, -3)
    const s = tsb.stats()
    expect(s.min).toBe(-5)
    expect(s.max).toBe(10)
    expect(s.sum).toBeCloseTo(2)
  })

  it('merge combines two buffers', () => {
    const tsb1 = new TimeSeriesBuffer()
    tsb1.push(100, 1)
    tsb1.push(300, 3)
    const tsb2 = new TimeSeriesBuffer()
    tsb2.push(200, 2)
    tsb2.push(400, 4)
    tsb1.merge(tsb2)
    expect(tsb1.size).toBe(4)
    const arr = tsb1.toArray()
    expect(arr).toEqual([
      { timestamp: 100, value: 1 },
      { timestamp: 200, value: 2 },
      { timestamp: 300, value: 3 },
      { timestamp: 400, value: 4 },
    ])
  })

  it('merge with empty buffer is no-op', () => {
    const tsb1 = new TimeSeriesBuffer()
    tsb1.push(100, 1)
    const tsb2 = new TimeSeriesBuffer()
    tsb1.merge(tsb2)
    expect(tsb1.size).toBe(1)
  })

  it('empty buffer size is 0', () => {
    const tsb = new TimeSeriesBuffer()
    expect(tsb.size).toBe(0)
  })

  it('push increases size', () => {
    const tsb = new TimeSeriesBuffer()
    tsb.push(1, 10)
    expect(tsb.size).toBe(1)
  })

  it('empty buffer has size 0', () => {
    const tsb = new TimeSeriesBuffer()
    expect(tsb.size).toBe(0)
  })
})
