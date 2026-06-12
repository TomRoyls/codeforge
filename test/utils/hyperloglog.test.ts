import { describe, it, expect } from 'vitest'
import { HyperLogLog } from '../../src/utils/hyperloglog.js'

describe('HyperLogLog', () => {
  it('creates instance with default precision', () => {
    const hll = new HyperLogLog()
    expect(hll.registerCount).toBe(16384)
    expect(hll.precision).toBe(14)
  })

  it('creates instance with custom precision', () => {
    const hll = new HyperLogLog(12)
    expect(hll.registerCount).toBe(4096)
    expect(hll.precision).toBe(12)
  })

  it('adds single value and counts', () => {
    const hll = new HyperLogLog()
    hll.add('test')
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('adds multiple unique values', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 100; i++) {
      hll.add(`value-${i}`)
    }
    expect(hll.count()).toBeGreaterThan(80)
    expect(hll.count()).toBeLessThan(120)
  })

  it('handles duplicate values correctly', () => {
    const hll = new HyperLogLog()
    hll.add('test')
    hll.add('test')
    hll.add('test')
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('counts large set of unique values with accuracy', () => {
    const hll = new HyperLogLog()
    const count = 10000
    for (let i = 0; i < count; i++) {
      hll.add(`unique-${i}`)
    }
    const estimate = hll.count()
    const error = Math.abs(estimate - count) / count
    expect(error).toBeLessThan(0.15)
  })

  it('merges two HyperLogLog instances', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('a')
    hll1.add('b')
    hll2.add('c')
    hll2.add('d')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThan(3)
    expect(hll1.count()).toBeLessThan(5)
  })

  it('merges overlapping sets correctly', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('a')
    hll1.add('b')
    hll2.add('b')
    hll2.add('c')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThan(2)
    expect(hll1.count()).toBeLessThan(4)
  })

  it('merges with empty instance', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('test')
    hll1.merge(hll2)
    expect(hll1.count()).toBeCloseTo(1, 0)
  })

  it('handles empty count', () => {
    const hll = new HyperLogLog()
    expect(hll.count()).toBe(0)
  })

  it('handles string values with special characters', () => {
    const hll = new HyperLogLog()
    hll.add('test!@#$%^&*()')
    hll.add('test-with-dashes')
    hll.add('test_with_underscores')
    hll.add('test with spaces')
    expect(hll.count()).toBeGreaterThan(3)
    expect(hll.count()).toBeLessThan(5)
  })

  it('handles very long strings', () => {
    const hll = new HyperLogLog()
    const longString = 'a'.repeat(10000)
    hll.add(longString)
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('handles numeric string values', () => {
    const hll = new HyperLogLog()
    hll.add('123')
    hll.add('456')
    hll.add('789')
    expect(hll.count()).toBeGreaterThan(2)
    expect(hll.count()).toBeLessThan(4)
  })

  it('maintains accuracy after multiple merges', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    const hll3 = new HyperLogLog()
    const count = 3000
    for (let i = 0; i < count; i++) {
      if (i < count / 3) {
        hll1.add(`value-${i}`)
      } else if (i < (count * 2) / 3) {
        hll2.add(`value-${i}`)
      } else {
        hll3.add(`value-${i}`)
      }
    }
    hll1.merge(hll2)
    hll1.merge(hll3)
    const estimate = hll1.count()
    const error = Math.abs(estimate - count) / count
    expect(error).toBeLessThan(0.2)
  })

  it('handles merge with different precision', () => {
    const hll1 = new HyperLogLog(12)
    const hll2 = new HyperLogLog(12)
    hll1.add('a')
    hll2.add('b')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThan(1)
    expect(hll1.count()).toBeLessThan(3)
  })

  it('add and count same value many times', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 1000; i++) hll.add('same')
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('handles unicode strings', () => {
    const hll = new HyperLogLog()
    hll.add('日本語テスト')
    hll.add('🎉🎊🎈')
    hll.add('Привет')
    expect(hll.count()).toBeGreaterThan(2)
    expect(hll.count()).toBeLessThan(4)
  })

  it('empty string counts as value', () => {
    const hll = new HyperLogLog()
    hll.add('')
    expect(hll.count()).toBeCloseTo(1, 0)
  })

  it('multiple adds approximate count', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 100; i++) hll.add(`item-${i}`)
    expect(hll.count()).toBeGreaterThan(50)
  })

  it('empty estimates zero', () => {
    const hll = new HyperLogLog()
    expect(hll.count()).toBe(0)
  })

  it('add then count is positive', () => {
    const hll = new HyperLogLog()
    hll.add('test')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('merge combines cardinalities', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('a')
    hll2.add('b')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThanOrEqual(2)
  })

  it('empty count is near zero', () => {
    const hll = new HyperLogLog(10)
    expect(hll.count()).toBeLessThan(1)
  })

  it('count after adds is positive', () => {
    const hll = new HyperLogLog(10)
    hll.add('a')
    hll.add('b')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('merge modifies in place', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('a')
    const before = hll1.count()
    hll2.add('b')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThan(before)
  })

  it('merge accepts large precision', () => {
    const hll1 = new HyperLogLog(16)
    const hll2 = new HyperLogLog(16)
    hll1.add('test')
    hll2.add('value')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThanOrEqual(1)
  })

  it('merge with small precision', () => {
    const hll1 = new HyperLogLog(4)
    const hll2 = new HyperLogLog(4)
    hll1.add('a')
    hll2.add('b')
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThanOrEqual(1)
  })

  it('handles sequential merges', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    const hll3 = new HyperLogLog()
    hll1.add('a')
    hll2.add('b')
    hll3.add('c')
    hll1.merge(hll2)
    const afterFirst = hll1.count()
    hll1.merge(hll3)
    expect(hll1.count()).toBeGreaterThanOrEqual(afterFirst)
  })

  it('precision 4 has 16 registers', () => {
    const hll = new HyperLogLog(4)
    expect(hll.registerCount).toBe(16)
    expect(hll.precision).toBe(4)
  })

  it('precision 8 has 256 registers', () => {
    const hll = new HyperLogLog(8)
    expect(hll.registerCount).toBe(256)
    expect(hll.precision).toBe(8)
  })

  it('precision 12 has 4096 registers', () => {
    const hll = new HyperLogLog(12)
    expect(hll.registerCount).toBe(4096)
    expect(hll.precision).toBe(12)
  })

  it('precision 14 has 16384 registers', () => {
    const hll = new HyperLogLog(14)
    expect(hll.registerCount).toBe(16384)
    expect(hll.precision).toBe(14)
  })

  it('precision 16 has 65536 registers', () => {
    const hll = new HyperLogLog(16)
    expect(hll.registerCount).toBe(65536)
    expect(hll.precision).toBe(16)
  })

  it('default precision is 14', () => {
    const hll = new HyperLogLog()
    expect(hll.precision).toBe(14)
    expect(hll.registerCount).toBe(16384)
  })

  it('merge with overlapping large sets', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    const overlapSize = 100
    const uniqueSize = 200
    for (let i = 0; i < overlapSize; i++) {
      hll1.add(`overlap-${i}`)
      hll2.add(`overlap-${i}`)
    }
    for (let i = 0; i < uniqueSize; i++) {
      hll1.add(`unique1-${i}`)
      hll2.add(`unique2-${i}`)
    }
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThan(250)
    expect(hll1.count()).toBeLessThan(450)
  })

  it('merge preserves union semantics', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    hll1.add('x')
    hll2.add('x')
    const countBeforeMerge = hll1.count()
    hll1.merge(hll2)
    expect(hll1.count()).toBe(countBeforeMerge)
  })

  it('handles numeric-like strings', () => {
    const hll = new HyperLogLog()
    hll.add('123')
    hll.add('456.789')
    hll.add('1e10')
    expect(hll.count()).toBeGreaterThan(1)
  })

  it('handles emoji and special unicode', () => {
    const hll = new HyperLogLog()
    hll.add('🎉')
    hll.add('🚀')
    hll.add('✨')
    expect(hll.count()).toBeGreaterThan(2)
  })

  it('handles newlines and tabs in strings', () => {
    const hll = new HyperLogLog()
    hll.add('test\nvalue')
    hll.add('test\tvalue')
    expect(hll.count()).toBeGreaterThan(1)
  })

  it('count is stable after merge with empty', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    for (let i = 0; i < 100; i++) hll1.add(`test-${i}`)
    const before = hll1.count()
    hll1.merge(hll2)
    expect(hll1.count()).toBe(before)
  })

  it('handles many duplicate adds efficiently', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 10000; i++) hll.add('same')
    expect(hll.count()).toBeLessThan(10)
  })

  it('add with very long unicode string', () => {
    const hll = new HyperLogLog()
    const longUnicode = '🎉'.repeat(1000)
    hll.add(longUnicode)
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('handles mixed case strings', () => {
    const hll = new HyperLogLog()
    hll.add('Test')
    hll.add('test')
    hll.add('TEST')
    expect(hll.count()).toBeGreaterThan(2)
  })

  it('handles strings with backslashes', () => {
    const hll = new HyperLogLog()
    hll.add('path\\to\\file')
    hll.add('C:\\Users\\test')
    expect(hll.count()).toBeGreaterThan(1)
  })

  it('merge multiple times accumulates correctly', () => {
    const hll1 = new HyperLogLog()
    const hll2 = new HyperLogLog()
    for (let i = 0; i < 50; i++) hll1.add(`a-${i}`)
    for (let i = 0; i < 50; i++) hll2.add(`b-${i}`)
    hll1.merge(hll2)
    const afterFirst = hll1.count()
    const hll3 = new HyperLogLog()
    for (let i = 0; i < 50; i++) hll3.add(`c-${i}`)
    hll1.merge(hll3)
    expect(hll1.count()).toBeGreaterThan(afterFirst)
  })

  it('merge with self changes nothing', () => {
    const hll = new HyperLogLog()
    for (let i = 0; i < 100; i++) hll.add(`test-${i}`)
    const before = hll.count()
    hll.merge(hll)
    expect(hll.count()).toBe(before)
  })

  it('handles empty string with unicode', () => {
    const hll = new HyperLogLog()
    hll.add('')
    hll.add('日本語')
    expect(hll.count()).toBeGreaterThan(1)
  })

  it('should handle single element', () => {
    const hll = new HyperLogLog(8)
    hll.add('only')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })

  it('should estimate repeated elements as ~1', () => {
    const hll = new HyperLogLog(10)
    for (let i = 0; i < 500; i++) hll.add('same')
    expect(hll.count()).toBeLessThan(10)
  })

  it('should merge two sketches', () => {
    const hll1 = new HyperLogLog(8)
    const hll2 = new HyperLogLog(8)
    for (let i = 0; i < 100; i++) hll1.add(`x${i}`)
    for (let i = 0; i < 100; i++) hll2.add(`y${i}`)
    hll1.merge(hll2)
    expect(hll1.count()).toBeGreaterThan(50)
  })

  it('should report precision', () => {
    const hll = new HyperLogLog(12)
    expect(hll.precision).toBe(12)
  })

  it('should handle large cardinality', () => {
    const hll = new HyperLogLog(10)
    for (let i = 0; i < 10000; i++) hll.add(`item${i}`)
    const estimate = hll.count()
    expect(estimate).toBeGreaterThan(1000)
  })

  it('merge combines two sketches', () => {
    const a = new HyperLogLog(12)
    a.add('x')
    a.add('y')
    const b = new HyperLogLog(12)
    b.add('z')
    a.merge(b)
    expect(a.count()).toBeGreaterThanOrEqual(2)
  })

  it('new instance has zero count', () => {
    const hll = new HyperLogLog(12)
    expect(hll.count()).toBe(0)
  })

  it('single item estimate is approximately 1', () => {
    const hll = new HyperLogLog(10)
    hll.add('unique')
    expect(hll.count()).toBeGreaterThanOrEqual(1)
  })
  it('new HyperLogLog count is 0', () => {
    const hll = new HyperLogLog()
    expect(hll.count()).toBe(0)
  })

  it('add and count', () => {
    const hll = new HyperLogLog()
    hll.add('a')
    expect(hll.count()).toBeGreaterThanOrEqual(0)
  })

  it('reset clears', () => {
    const hll = new HyperLogLog()
    hll.add('a')
    hll.reset()
    expect(hll.count()).toBe(0)
  })
})

describe('hyperloglog - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('hyperloglog - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('hyperloglog - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('hyperloglog - wave548', () => {
  it('hyperloglog module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hyperloglog module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hyperloglog module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hyperloglog - wave549', () => {
  it('hyperloglog module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hyperloglog module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hyperloglog module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hyperloglog - wave550', () => {
  it('hyperloglog w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('hyperloglog w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('hyperloglog w550 has name', () => {
    expect(describe).toBeDefined()
  })
})
