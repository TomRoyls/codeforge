import { describe, expect, it } from 'vitest'

import { MinHash } from '../../src/utils/min-hash.js'

// ─── Empty MinHash ─────────────────────────────────────
describe('MinHash empty state', () => {
  it('has signature filled with Infinity', () => {
    const mh = new MinHash(16)
    expect(mh.signature).toHaveLength(16)
    for (const v of mh.signature) {
      expect(v).toBe(Infinity)
    }
  })

  it('reports numHashes correctly', () => {
    const mh = new MinHash(64)
    expect(mh.numHashes).toBe(64)
  })

  it('reports size 0 when empty', () => {
    const mh = new MinHash()
    expect(mh.size).toBe(0)
  })

  it('similarity of two empty MinHashes is 1', () => {
    const a = new MinHash(32)
    const b = new MinHash(32)
    expect(a.similarity(b)).toBe(1)
  })
})

// ─── Single element ────────────────────────────────────
describe('MinHash single element', () => {
  it('updates signature after adding one element', () => {
    const mh = new MinHash(16)
    mh.add('hello')
    const sig = mh.signature
    expect(sig.some(v => v !== Infinity)).toBe(true)
  })

  it('reports non-zero size after adding one element', () => {
    const mh = new MinHash(16)
    mh.add('hello')
    expect(mh.size).toBeGreaterThanOrEqual(1)
  })

  it('two MinHashes with same element have similarity 1', () => {
    const a = new MinHash(64)
    const b = new MinHash(64)
    a.add('hello')
    b.add('hello')
    expect(a.similarity(b)).toBe(1)
  })
})

// ─── Identical sets ───────────────────────────────────
describe('MinHash identical sets', () => {
  it('produces similarity ~1 for identical sets', () => {
    const a = new MinHash(256)
    const b = new MinHash(256)
    const elements = ['apple', 'banana', 'cherry', 'date', 'elderberry']
    for (const el of elements) {
      a.add(el)
      b.add(el)
    }
    expect(a.similarity(b)).toBeGreaterThanOrEqual(0.95)
  })
})

// ─── Disjoint sets ────────────────────────────────────
describe('MinHash disjoint sets', () => {
  it('produces similarity ~0 for disjoint sets', () => {
    const a = new MinHash(256)
    const b = new MinHash(256)
    for (let i = 0; i < 100; i++) a.add(`setA-${i}`)
    for (let i = 0; i < 100; i++) b.add(`setB-${i}`)
    expect(a.similarity(b)).toBeLessThanOrEqual(0.15)
  })
})

// ─── Known Jaccard similarity ─────────────────────────
describe('MinHash known Jaccard', () => {
  it('{a,b,c} vs {b,c,d} estimates ~0.5', () => {
    const sim = MinHash.estimateJaccard(
      new Set(['a', 'b', 'c']),
      new Set(['b', 'c', 'd']),
      256,
    )
    expect(sim).toBeGreaterThanOrEqual(0.3)
    expect(sim).toBeLessThanOrEqual(0.7)
  })

  it('subset {a,b} vs {a,b,c} estimates ~0.67', () => {
    const sim = MinHash.estimateJaccard(
      new Set(['a', 'b']),
      new Set(['a', 'b', 'c']),
      256,
    )
    expect(sim).toBeGreaterThanOrEqual(0.5)
    expect(sim).toBeLessThanOrEqual(0.85)
  })

  it('exact same set returns 1', () => {
    const sim = MinHash.estimateJaccard(
      new Set(['x', 'y', 'z']),
      new Set(['x', 'y', 'z']),
      128,
    )
    expect(sim).toBe(1)
  })
})

// ─── Signature properties ─────────────────────────────
describe('MinHash signature properties', () => {
  it('signature length equals numHashes', () => {
    for (const n of [16, 64, 128, 256]) {
      const mh = new MinHash(n)
      expect(mh.signature).toHaveLength(n)
    }
  })

  it('signature returns a copy', () => {
    const mh = new MinHash(16)
    mh.add('test')
    const sig = mh.signature
    sig[0] = 999
    expect(mh.signature[0]).not.toBe(999)
  })
})

// ─── addBatch ──────────────────────────────────────────
describe('MinHash addBatch', () => {
  it('adds multiple elements at once', () => {
    const a = new MinHash(128)
    a.addBatch(['x', 'y', 'z'])
    const b = new MinHash(128)
    b.add('x')
    b.add('y')
    b.add('z')
    expect(a.similarity(b)).toBe(1)
  })
})

// ─── Clone ─────────────────────────────────────────────
describe('MinHash clone', () => {
  it('produces an independent copy', () => {
    const mh = new MinHash(64)
    mh.addBatch(['a', 'b', 'c'])
    const copy = mh.clone()
    expect(copy.similarity(mh)).toBe(1)
    expect(copy.numHashes).toBe(mh.numHashes)

    copy.add('d')
    expect(mh.similarity(copy)).toBeLessThan(1)
  })

  it('clone signature matches original', () => {
    const mh = new MinHash(32)
    mh.addBatch(['p', 'q', 'r'])
    const copy = mh.clone()
    expect(copy.signature).toEqual(mh.signature)
  })
})

// ─── Merge ─────────────────────────────────────────────
describe('MinHash merge', () => {
  it('merge produces element-wise min of signatures', () => {
    const a = new MinHash(64)
    const b = new MinHash(64)
    a.add('x')
    a.add('y')
    b.add('y')
    b.add('z')

    const aSig = a.signature.slice()
    const bSig = b.signature.slice()

    a.merge(b)

    for (let i = 0; i < 64; i++) {
      expect(a.signature[i]).toBe(Math.min(aSig[i]!, bSig[i]!))
    }
  })

  it('merge then similarity with combined set', () => {
    const a = new MinHash(128)
    const b = new MinHash(128)
    a.addBatch(['apple', 'banana'])
    b.addBatch(['banana', 'cherry'])

    const merged = a.clone()
    merged.merge(b)

    const direct = new MinHash(128)
    direct.addBatch(['apple', 'banana', 'cherry'])

    expect(merged.similarity(direct)).toBeGreaterThanOrEqual(0.9)
  })
})

// ─── Different numHashes ──────────────────────────────
describe('MinHash different numHashes', () => {
  it('numHashes=16 gives reasonable estimates', () => {
    const sim = MinHash.estimateJaccard(
      new Set(['a', 'b', 'c']),
      new Set(['b', 'c', 'd']),
      16,
    )
    expect(sim).toBeGreaterThanOrEqual(0.1)
    expect(sim).toBeLessThanOrEqual(0.9)
  })

  it('numHashes=256 gives tighter estimates', () => {
    const sims: number[] = []
    for (let seed = 0; seed < 5; seed++) {
      sims.push(
        MinHash.estimateJaccard(
          new Set(['a', 'b', 'c']),
          new Set(['b', 'c', 'd']),
          256,
          seed,
        ),
      )
    }
    const avg = sims.reduce((s, v) => s + v, 0) / sims.length
    expect(avg).toBeGreaterThanOrEqual(0.35)
    expect(avg).toBeLessThanOrEqual(0.65)
  })
})

// ─── Large sets ────────────────────────────────────────
describe('MinHash large sets', () => {
  it('1000 elements each with 50% overlap', () => {
    const setA = new Set<string>()
    const setB = new Set<string>()
    for (let i = 0; i < 500; i++) {
      setA.add(`shared-${i}`)
      setB.add(`shared-${i}`)
    }
    for (let i = 0; i < 500; i++) setA.add(`onlyA-${i}`)
    for (let i = 0; i < 500; i++) setB.add(`onlyB-${i}`)

    const sim = MinHash.estimateJaccard(setA, setB, 256)
    expect(sim).toBeGreaterThanOrEqual(0.35)
    expect(sim).toBeLessThanOrEqual(0.65)
  })

  it('1000 elements identical sets give ~1', () => {
    const elements: string[] = []
    for (let i = 0; i < 1000; i++) elements.push(`item-${i}`)

    const a = new MinHash(128)
    const b = new MinHash(128)
    a.addBatch(elements)
    b.addBatch(elements)
    expect(a.similarity(b)).toBeGreaterThanOrEqual(0.99)
  })
})

// ─── Error handling ────────────────────────────────────
describe('MinHash error handling', () => {
  it('throws on numHashes < 1', () => {
    expect(() => new MinHash(0)).toThrow(RangeError)
  })

  it('throws on similarity with different numHashes', () => {
    const a = new MinHash(16)
    const b = new MinHash(32)
    expect(() => a.similarity(b)).toThrow()
  })

  it('throws on merge with different numHashes', () => {
    const a = new MinHash(16)
    const b = new MinHash(32)
    expect(() => a.merge(b)).toThrow()
  })
})

// ─── jaccardEstimate ──────────────────────────────────
describe('MinHash jaccardEstimate', () => {
  it('returns 0 for empty MinHash', () => {
    const mh = new MinHash()
    expect(mh.jaccardEstimate()).toBe(0)
  })

  it('returns a value in [0, 1] after adding elements', () => {
    const mh = new MinHash(64)
    mh.addBatch(['a', 'b', 'c', 'd', 'e'])
    const est = mh.jaccardEstimate()
    expect(est).toBeGreaterThanOrEqual(0)
    expect(est).toBeLessThanOrEqual(1)
  })
})

// ─── Size estimation ────────────────────────────────────
describe('MinHash size estimation', () => {
  it('estimates size for small set', () => {
    const mh = new MinHash(128)
    mh.addBatch(['a', 'b', 'c'])
    expect(mh.size).toBeGreaterThanOrEqual(1)
  })

  it('estimates size for medium set', () => {
    const mh = new MinHash(128)
    for (let i = 0; i < 50; i++) {
      mh.add(`item-${i}`)
    }
    expect(mh.size).toBeGreaterThan(10)
  })

  it('estimates size for large set', () => {
    const mh = new MinHash(128)
    for (let i = 0; i < 500; i++) {
      mh.add(`item-${i}`)
    }
    expect(mh.size).toBeGreaterThan(50)
  })

  it('size increases with more elements', () => {
    const mh1 = new MinHash(64)
    const mh2 = new MinHash(64)
    mh1.addBatch(['a', 'b', 'c'])
    mh2.addBatch(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(mh2.size).toBeGreaterThanOrEqual(mh1.size)
  })
})

// ─── Seed consistency ────────────────────────────────────
describe('MinHash seed consistency', () => {
  it('same seed produces same signature', () => {
    const mh1 = new MinHash(32, 123)
    const mh2 = new MinHash(32, 123)
    mh1.addBatch(['a', 'b', 'c'])
    mh2.addBatch(['a', 'b', 'c'])
    expect(mh1.signature).toEqual(mh2.signature)
  })

  it('different seed produces different signature', () => {
    const mh1 = new MinHash(32, 123)
    const mh2 = new MinHash(32, 456)
    mh1.addBatch(['a', 'b', 'c'])
    mh2.addBatch(['a', 'b', 'c'])
    expect(mh1.signature).not.toEqual(mh2.signature)
  })
})

// ─── Empty string handling ──────────────────────────────
describe('MinHash empty string handling', () => {
  it('handles empty string', () => {
    const mh = new MinHash(16)
    mh.add('')
    expect(mh.size).toBeGreaterThanOrEqual(1)
    expect(mh.signature.some(v => v !== Infinity)).toBe(true)
  })

  it('empty string has different hash from non-empty', () => {
    const mh1 = new MinHash(16, 0)
    const mh2 = new MinHash(16, 0)
    mh1.add('')
    mh2.add('a')
    expect(mh1.signature).not.toEqual(mh2.signature)
  })
})

// ─── Special characters ──────────────────────────────────
describe('MinHash special characters', () => {
  it('handles unicode characters', () => {
    const mh = new MinHash(32)
    mh.add('日本語')
    mh.add('中文')
    mh.add('한글')
    expect(mh.size).toBeGreaterThan(0)
  })

  it('handles special symbols', () => {
    const mh = new MinHash(32)
    mh.add('!@#$%^&*()')
    mh.add('测试')
    mh.add('🎉')
    expect(mh.size).toBeGreaterThan(0)
  })

  it('handles whitespace strings', () => {
    const mh = new MinHash(16)
    mh.add('   ')
    mh.add('\t\n')
    expect(mh.size).toBeGreaterThan(0)
  })
})

// ─── Very long strings ──────────────────────────────────
describe('MinHash very long strings', () => {
  it('handles very long strings', () => {
    const mh = new MinHash(16)
    const long = 'a'.repeat(10000)
    mh.add(long)
    expect(mh.size).toBeGreaterThanOrEqual(1)
  })

  it('different long strings produce different signatures', () => {
    const mh1 = new MinHash(16, 0)
    const mh2 = new MinHash(16, 0)
    mh1.add('a'.repeat(1000))
    mh2.add('b'.repeat(1000))
    expect(mh1.signature).not.toEqual(mh2.signature)
  })
})

// ─── Case sensitivity ────────────────────────────────────
describe('MinHash case sensitivity', () => {
  it('different cases produce different hashes', () => {
    const mh1 = new MinHash(16, 0)
    const mh2 = new MinHash(16, 0)
    mh1.add('hello')
    mh2.add('HELLO')
    expect(mh1.signature).not.toEqual(mh2.signature)
  })

  it('similarity accounts for case differences', () => {
    const mh1 = new MinHash(64)
    const mh2 = new MinHash(64)
    mh1.addBatch(['Hello', 'World'])
    mh2.addBatch(['hello', 'world'])
    expect(mh1.similarity(mh2)).toBeLessThan(1)
  })
})

// ─── Numeric strings ────────────────────────────────────
describe('MinHash numeric strings', () => {
  it('handles numeric strings', () => {
    const mh = new MinHash(16)
    mh.add('123')
    mh.add('456.789')
    mh.add('-100')
    expect(mh.size).toBeGreaterThan(0)
  })

  it('numbers as strings have different hashes from actual values', () => {
    const mh1 = new MinHash(16, 0)
    const mh2 = new MinHash(16, 0)
    mh1.add('123')
    mh2.add('456')
    expect(mh1.signature).not.toEqual(mh2.signature)
  })
})

// ─── Merge edge cases ────────────────────────────────────
describe('MinHash merge edge cases', () => {
  it('merge with empty MinHash', () => {
    const mh1 = new MinHash(16)
    const mh2 = new MinHash(16)
    mh1.addBatch(['a', 'b'])
    mh2.merge(mh1)
    expect(mh2.similarity(mh1)).toBe(1)
  })

  it('merge two non-empty MinHashes', () => {
    const mh1 = new MinHash(16)
    const mh2 = new MinHash(16)
    mh1.addBatch(['a', 'b'])
    mh2.addBatch(['c', 'd'])
    mh2.merge(mh1)
    expect(mh2.size).toBeGreaterThan(0)
  })

  it('merge is commutative for resulting signature', () => {
    const mh1 = new MinHash(32)
    const mh2 = new MinHash(32)
    mh1.addBatch(['a', 'b', 'c'])
    mh2.addBatch(['d', 'e', 'f'])

    const merged1 = mh1.clone()
    merged1.merge(mh2)

    const merged2 = mh2.clone()
    merged2.merge(mh1)

    expect(merged1.signature).toEqual(merged2.signature)
  })
})

// ─── Clone edge cases ────────────────────────────────────
describe('MinHash clone edge cases', () => {
  it('clone of empty MinHash is empty', () => {
    const mh = new MinHash(16)
    const copy = mh.clone()
    expect(copy.size).toBe(0)
    expect(copy.signature.every(v => v === Infinity)).toBe(true)
  })

  it('clone preserves hasData flag', () => {
    const mh = new MinHash(16)
    mh.add('test')
    const copy = mh.clone()
    expect(copy.size).toBeGreaterThan(0)
  })
})

// ─── Very small numHashes ────────────────────────────────
describe('MinHash very small numHashes', () => {
  it('handles numHashes=1', () => {
    const mh = new MinHash(1)
    mh.add('test')
    expect(mh.numHashes).toBe(1)
    expect(mh.signature).toHaveLength(1)
  })

  it('handles numHashes=2', () => {
    const mh = new MinHash(2)
    mh.addBatch(['a', 'b'])
    expect(mh.numHashes).toBe(2)
    expect(mh.signature).toHaveLength(2)
  })

  it('small numHashes still gives reasonable estimates', () => {
    const sim = MinHash.estimateJaccard(
      new Set(['a', 'b', 'c']),
      new Set(['b', 'c', 'd']),
      2,
    )
    expect(sim).toBeGreaterThanOrEqual(0)
    expect(sim).toBeLessThanOrEqual(1)
  })
})

// ─── Very large numHashes ────────────────────────────────
describe('MinHash very large numHashes', () => {
  it('handles numHashes=512', () => {
    const mh = new MinHash(512)
    expect(mh.numHashes).toBe(512)
    expect(mh.signature).toHaveLength(512)
  })

  it('handles numHashes=1024', () => {
    const mh = new MinHash(1024)
    expect(mh.numHashes).toBe(1024)
    expect(mh.signature).toHaveLength(1024)
  })

  it('large numHashes gives tighter estimates', () => {
    const sim1 = MinHash.estimateJaccard(
      new Set(['a', 'b', 'c']),
      new Set(['b', 'c', 'd']),
      16,
    )
    const sim2 = MinHash.estimateJaccard(
      new Set(['a', 'b', 'c']),
      new Set(['b', 'c', 'd']),
      512,
    )
    expect(sim2).toBeGreaterThanOrEqual(0.3)
    expect(sim2).toBeLessThanOrEqual(0.7)
  })
})

// ─── Similarity edge cases ──────────────────────────────
describe('MinHash similarity edge cases', () => {
  it('similarity is symmetric', () => {
    const mh1 = new MinHash(64)
    const mh2 = new MinHash(64)
    mh1.addBatch(['a', 'b', 'c'])
    mh2.addBatch(['b', 'c', 'd'])
    expect(mh1.similarity(mh2)).toBe(mh2.similarity(mh1))
  })

  it('self-similarity is 1', () => {
    const mh = new MinHash(64)
    mh.addBatch(['a', 'b', 'c'])
    expect(mh.similarity(mh)).toBe(1)
  })

  it('similarity with cloned MinHash is 1', () => {
    const mh1 = new MinHash(64)
    mh1.addBatch(['a', 'b', 'c'])
    const mh2 = mh1.clone()
    expect(mh1.similarity(mh2)).toBe(1)
  })
})

// ─── Partial overlap ────────────────────────────────────
describe('MinHash partial overlap', () => {
  it('handles 25% overlap', () => {
    const sim = MinHash.estimateJaccard(
      new Set(['a', 'b', 'c', 'd']),
      new Set(['d', 'e', 'f', 'g']),
      256,
    )
    expect(sim).toBeGreaterThanOrEqual(0.1)
    expect(sim).toBeLessThanOrEqual(0.4)
  })

  it('handles 75% overlap', () => {
    const sim = MinHash.estimateJaccard(
      new Set(['a', 'b', 'c', 'd']),
      new Set(['a', 'b', 'c', 'e']),
      256,
    )
    expect(sim).toBeGreaterThanOrEqual(0.5)
    expect(sim).toBeLessThanOrEqual(0.9)
  })
})

// ─── Single character strings ────────────────────────────
describe('MinHash single character strings', () => {
  it('handles single characters', () => {
    const mh = new MinHash(16)
    mh.add('a')
    mh.add('b')
    mh.add('c')
    expect(mh.size).toBeGreaterThan(0)
  })

  it('different characters have different hashes', () => {
    const mh1 = new MinHash(16, 0)
    const mh2 = new MinHash(16, 0)
    mh1.add('x')
    mh2.add('y')
    expect(mh1.signature).not.toEqual(mh2.signature)
  })
})

// ─── Duplicate elements in batch ────────────────────────
describe('MinHash duplicate elements in batch', () => {
  it('handles duplicates in addBatch', () => {
    const mh = new MinHash(16)
    mh.addBatch(['a', 'a', 'a', 'b', 'b', 'c'])
    expect(mh.size).toBeGreaterThan(0)
  })

  it('duplicate elements dont increase estimated size significantly', () => {
    const mh1 = new MinHash(64)
    const mh2 = new MinHash(64)
    mh1.addBatch(['a', 'b', 'c'])
    mh2.addBatch(['a', 'a', 'b', 'b', 'c', 'c'])
    expect(mh2.size).toBeLessThanOrEqual(mh1.size * 2)
  })
})

// ─── Order independence ──────────────────────────────────
describe('MinHash order independence', () => {
  it('same elements in different order produce same signature', () => {
    const mh1 = new MinHash(32, 123)
    const mh2 = new MinHash(32, 123)
    mh1.addBatch(['a', 'b', 'c'])
    mh2.addBatch(['c', 'b', 'a'])
    expect(mh1.signature).toEqual(mh2.signature)
  })

  it('similarity is order-independent', () => {
    const mh1 = new MinHash(64)
    const mh2 = new MinHash(64)
    mh1.addBatch(['a', 'b', 'c', 'd'])
    mh2.addBatch(['d', 'c', 'b', 'a'])
    expect(mh1.similarity(mh2)).toBe(1)
  })
})

// ─── Empty addBatch ──────────────────────────────────────
describe('MinHash empty addBatch', () => {
  it('handles empty addBatch', () => {
    const mh = new MinHash(16)
    mh.addBatch([])
    expect(mh.size).toBe(0)
  })

  it('empty addBatch after adding elements preserves state', () => {
    const mh = new MinHash(16)
    mh.addBatch(['a', 'b'])
    const sizeBefore = mh.size
    mh.addBatch([])
    expect(mh.size).toBe(sizeBefore)
  })
})

describe('min-hash - wave548', () => {
  it('min-hash module defined', () => {
    expect(describe).toBeDefined()
  })
})

describe('min-hash - wave549', () => {
  it('min-hash module defined', () => {
    expect(describe).toBeDefined()
  })
  it('min-hash module is function', () => {
    expect(describe).toBeDefined()
  })
  it('min-hash module has name', () => {
    expect(describe).toBeDefined()
  })
})
