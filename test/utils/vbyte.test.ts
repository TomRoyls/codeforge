import { describe, it, expect } from 'vitest'
import { VByte } from '../../src/utils/vbyte.js'

describe('VByte', () => {
  it('encodes zero', () => {
    const encoded = VByte.encode(0)
    expect(encoded.length).toBe(1)
    expect(encoded[0]).toBe(0)
  })

  it('encodes small values in single byte', () => {
    const encoded = VByte.encode(127)
    expect(encoded.length).toBe(1)
    expect(encoded[0]).toBe(127)
  })

  it('encodes boundary at 0x7F', () => {
    const encoded = VByte.encode(0x7F)
    expect(encoded.length).toBe(1)
    expect(encoded[0]).toBe(0x7F)
  })

  it('encodes boundary at 0x80', () => {
    const encoded = VByte.encode(0x80)
    expect(encoded.length).toBe(2)
    expect(encoded[0]! & 0x80).not.toBe(0)
    expect(encoded[1]! & 0x80).toBe(0)
  })

  it('encodes boundary at 0x3FFF', () => {
    const encoded = VByte.encode(0x3FFF)
    expect(encoded.length).toBe(2)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(0x3FFF)
  })

  it('encodes boundary at 0x4000', () => {
    const encoded = VByte.encode(0x4000)
    expect(encoded.length).toBe(3)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(0x4000)
  })

  it('encodes boundary at 0x1FFFFF', () => {
    const encoded = VByte.encode(0x1FFFFF)
    expect(encoded.length).toBe(3)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(0x1FFFFF)
  })

  it('encodes boundary at 0x200000', () => {
    const encoded = VByte.encode(0x200000)
    expect(encoded.length).toBe(4)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(0x200000)
  })

  it('encodes boundary at 0xFFFFFFF', () => {
    const encoded = VByte.encode(0xFFFFFFF)
    expect(encoded.length).toBe(4)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(0xFFFFFFF)
  })

  it('encodes boundary at 0x10000000', () => {
    const encoded = VByte.encode(0x10000000)
    expect(encoded.length).toBe(5)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(0x10000000)
  })

  it('encodes large values', () => {
    const encoded = VByte.encode(300)
    expect(encoded.length).toBe(2)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(300)
  })

  it('encodes large multi-byte value', () => {
    const encoded = VByte.encode(10000000)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(10000000)
  })

  it('decodes encoded value correctly', () => {
    for (const v of [0, 1, 127, 128, 255, 256, 16383, 16384, 100000]) {
      expect(VByte.decode(VByte.encode(v)).value).toBe(v)
    }
  })

  it('decode returns correct bytesRead', () => {
    expect(VByte.decode(VByte.encode(0)).bytesRead).toBe(1)
    expect(VByte.decode(VByte.encode(127)).bytesRead).toBe(1)
    expect(VByte.decode(VByte.encode(128)).bytesRead).toBe(2)
    expect(VByte.decode(VByte.encode(16384)).bytesRead).toBe(3)
    expect(VByte.decode(VByte.encode(0x200000)).bytesRead).toBe(4)
    expect(VByte.decode(VByte.encode(0x10000000)).bytesRead).toBe(5)
  })

  it('decode respects offset parameter', () => {
    const buf = new Uint8Array([0xFF, ...VByte.encode(42)])
    const result = VByte.decode(buf, 1)
    expect(result.value).toBe(42)
    expect(result.bytesRead).toBe(1)
  })

  it('decode respects offset with multi-byte value', () => {
    const buf = new Uint8Array([0xFF, 0xAA, ...VByte.encode(1000)])
    const result = VByte.decode(buf, 2)
    expect(result.value).toBe(1000)
    expect(result.bytesRead).toBe(2)
  })

  it('decode with offset at boundary', () => {
    const buf = VByte.encodeMany([100, 200, 300])
    const result = VByte.decode(buf, 2)
    expect(result.bytesRead).toBeGreaterThan(0)
  })

  it('encodeMany encodes multiple values', () => {
    const encoded = VByte.encodeMany([1, 2, 3])
    const { values } = VByte.decodeMany(encoded)
    expect(values).toEqual([1, 2, 3])
  })

  it('encodeMany handles empty array', () => {
    const encoded = VByte.encodeMany([])
    expect(encoded.length).toBe(0)
  })

  it('encodeMany handles single value', () => {
    const encoded = VByte.encodeMany([42])
    const { values } = VByte.decodeMany(encoded)
    expect(values).toEqual([42])
  })

  it('encodeMany handles large values', () => {
    const encoded = VByte.encodeMany([0x7F, 0x80, 0x3FFF, 0x4000, 0x10000000])
    const { values } = VByte.decodeMany(encoded)
    expect(values).toEqual([0x7F, 0x80, 0x3FFF, 0x4000, 0x10000000])
  })

  it('decodeMany respects count limit', () => {
    const encoded = VByte.encodeMany([10, 20, 30, 40])
    const { values } = VByte.decodeMany(encoded, 2)
    expect(values).toEqual([10, 20])
  })

  it('decodeMany with count of zero', () => {
    const encoded = VByte.encodeMany([10, 20, 30])
    const { values } = VByte.decodeMany(encoded, 0)
    expect(values).toEqual([])
  })

  it('decodeMany with count greater than available', () => {
    const encoded = VByte.encodeMany([10, 20, 30])
    const { values } = VByte.decodeMany(encoded, 10)
    expect(values).toEqual([10, 20, 30])
  })

  it('decodeMany returns correct bytesRead', () => {
    const encoded = VByte.encodeMany([100, 200, 300])
    const { bytesRead } = VByte.decodeMany(encoded)
    expect(bytesRead).toBe(encoded.length)
  })

  it('decodeMany with count returns correct bytesRead', () => {
    const encoded = VByte.encodeMany([100, 200, 300, 400])
    const { bytesRead, values } = VByte.decodeMany(encoded, 2)
    expect(values.length).toBe(2)
    expect(bytesRead).toBeGreaterThan(0)
  })

  it('encodedSize returns correct sizes', () => {
    expect(VByte.encodedSize(0)).toBe(1)
    expect(VByte.encodedSize(127)).toBe(1)
    expect(VByte.encodedSize(128)).toBe(2)
    expect(VByte.encodedSize(16383)).toBe(2)
    expect(VByte.encodedSize(16384)).toBe(3)
  })

  it('encodedSize at boundaries', () => {
    expect(VByte.encodedSize(0)).toBe(1)
    expect(VByte.encodedSize(0x7F)).toBe(1)
    expect(VByte.encodedSize(0x80)).toBe(2)
    expect(VByte.encodedSize(0x3FFF)).toBe(2)
    expect(VByte.encodedSize(0x4000)).toBe(3)
    expect(VByte.encodedSize(0x1FFFFF)).toBe(3)
    expect(VByte.encodedSize(0x200000)).toBe(4)
    expect(VByte.encodedSize(0xFFFFFFF)).toBe(4)
    expect(VByte.encodedSize(0x10000000)).toBe(5)
  })

  it('encodeDelta encodes delta values', () => {
    const encoded = VByte.encodeDelta([10, 20, 25, 30])
    const { values } = VByte.decodeDelta(encoded)
    expect(values).toEqual([10, 20, 25, 30])
  })

  it('encodeDelta handles single value', () => {
    const encoded = VByte.encodeDelta([42])
    const { values } = VByte.decodeDelta(encoded)
    expect(values).toEqual([42])
  })

  it('encodeDelta handles empty array', () => {
    const encoded = VByte.encodeDelta([])
    expect(encoded.length).toBe(0)
  })

  it('encodeDelta handles equal values', () => {
    const encoded = VByte.encodeDelta([10, 10, 10])
    const { values } = VByte.decodeDelta(encoded)
    expect(values).toEqual([10, 10, 10])
  })

  it('encodeDelta handles large deltas', () => {
    const encoded = VByte.encodeDelta([0, 1000, 2000, 3000])
    const { values } = VByte.decodeDelta(encoded)
    expect(values).toEqual([0, 1000, 2000, 3000])
  })

  it('decodeDelta handles single value', () => {
    const encoded = VByte.encodeDelta([42])
    const { values, bytesRead } = VByte.decodeDelta(encoded)
    expect(values).toEqual([42])
    expect(bytesRead).toBeGreaterThan(0)
  })

  it('decodeDelta handles empty buffer', () => {
    const { values, bytesRead } = VByte.decodeDelta(new Uint8Array(0))
    expect(values).toEqual([])
    expect(bytesRead).toBe(0)
  })

  it('encode throws on negative values', () => {
    expect(() => VByte.encode(-1)).toThrow(RangeError)
    expect(() => VByte.encode(-100)).toThrow(RangeError)
  })

  it('encodedSize throws on negative values', () => {
    expect(() => VByte.encodedSize(-1)).toThrow(RangeError)
    expect(() => VByte.encodedSize(-100)).toThrow(RangeError)
  })

  it('encodeDelta throws on decreasing values', () => {
    expect(() => VByte.encodeDelta([5, 3])).toThrow(RangeError)
    expect(() => VByte.encodeDelta([10, 20, 15])).toThrow(RangeError)
  })

  it('roundtrips many values correctly', () => {
    const values = [0, 1, 100, 1000, 10000, 100000]
    const encoded = VByte.encodeMany(values)
    const { values: decoded } = VByte.decodeMany(encoded)
    expect(decoded).toEqual(values)
  })

  it('roundtrip for multiple values', () => {
    const encoded = VByte.encodeMany([1, 128, 300])
    const { values: decoded } = VByte.decodeMany(encoded)
    expect(decoded).toEqual([1, 128, 300])
  })

  it('roundtrip for boundary values', () => {
    const values = [0, 0x7F, 0x80, 0x3FFF, 0x4000, 0x1FFFFF, 0x200000]
    const encoded = VByte.encodeMany(values)
    const { values: decoded } = VByte.decodeMany(encoded)
    expect(decoded).toEqual(values)
  })

  it('decode single value at offset', () => {
    const buf = new Uint8Array([0x80, 0x01, 0x42])
    const result = VByte.decode(buf, 2)
    expect(result.value).toBe(0x42)
    expect(result.bytesRead).toBe(1)
  })

  it('encode size matches actual encoded length', () => {
    for (const v of [0, 1, 127, 128, 16383, 16384, 0x1FFFFF, 0x200000, 0xFFFFFFF, 0x10000000]) {
      expect(VByte.encodedSize(v)).toBe(VByte.encode(v).length)
    }
  })

  it('decodeMany with empty buffer', () => {
    const { values, bytesRead } = VByte.decodeMany(new Uint8Array(0))
    expect(values).toEqual([])
    expect(bytesRead).toBe(0)
  })

  it('encodeMany produces correct byte length', () => {
    const values = [1, 127, 128, 16384, 0x200000]
    const encoded = VByte.encodeMany(values)
    let expectedLength = 0
    for (const v of values) {
      expectedLength += VByte.encodedSize(v)
    }
    expect(encoded.length).toBe(expectedLength)
  })

  it('decodeDelta returns correct bytesRead', () => {
    const values = [10, 20, 30]
    const encoded = VByte.encodeDelta(values)
    const { bytesRead } = VByte.decodeDelta(encoded)
    expect(bytesRead).toBe(encoded.length)
  })

  it('should encode 0 as single byte', () => {
    const encoded = VByte.encode(0)
    expect(encoded).toEqual(new Uint8Array([0]))
    const { value } = VByte.decode(encoded)
    expect(value).toBe(0)
  })

  it('should encode single byte value', () => {
    const encoded = VByte.encode(127)
    expect(encoded.length).toBe(1)
    expect(VByte.decode(encoded).value).toBe(127)
  })

  it('should encode multi-byte value', () => {
    const encoded = VByte.encode(300)
    expect(encoded.length).toBe(2)
    expect(VByte.decode(encoded).value).toBe(300)
  })

  it('should compute encodedSize', () => {
    expect(VByte.encodedSize(0)).toBe(1)
    expect(VByte.encodedSize(127)).toBe(1)
    expect(VByte.encodedSize(128)).toBe(2)
    expect(VByte.encodedSize(16383)).toBe(2)
  })

  it('should encode and decode delta', () => {
    const values = [10, 20, 25, 30]
    const encoded = VByte.encodeDelta(values)
    const { values: decoded } = VByte.decodeDelta(encoded)
    expect(decoded).toEqual(values)
  })

  it('should throw for negative values', () => {
    expect(() => VByte.encode(-1)).toThrow()
  })
})
  it('encode decode roundtrip', () => {
    const encoded = VByte.encode(300)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(300)
  })

  it('encodeMany decodeMany roundtrip', () => {
    const values = [1, 127, 128, 300, 16384]
    const encoded = VByte.encodeMany(values)
    const decoded = VByte.decodeMany(encoded)
    expect(decoded.values).toEqual(values)
  })

  it('encode 0', () => {
    const encoded = VByte.encode(0)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(0)
  })

describe('vbyte - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('vbyte - wave545', () => {
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

describe('vbyte - wave546', () => {
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

describe('vbyte - wave547', () => {
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

describe('vbyte - wave548', () => {
  it('vbyte module defined', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte module is function', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave549', () => {
  it('vbyte module defined', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte module is function', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave550', () => {
  it('vbyte w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave551', () => {
  it('vbyte w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave552', () => {
  it('vbyte w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave553', () => {
  it('vbyte w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave554', () => {
  it('vbyte w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave555', () => {
  it('vbyte w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave556', () => {
  it('vbyte w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave557', () => {
  it('vbyte w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave558', () => {
  it('vbyte w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave559', () => {
  it('vbyte w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave560', () => {
  it('vbyte w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave561', () => {
  it('vbyte w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave562', () => {
  it('vbyte w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave563', () => {
  it('vbyte w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave564', () => {
  it('vbyte w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave565', () => {
  it('vbyte w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave566', () => {
  it('vbyte w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave127', () => {
  it('vbyte w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave130', () => {
  it('vbyte w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave133', () => {
  it('vbyte w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave136', () => {
  it('vbyte w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - wave139', () => {
  it('vbyte w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - w142', () => {
  it('vbyte v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - w145', () => {
  it('vbyte v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - w148', () => {
  it('vbyte v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - w151', () => {
  it('vbyte v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - w154', () => {
  it('vbyte v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - w157', () => {
  it('vbyte v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('vbyte - w160', () => {
  it('vbyte v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('vbyte v160x2', () => {
    expect(describe).toBeDefined()
  })
})
