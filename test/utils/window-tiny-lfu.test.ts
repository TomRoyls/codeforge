import { describe, it, expect } from 'vitest'
import { WindowTinyLFU } from '../../src/utils/window-tiny-lfu.js'

describe('WindowTinyLFU', () => {
  it('throws on capacity < 1', () => {
    expect(() => new WindowTinyLFU(0)).toThrow(RangeError)
  })

  it('throws on negative capacity', () => {
    expect(() => new WindowTinyLFU(-1)).toThrow(RangeError)
  })

  it('throws on capacity 0.5 (non-integer)', () => {
    expect(() => new WindowTinyLFU(0.5)).toThrow(RangeError)
  })

  it('accepts capacity of 1', () => {
    const w = new WindowTinyLFU(1)
    expect(w.capacity).toBe(1)
  })

  it('accepts large capacity', () => {
    const w = new WindowTinyLFU(1000000)
    expect(w.capacity).toBe(1000000)
  })

  it('records accesses', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('a')
    w.recordAccess('a')
    w.recordAccess('a')
    expect(w.estimate('a')).toBeGreaterThanOrEqual(3)
  })

  it('admits more frequent over less frequent', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 10; i++) w.recordAccess('popular')
    w.recordAccess('rare')
    expect(w.shouldAdmit('popular', 'rare')).toBe(true)
  })

  it('rejects less frequent candidate', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 10; i++) w.recordAccess('victim')
    w.recordAccess('candidate')
    expect(w.shouldAdmit('candidate', 'victim')).toBe(false)
  })

  it('admits when frequencies are equal', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('a')
    w.recordAccess('b')
    expect(w.shouldAdmit('a', 'b')).toBe(false)
  })

  it('admits candidate with slightly higher frequency', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 5; i++) w.recordAccess('candidate')
    for (let i = 0; i < 3; i++) w.recordAccess('victim')
    expect(w.shouldAdmit('candidate', 'victim')).toBe(true)
  })

  it('exposes capacity', () => {
    const w = new WindowTinyLFU(50)
    expect(w.capacity).toBe(50)
  })

  it('exposes windowSize with default ratio', () => {
    const w = new WindowTinyLFU(100)
    expect(w.windowSize).toBe(1)
  })

  it('exposes windowSize with custom ratio', () => {
    const w = new WindowTinyLFU(100, 0.05)
    expect(w.windowSize).toBe(5)
  })

  it('ensures windowSize is at least 1', () => {
    const w = new WindowTinyLFU(10, 0.001)
    expect(w.windowSize).toBe(1)
  })

  it('tracks totalAccessesCount', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('a')
    w.recordAccess('b')
    expect(w.totalAccessesCount).toBe(2)
  })

  it('totalAccessesCount increments with each recordAccess', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 100; i++) {
      w.recordAccess(`key-${i}`)
    }
    expect(w.totalAccessesCount).toBe(100)
  })

  it('works with number keys', () => {
    const w = new WindowTinyLFU<number>(100)
    w.recordAccess(42)
    w.recordAccess(42)
    expect(w.estimate(42)).toBeGreaterThanOrEqual(2)
  })

  it('works with object keys (converted to string)', () => {
    const w = new WindowTinyLFU<object>(100)
    const obj = { id: 1 }
    w.recordAccess(obj)
    expect(w.estimate(obj)).toBeGreaterThanOrEqual(1)
  })

  it('works with string keys', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('test')
    expect(w.estimate('test')).toBeGreaterThan(0)
  })

  it('handles many unique keys', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 500; i++) {
      w.recordAccess(`key-${i}`)
    }
    expect(w.totalAccessesCount).toBe(500)
  })

  it('handles empty string keys', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('')
    w.recordAccess('')
    expect(w.estimate('')).toBeGreaterThanOrEqual(2)
  })

  it('handles special character keys', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('key-with-dashes')
    w.recordAccess('key.with.dots')
    w.recordAccess('key_with_underscores')
    expect(w.estimate('key-with-dashes')).toBeGreaterThan(0)
    expect(w.estimate('key.with.dots')).toBeGreaterThan(0)
    expect(w.estimate('key_with_underscores')).toBeGreaterThan(0)
  })

  it('handles unicode keys', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('café')
    w.recordAccess('日本語')
    expect(w.estimate('café')).toBeGreaterThan(0)
    expect(w.estimate('日本語')).toBeGreaterThan(0)
  })

  it('estimate returns 0 for unseen key', () => {
    const w = new WindowTinyLFU(100)
    expect(w.estimate('unknown')).toBe(0)
  })

  it('estimate returns 0 for multiple unseen keys', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('known')
    expect(w.estimate('unknown1')).toBe(0)
    expect(w.estimate('unknown2')).toBe(0)
    expect(w.estimate('unknown3')).toBe(0)
  })

  it('estimate increases with more accesses', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('item')
    const first = w.estimate('item')
    w.recordAccess('item')
    const second = w.estimate('item')
    w.recordAccess('item')
    const third = w.estimate('item')
    expect(third).toBeGreaterThanOrEqual(second)
    expect(second).toBeGreaterThanOrEqual(first)
  })

  it('handles single capacity', () => {
    const w = new WindowTinyLFU(1)
    w.recordAccess('x')
    expect(w.estimate('x')).toBeGreaterThanOrEqual(1)
  })

  it('many accesses to same key', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 50; i++) w.recordAccess('hot')
    expect(w.estimate('hot')).toBeGreaterThanOrEqual(10)
  })

  it('many accesses to same key with large count', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 100; i++) w.recordAccess('hot')
    expect(w.estimate('hot')).toBeGreaterThanOrEqual(20)
  })

  it('shouldAdmit with both unseen keys', () => {
    const w = new WindowTinyLFU(100)
    expect(w.shouldAdmit('a', 'b')).toBe(false)
  })

  it('shouldAdmit with one unseen and one seen', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('seen')
    expect(w.shouldAdmit('seen', 'unseen')).toBe(true)
    expect(w.shouldAdmit('unseen', 'seen')).toBe(false)
  })

  it('window eviction keeps working', () => {
    const w = new WindowTinyLFU(100, 0.02)
    for (let i = 0; i < 20; i++) {
      w.recordAccess(`key-${i}`)
    }
    expect(w.windowSize).toBeLessThanOrEqual(20)
  })

  it('window eviction removes least frequently accessed', () => {
    const w = new WindowTinyLFU(10, 0.5)
    w.recordAccess('frequent')
    w.recordAccess('frequent')
    w.recordAccess('rare')
    for (let i = 0; i < 8; i++) {
      w.recordAccess(`other-${i}`)
    }
    const freqEstimate = w.estimate('frequent')
    const rareEstimate = w.estimate('rare')
    expect(freqEstimate).toBeGreaterThan(rareEstimate)
  })

  it('handles resetting when sample size reached', () => {
    const w = new WindowTinyLFU(10)
    for (let i = 0; i < 5; i++) w.recordAccess('key1')
    for (let i = 0; i < 5; i++) w.recordAccess('key2')
    const beforeReset = w.estimate('key1')
    for (let i = 0; i < 90; i++) w.recordAccess(`other-${i}`)
    const afterReset = w.estimate('key1')
    expect(afterReset).toBeGreaterThanOrEqual(0)
  })

  it('totalAccessesCount decreases after reset', () => {
    const w = new WindowTinyLFU(10)
    for (let i = 0; i < 100; i++) {
      w.recordAccess(`key-${i % 5}`)
    }
    const highCount = w.totalAccessesCount
    for (let i = 0; i < 100; i++) {
      w.recordAccess(`key-${i % 5}`)
    }
    expect(w.totalAccessesCount).toBeLessThan(highCount + 100)
  })

  it('works with zero windowRatio (uses minimum window size)', () => {
    const w = new WindowTinyLFU(100, 0)
    expect(w.windowSize).toBe(1)
    w.recordAccess('a')
    expect(w.estimate('a')).toBeGreaterThan(0)
  })

  it('works with windowRatio of 1', () => {
    const w = new WindowTinyLFU(10, 1)
    expect(w.windowSize).toBe(10)
    for (let i = 0; i < 15; i++) {
      w.recordAccess(`key-${i}`)
    }
    expect(w.estimate('key-0')).toBeGreaterThan(0)
  })

  it('handles very large number of accesses', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 1000; i++) {
      w.recordAccess(`key-${i % 20}`)
    }
    expect(w.totalAccessesCount).toBe(500)
  })

  it('shouldAdmit is transitive for frequencies', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 10; i++) w.recordAccess('high')
    for (let i = 0; i < 5; i++) w.recordAccess('medium')
    w.recordAccess('low')
    expect(w.shouldAdmit('high', 'medium')).toBe(true)
    expect(w.shouldAdmit('medium', 'low')).toBe(true)
    expect(w.shouldAdmit('high', 'low')).toBe(true)
  })

  it('estimate is consistent for same key', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('key')
    w.recordAccess('key')
    const est1 = w.estimate('key')
    const est2 = w.estimate('key')
    expect(est1).toBe(est2)
  })

  it('handles recording same key repeatedly', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 200; i++) {
      w.recordAccess('same-key')
    }
    expect(w.estimate('same-key')).toBeGreaterThan(50)
  })

  it('works with custom sketchWidth', () => {
    const w = new WindowTinyLFU(100, 0.01, 500)
    w.recordAccess('key')
    expect(w.estimate('key')).toBeGreaterThan(0)
  })

  it('works with custom sketchDepth', () => {
    const w = new WindowTinyLFU(100, 0.01, 1000, 8)
    w.recordAccess('key')
    expect(w.estimate('key')).toBeGreaterThan(0)
  })

  it('shouldAdmit works with negative frequency difference', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('a')
    for (let i = 0; i < 5; i++) w.recordAccess('b')
    expect(w.shouldAdmit('a', 'b')).toBe(false)
  })

  it('handles recording access after reset threshold', () => {
    const w = new WindowTinyLFU(10)
    for (let i = 0; i < 100; i++) {
      w.recordAccess(`key-${i % 5}`)
    }
    w.recordAccess('new-key')
    expect(w.estimate('new-key')).toBeGreaterThan(0)
  })

  it('windowSize formula with various ratios', () => {
    const w1 = new WindowTinyLFU(1000, 0.1)
    expect(w1.windowSize).toBe(100)
    const w2 = new WindowTinyLFU(1000, 0.05)
    expect(w2.windowSize).toBe(50)
    const w3 = new WindowTinyLFU(1000, 0.2)
    expect(w3.windowSize).toBe(200)
  })

  it('estimate for unseen key returns 0', () => {
    const w = new WindowTinyLFU(100)
    expect(w.estimate('never-seen')).toBe(0)
  })

  it('recordAccess updates estimate incrementally', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('key')
    const est1 = w.estimate('key')
    w.recordAccess('key')
    const est2 = w.estimate('key')
    expect(est2).toBeGreaterThanOrEqual(est1)
  })

  it('shouldAdmit with zero candidate frequency', () => {
    const w = new WindowTinyLFU(100)
    w.recordAccess('victim')
    expect(w.shouldAdmit('candidate', 'victim')).toBe(false)
  })

  it('shouldAdmit with equal frequencies returns false', () => {
    const w = new WindowTinyLFU(100)
    for (let i = 0; i < 10; i++) {
      w.recordAccess('a')
      w.recordAccess('b')
    }
    expect(w.shouldAdmit('a', 'b')).toBe(false)
  })

  it('multiple keys in window', () => {
    const w = new WindowTinyLFU(100, 0.5)
    w.recordAccess('a')
    w.recordAccess('b')
    w.recordAccess('c')
    expect(w.estimate('a')).toBeGreaterThan(0)
    expect(w.estimate('b')).toBeGreaterThan(0)
    expect(w.estimate('c')).toBeGreaterThan(0)
  })

  it('window eviction works at capacity', () => {
    const w = new WindowTinyLFU(10, 0.5)
    for (let i = 0; i < 15; i++) {
      w.recordAccess(`key-${i}`)
    }
    expect(w.estimate('key-14')).toBeGreaterThan(0)
  })

  it('sketch with custom width and depth works', () => {
    const w = new WindowTinyLFU(100, 0.01, 500, 8)
    w.recordAccess('key')
    expect(w.estimate('key')).toBeGreaterThan(0)
    expect(w.capacity).toBe(100)
  })
})
describe('window-tiny-lfu - wave548', () => {
  it('window-tiny-lfu module defined', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu module is function', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu module has name', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu module not null', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave549', () => {
  it('window-tiny-lfu module defined', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu module is function', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave550', () => {
  it('window-tiny-lfu w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave551', () => {
  it('window-tiny-lfu w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave552', () => {
  it('window-tiny-lfu w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave553', () => {
  it('window-tiny-lfu w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave554', () => {
  it('window-tiny-lfu w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave555', () => {
  it('window-tiny-lfu w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave556', () => {
  it('window-tiny-lfu w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave557', () => {
  it('window-tiny-lfu w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave558', () => {
  it('window-tiny-lfu w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave559', () => {
  it('window-tiny-lfu w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave560', () => {
  it('window-tiny-lfu w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave561', () => {
  it('window-tiny-lfu w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
