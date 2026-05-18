import { describe, expect, it } from 'vitest'
import { PairingFunction2 } from '../../src/core/pairing-function-2/index.js'

// ─── Cantor Pair ───

describe('PairingFunction2 cantorPair', () => {
  it('pairs (0, 0) to 0', () => {
    expect(PairingFunction2.cantorPair(0, 0)).toBe(0n)
  })

  it('pairs (1, 0) correctly', () => {
    expect(PairingFunction2.cantorPair(1, 0)).toBe(1n)
  })

  it('pairs (0, 1) correctly', () => {
    expect(PairingFunction2.cantorPair(0, 1)).toBe(2n)
  })

  it('pairs (1, 1) correctly', () => {
    expect(PairingFunction2.cantorPair(1, 1)).toBe(4n)
  })

  it('throws on negative x', () => {
    expect(() => PairingFunction2.cantorPair(-1, 0)).toThrow(
      'Cantor pairing requires non-negative integers'
    )
  })

  it('throws on negative y', () => {
    expect(() => PairingFunction2.cantorPair(0, -1)).toThrow(
      'Cantor pairing requires non-negative integers'
    )
  })
})

// ─── Cantor Unpair ───

describe('PairingFunction2 cantorUnpair', () => {
  it('unpairs 0 to (0, 0)', () => {
    expect(PairingFunction2.cantorUnpair(0n)).toEqual([0, 0])
  })

  it('unpairs 1 to (1, 0)', () => {
    expect(PairingFunction2.cantorUnpair(1n)).toEqual([1, 0])
  })

  it('unpairs 2 to (0, 1)', () => {
    expect(PairingFunction2.cantorUnpair(2n)).toEqual([0, 1])
  })

  it('throws on negative input', () => {
    expect(() => PairingFunction2.cantorUnpair(-1n)).toThrow(
      'Cantor unpairing requires non-negative integer'
    )
  })
})

// ─── Cantor Round-trip ───

describe('PairingFunction2 cantor round-trip', () => {
  it('round-trips for (0, 0)', () => {
    const z = PairingFunction2.cantorPair(0, 0)
    expect(PairingFunction2.cantorUnpair(z)).toEqual([0, 0])
  })

  it('round-trips for various pairs', () => {
    const pairs: [number, number][] = [
      [3, 7],
      [10, 0],
      [0, 10],
      [100, 200],
      [5, 5],
    ]
    for (const [x, y] of pairs) {
      const z = PairingFunction2.cantorPair(x, y)
      expect(PairingFunction2.cantorUnpair(z)).toEqual([x, y])
    }
  })
})

// ─── Szudzik Pair ───

describe('PairingFunction2 szudzikPair', () => {
  it('pairs (0, 0) to 0', () => {
    expect(PairingFunction2.szudzikPair(0, 0)).toBe(0n)
  })

  it('pairs (0, 1) correctly', () => {
    expect(PairingFunction2.szudzikPair(0, 1)).toBe(1n)
  })

  it('pairs (1, 0) correctly', () => {
    expect(PairingFunction2.szudzikPair(1, 0)).toBe(2n)
  })

  it('throws on negative x', () => {
    expect(() => PairingFunction2.szudzikPair(-1, 0)).toThrow(
      'Szudzik pairing requires non-negative integers'
    )
  })

  it('throws on negative y', () => {
    expect(() => PairingFunction2.szudzikPair(0, -1)).toThrow(
      'Szudzik pairing requires non-negative integers'
    )
  })
})

// ─── Szudzik Unpair ───

describe('PairingFunction2 szudzikUnpair', () => {
  it('unpairs 0 to (0, 0)', () => {
    expect(PairingFunction2.szudzikUnpair(0n)).toEqual([0, 0])
  })

  it('unpairs 1 to (0, 1)', () => {
    expect(PairingFunction2.szudzikUnpair(1n)).toEqual([0, 1])
  })

  it('unpairs 2 to (1, 0)', () => {
    expect(PairingFunction2.szudzikUnpair(2n)).toEqual([1, 0])
  })

  it('throws on negative input', () => {
    expect(() => PairingFunction2.szudzikUnpair(-1n)).toThrow(
      'Szudzik unpairing requires non-negative integer'
    )
  })
})

// ─── Szudzik Round-trip ───

describe('PairingFunction2 szudzik round-trip', () => {
  it('round-trips for various pairs', () => {
    const pairs: [number, number][] = [
      [0, 0],
      [0, 5],
      [5, 0],
      [3, 7],
      [7, 3],
      [100, 200],
    ]
    for (const [x, y] of pairs) {
      const z = PairingFunction2.szudzikPair(x, y)
      expect(PairingFunction2.szudzikUnpair(z)).toEqual([x, y])
    }
  })
})

// ─── Elegant Pair ───

describe('PairingFunction2 elegantPair', () => {
  it('pairs (0, 0) to 0', () => {
    expect(PairingFunction2.elegantPair(0, 0)).toBe(0n)
  })

  it('throws on negative inputs', () => {
    expect(() => PairingFunction2.elegantPair(-1, 0)).toThrow(
      'Elegant pairing requires non-negative integers'
    )
  })
})

// ─── Elegant Unpair ───

describe('PairingFunction2 elegantUnpair', () => {
  it('unpairs 0 to (0, 0)', () => {
    expect(PairingFunction2.elegantUnpair(0n)).toEqual([0, 0])
  })

  it('throws on negative input', () => {
    expect(() => PairingFunction2.elegantUnpair(-1n)).toThrow(
      'Elegant unpairing requires non-negative integer'
    )
  })
})

// ─── Elegant Round-trip ───

describe('PairingFunction2 elegant round-trip', () => {
  it('round-trips for various pairs', () => {
    const pairs: [number, number][] = [
      [0, 0],
      [1, 0],
      [0, 1],
      [3, 7],
      [7, 3],
      [50, 100],
    ]
    for (const [x, y] of pairs) {
      const z = PairingFunction2.elegantPair(x, y)
      expect(PairingFunction2.elegantUnpair(z)).toEqual([x, y])
    }
  })
})

// ─── IsPairable ───

describe('PairingFunction2 isPairable', () => {
  it('returns true for valid non-negative numbers', () => {
    expect(PairingFunction2.isPairable(0, 0)).toBe(true)
    expect(PairingFunction2.isPairable(100, 200)).toBe(true)
  })

  it('returns false for negative numbers', () => {
    expect(PairingFunction2.isPairable(-1, 0)).toBe(false)
    expect(PairingFunction2.isPairable(0, -1)).toBe(false)
  })

  it('returns true for MAX_SAFE_INTEGER', () => {
    expect(PairingFunction2.isPairable(Number.MAX_SAFE_INTEGER, 0)).toBe(true)
  })

  it('returns false for values exceeding MAX_SAFE_INTEGER', () => {
    expect(PairingFunction2.isPairable(Number.MAX_SAFE_INTEGER + 1, 0)).toBe(false)
  })
})
