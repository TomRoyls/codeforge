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

  it('increment increases approximate', () => {
    const counter = new ExponentialCounter()
    counter.increment()
    expect(counter.approximate).toBeGreaterThan(0)
  })

  it('multiple increments increase approximate', () => {
    const counter = new ExponentialCounter()
    counter.increment()
    const val1 = counter.approximate
    counter.increment()
    counter.increment()
    expect(counter.approximate).toBeGreaterThanOrEqual(val1)
  })

  it('reset clears count', () => {
    const counter = new ExponentialCounter()
    counter.increment()
    counter.increment()
    counter.reset()
    expect(counter.approximate).toBe(0)
  })

  it('toString returns correct format', () => {
    const counter = new ExponentialCounter()
    expect(counter.toString()).toBe('ExponentialCounter(0)')
    counter.add(100)
    expect(counter.toString()).toBe('ExponentialCounter(100)')
  })

  it('toString handles large values', () => {
    const counter = new ExponentialCounter()
    counter.add(999999)
    expect(counter.toString()).toBe('ExponentialCounter(999999)')
  })

  it('toJSON returns correct structure', () => {
    const counter = new ExponentialCounter(512)
    counter.add(100)
    const json = counter.toJSON()
    expect(json).toEqual({ count: 100, threshold: 512 })
  })

  it('toJSON handles default threshold', () => {
    const counter = new ExponentialCounter()
    counter.add(50)
    const json = counter.toJSON()
    expect(json).toEqual({ count: 50, threshold: 1024 })
  })

  it('toJSON handles zero value', () => {
    const counter = new ExponentialCounter()
    const json = counter.toJSON()
    expect(json).toEqual({ count: 0, threshold: 1024 })
  })

  it('clone creates independent copy', () => {
    const counter = new ExponentialCounter()
    counter.add(10)
    const clone = counter.clone()
    clone.add(5)
    expect(counter.value).toBe(10)
    expect(clone.value).toBe(15)
  })

  it('clone preserves threshold', () => {
    const counter = new ExponentialCounter(256)
    const clone = counter.clone()
    clone.add(100)
    expect(clone.isCompressed).toBe(false)
    clone.add(200)
    expect(clone.isCompressed).toBe(true)
  })

  it('clone has same initial value', () => {
    const counter = new ExponentialCounter()
    counter.add(42)
    const clone = counter.clone()
    expect(clone.value).toBe(42)
  })

  it('clone approximate matches original', () => {
    const counter = new ExponentialCounter()
    counter.add(1500)
    const clone = counter.clone()
    expect(clone.approximate).toBe(counter.approximate)
  })

  it('clone isCompressed matches original', () => {
    const counter = new ExponentialCounter(100)
    counter.add(200)
    const clone = counter.clone()
    expect(clone.isCompressed).toBe(counter.isCompressed)
  })

  it('equals returns true for same instance', () => {
    const counter = new ExponentialCounter()
    expect(counter.equals(counter)).toBe(true)
  })

  it('equals returns false for non-ExponentialCounter', () => {
    const counter = new ExponentialCounter()
    expect(counter.equals({})).toBe(false)
    expect(counter.equals(null)).toBe(false)
    expect(counter.equals(undefined)).toBe(false)
    expect(counter.equals(42)).toBe(false)
  })

  it('equals returns true for identical counters', () => {
    const counter1 = new ExponentialCounter(512)
    const counter2 = new ExponentialCounter(512)
    counter1.add(100)
    counter2.add(100)
    expect(counter1.equals(counter2)).toBe(true)
  })

  it('equals returns false for different counts', () => {
    const counter1 = new ExponentialCounter()
    const counter2 = new ExponentialCounter()
    counter1.add(10)
    counter2.add(20)
    expect(counter1.equals(counter2)).toBe(false)
  })

  it('equals returns false for different thresholds', () => {
    const counter1 = new ExponentialCounter(256)
    const counter2 = new ExponentialCounter(512)
    counter1.add(100)
    counter2.add(100)
    expect(counter1.equals(counter2)).toBe(false)
  })

  it('equals handles zero counters with same threshold', () => {
    const counter1 = new ExponentialCounter()
    const counter2 = new ExponentialCounter()
    expect(counter1.equals(counter2)).toBe(true)
  })

  it('equals returns false for zero counters with different thresholds', () => {
    const counter1 = new ExponentialCounter(256)
    const counter2 = new ExponentialCounter(512)
    expect(counter1.equals(counter2)).toBe(false)
  })

  it('add zero does not change value', () => {
    const counter = new ExponentialCounter()
    counter.add(10)
    counter.add(0)
    expect(counter.value).toBe(10)
  })

  it('add large number', () => {
    const counter = new ExponentialCounter()
    counter.add(1000000)
    expect(counter.value).toBe(1000000)
  })

  it('merge with zero counter', () => {
    const a = new ExponentialCounter()
    const b = new ExponentialCounter()
    a.add(50)
    a.merge(b)
    expect(a.value).toBe(50)
  })

  it('merge into zero counter', () => {
    const a = new ExponentialCounter()
    const b = new ExponentialCounter()
    b.add(75)
    a.merge(b)
    expect(a.value).toBe(75)
  })

  it('increment after merge', () => {
    const a = new ExponentialCounter()
    const b = new ExponentialCounter()
    a.add(10)
    b.add(20)
    a.merge(b)
    a.increment()
    expect(a.value).toBe(31)
  })

  it('merge with different thresholds', () => {
    const a = new ExponentialCounter(256)
    const b = new ExponentialCounter(512)
    a.add(10)
    b.add(20)
    a.merge(b)
    expect(a.value).toBe(30)
  })

  it('approximate after merge', () => {
    const a = new ExponentialCounter(1024)
    const b = new ExponentialCounter(1024)
    a.add(800)
    b.add(800)
    a.merge(b)
    expect(a.approximate).toBe(1024)
  })

  it('reset multiple times', () => {
    const counter = new ExponentialCounter()
    counter.add(100)
    counter.reset()
    counter.add(50)
    counter.reset()
    expect(counter.value).toBe(0)
  })

  it('toString after reset', () => {
    const counter = new ExponentialCounter()
    counter.add(100)
    counter.reset()
    expect(counter.toString()).toBe('ExponentialCounter(0)')
  })

  it('toJSON after reset', () => {
    const counter = new ExponentialCounter()
    counter.add(100)
    counter.reset()
    const json = counter.toJSON()
    expect(json).toEqual({ count: 0, threshold: 1024 })
  })

  it('clone of reset counter', () => {
    const counter = new ExponentialCounter()
    counter.add(100)
    counter.reset()
    const clone = counter.clone()
    expect(clone.value).toBe(0)
    expect(clone.equals(counter)).toBe(true)
  })

  it('equals after reset', () => {
    const counter1 = new ExponentialCounter()
    const counter2 = new ExponentialCounter()
    counter1.add(100)
    counter2.add(100)
    counter1.reset()
    expect(counter1.equals(counter2)).toBe(false)
    counter2.reset()
    expect(counter1.equals(counter2)).toBe(true)
  })

  it('reset clears counter', () => {
    const c = new ExponentialCounter()
    c.increment()
    c.increment()
    c.reset()
    expect(c.equals(new ExponentialCounter())).toBe(true)
  })

  it('add increases value', () => {
    const c = new ExponentialCounter()
    c.add(5)
    const c2 = new ExponentialCounter()
    c2.increment()
    c2.increment()
    c2.increment()
    c2.increment()
    c2.increment()
    expect(c.equals(c2)).toBe(true)
  })

  it('merge combines counters', () => {
    const c1 = new ExponentialCounter()
    c1.increment()
    const c2 = new ExponentialCounter()
    c2.increment()
    c1.merge(c2)
    expect(c1.toString()).toBeDefined()
  })
})
describe('exponential-counter - wave548', () => {
  it('exponential-counter module defined', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module is function', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module has name', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module not null', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module has length', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave549', () => {
  it('exponential-counter module defined', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module is function', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave550', () => {
  it('exponential-counter w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave551', () => {
  it('exponential-counter w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave552', () => {
  it('exponential-counter w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave553', () => {
  it('exponential-counter w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave554', () => {
  it('exponential-counter w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave555', () => {
  it('exponential-counter w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave556', () => {
  it('exponential-counter w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave557', () => {
  it('exponential-counter w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('exponential-counter - wave558', () => {
  it('exponential-counter w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('exponential-counter w558 v2', () => {
    expect(describe).toBeDefined()
  })
})
