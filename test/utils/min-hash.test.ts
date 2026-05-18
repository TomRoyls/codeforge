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
