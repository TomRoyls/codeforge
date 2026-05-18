import { CachedSegment, DEFAULT_CACHED_SEGMENT_OPTIONS } from '../src/core/cached-segment/cached-segment.js'
import type { CachedSegmentOptions, CachedSegmentStatistics } from '../src/core/cached-segment/cached-segment.js'

// ─── Default Options ────────────────────────────────────────────────────

describe('DEFAULT_CACHED_SEGMENT_OPTIONS', () => {
  it('has segmentSize of 64', () => {
    expect(DEFAULT_CACHED_SEGMENT_OPTIONS.segmentSize).toBe(64)
  })

  it('has cacheCapacity of 8', () => {
    expect(DEFAULT_CACHED_SEGMENT_OPTIONS.cacheCapacity).toBe(8)
  })
})

// ─── Constructor ────────────────────────────────────────────────────────

describe('CachedSegment constructor', () => {
  it('creates an instance with default options', () => {
    const cs = new CachedSegment<number>()
    expect(cs.size).toBe(0)
    expect(cs.isEmpty()).toBe(true)
  })

  it('creates an instance with custom segmentSize', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.size).toBe(0)
  })

  it('creates an instance with custom cacheCapacity', () => {
    const cs = new CachedSegment<number>({ cacheCapacity: 2 })
    expect(cs.size).toBe(0)
  })

  it('creates an instance with both custom options', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4, cacheCapacity: 2 })
    expect(cs.size).toBe(0)
  })

  it('creates an instance with segmentSize 1', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1 })
    expect(cs.size).toBe(0)
  })

  it('creates an instance with cacheCapacity 1', () => {
    const cs = new CachedSegment<number>({ cacheCapacity: 1 })
    expect(cs.size).toBe(0)
  })

  it('throws RangeError for segmentSize 0', () => {
    expect(() => new CachedSegment<number>({ segmentSize: 0 })).toThrow(RangeError)
    expect(() => new CachedSegment<number>({ segmentSize: 0 })).toThrow('segmentSize must be at least 1')
  })

  it('throws RangeError for negative segmentSize', () => {
    expect(() => new CachedSegment<number>({ segmentSize: -1 })).toThrow(RangeError)
    expect(() => new CachedSegment<number>({ segmentSize: -10 })).toThrow('segmentSize must be at least 1')
  })

  it('throws RangeError for cacheCapacity 0', () => {
    expect(() => new CachedSegment<number>({ cacheCapacity: 0 })).toThrow(RangeError)
    expect(() => new CachedSegment<number>({ cacheCapacity: 0 })).toThrow('cacheCapacity must be at least 1')
  })

  it('throws RangeError for negative cacheCapacity', () => {
    expect(() => new CachedSegment<number>({ cacheCapacity: -1 })).toThrow(RangeError)
    expect(() => new CachedSegment<number>({ cacheCapacity: -5 })).toThrow('cacheCapacity must be at least 1')
  })
})

// ─── push ───────────────────────────────────────────────────────────────

describe('push', () => {
  it('adds an element and returns new size', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.push(10)).toBe(1)
    expect(cs.push(20)).toBe(2)
    expect(cs.size).toBe(2)
  })

  it('stores pushed values correctly', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(10)
    cs.push(20)
    cs.push(30)
    expect(cs.get(0)).toBe(10)
    expect(cs.get(1)).toBe(20)
    expect(cs.get(2)).toBe(30)
  })

  it('handles pushing across segment boundaries', () => {
    const cs = new CachedSegment<number>({ segmentSize: 3 })
    for (let i = 0; i < 10; i++) {
      cs.push(i)
    }
    expect(cs.size).toBe(10)
    expect(cs.segmentCount()).toBe(4)
    for (let i = 0; i < 10; i++) {
      expect(cs.get(i)).toBe(i)
    }
  })

  it('handles string elements', () => {
    const cs = new CachedSegment<string>({ segmentSize: 2 })
    cs.push('hello')
    cs.push('world')
    expect(cs.toArray()).toEqual(['hello', 'world'])
  })

  it('handles object elements', () => {
    const cs = new CachedSegment<{ id: number }>({ segmentSize: 2 })
    cs.push({ id: 1 })
    cs.push({ id: 2 })
    expect(cs.get(0).id).toBe(1)
    expect(cs.get(1).id).toBe(2)
  })

  it('handles undefined values', () => {
    const cs = new CachedSegment<number | undefined>({ segmentSize: 4 })
    cs.push(undefined)
    expect(cs.size).toBe(1)
    expect(cs.get(0)).toBeUndefined()
  })

  it('returns sequential sizes', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    for (let i = 1; i <= 5; i++) {
      expect(cs.push(i * 10)).toBe(i)
    }
  })
})

// ─── get ────────────────────────────────────────────────────────────────

describe('get', () => {
  it('returns element at valid index', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(10)
    cs.push(20)
    cs.push(30)
    expect(cs.get(0)).toBe(10)
    expect(cs.get(1)).toBe(20)
    expect(cs.get(2)).toBe(30)
  })

  it('reads from correct segments in multi-segment layout', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    for (let i = 0; i < 6; i++) cs.push(i)
    expect(cs.get(0)).toBe(0)
    expect(cs.get(2)).toBe(2)
    expect(cs.get(4)).toBe(4)
    expect(cs.get(5)).toBe(5)
  })

  it('throws RangeError for negative index', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    expect(() => cs.get(-1)).toThrow(RangeError)
  })

  it('throws RangeError for index equal to size', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    expect(() => cs.get(1)).toThrow(RangeError)
  })

  it('throws RangeError for index beyond size', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    expect(() => cs.get(100)).toThrow(RangeError)
  })

  it('throws RangeError on empty segment', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(() => cs.get(0)).toThrow(RangeError)
  })

  it('throws RangeError with correct message format', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    expect(() => cs.get(5)).toThrow('Index 5 out of bounds [0, 1)')
  })
})

// ─── set ────────────────────────────────────────────────────────────────

describe('set', () => {
  it('sets value at valid index', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.set(1, 99)
    expect(cs.get(1)).toBe(99)
  })

  it('overwrites existing values across segment boundaries', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    for (let i = 0; i < 6; i++) cs.push(i)
    cs.set(2, 200)
    cs.set(3, 300)
    expect(cs.get(2)).toBe(200)
    expect(cs.get(3)).toBe(300)
  })

  it('throws RangeError for negative index', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    expect(() => cs.set(-1, 99)).toThrow(RangeError)
  })

  it('throws RangeError for out-of-bounds index', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    expect(() => cs.set(1, 99)).toThrow(RangeError)
    expect(() => cs.set(100, 99)).toThrow(RangeError)
  })

  it('throws RangeError on empty segment', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(() => cs.set(0, 1)).toThrow(RangeError)
  })

  it('preserves other values when setting one', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.set(1, 99)
    expect(cs.get(0)).toBe(1)
    expect(cs.get(2)).toBe(3)
  })
})

// ─── pop ────────────────────────────────────────────────────────────────

describe('pop', () => {
  it('returns the last element', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    expect(cs.pop()).toBe(3)
    expect(cs.size).toBe(2)
  })

  it('returns undefined on empty segment', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.pop()).toBeUndefined()
  })

  it('removes elements sequentially', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    expect(cs.pop()).toBe(3)
    expect(cs.pop()).toBe(2)
    expect(cs.pop()).toBe(1)
    expect(cs.pop()).toBeUndefined()
    expect(cs.size).toBe(0)
  })

  it('cleans up empty segments', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    expect(cs.segmentCount()).toBe(2)
    cs.pop()
    expect(cs.segmentCount()).toBe(1)
    cs.pop()
    expect(cs.segmentCount()).toBe(1)
    cs.pop()
    expect(cs.segmentCount()).toBe(0)
  })

  it('removes segment from cache when emptied', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(1)
    cs.push(2)
    cs.get(0)
    cs.get(1)
    expect(cs.cacheSize()).toBeGreaterThan(0)
    cs.pop()
    cs.pop()
    expect(cs.cacheSize()).toBe(0)
  })
})

// ─── size / isEmpty ────────────────────────────────────────────────────

describe('size and isEmpty', () => {
  it('size returns 0 for empty', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.size).toBe(0)
  })

  it('isEmpty returns true for empty', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.isEmpty()).toBe(true)
  })

  it('size tracks elements after push and pop', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    expect(cs.size).toBe(1)
    expect(cs.isEmpty()).toBe(false)
    cs.pop()
    expect(cs.size).toBe(0)
    expect(cs.isEmpty()).toBe(true)
  })
})

// ─── clear ─────────────────────────────────────────────────────────────

describe('clear', () => {
  it('clears all elements', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.clear()
    expect(cs.size).toBe(0)
    expect(cs.isEmpty()).toBe(true)
  })

  it('clears segments', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.clear()
    expect(cs.segmentCount()).toBe(0)
  })

  it('clears cache', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(1)
    cs.push(2)
    cs.get(0)
    cs.clear()
    expect(cs.cacheSize()).toBe(0)
  })

  it('resets statistics', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.get(0)
    cs.clear()
    const stats = cs.getStatistics()
    expect(stats.reads).toBe(0)
    expect(stats.writes).toBe(0)
    expect(stats.cacheHits).toBe(0)
    expect(stats.cacheMisses).toBe(0)
    expect(stats.evictions).toBe(0)
    expect(stats.flushes).toBe(0)
    expect(stats.segmentsLoaded).toBe(0)
  })

  it('allows operations after clear', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.clear()
    cs.push(99)
    expect(cs.size).toBe(1)
    expect(cs.get(0)).toBe(99)
  })
})

// ─── flush ─────────────────────────────────────────────────────────────

describe('flush', () => {
  it('clears the cache', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.get(0)
    cs.flush()
    expect(cs.cacheSize()).toBe(0)
  })

  it('does not remove data', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.flush()
    expect(cs.size).toBe(2)
    expect(cs.get(0)).toBe(1)
    expect(cs.get(1)).toBe(2)
  })

  it('increments flushes counter', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.flush()
    cs.flush()
    cs.flush()
    expect(cs.getStatistics().flushes).toBe(3)
  })

  it('does not reset other statistics', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.get(0)
    const writesBefore = cs.getStatistics().writes
    const readsBefore = cs.getStatistics().reads
    cs.flush()
    expect(cs.getStatistics().writes).toBe(writesBefore)
    expect(cs.getStatistics().reads).toBe(readsBefore)
  })
})

// ─── cacheSize ─────────────────────────────────────────────────────────

describe('cacheSize', () => {
  it('returns 0 for fresh instance', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.cacheSize()).toBe(0)
  })

  it('increases after reads', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.flush()
    cs.get(0)
    expect(cs.cacheSize()).toBe(1)
    cs.get(1)
    expect(cs.cacheSize()).toBe(2)
  })

  it('respects cacheCapacity limit', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 2 })
    for (let i = 0; i < 5; i++) cs.push(i)
    cs.get(0)
    cs.get(1)
    cs.get(2)
    expect(cs.cacheSize()).toBeLessThanOrEqual(2)
  })
})

// ─── cacheHits / cacheMisses / cacheHitRate ────────────────────────────

describe('cache statistics', () => {
  it('cacheHits returns 0 initially', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.cacheHits()).toBe(0)
  })

  it('cacheMisses returns 0 initially', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.cacheMisses()).toBe(0)
  })

  it('cacheHitRate returns 0 when no reads', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.cacheHitRate()).toBe(0)
  })

  it('tracks cache misses on first access', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.flush()
    cs.get(0)
    expect(cs.cacheMisses()).toBe(1)
    expect(cs.cacheHits()).toBe(0)
  })

  it('tracks cache hits on repeated access', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.flush()
    cs.get(0)
    cs.get(0)
    expect(cs.cacheMisses()).toBe(1)
    expect(cs.cacheHits()).toBe(1)
  })

  it('computes cacheHitRate correctly', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.flush()
    cs.get(0)
    cs.get(0)
    cs.get(0)
    expect(cs.cacheHitRate()).toBeCloseTo(2 / 3)
  })

  it('returns correct hit rate after flush', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.flush()
    cs.get(0)
    cs.get(0)
    expect(cs.cacheHitRate()).toBeCloseTo(1 / 2)
  })
})

// ─── segmentCount ──────────────────────────────────────────────────────

describe('segmentCount', () => {
  it('returns 0 for empty', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.segmentCount()).toBe(0)
  })

  it('returns 1 for single partial segment', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    expect(cs.segmentCount()).toBe(1)
  })

  it('returns 1 for exactly filled segment', () => {
    const cs = new CachedSegment<number>({ segmentSize: 3 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    expect(cs.segmentCount()).toBe(1)
  })

  it('returns correct count across boundaries', () => {
    const cs = new CachedSegment<number>({ segmentSize: 3 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.push(4)
    expect(cs.segmentCount()).toBe(2)
  })

  it('decreases when segments are popped', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.push(4)
    expect(cs.segmentCount()).toBe(2)
    cs.pop()
    cs.pop()
    expect(cs.segmentCount()).toBe(1)
  })
})

// ─── toArray ───────────────────────────────────────────────────────────

describe('toArray', () => {
  it('returns empty array for empty segment', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.toArray()).toEqual([])
  })

  it('returns all elements in order', () => {
    const cs = new CachedSegment<number>({ segmentSize: 3 })
    for (let i = 0; i < 10; i++) cs.push(i)
    expect(cs.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('returns a new array each time', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    const a1 = cs.toArray()
    const a2 = cs.toArray()
    expect(a1).toEqual(a2)
    expect(a1).not.toBe(a2)
  })

  it('reflects mutations', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.set(1, 99)
    expect(cs.toArray()).toEqual([1, 99, 3])
  })
})

// ─── forEach ───────────────────────────────────────────────────────────

describe('forEach', () => {
  it('iterates over all elements with correct indices', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(10)
    cs.push(20)
    cs.push(30)
    const results: Array<{ value: number; index: number }> = []
    cs.forEach((value, index) => {
      results.push({ value, index })
    })
    expect(results).toEqual([
      { value: 10, index: 0 },
      { value: 20, index: 1 },
      { value: 30, index: 2 },
    ])
  })

  it('does not call callback on empty', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    let callCount = 0
    cs.forEach(() => { callCount++ })
    expect(callCount).toBe(0)
  })

  it('iterates across segment boundaries', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    for (let i = 0; i < 7; i++) cs.push(i)
    const values: number[] = []
    cs.forEach((v) => values.push(v))
    expect(values).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

// ─── iterator ──────────────────────────────────────────────────────────

describe('Symbol.iterator', () => {
  it('iterates over all elements', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(10)
    cs.push(20)
    cs.push(30)
    const result: number[] = []
    for (const v of cs) {
      result.push(v)
    }
    expect(result).toEqual([10, 20, 30])
  })

  it('yields nothing for empty', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    const result: number[] = []
    for (const v of cs) {
      result.push(v)
    }
    expect(result).toEqual([])
  })

  it('works with spread operator', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    expect([...cs]).toEqual([1, 2, 3])
  })
})

// ─── getStatistics ─────────────────────────────────────────────────────

describe('getStatistics', () => {
  it('returns initial statistics', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    const stats = cs.getStatistics()
    expect(stats).toEqual({
      reads: 0,
      writes: 0,
      cacheHits: 0,
      cacheMisses: 0,
      evictions: 0,
      flushes: 0,
      segmentsLoaded: 0,
    })
  })

  it('returns a copy of statistics', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    const s1 = cs.getStatistics()
    const s2 = cs.getStatistics()
    expect(s1).toEqual(s2)
    expect(s1).not.toBe(s2)
  })

  it('tracks writes from push', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    expect(cs.getStatistics().writes).toBe(3)
  })

  it('tracks writes from set', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.set(1, 99)
    expect(cs.getStatistics().writes).toBe(3)
  })

  it('tracks reads from get', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.get(0)
    cs.get(0)
    expect(cs.getStatistics().reads).toBe(2)
  })

  it('tracks segmentsLoaded on cache miss', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.get(0)
    expect(cs.getStatistics().segmentsLoaded).toBe(1)
  })
})

// ─── LRU Cache Eviction ───────────────────────────────────────────────

describe('LRU cache eviction', () => {
  it('evicts LRU segment when capacity exceeded', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.get(0)
    cs.get(1)
    cs.get(2)
    expect(cs.getStatistics().evictions).toBeGreaterThan(0)
  })

  it('promotes accessed segment to MRU', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.get(0)
    cs.get(1)
    cs.get(0)
    cs.get(2)
    expect(cs.getStatistics().cacheHits).toBeGreaterThan(0)
  })

  it('maintains cache capacity after many accesses', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 3 })
    for (let i = 0; i < 20; i++) cs.push(i)
    for (let i = 0; i < 20; i++) cs.get(i)
    expect(cs.cacheSize()).toBeLessThanOrEqual(3)
  })

  it('tracks eviction count accurately', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 2 })
    for (let i = 0; i < 10; i++) cs.push(i)
    const evictionsBefore = cs.getStatistics().evictions
    for (let i = 0; i < 10; i++) cs.get(i)
    const evictionsAfter = cs.getStatistics().evictions
    expect(evictionsAfter).toBeGreaterThan(evictionsBefore)
  })

  it('evicts from loadSegment correctly', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.get(0)
    cs.get(1)
    expect(cs.cacheSize()).toBe(2)
    cs.get(2)
    expect(cs.cacheSize()).toBe(2)
  })

  it('set touches segment updating LRU order', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1, cacheCapacity: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.get(0)
    cs.get(1)
    cs.set(0, 99)
    cs.get(2)
    expect(cs.get(0)).toBe(99)
    expect(cs.get(2)).toBe(3)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles single element with segmentSize 1', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1 })
    cs.push(42)
    expect(cs.size).toBe(1)
    expect(cs.get(0)).toBe(42)
    expect(cs.segmentCount()).toBe(1)
  })

  it('handles many elements with segmentSize 1', () => {
    const cs = new CachedSegment<number>({ segmentSize: 1 })
    for (let i = 0; i < 5; i++) cs.push(i)
    expect(cs.size).toBe(5)
    expect(cs.segmentCount()).toBe(5)
    for (let i = 0; i < 5; i++) {
      expect(cs.get(i)).toBe(i)
    }
  })

  it('push and pop to zero then push again', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(1)
    cs.push(2)
    cs.pop()
    cs.pop()
    expect(cs.size).toBe(0)
    expect(cs.isEmpty()).toBe(true)
    cs.push(99)
    expect(cs.size).toBe(1)
    expect(cs.get(0)).toBe(99)
  })

  it('handles mixed push and pop operations', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.pop()
    cs.push(4)
    expect(cs.toArray()).toEqual([1, 2, 4])
  })

  it('handles large number of elements', () => {
    const cs = new CachedSegment<number>({ segmentSize: 64 })
    for (let i = 0; i < 1000; i++) cs.push(i)
    expect(cs.size).toBe(1000)
    expect(cs.get(0)).toBe(0)
    expect(cs.get(500)).toBe(500)
    expect(cs.get(999)).toBe(999)
    expect(cs.segmentCount()).toBe(Math.ceil(1000 / 64))
  })

  it('handles cacheCapacity 1', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 1 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.get(0)
    expect(cs.cacheSize()).toBe(1)
    cs.get(2)
    expect(cs.cacheSize()).toBe(1)
  })

  it('handles get after set across segments', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.push(4)
    cs.set(1, 99)
    cs.set(3, 88)
    expect(cs.get(0)).toBe(1)
    expect(cs.get(1)).toBe(99)
    expect(cs.get(2)).toBe(3)
    expect(cs.get(3)).toBe(88)
  })

  it('toArray does not affect cache', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    const readsBefore = cs.getStatistics().reads
    cs.toArray()
    expect(cs.getStatistics().reads).toBe(readsBefore)
  })

  it('forEach does not affect cache', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    const readsBefore = cs.getStatistics().reads
    cs.forEach(() => {})
    expect(cs.getStatistics().reads).toBe(readsBefore)
  })

  it('iterator does not affect cache', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    const readsBefore = cs.getStatistics().reads
    for (const _v of cs) { break }
    expect(cs.getStatistics().reads).toBe(readsBefore)
  })

  it('pop after flush still works', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.get(0)
    cs.flush()
    expect(cs.pop()).toBe(3)
    expect(cs.size).toBe(2)
  })

  it('clear after many operations resets cleanly', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2, cacheCapacity: 2 })
    for (let i = 0; i < 20; i++) cs.push(i)
    for (let i = 0; i < 20; i++) cs.get(i)
    cs.clear()
    expect(cs.size).toBe(0)
    expect(cs.segmentCount()).toBe(0)
    expect(cs.cacheSize()).toBe(0)
    expect(cs.cacheHits()).toBe(0)
    expect(cs.cacheMisses()).toBe(0)
  })

  it('handles only pop operations on empty', () => {
    const cs = new CachedSegment<number>({ segmentSize: 4 })
    expect(cs.pop()).toBeUndefined()
    expect(cs.pop()).toBeUndefined()
    expect(cs.size).toBe(0)
  })

  it('get after set verifies consistency', () => {
    const cs = new CachedSegment<number>({ segmentSize: 3 })
    cs.push(1)
    cs.push(2)
    cs.push(3)
    cs.push(4)
    cs.push(5)
    cs.set(0, 10)
    cs.set(2, 30)
    cs.set(4, 50)
    expect(cs.toArray()).toEqual([10, 2, 30, 4, 50])
  })

  it('repeated push-pop cycle', () => {
    const cs = new CachedSegment<number>({ segmentSize: 2 })
    for (let cycle = 0; cycle < 10; cycle++) {
      cs.push(cycle * 10)
      cs.push(cycle * 10 + 1)
      expect(cs.size).toBe(2)
      expect(cs.pop()).toBe(cycle * 10 + 1)
      expect(cs.pop()).toBe(cycle * 10)
      expect(cs.size).toBe(0)
    }
  })
})
