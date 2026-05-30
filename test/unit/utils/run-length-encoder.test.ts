import { describe, it, expect } from 'vitest'
import { RunLengthEncoder } from '../../../src/utils/run-length-encoder.js'

describe('RunLengthEncoder', () => {
  describe('append and decode', () => {
    it('encodes single values', () => {
      const enc = new RunLengthEncoder<number>()
      enc.append(1)
      enc.append(1)
      enc.append(1)
      expect(enc.decode()).toEqual([1, 1, 1])
      expect(enc.runCount).toBe(1)
    })

    it('encodes mixed values', () => {
      const enc = new RunLengthEncoder<string>()
      enc.append('a')
      enc.append('a')
      enc.append('b')
      enc.append('b')
      enc.append('b')
      enc.append('a')
      expect(enc.decode()).toEqual(['a', 'a', 'b', 'b', 'b', 'a'])
      expect(enc.runCount).toBe(3)
    })

    it('creates from array', () => {
      const enc = RunLengthEncoder.fromArray([1, 1, 2, 2, 2, 3])
      expect(enc.decode()).toEqual([1, 1, 2, 2, 2, 3])
      expect(enc.runCount).toBe(3)
    })

    it('handles empty encoder', () => {
      const enc = new RunLengthEncoder<number>()
      expect(enc.decode()).toEqual([])
      expect(enc.length).toBe(0)
    })
  })

  describe('get', () => {
    it('returns value at index', () => {
      const enc = RunLengthEncoder.fromArray([5, 5, 5, 10, 10])
      expect(enc.get(0)).toBe(5)
      expect(enc.get(2)).toBe(5)
      expect(enc.get(3)).toBe(10)
      expect(enc.get(4)).toBe(10)
    })

    it('returns undefined for out of bounds', () => {
      const enc = RunLengthEncoder.fromArray([1, 2])
      expect(enc.get(-1)).toBeUndefined()
      expect(enc.get(2)).toBeUndefined()
    })
  })

  describe('indexOf', () => {
    it('finds first occurrence', () => {
      const enc = RunLengthEncoder.fromArray([1, 1, 2, 2, 1])
      expect(enc.indexOf(1)).toBe(0)
      expect(enc.indexOf(2)).toBe(2)
    })

    it('returns -1 for missing value', () => {
      const enc = RunLengthEncoder.fromArray([1, 2, 3])
      expect(enc.indexOf(5)).toBe(-1)
    })
  })

  describe('countOf', () => {
    it('counts all occurrences', () => {
      const enc = RunLengthEncoder.fromArray([1, 1, 2, 1, 1])
      expect(enc.countOf(1)).toBe(4)
      expect(enc.countOf(2)).toBe(1)
      expect(enc.countOf(3)).toBe(0)
    })
  })

  describe('compressRatio', () => {
    it('reports 1 for no compression', () => {
      const enc = RunLengthEncoder.fromArray([1, 2, 3])
      expect(enc.compressRatio()).toBeCloseTo(1)
    })

    it('reports good ratio for highly compressible', () => {
      const enc = new RunLengthEncoder<number>()
      for (let i = 0; i < 1000; i++) enc.append(7)
      expect(enc.compressRatio()).toBeLessThan(0.01)
    })

    it('reports 1 for empty', () => {
      const enc = new RunLengthEncoder<number>()
      expect(enc.compressRatio()).toBe(1)
    })
  })

  describe('slice', () => {
    it('slices a range', () => {
      const enc = RunLengthEncoder.fromArray([1, 1, 2, 2, 2, 3, 3])
      const s = enc.slice(2, 5)
      expect(s.decode()).toEqual([2, 2, 2])
    })

    it('slices to end', () => {
      const enc = RunLengthEncoder.fromArray([1, 2, 3])
      const s = enc.slice(1)
      expect(s.decode()).toEqual([2, 3])
    })

    it('slice produces independent encoder', () => {
      const enc = RunLengthEncoder.fromArray([1, 1, 1])
      const s = enc.slice(0, 2)
      s.append(1)
      expect(enc.length).toBe(3)
      expect(s.length).toBe(3)
    })
  })

  describe('length', () => {
    it('tracks total length', () => {
      const enc = new RunLengthEncoder<number>()
      expect(enc.length).toBe(0)
      enc.append(1)
      expect(enc.length).toBe(1)
      enc.append(1)
      expect(enc.length).toBe(2)
      enc.append(2)
      expect(enc.length).toBe(3)
    })
  })

  describe('text compression', () => {
    it('compresses repeated characters', () => {
      const enc = new RunLengthEncoder<string>()
      for (const ch of 'AAABBBCCDAA') enc.append(ch)
      expect(enc.runCount).toBe(5)
      expect(enc.decode().join('')).toBe('AAABBBCCDAA')
      expect(enc.countOf('A')).toBe(5)
    })
  })
})
