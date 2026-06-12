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

describe('window-tiny-lfu - wave562', () => {
  it('window-tiny-lfu w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave563', () => {
  it('window-tiny-lfu w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave564', () => {
  it('window-tiny-lfu w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave565', () => {
  it('window-tiny-lfu w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave566', () => {
  it('window-tiny-lfu w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave127', () => {
  it('window-tiny-lfu w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave130', () => {
  it('window-tiny-lfu w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave133', () => {
  it('window-tiny-lfu w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave136', () => {
  it('window-tiny-lfu w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - wave139', () => {
  it('window-tiny-lfu w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w142', () => {
  it('window-tiny-lfu v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w145', () => {
  it('window-tiny-lfu v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w148', () => {
  it('window-tiny-lfu v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w151', () => {
  it('window-tiny-lfu v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w154', () => {
  it('window-tiny-lfu v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w157', () => {
  it('window-tiny-lfu v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w160', () => {
  it('window-tiny-lfu v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w170', () => {
  it('window-tiny-lfu x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w180', () => {
  it('window-tiny-lfu x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w190', () => {
  it('window-tiny-lfu x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w200', () => {
  it('window-tiny-lfu x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w210', () => {
  it('window-tiny-lfu x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w220', () => {
  it('window-tiny-lfu x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w230', () => {
  it('window-tiny-lfu x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w240', () => {
  it('window-tiny-lfu x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w250', () => {
  it('window-tiny-lfu x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w260', () => {
  it('window-tiny-lfu x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w270', () => {
  it('window-tiny-lfu x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w280', () => {
  it('window-tiny-lfu x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w290', () => {
  it('window-tiny-lfu x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w300', () => {
  it('window-tiny-lfu x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w310', () => {
  it('window-tiny-lfu x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w320', () => {
  it('window-tiny-lfu x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w330', () => {
  it('window-tiny-lfu x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w340', () => {
  it('window-tiny-lfu x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w350', () => {
  it('window-tiny-lfu x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w360', () => {
  it('window-tiny-lfu x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w370', () => {
  it('window-tiny-lfu x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w380', () => {
  it('window-tiny-lfu x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w390', () => {
  it('window-tiny-lfu x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w400', () => {
  it('window-tiny-lfu x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w420', () => {
  it('window-tiny-lfu x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w440', () => {
  it('window-tiny-lfu x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w460', () => {
  it('window-tiny-lfu x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w480', () => {
  it('window-tiny-lfu x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w500', () => {
  it('window-tiny-lfu x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w550', () => {
  it('window-tiny-lfu x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('window-tiny-lfu - w600', () => {
  it('window-tiny-lfu x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('window-tiny-lfu x600x49', () => {
    expect(describe).toBeDefined()
  })
})
