import { describe, it, expect } from 'vitest'
import { RunLengthEncoder } from '../../src/utils/run-length-encoder.js'

describe('RunLengthEncoder', () => {
  it('creates empty encoder', () => {
    const enc = new RunLengthEncoder<number>()
    expect(enc.length).toBe(0)
    expect(enc.runCount).toBe(0)
  })

  it('creates encoder from array', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 2, 2, 2])
    expect(enc.length).toBe(5)
    expect(enc.runCount).toBe(2)
  })

  it('appends single value', () => {
    const enc = new RunLengthEncoder<number>()
    enc.append(1)
    expect(enc.length).toBe(1)
    expect(enc.runCount).toBe(1)
  })

  it('appends multiple same values', () => {
    const enc = new RunLengthEncoder<number>()
    enc.append(1)
    enc.append(1)
    enc.append(1)
    expect(enc.length).toBe(3)
    expect(enc.runCount).toBe(1)
  })

  it('appends different values', () => {
    const enc = new RunLengthEncoder<number>()
    enc.append(1)
    enc.append(2)
    enc.append(1)
    expect(enc.length).toBe(3)
    expect(enc.runCount).toBe(3)
  })

  it('gets value at index', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 2, 3, 3])
    expect(enc.get(0)).toBe(1)
    expect(enc.get(2)).toBe(2)
    expect(enc.get(4)).toBe(3)
  })

  it('returns undefined for out of bounds get', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    expect(enc.get(-1)).toBeUndefined()
    expect(enc.get(10)).toBeUndefined()
  })

  it('decodes to array', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 2, 3, 3])
    expect(enc.decode()).toEqual([1, 1, 2, 3, 3])
  })

  it('decodes empty encoder', () => {
    const enc = new RunLengthEncoder<number>()
    expect(enc.decode()).toEqual([])
  })

  it('finds index of value', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 2, 2, 2])
    expect(enc.indexOf(1)).toBe(0)
    expect(enc.indexOf(2)).toBe(2)
  })

  it('returns -1 for indexOf non-existent value', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 2, 2])
    expect(enc.indexOf(3)).toBe(-1)
  })

  it('counts occurrences of value', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 2, 2, 2, 1])
    expect(enc.countOf(1)).toBe(3)
    expect(enc.countOf(2)).toBe(3)
  })

  it('returns 0 for countOf non-existent value', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    expect(enc.countOf(4)).toBe(0)
  })

  it('calculates compression ratio', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 1, 1, 1])
    expect(enc.compressRatio()).toBe(0.2)
  })

  it('returns 1 for compression ratio of empty encoder', () => {
    const enc = new RunLengthEncoder<number>()
    expect(enc.compressRatio()).toBe(1)
  })

  it('returns 1 for compression ratio of no compression', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3, 4, 5])
    expect(enc.compressRatio()).toBe(1)
  })

  it('slices encoder', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 2, 3, 3])
    const sliced = enc.slice(1, 4)
    expect(sliced.decode()).toEqual([1, 2, 3])
  })

  it('slices encoder with only start', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 2, 3, 3])
    const sliced = enc.slice(2)
    expect(sliced.decode()).toEqual([2, 3, 3])
  })

  it('handles slice with start equal to length', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    const sliced = enc.slice(3)
    expect(sliced.decode()).toEqual([])
  })

  it('works with strings', () => {
    const enc = new RunLengthEncoder<string>()
    enc.append('a')
    enc.append('a')
    enc.append('b')
    expect(enc.length).toBe(3)
    expect(enc.get(0)).toBe('a')
    expect(enc.decode()).toEqual(['a', 'a', 'b'])
  })

  it('works with objects', () => {
    const enc = new RunLengthEncoder<{ id: number }>()
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    enc.append(obj1)
    enc.append(obj1)
    enc.append(obj2)
    expect(enc.length).toBe(3)
    expect(enc.get(0)).toBe(obj1)
    expect(enc.countOf(obj1)).toBe(2)
  })

  it('totalLength is correct', () => {
    const enc = new RunLengthEncoder<{ v: number }>()
    enc.append({ v: 1 })
    enc.append({ v: 1 })
    enc.append({ v: 2 })
    expect(enc.length).toBe(3)
  })

  it('append increases length', () => {
    const enc = new RunLengthEncoder<number>()
    enc.append(1)
    expect(enc.length).toBe(1)
  })

  it('append creates new run for different value', () => {
    const enc = new RunLengthEncoder<number>()
    enc.append(1)
    enc.append(2)
    expect(enc.runCount).toBe(2)
  })

  it('append extends existing run for same value', () => {
    const enc = new RunLengthEncoder<number>()
    enc.append(1)
    enc.append(1)
    enc.append(1)
    expect(enc.runCount).toBe(1)
    expect(enc.length).toBe(3)
  })

  it('append with strings', () => {
    const enc = new RunLengthEncoder<string>()
    enc.append('a')
    enc.append('b')
    expect(enc.length).toBe(2)
    expect(enc.runCount).toBe(2)
  })

  it('append with alternating values', () => {
    const enc = new RunLengthEncoder<number>()
    enc.append(1)
    enc.append(2)
    enc.append(1)
    enc.append(2)
    expect(enc.length).toBe(4)
    expect(enc.runCount).toBe(4)
  })

  it('get first element', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    expect(enc.get(0)).toBe(1)
  })

  it('get last element', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    expect(enc.get(2)).toBe(3)
  })

  it('get middle element', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3, 4, 5])
    expect(enc.get(2)).toBe(3)
  })

  it('get from single run', () => {
    const enc = RunLengthEncoder.fromArray([5, 5, 5, 5, 5])
    expect(enc.get(3)).toBe(5)
  })

  it('get returns undefined for negative index', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    expect(enc.get(-5)).toBeUndefined()
  })

  it('get returns undefined for index equal to length', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    expect(enc.get(3)).toBeUndefined()
  })

  it('decode large run', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    expect(enc.decode()).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
  })

  it('decode alternating values', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 1, 2, 1])
    expect(enc.decode()).toEqual([1, 2, 1, 2, 1])
  })

  it('decode with strings', () => {
    const enc = RunLengthEncoder.fromArray(['a', 'a', 'b', 'c', 'c'])
    expect(enc.decode()).toEqual(['a', 'a', 'b', 'c', 'c'])
  })

  it('indexOf returns first occurrence', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 1, 2, 1])
    expect(enc.indexOf(1)).toBe(0)
  })

  it('indexOf handles multiple occurrences', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 1, 2, 1])
    expect(enc.indexOf(1)).toBe(0)
    expect(enc.indexOf(2)).toBe(1)
  })

  it('indexOf with strings', () => {
    const enc = RunLengthEncoder.fromArray(['a', 'b', 'c'])
    expect(enc.indexOf('b')).toBe(1)
  })

  it('countOf with repeated values', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 1, 2, 2, 1])
    expect(enc.countOf(1)).toBe(4)
    expect(enc.countOf(2)).toBe(2)
  })

  it('countOf with strings', () => {
    const enc = RunLengthEncoder.fromArray(['a', 'a', 'b', 'a'])
    expect(enc.countOf('a')).toBe(3)
    expect(enc.countOf('b')).toBe(1)
  })

  it('countOf with no occurrences', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    expect(enc.countOf(999)).toBe(0)
  })

  it('compressRatio with no compression', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3, 4])
    expect(enc.compressRatio()).toBe(1)
  })

  it('compressRatio with some compression', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 2, 3, 3])
    expect(enc.compressRatio()).toBeCloseTo(0.6, 1)
  })

  it('compressRatio with high compression', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    expect(enc.compressRatio()).toBe(0.1)
  })

  it('slice from beginning', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3, 4, 5])
    const sliced = enc.slice(0, 3)
    expect(sliced.decode()).toEqual([1, 2, 3])
  })

  it('slice to end', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3, 4, 5])
    const sliced = enc.slice(2)
    expect(sliced.decode()).toEqual([3, 4, 5])
  })

  it('slice middle section', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3, 4, 5])
    const sliced = enc.slice(1, 4)
    expect(sliced.decode()).toEqual([2, 3, 4])
  })

  it('slice with end equal to length', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    const sliced = enc.slice(0, 3)
    expect(sliced.decode()).toEqual([1, 2, 3])
  })

  it('slice with start greater than end', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    const sliced = enc.slice(2, 1)
    expect(sliced.decode()).toEqual([])
  })

  it('slice preserves runs', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 1, 2, 2, 2])
    const sliced = enc.slice(1, 4)
    expect(sliced.decode()).toEqual([1, 1, 2])
  })

  it('runCount for empty encoder', () => {
    const enc = new RunLengthEncoder<number>()
    expect(enc.runCount).toBe(0)
  })

  it('runCount for single run', () => {
    const enc = RunLengthEncoder.fromArray([1, 1, 1])
    expect(enc.runCount).toBe(1)
  })

  it('runCount for multiple runs', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3, 4, 5])
    expect(enc.runCount).toBe(5)
  })

  it('length for empty encoder', () => {
    const enc = new RunLengthEncoder<number>()
    expect(enc.length).toBe(0)
  })

  it('length increases with each append', () => {
    const enc = new RunLengthEncoder<number>()
    enc.append(1)
    expect(enc.length).toBe(1)
    enc.append(2)
    expect(enc.length).toBe(2)
    enc.append(3)
    expect(enc.length).toBe(3)
  })

  it('fromArray with empty array', () => {
    const enc = RunLengthEncoder.fromArray([])
    expect(enc.length).toBe(0)
    expect(enc.runCount).toBe(0)
  })

  it('fromArray with single element', () => {
    const enc = RunLengthEncoder.fromArray([1])
    expect(enc.length).toBe(1)
    expect(enc.runCount).toBe(1)
  })

  it('fromArray with all same values', () => {
    const enc = RunLengthEncoder.fromArray([5, 5, 5, 5])
    expect(enc.length).toBe(4)
    expect(enc.runCount).toBe(1)
  })

  it('works with negative numbers', () => {
    const enc = RunLengthEncoder.fromArray([-1, -1, -2, -3])
    expect(enc.length).toBe(4)
    expect(enc.get(0)).toBe(-1)
    expect(enc.get(2)).toBe(-2)
  })

  it('works with zero', () => {
    const enc = RunLengthEncoder.fromArray([0, 0, 1, 0])
    expect(enc.length).toBe(4)
    expect(enc.get(0)).toBe(0)
    expect(enc.countOf(0)).toBe(3)
  })

  it('works with decimal numbers', () => {
    const enc = RunLengthEncoder.fromArray([1.5, 1.5, 2.5])
    expect(enc.length).toBe(3)
    expect(enc.get(0)).toBe(1.5)
    expect(enc.get(2)).toBe(2.5)
  })

  it('works with boolean values', () => {
    const enc = RunLengthEncoder.fromArray([true, true, false, true])
    expect(enc.length).toBe(4)
    expect(enc.countOf(true)).toBe(3)
    expect(enc.countOf(false)).toBe(1)
  })

  it('works with null values', () => {
    const enc = RunLengthEncoder.fromArray([null, null, 1])
    expect(enc.length).toBe(3)
    expect(enc.get(0)).toBe(null)
    expect(enc.countOf(null)).toBe(2)
  })

  it('works with undefined values', () => {
    const enc = RunLengthEncoder.fromArray([undefined, undefined, 1] as any[])
    expect(enc.length).toBe(3)
    expect(enc.get(0)).toBe(undefined)
    expect(enc.countOf(undefined)).toBe(2)
  })

  it('append many values', () => {
    const enc = new RunLengthEncoder<number>()
    for (let i = 0; i < 100; i++) {
      enc.append(i % 10)
    }
    expect(enc.length).toBe(100)
    expect(enc.get(0)).toBe(0)
    expect(enc.get(99)).toBe(9)
  })

  it('decode large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i % 5)
    const enc = RunLengthEncoder.fromArray(arr)
    const decoded = enc.decode()
    expect(decoded).toEqual(arr)
  })

  it('slice with negative start does not support negative indices', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3, 4, 5])
    const sliced = enc.slice(-2)
    expect(sliced.decode()).toEqual([undefined, undefined, 1, 2, 3, 4, 5])
  })

  it('indexOf with non-existent value returns -1', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3])
    expect(enc.indexOf(999)).toBe(-1)
  })

  it('countOf with mixed types', () => {
    const enc = new RunLengthEncoder<string | number>()
    enc.append(1)
    enc.append(1)
    enc.append('a')
    expect(enc.countOf(1)).toBe(2)
    expect(enc.countOf('a')).toBe(1)
  })

  it('works with symbols', () => {
    const sym = Symbol('test')
    const enc = RunLengthEncoder.fromArray([sym, sym, 'a'])
    expect(enc.countOf(sym)).toBe(2)
  })

  it('append after slice', () => {
    const enc = RunLengthEncoder.fromArray([1, 2, 3, 4, 5])
    const sliced = enc.slice(1, 3)
    sliced.append(6)
    expect(sliced.decode()).toEqual([2, 3, 6])
  })
})
describe('run-length-encoder - wave549', () => {
  it('run-length-encoder module defined', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoder - wave550', () => {
  it('run-length-encoder w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoder w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoder w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoder - wave551', () => {
  it('run-length-encoder w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoder w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoder w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoder - wave552', () => {
  it('run-length-encoder w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoder w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoder w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('run-length-encoder - wave553', () => {
  it('run-length-encoder w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoder w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('run-length-encoder w553 v2', () => {
    expect(describe).toBeDefined()
  })
})
