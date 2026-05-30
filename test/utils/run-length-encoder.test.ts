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
})