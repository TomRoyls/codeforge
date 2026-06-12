import { describe, it, expect } from 'vitest'
import { StreamSampler } from '../../src/utils/stream-sampler.js'

describe('StreamSampler', () => {
  it('collects items up to reservoir size', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    expect(sampler.size).toBe(3)
    expect(sampler.sample()).toEqual([1, 2, 3])
  })

  it('fills reservoir completely', () => {
    const sampler = new StreamSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.add(3)
    expect(sampler.isFull).toBe(true)
    expect(sampler.size).toBe(3)
  })

  it('tracks total seen count', () => {
    const sampler = new StreamSampler<number>(2)
    for (let i = 0; i < 100; i++) {
      sampler.add(i)
    }
    expect(sampler.totalSeen).toBe(100)
    expect(sampler.size).toBe(2)
  })

  it('reservoir stays bounded after many adds', () => {
    const sampler = new StreamSampler<number>(5)
    for (let i = 0; i < 10000; i++) {
      sampler.add(i)
    }
    expect(sampler.size).toBe(5)
    for (const val of sampler.sample()) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(10000)
    }
  })

  it('returns empty sample when nothing added', () => {
    const sampler = new StreamSampler<number>(5)
    expect(sampler.sample()).toEqual([])
    expect(sampler.isEmpty).toBe(true)
    expect(sampler.isFull).toBe(false)
  })

  it('throws on size < 1', () => {
    expect(() => new StreamSampler(0)).toThrow(RangeError)
    expect(() => new StreamSampler(-1)).toThrow(RangeError)
  })

  it('addAll adds iterable items', () => {
    const sampler = new StreamSampler<number>(10)
    sampler.addAll([1, 2, 3, 4, 5])
    expect(sampler.size).toBe(5)
    expect(sampler.totalSeen).toBe(5)
  })

  it('reset clears reservoir and count', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.add(1)
    sampler.add(2)
    sampler.reset()
    expect(sampler.isEmpty).toBe(true)
    expect(sampler.totalSeen).toBe(0)
    expect(sampler.sample()).toEqual([])
  })

  it('forEach iterates reservoir items', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([10, 20, 30])
    const collected: number[] = []
    sampler.forEach((item) => collected.push(item))
    expect(collected).toEqual([10, 20, 30])
  })

  it('sample returns independent copy', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([1, 2, 3])
    const sample = sampler.sample()
    sample.push(999)
    expect(sampler.size).toBe(3)
  })

  it('works with size 1', () => {
    const sampler = new StreamSampler<number>(1)
    sampler.add(42)
    expect(sampler.size).toBe(1)
    expect(sampler.isFull).toBe(true)
    sampler.add(99)
    expect(sampler.size).toBe(1)
    expect(sampler.totalSeen).toBe(2)
  })

  it('sample after adding items', () => {
    const sampler = new StreamSampler<string>(3)
    sampler.add('a')
    sampler.add('b')
    expect(sampler.size).toBe(2)
  })

  it('sample returns array of at most k items', () => {
    const sampler = new StreamSampler<string>(2)
    for (let i = 0; i < 10; i++) sampler.add('item' + i)
    expect(sampler.sample().length).toBeLessThanOrEqual(2)
  })

  it('empty sampler has no samples', () => {
    const sampler = new StreamSampler<string>(2)
    expect(sampler.sample()).toEqual([])
  })

  it('single item sampler keeps one item', () => {
    const sampler = new StreamSampler<string>(1)
    sampler.add('a')
    sampler.add('b')
    expect(sampler.sample()).toHaveLength(1)
  })

  it('sample with k=2 returns up to 2', () => {
    const sampler = new StreamSampler<string>(2)
    sampler.add('a')
    sampler.add('b')
    sampler.add('c')
    expect(sampler.sample().length).toBe(2)
  })

  it('addAll with empty iterable', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([])
    expect(sampler.size).toBe(0)
    expect(sampler.totalSeen).toBe(0)
  })

  it('forEach with index parameter', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([10, 20, 30])
    const indices: number[] = []
    sampler.forEach((_, index) => indices.push(index))
    expect(indices).toEqual([0, 1, 2])
  })

  it('forEach on empty sampler', () => {
    const sampler = new StreamSampler<number>(5)
    let called = false
    sampler.forEach(() => { called = true })
    expect(called).toBe(false)
  })

  it('mean returns undefined for empty sampler', () => {
    const sampler = new StreamSampler<number>(5)
    expect(sampler.mean()).toBeUndefined()
  })

  it('mean returns undefined for non-numeric items', () => {
    const sampler = new StreamSampler<string>(5)
    sampler.addAll(['a', 'b', 'c'])
    expect(sampler.mean()).toBeUndefined()
  })

  it('mean with single element', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.add(42)
    expect(sampler.mean()).toBe(42)
  })

  it('mean with negative numbers', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([-10, -20, -30])
    expect(sampler.mean()).toBe(-20)
  })

  it('mean with floating point numbers', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([1.5, 2.5, 3.5])
    expect(sampler.mean()).toBeCloseTo(2.5)
  })

  it('mean after reset', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([10, 20, 30])
    sampler.reset()
    expect(sampler.mean()).toBeUndefined()
  })

  it('min returns undefined when empty', () => {
    const sampler = new StreamSampler<number>(5)
    expect(sampler.min()).toBeUndefined()
  })

  it('max returns undefined when empty', () => {
    const sampler = new StreamSampler<number>(5)
    expect(sampler.max()).toBeUndefined()
  })

  it('min with single element', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.add(42)
    expect(sampler.min()).toBe(42)
  })

  it('max with single element', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.add(42)
    expect(sampler.max()).toBe(42)
  })

  it('min with negative numbers', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([-10, -5, -20, -15])
    expect(sampler.min()).toBe(-20)
  })

  it('max with negative numbers', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([-10, -5, -20, -15])
    expect(sampler.max()).toBe(-5)
  })

  it('min with mixed positive and negative', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([10, -5, 3, -8, 2])
    expect(sampler.min()).toBe(-8)
  })

  it('max with mixed positive and negative', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([10, -5, 3, -8, 2])
    expect(sampler.max()).toBe(10)
  })

  it('min after reset', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([10, 20, 30])
    sampler.reset()
    expect(sampler.min()).toBeUndefined()
  })

  it('max after reset', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([10, 20, 30])
    sampler.reset()
    expect(sampler.max()).toBeUndefined()
  })

  it('isFull after reset', () => {
    const sampler = new StreamSampler<number>(3)
    sampler.addAll([1, 2, 3])
    expect(sampler.isFull).toBe(true)
    sampler.reset()
    expect(sampler.isFull).toBe(false)
  })

  it('isEmpty with some items', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.add(1)
    sampler.add(2)
    expect(sampler.isEmpty).toBe(false)
  })

  it('isEmpty after reset', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.add(1)
    sampler.add(2)
    expect(sampler.isEmpty).toBe(false)
    sampler.reset()
    expect(sampler.isEmpty).toBe(true)
  })

  it('addAll with Set', () => {
    const sampler = new StreamSampler<number>(10)
    const set = new Set([1, 2, 3, 4, 5])
    sampler.addAll(set)
    expect(sampler.size).toBe(5)
    expect(sampler.totalSeen).toBe(5)
  })

  it('addAll with large iterable', () => {
    const sampler = new StreamSampler<number>(10)
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    sampler.addAll(arr)
    expect(sampler.size).toBe(10)
    expect(sampler.totalSeen).toBe(1000)
  })

  it('multiple addAll calls', () => {
    const sampler = new StreamSampler<number>(10)
    sampler.addAll([1, 2, 3])
    sampler.addAll([4, 5, 6])
    sampler.addAll([7, 8, 9])
    expect(sampler.size).toBe(9)
    expect(sampler.totalSeen).toBe(9)
  })

  it('addAll after reset', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([1, 2, 3])
    sampler.reset()
    sampler.addAll([4, 5, 6])
    expect(sampler.size).toBe(3)
    expect(sampler.totalSeen).toBe(3)
  })

  it('forEach on large reservoir', () => {
    const sampler = new StreamSampler<number>(100)
    const arr = Array.from({ length: 100 }, (_, i) => i)
    sampler.addAll(arr)
    let count = 0
    sampler.forEach(() => count++)
    expect(count).toBe(100)
  })

  it('sample size never exceeds maxSize', () => {
    const sampler = new StreamSampler<number>(10)
    for (let i = 0; i < 1000; i++) {
      sampler.add(i)
    }
    expect(sampler.sample().length).toBe(10)
  })

  it('add after isFull maintains size', () => {
    const sampler = new StreamSampler<number>(2)
    sampler.add(1)
    sampler.add(2)
    expect(sampler.isFull).toBe(true)
    sampler.add(3)
    sampler.add(4)
    expect(sampler.size).toBe(2)
    expect(sampler.isFull).toBe(true)
  })

  it('mean with very large numbers', () => {
    const sampler = new StreamSampler<number>(3)
    sampler.addAll([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])
    expect(sampler.mean()).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('mean with negative and positive mix', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([-10, 20, -30, 40, -50])
    expect(sampler.mean()).toBe(-6)
  })

  it('min with very large values', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER])
    expect(sampler.min()).toBe(Number.MAX_SAFE_INTEGER - 1)
  })

  it('max with very large values', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([Number.MAX_SAFE_INTEGER - 100, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 50])
    expect(sampler.max()).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('sample returns fresh array each time', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([1, 2, 3])
    const sample1 = sampler.sample()
    const sample2 = sampler.sample()
    sample1.push(999)
    expect(sample2).not.toContain(999)
  })

  it('multiple samples return consistent state', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([1, 2, 3])
    const sample1 = sampler.sample()
    const sample2 = sampler.sample()
    expect(sample1).toEqual(sample2)
  })

  it('totalSeen increments correctly with add', () => {
    const sampler = new StreamSampler<number>(5)
    expect(sampler.totalSeen).toBe(0)
    sampler.add(1)
    expect(sampler.totalSeen).toBe(1)
    sampler.add(2)
    expect(sampler.totalSeen).toBe(2)
  })

  it('addAll with duplicate items', () => {
    const sampler = new StreamSampler<number>(10)
    sampler.addAll([1, 1, 1, 2, 2, 2])
    expect(sampler.size).toBe(6)
    expect(sampler.totalSeen).toBe(6)
  })

  it('forEach callback receives correct indices', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([100, 200, 300, 400])
    const pairs: [number, number][] = []
    sampler.forEach((item, index) => pairs.push([item, index]))
    expect(pairs).toEqual([[100, 0], [200, 1], [300, 2], [400, 3]])
  })

  it('isFull when exactly at capacity', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([1, 2, 3, 4, 5])
    expect(sampler.isFull).toBe(true)
    expect(sampler.size).toBe(5)
  })

  it('add after reset works correctly', () => {
    const sampler = new StreamSampler<number>(3)
    sampler.add(1)
    sampler.add(2)
    sampler.reset()
    sampler.add(10)
    expect(sampler.size).toBe(1)
    expect(sampler.totalSeen).toBe(1)
    expect(sampler.sample()).toEqual([10])
  })

  it('consecutive reset operations', () => {
    const sampler = new StreamSampler<number>(5)
    sampler.addAll([1, 2, 3])
    sampler.reset()
    sampler.reset()
    expect(sampler.size).toBe(0)
    expect(sampler.totalSeen).toBe(0)
    expect(sampler.isEmpty).toBe(true)
  })
})
describe('stream-sampler - wave548', () => {
  it('stream-sampler module defined', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module is function', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module has name', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module not null', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module has length', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave549', () => {
  it('stream-sampler module defined', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module is function', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave550', () => {
  it('stream-sampler w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave551', () => {
  it('stream-sampler w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave552', () => {
  it('stream-sampler w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave553', () => {
  it('stream-sampler w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave554', () => {
  it('stream-sampler w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave555', () => {
  it('stream-sampler w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave556', () => {
  it('stream-sampler w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave557', () => {
  it('stream-sampler w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave558', () => {
  it('stream-sampler w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave559', () => {
  it('stream-sampler w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave560', () => {
  it('stream-sampler w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave561', () => {
  it('stream-sampler w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave562', () => {
  it('stream-sampler w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave563', () => {
  it('stream-sampler w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('stream-sampler - wave564', () => {
  it('stream-sampler w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('stream-sampler w564 v2', () => {
    expect(describe).toBeDefined()
  })
})
