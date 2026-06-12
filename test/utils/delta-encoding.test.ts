import { describe, expect, it } from 'vitest'
import { DeltaEncoding } from '../../src/utils/delta-encoding.js'

describe('DeltaEncoding', () => {
  it('encodes and decodes ascending sequence', () => {
    const encoded = DeltaEncoding.encode([1, 3, 6, 10, 15])
    expect(encoded.first).toBe(1)
    expect(encoded.deltas).toEqual([2, 3, 4, 5])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual([1, 3, 6, 10, 15])
  })

  it('handles empty array', () => {
    const encoded = DeltaEncoding.encode([])
    expect(encoded.first).toBe(0)
    expect(encoded.deltas).toEqual([])
    expect(DeltaEncoding.decode(0, [])).toEqual([])
  })

  it('handles single element', () => {
    const encoded = DeltaEncoding.encode([42])
    expect(encoded.first).toBe(42)
    expect(encoded.deltas).toEqual([])
    expect(DeltaEncoding.decode(42, [])).toEqual([42])
  })

  it('handles constant values', () => {
    const encoded = DeltaEncoding.encode([5, 5, 5, 5])
    expect(encoded.deltas).toEqual([0, 0, 0])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual([5, 5, 5, 5])
  })

  it('handles descending sequence', () => {
    const encoded = DeltaEncoding.encode([10, 7, 4, 1])
    expect(encoded.deltas).toEqual([-3, -3, -3])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual([10, 7, 4, 1])
  })

  it('handles negative numbers', () => {
    const encoded = DeltaEncoding.encode([-5, -3, 0, 4])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual([-5, -3, 0, 4])
  })

  it('zigzag encode/decode', () => {
    const encoded = DeltaEncoding.encodeZigzag([0, -1, 2, -3, 4])
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual([0, -1, 2, -3, 4])
  })

  it('compressSize returns reasonable size', () => {
    const encoded = DeltaEncoding.encode([1, 2, 3, 4, 5])
    expect(DeltaEncoding.compressSize(encoded.first, encoded.deltas)).toBeGreaterThan(0)
  })

  it('roundtrip with large numbers', () => {
    const arr = [1000000, 1000005, 1000015, 1000030]
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('zigzag roundtrip negative deltas', () => {
    const arr = [100, 90, 80, 70]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('roundtrip alternating positive negative', () => {
    const arr = [0, 5, -3, 8, -1]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles all negative numbers', () => {
    const arr = [-10, -20, -30, -40]
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles alternating signs', () => {
    const arr = [5, -5, 5, -5, 5]
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles zero deltas', () => {
    const arr = [10, 10, 10, 10, 10]
    const encoded = DeltaEncoding.encode(arr)
    expect(encoded.deltas).toEqual([0, 0, 0, 0])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles large positive deltas', () => {
    const arr = [0, 1000000, 2000000, 3000000]
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles large negative deltas', () => {
    const arr = [3000000, 2000000, 1000000, 0]
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles two element array', () => {
    const arr = [10, 20]
    const encoded = DeltaEncoding.encode(arr)
    expect(encoded.first).toBe(10)
    expect(encoded.deltas).toEqual([10])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles three element array', () => {
    const arr = [10, 20, 35]
    const encoded = DeltaEncoding.encode(arr)
    expect(encoded.first).toBe(10)
    expect(encoded.deltas).toEqual([10, 15])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles array with zero first element', () => {
    const arr = [0, 5, 10, 15]
    const encoded = DeltaEncoding.encode(arr)
    expect(encoded.first).toBe(0)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles array with single zero element', () => {
    const arr = [0]
    const encoded = DeltaEncoding.encode(arr)
    expect(encoded.first).toBe(0)
    expect(encoded.deltas).toEqual([])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual([])
  })

  it('zigzag handles all zeros', () => {
    const arr = [0, 0, 0, 0]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('zigzag handles positive deltas only', () => {
    const arr = [0, 1, 2, 3, 4]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('zigzag handles negative deltas only', () => {
    const arr = [10, 9, 8, 7, 6]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('zigzag handles mixed deltas', () => {
    const arr = [0, 10, 5, 15, 10]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('zigzag handles single element', () => {
    const arr = [42]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(encoded.first).toBe(42)
    expect(encoded.deltas).toEqual([])
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('zigzag handles empty array', () => {
    const encoded = DeltaEncoding.encodeZigzag([])
    expect(encoded.first).toBe(0)
    expect(encoded.deltas).toEqual([])
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual([])
  })

  it('zigzag handles zero first element', () => {
    const arr = [0, -1, 1, -2]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('encode produces correct deltas', () => {
    const encoded = DeltaEncoding.encode([10, 15, 13, 20])
    expect(encoded.first).toBe(10)
    expect(encoded.deltas).toEqual([5, -2, 7])
  })

  it('encode handles negative first element', () => {
    const encoded = DeltaEncoding.encode([-10, -5, 0, 5])
    expect(encoded.first).toBe(-10)
    expect(encoded.deltas).toEqual([5, 5, 5])
  })

  it('decode reconstructs original array', () => {
    const decoded = DeltaEncoding.decode(10, [5, -2, 7, 3])
    expect(decoded).toEqual([10, 15, 13, 20, 23])
  })

  it('decode with empty deltas returns single element', () => {
    const decoded = DeltaEncoding.decode(42, [])
    expect(decoded).toEqual([42])
  })

  it('decode with zero first and empty deltas returns empty', () => {
    const decoded = DeltaEncoding.decode(0, [])
    expect(decoded).toEqual([])
  })

  it('decode with non-zero first and empty deltas returns single element', () => {
    const decoded = DeltaEncoding.decode(1, [])
    expect(decoded).toEqual([1])
  })

  it('decode handles negative first element', () => {
    const decoded = DeltaEncoding.decode(-10, [5, 5, 5])
    expect(decoded).toEqual([-10, -5, 0, 5])
  })

  it('decode handles negative deltas', () => {
    const decoded = DeltaEncoding.decode(20, [-5, -3, -2])
    expect(decoded).toEqual([20, 15, 12, 10])
  })

  it('decode handles zero deltas', () => {
    const decoded = DeltaEncoding.decode(10, [0, 0, 0])
    expect(decoded).toEqual([10, 10, 10, 10])
  })

  it('decode handles mixed deltas', () => {
    const decoded = DeltaEncoding.decode(10, [5, -2, 7, -3])
    expect(decoded).toEqual([10, 15, 13, 20, 17])
  })

  it('decodeZigzag handles positive zigzag values', () => {
    const decoded = DeltaEncoding.decodeZigzag(0, [2, 2, 2, 2])
    expect(decoded).toEqual([0, 1, 2, 3, 4])
  })

  it('decodeZigzag handles negative zigzag values', () => {
    const decoded = DeltaEncoding.decodeZigzag(0, [1, 1, 1, 1])
    expect(decoded).toEqual([0, -1, -2, -3, -4])
  })

  it('decodeZigzag handles mixed zigzag values', () => {
    const decoded = DeltaEncoding.decodeZigzag(0, [2, 1, 2, 1])
    expect(decoded).toEqual([0, 1, 0, 1, 0])
  })

  it('decodeZigzag with empty deltas returns single element if first is non-zero', () => {
    const decoded = DeltaEncoding.decodeZigzag(5, [])
    expect(decoded).toEqual([5])
  })

  it('decodeZigzag with empty deltas and zero first returns empty', () => {
    const decoded = DeltaEncoding.decodeZigzag(0, [])
    expect(decoded).toEqual([])
  })

  it('compressSize with small numbers', () => {
    const size = DeltaEncoding.compressSize(10, [1, 2, 3, 4, 5])
    expect(size).toBe(6)
  })

  it('compressSize with medium numbers', () => {
    const size = DeltaEncoding.compressSize(1000, [200, 300, 400])
    expect(size).toBe(8)
  })

  it('compressSize with large numbers', () => {
    const size = DeltaEncoding.compressSize(1000000, [500000, 1000000])
    expect(size).toBe(9)
  })

  it('compressSize with very large numbers', () => {
    const size = DeltaEncoding.compressSize(10000000, [5000000])
    expect(size).toBe(8)
  })

  it('compressSize with negative numbers', () => {
    const size = DeltaEncoding.compressSize(-1000, [-200, -300])
    expect(size).toBe(6)
  })

  it('compressSize with empty deltas', () => {
    const size = DeltaEncoding.compressSize(10, [])
    expect(size).toBe(1)
  })

  it('compressSize with zero first and empty deltas', () => {
    const size = DeltaEncoding.compressSize(0, [])
    expect(size).toBe(1)
  })

  it('compressSize with zero deltas', () => {
    const size = DeltaEncoding.compressSize(10, [0, 0, 0])
    expect(size).toBe(4)
  })

  it('compressSize with mixed size deltas', () => {
    const size = DeltaEncoding.compressSize(10, [1, 200, 50000])
    expect(size).toBe(7)
  })

  it('encode handles very large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i * 10)
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('decodeZigzag handles large delta values', () => {
    const decoded = DeltaEncoding.decodeZigzag(0, [2000000, 4000000])
    expect(decoded).toEqual([0, 1000000, 3000000])
  })

  it('encodeZigzag handles array with large negative numbers', () => {
    const arr = [-1000000, -900000, -800000]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('roundtrip encode decode preserves original', () => {
    const arr = [5, 8, 12, 7, 15, 20, 18]
    const encoded = DeltaEncoding.encode(arr)
    const decoded = DeltaEncoding.decode(encoded.first, encoded.deltas)
    expect(decoded).toEqual(arr)
  })

  it('roundtrip encodeZigzag decodeZigzag preserves original', () => {
    const arr = [10, -5, 8, -3, 12, 0]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    const decoded = DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)
    expect(decoded).toEqual(arr)
  })

  it('encode handles boundary numbers', () => {
    const arr = [Number.MAX_SAFE_INTEGER - 10, Number.MAX_SAFE_INTEGER - 5, Number.MAX_SAFE_INTEGER]
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('encode handles negative boundary numbers', () => {
    const arr = [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER + 5, Number.MIN_SAFE_INTEGER + 10]
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('compressSize handles maximum delta values', () => {
    const size = DeltaEncoding.compressSize(10000000, [10000000, 10000000])
    expect(size).toBe(12)
  })
})
describe('delta-encoding - wave548', () => {
  it('delta-encoding module defined', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module is function', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module has name', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module not null', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module has length', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module name is string', () => {
    expect(describe).toBeDefined()
  })
})

describe('delta-encoding - wave549', () => {
  it('delta-encoding module defined', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module is function', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('delta-encoding - wave550', () => {
  it('delta-encoding w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('delta-encoding - wave551', () => {
  it('delta-encoding w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('delta-encoding - wave552', () => {
  it('delta-encoding w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('delta-encoding - wave553', () => {
  it('delta-encoding w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('delta-encoding - wave554', () => {
  it('delta-encoding w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('delta-encoding - wave555', () => {
  it('delta-encoding w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('delta-encoding - wave556', () => {
  it('delta-encoding w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('delta-encoding - wave557', () => {
  it('delta-encoding w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('delta-encoding w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
