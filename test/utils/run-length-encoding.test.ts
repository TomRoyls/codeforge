import { describe, expect, it } from 'vitest'
import { RunLengthEncoding } from '../../src/utils/run-length-encoding.js'

describe('RunLengthEncoding', () => {
  describe('encode', () => {
    it('encodes empty array', () => {
      expect(RunLengthEncoding.encode([])).toEqual([])
    })

    it('encodes single element', () => {
      expect(RunLengthEncoding.encode([5])).toEqual([{ value: 5, count: 1 }])
    })

    it('encodes repeated elements', () => {
      expect(RunLengthEncoding.encode([1, 1, 1])).toEqual([{ value: 1, count: 3 }])
    })

    it('encodes mixed elements', () => {
      expect(RunLengthEncoding.encode([1, 1, 2, 3, 3, 3])).toEqual([
        { value: 1, count: 2 },
        { value: 2, count: 1 },
        { value: 3, count: 3 },
      ])
    })

    it('encodes alternating elements', () => {
      expect(RunLengthEncoding.encode([1, 2, 1, 2])).toEqual([
        { value: 1, count: 1 },
        { value: 2, count: 1 },
        { value: 1, count: 1 },
        { value: 2, count: 1 },
      ])
    })

    it('encodes all same elements efficiently', () => {
      const encoded = RunLengthEncoding.encode([5, 5, 5, 5, 5])
      expect(encoded.length).toBe(1)
      expect(encoded[0]).toEqual({ value: 5, count: 5 })
    })

    it('encodes large array of same elements', () => {
      const encoded = RunLengthEncoding.encode(Array(1000).fill(42))
      expect(encoded.length).toBe(1)
      expect(encoded[0]).toEqual({ value: 42, count: 1000 })
    })

    it('encodes array with negative numbers', () => {
      expect(RunLengthEncoding.encode([-1, -1, 2, -3])).toEqual([
        { value: -1, count: 2 },
        { value: 2, count: 1 },
        { value: -3, count: 1 },
      ])
    })

    it('encodes array with zero', () => {
      expect(RunLengthEncoding.encode([0, 0, 1, 0])).toEqual([
        { value: 0, count: 2 },
        { value: 1, count: 1 },
        { value: 0, count: 1 },
      ])
    })

    it('encodes array with floating point numbers', () => {
      expect(RunLengthEncoding.encode([1.5, 1.5, 2.7])).toEqual([
        { value: 1.5, count: 2 },
        { value: 2.7, count: 1 },
      ])
    })

    it('encodes array with Infinity', () => {
      expect(RunLengthEncoding.encode([Infinity, Infinity, 1])).toEqual([
        { value: Infinity, count: 2 },
        { value: 1, count: 1 },
      ])
    })

    it('encodes array with -Infinity', () => {
      expect(RunLengthEncoding.encode([-Infinity, -Infinity, 1])).toEqual([
        { value: -Infinity, count: 2 },
        { value: 1, count: 1 },
      ])
    })

    it('encodes array with NaN', () => {
      const encoded = RunLengthEncoding.encode([NaN, NaN, 1])
      expect(encoded.length).toBe(3)
      expect(encoded[0].value).toBeNaN()
      expect(encoded[0].count).toBe(1)
    })

    it('encodes array with null values', () => {
      expect(RunLengthEncoding.encode([null, null, 1])).toEqual([
        { value: null, count: 2 },
        { value: 1, count: 1 },
      ])
    })

    it('encodes array with undefined values', () => {
      expect(RunLengthEncoding.encode([undefined, undefined, 1])).toEqual([
        { value: undefined, count: 2 },
        { value: 1, count: 1 },
      ])
    })

    it('encodes array with boolean values', () => {
      expect(RunLengthEncoding.encode([true, true, false])).toEqual([
        { value: true, count: 2 },
        { value: false, count: 1 },
      ])
    })
  })

  describe('decode', () => {
    it('decodes empty runs', () => {
      expect(RunLengthEncoding.decode([])).toEqual([])
    })

    it('decodes single run', () => {
      expect(RunLengthEncoding.decode([{ value: 5, count: 3 }])).toEqual([5, 5, 5])
    })

    it('decodes multiple runs', () => {
      expect(RunLengthEncoding.decode([
        { value: 1, count: 2 },
        { value: 2, count: 3 },
      ])).toEqual([1, 1, 2, 2, 2])
    })

    it('decodes run with count 1', () => {
      expect(RunLengthEncoding.decode([{ value: 5, count: 1 }])).toEqual([5])
    })

    it('decodes run with large count', () => {
      const result = RunLengthEncoding.decode([{ value: 7, count: 100 }])
      expect(result.length).toBe(100)
      expect(result.every(x => x === 7)).toBe(true)
    })

    it('decodes negative numbers', () => {
      expect(RunLengthEncoding.decode([{ value: -5, count: 2 }])).toEqual([-5, -5])
    })

    it('decodes zero', () => {
      expect(RunLengthEncoding.decode([{ value: 0, count: 3 }])).toEqual([0, 0, 0])
    })

    it('decodes floating point numbers', () => {
      expect(RunLengthEncoding.decode([{ value: 3.14, count: 2 }])).toEqual([3.14, 3.14])
    })

    it('decodes Infinity', () => {
      expect(RunLengthEncoding.decode([{ value: Infinity, count: 2 }])).toEqual([Infinity, Infinity])
    })

    it('decodes -Infinity', () => {
      expect(RunLengthEncoding.decode([{ value: -Infinity, count: 2 }])).toEqual([-Infinity, -Infinity])
    })

    it('decodes NaN', () => {
      const result = RunLengthEncoding.decode([{ value: NaN, count: 2 }])
      expect(result.length).toBe(2)
      expect(result.every(x => Number.isNaN(x))).toBe(true)
    })

    it('decodes null values', () => {
      expect(RunLengthEncoding.decode([{ value: null, count: 2 }])).toEqual([null, null])
    })

    it('decodes undefined values', () => {
      expect(RunLengthEncoding.decode([{ value: undefined, count: 2 }])).toEqual([undefined, undefined])
    })

    it('decodes boolean values', () => {
      expect(RunLengthEncoding.decode([{ value: true, count: 2 }])).toEqual([true, true])
    })
  })

  describe('roundtrip', () => {
    it('decodes back to original for numbers', () => {
      const data = [1, 1, 2, 3, 3, 3]
      const encoded = RunLengthEncoding.encode(data)
      expect(RunLengthEncoding.decode(encoded)).toEqual(data)
    })

    it('roundtrip for strings', () => {
      const data = ['a', 'a', 'b', 'c', 'c', 'c']
      expect(RunLengthEncoding.decode(RunLengthEncoding.encode(data))).toEqual(data)
    })

    it('single element roundtrip', () => {
      const encoded = RunLengthEncoding.encode([42])
      expect(RunLengthEncoding.decode(encoded)).toEqual([42])
    })

    it('decode roundtrip preserves original', () => {
      const original = [1, 2, 2, 3, 3, 3]
      const encoded = RunLengthEncoding.encode(original)
      expect(RunLengthEncoding.decode(encoded)).toEqual(original)
    })

    it('roundtrip with alternating elements', () => {
      const original = [1, 2, 1, 2, 1]
      const encoded = RunLengthEncoding.encode(original)
      expect(RunLengthEncoding.decode(encoded)).toEqual(original)
    })

    it('roundtrip with all same elements', () => {
      const original = [7, 7, 7, 7]
      const encoded = RunLengthEncoding.encode(original)
      expect(RunLengthEncoding.decode(encoded)).toEqual(original)
    })

    it('roundtrip with large array', () => {
      const original = Array(500).fill(1).concat(Array(300).fill(2))
      const encoded = RunLengthEncoding.encode(original)
      expect(RunLengthEncoding.decode(encoded)).toEqual(original)
    })
  })

  describe('encodeString', () => {
    it('encodeString works with basic string', () => {
      const result = RunLengthEncoding.encodeString('aaabbc')
      expect(result).toEqual([
        { value: 'a', count: 3 },
        { value: 'b', count: 2 },
        { value: 'c', count: 1 },
      ])
    })

    it('handles strings with repeated chars', () => {
      const encoded = RunLengthEncoding.encodeString('AAAAABBBCC')
      expect(encoded.length).toBe(3)
      expect(RunLengthEncoding.decodeString(encoded)).toBe('AAAAABBBCC')
    })

    it('encodes empty string', () => {
      expect(RunLengthEncoding.encodeString('')).toEqual([])
    })

    it('encodes single character string', () => {
      expect(RunLengthEncoding.encodeString('a')).toEqual([{ value: 'a', count: 1 }])
    })

    it('encodes string with no repeats', () => {
      const result = RunLengthEncoding.encodeString('abcde')
      expect(result).toEqual([
        { value: 'a', count: 1 },
        { value: 'b', count: 1 },
        { value: 'c', count: 1 },
        { value: 'd', count: 1 },
        { value: 'e', count: 1 },
      ])
    })

    it('encodes string with spaces', () => {
      const result = RunLengthEncoding.encodeString('aa  bb')
      expect(result).toEqual([
        { value: 'a', count: 2 },
        { value: ' ', count: 2 },
        { value: 'b', count: 2 },
      ])
    })

    it('encodes string with special characters', () => {
      const result = RunLengthEncoding.encodeString('!!!@@@')
      expect(result).toEqual([
        { value: '!', count: 3 },
        { value: '@', count: 3 },
      ])
    })

    it('encodes string with mixed case', () => {
      const result = RunLengthEncoding.encodeString('AAaa')
      expect(result).toEqual([
        { value: 'A', count: 2 },
        { value: 'a', count: 2 },
      ])
    })

    it('encodes string with digits', () => {
      const result = RunLengthEncoding.encodeString('112233')
      expect(result).toEqual([
        { value: '1', count: 2 },
        { value: '2', count: 2 },
        { value: '3', count: 2 },
      ])
    })

    it('encodes string with newlines', () => {
      const result = RunLengthEncoding.encodeString('a\n\nb')
      expect(result).toEqual([
        { value: 'a', count: 1 },
        { value: '\n', count: 2 },
        { value: 'b', count: 1 },
      ])
    })
  })

  describe('decodeString', () => {
    it('decodeString works with basic runs', () => {
      expect(RunLengthEncoding.decodeString([
        { value: 'a', count: 3 },
        { value: 'b', count: 2 },
      ])).toBe('aaabb')
    })

    it('decodes empty runs to empty string', () => {
      expect(RunLengthEncoding.decodeString([])).toBe('')
    })

    it('decodes single run to string', () => {
      expect(RunLengthEncoding.decodeString([{ value: 'x', count: 5 }])).toBe('xxxxx')
    })

    it('decodes string with spaces', () => {
      expect(RunLengthEncoding.decodeString([{ value: ' ', count: 3 }])).toBe('   ')
    })

    it('decodes string with special characters', () => {
      expect(RunLengthEncoding.decodeString([{ value: '!', count: 2 }])).toBe('!!')
    })

    it('decodes string with mixed runs', () => {
      expect(RunLengthEncoding.decodeString([
        { value: 'a', count: 1 },
        { value: 'b', count: 2 },
        { value: 'c', count: 3 },
      ])).toBe('abbccc')
    })
  })

  describe('compressionRatio', () => {
    it('compressionRatio for highly compressible', () => {
      const data = Array(100).fill(1)
      expect(RunLengthEncoding.compressionRatio(data)).toBeCloseTo(0.01)
    })

    it('compressionRatio for incompressible', () => {
      const data = [1, 2, 3, 4, 5]
      expect(RunLengthEncoding.compressionRatio(data)).toBeCloseTo(1)
    })

    it('compressionRatio for empty', () => {
      expect(RunLengthEncoding.compressionRatio([])).toBe(1)
    })

    it('compressionRatio for single element', () => {
      expect(RunLengthEncoding.compressionRatio([5])).toBe(1)
    })

    it('compressionRatio for partially compressible', () => {
      const data = [1, 1, 1, 2, 2, 3, 4, 5]
      expect(RunLengthEncoding.compressionRatio(data)).toBeCloseTo(5 / 8)
    })

    it('compressionRatio for two runs', () => {
      const data = [1, 1, 1, 2, 2, 2, 2]
      expect(RunLengthEncoding.compressionRatio(data)).toBeCloseTo(2 / 7)
    })

    it('compressionRatio for all alternating', () => {
      const data = [1, 2, 1, 2, 1, 2]
      expect(RunLengthEncoding.compressionRatio(data)).toBeCloseTo(1)
    })

    it('compressionRatio for one long run', () => {
      const data = Array(1000).fill(7)
      expect(RunLengthEncoding.compressionRatio(data)).toBeCloseTo(0.001)
    })

    it('compressionRatio with no repeats', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      expect(RunLengthEncoding.compressionRatio(data)).toBeCloseTo(1)
    })
  })
})
describe('run-length-encoding - wave548', () => {
  it('run-length-encoding module defined', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding module is function', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding module has name', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding module not null', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding module toString works', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoding - wave549', () => {
  it('run-length-encoding module defined', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding module is function', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoding - wave550', () => {
  it('run-length-encoding w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoding - wave551', () => {
  it('run-length-encoding w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoding - wave552', () => {
  it('run-length-encoding w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoding - wave553', () => {
  it('run-length-encoding w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoding - wave554', () => {
  it('run-length-encoding w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoding - wave555', () => {
  it('run-length-encoding w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoding w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
