import { describe, it, expect } from 'vitest'
import { ExponentialCounter } from '../../src/utils/exponential-counter.js'

describe('ExponentialCounter', () => {
  it('starts at zero', () => {
    const counter = new ExponentialCounter()
    expect(counter.value).toBe(0)
  })

  it('increments by one', () => {
    const counter = new ExponentialCounter()
    counter.increment()
    expect(counter.value).toBe(1)
  })

  it('increments multiple times', () => {
    const counter = new ExponentialCounter()
    counter.increment()
    counter.increment()
    counter.increment()
    expect(counter.value).toBe(3)
  })

  it('adds value', () => {
    const counter = new ExponentialCounter()
    counter.add(10)
    expect(counter.value).toBe(10)
  })

  it('adds negative value', () => {
    const counter = new ExponentialCounter()
    counter.add(10)
    counter.add(-5)
    expect(counter.value).toBe(5)
  })

  it('resets to zero', () => {
    const counter = new ExponentialCounter()
    counter.add(100)
    counter.reset()
    expect(counter.value).toBe(0)
  })

  it('approximate returns exact when below threshold', () => {
    const counter = new ExponentialCounter(1024)
    counter.add(500)
    expect(counter.approximate).toBe(500)
  })

  it('approximate rounds down to power of two', () => {
    const counter = new ExponentialCounter(1024)
    counter.add(1500)
    expect(counter.approximate).toBe(1024)
  })

  it('approximate handles exact power of two', () => {
    const counter = new ExponentialCounter(1024)
    counter.add(2048)
    expect(counter.approximate).toBe(2048)
  })

  it('approximate handles large value', () => {
    const counter = new ExponentialCounter(1024)
    counter.add(10000)
    expect(counter.approximate).toBe(8192)
  })

  it('isCompressed returns false below threshold', () => {
    const counter = new ExponentialCounter(1024)
    counter.add(500)
    expect(counter.isCompressed).toBe(false)
  })

  it('isCompressed returns true at threshold', () => {
    const counter = new ExponentialCounter(1024)
    counter.add(1024)
    expect(counter.isCompressed).toBe(true)
  })

  it('isCompressed returns true above threshold', () => {
    const counter = new ExponentialCounter(1024)
    counter.add(2000)
    expect(counter.isCompressed).toBe(true)
  })

  it('merge adds values from other counter', () => {
    const a = new ExponentialCounter()
    const b = new ExponentialCounter()
    a.add(10)
    b.add(20)
    a.merge(b)
    expect(a.value).toBe(30)
  })

  it('merge handles zero value counters', () => {
    const a = new ExponentialCounter()
    const b = new ExponentialCounter()
    a.add(10)
    a.merge(b)
    expect(a.value).toBe(10)
  })

  it('merge works with multiple operations', () => {
    const a = new ExponentialCounter()
    const b = new ExponentialCounter()
    a.add(5)
    b.add(3)
    a.increment()
    b.add(10)
    a.merge(b)
    expect(a.value).toBe(19)
  })

  it('uses custom threshold', () => {
    const counter = new ExponentialCounter(100)
    counter.add(150)
    expect(counter.isCompressed).toBe(true)
    expect(counter.approximate).toBe(128)
  })

  it('handles multiple adds and increments', () => {
    const counter = new ExponentialCounter()
    counter.add(10)
    counter.increment()
    counter.add(5)
    counter.increment()
    expect(counter.value).toBe(17)
  })

  it('resets then increments', () => {
    const counter = new ExponentialCounter()
    counter.add(100)
    counter.reset()
    counter.increment()
    expect(counter.value).toBe(1)
  })

  it('merge after reset', () => {
    const a = new ExponentialCounter()
    const b = new ExponentialCounter()
    a.add(100)
    b.add(50)
    a.reset()
    a.merge(b)
    expect(a.value).toBe(50)
  })

  it('approximate returns zero for zero count', () => {
    const counter = new ExponentialCounter()
    expect(counter.approximate).toBe(0)
  })
})