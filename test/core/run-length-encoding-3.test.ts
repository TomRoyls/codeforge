import { describe, it, expect, beforeEach } from 'vitest'
import { RunLengthEncoding3 } from '../../src/core/run-length-encoding-3/index.js'

// ─── Constructor ───

describe('RunLengthEncoding3', () => {
  describe('constructor', () => {
    it('should create an empty instance', () => {
      const rle = new RunLengthEncoding3()
      expect(rle.isEmpty()).toBe(true)
      expect(rle.length).toBe(0)
      expect(rle.runCount).toBe(0)
    })
  })

  // ─── Encode ───

  describe('encode', () => {
    let rle: RunLengthEncoding3

    beforeEach(() => {
      rle = new RunLengthEncoding3()
    })

    it('should encode an empty string', () => {
      expect(rle.encode('')).toBe('')
    })

    it('should encode a single character', () => {
      expect(rle.encode('A')).toBe('1A')
    })

    it('should encode repeated characters', () => {
      expect(rle.encode('AAABBB')).toBe('3A3B')
    })

    it('should encode non-repeating characters', () => {
      expect(rle.encode('ABC')).toBe('1A1B1C')
    })

    it('should encode mixed patterns', () => {
      expect(rle.encode('AABCCC')).toBe('2A1B3C')
    })

    it('should encode long runs', () => {
      const input = 'A'.repeat(100)
      expect(rle.encode(input)).toBe('100A')
    })

    it('should encode single character repeated', () => {
      expect(rle.encode('AAAAA')).toBe('5A')
    })

    it('should handle digits as characters', () => {
      expect(rle.encode('111222')).toBe('3132')
    })

    it('should handle special characters', () => {
      expect(rle.encode('!!!??')).toBe('3!2?')
    })

    it('should handle lowercase', () => {
      expect(rle.encode('aabbbcc')).toBe('2a3b2c')
    })
  })

  // ─── Decode ───

  describe('decode', () => {
    let rle: RunLengthEncoding3

    beforeEach(() => {
      rle = new RunLengthEncoding3()
    })

    it('should decode an empty string', () => {
      expect(rle.decode('')).toBe('')
    })

    it('should decode a single run', () => {
      expect(rle.decode('3A')).toBe('AAA')
    })

    it('should decode multiple runs', () => {
      expect(rle.decode('2A3B')).toBe('AABBB')
    })

    it('should decode single characters', () => {
      expect(rle.decode('1A1B1C')).toBe('ABC')
    })

    it('should decode long runs', () => {
      expect(rle.decode('100A')).toBe('A'.repeat(100))
    })

    it('should decode special characters', () => {
      expect(rle.decode('3!2?')).toBe('!!!??')
    })
  })

  // ─── Roundtrip ───

  describe('roundtrip (encode → decode)', () => {
    it('should roundtrip empty string', () => {
      const rle = new RunLengthEncoding3()
      const encoded = rle.encode('')
      const decoded = new RunLengthEncoding3().decode(encoded)
      expect(decoded).toBe('')
    })

    it('should roundtrip simple string', () => {
      const rle = new RunLengthEncoding3()
      const encoded = rle.encode('AAABBC')
      const decoded = new RunLengthEncoding3().decode(encoded)
      expect(decoded).toBe('AAABBC')
    })

    it('should roundtrip non-repeating string', () => {
      const rle = new RunLengthEncoding3()
      const encoded = rle.encode('ABCDEFG')
      const decoded = new RunLengthEncoding3().decode(encoded)
      expect(decoded).toBe('ABCDEFG')
    })

    it('should roundtrip long repeated string', () => {
      const rle = new RunLengthEncoding3()
      const input = 'X'.repeat(50) + 'Y'.repeat(30) + 'Z'
      const encoded = rle.encode(input)
      const decoded = new RunLengthEncoding3().decode(encoded)
      expect(decoded).toBe(input)
    })
  })

  // ─── Append ───

  describe('append', () => {
    let rle: RunLengthEncoding3

    beforeEach(() => {
      rle = new RunLengthEncoding3()
    })

    it('should append a run', () => {
      rle.append('A', 3)
      expect(rle.getRuns()).toEqual([{ char: 'A', count: 3 }])
    })

    it('should merge consecutive same-character runs', () => {
      rle.append('A', 2)
      rle.append('A', 3)
      expect(rle.getRuns()).toEqual([{ char: 'A', count: 5 }])
    })

    it('should create new run for different character', () => {
      rle.append('A', 2)
      rle.append('B', 3)
      expect(rle.getRuns()).toEqual([
        { char: 'A', count: 2 },
        { char: 'B', count: 3 },
      ])
    })

    it('should handle append with count 0', () => {
      rle.append('A', 0)
      expect(rle.getRuns()).toEqual([{ char: 'A', count: 0 }])
    })
  })

  // ─── GetRuns ───

  describe('getRuns', () => {
    it('should return empty array for empty instance', () => {
      const rle = new RunLengthEncoding3()
      expect(rle.getRuns()).toEqual([])
    })

    it('should return a copy of runs (not mutable)', () => {
      const rle = new RunLengthEncoding3()
      rle.append('A', 3)
      const runs = rle.getRuns()
      runs[0]!.count = 99
      expect(rle.getRuns()[0]!.count).toBe(3)
    })
  })

  // ─── Length ───

  describe('length', () => {
    it('should return 0 for empty instance', () => {
      const rle = new RunLengthEncoding3()
      expect(rle.length).toBe(0)
    })

    it('should return total count across runs', () => {
      const rle = new RunLengthEncoding3()
      rle.append('A', 3)
      rle.append('B', 5)
      expect(rle.length).toBe(8)
    })
  })

  // ─── RunCount ───

  describe('runCount', () => {
    it('should return 0 for empty instance', () => {
      const rle = new RunLengthEncoding3()
      expect(rle.runCount).toBe(0)
    })

    it('should return number of distinct runs', () => {
      const rle = new RunLengthEncoding3()
      rle.append('A', 3)
      rle.append('B', 2)
      rle.append('A', 1)
      expect(rle.runCount).toBe(3)
    })
  })

  // ─── IsEmpty ───

  describe('isEmpty', () => {
    it('should be true for new instance', () => {
      const rle = new RunLengthEncoding3()
      expect(rle.isEmpty()).toBe(true)
    })

    it('should be false after append', () => {
      const rle = new RunLengthEncoding3()
      rle.append('A', 1)
      expect(rle.isEmpty()).toBe(false)
    })

    it('should be true after clear', () => {
      const rle = new RunLengthEncoding3()
      rle.append('A', 1)
      rle.clear()
      expect(rle.isEmpty()).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all runs', () => {
      const rle = new RunLengthEncoding3()
      rle.append('A', 5)
      rle.append('B', 3)
      rle.clear()
      expect(rle.isEmpty()).toBe(true)
      expect(rle.getRuns()).toEqual([])
      expect(rle.length).toBe(0)
      expect(rle.runCount).toBe(0)
    })

    it('should allow reuse after clear', () => {
      const rle = new RunLengthEncoding3()
      rle.append('A', 5)
      rle.clear()
      rle.append('X', 2)
      expect(rle.getRuns()).toEqual([{ char: 'X', count: 2 }])
    })
  })

  // ─── ToString ───

  describe('toString', () => {
    it('should return empty string for empty instance', () => {
      const rle = new RunLengthEncoding3()
      expect(rle.toString()).toBe('')
    })

    it('should format runs as count+char', () => {
      const rle = new RunLengthEncoding3()
      rle.append('A', 3)
      rle.append('B', 1)
      expect(rle.toString()).toBe('3A1B')
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle single character encode/decode', () => {
      const rle = new RunLengthEncoding3()
      expect(rle.encode('Z')).toBe('1Z')
      const decoded = new RunLengthEncoding3().decode('1Z')
      expect(decoded).toBe('Z')
    })

    it('should handle whitespace characters', () => {
      const rle = new RunLengthEncoding3()
      expect(rle.encode('   ')).toBe('3 ')
    })

    it('should handle mixed case input', () => {
      const rle = new RunLengthEncoding3()
      const encoded = rle.encode('aAaA')
      const decoded = new RunLengthEncoding3().decode(encoded)
      expect(decoded).toBe('aAaA')
    })
  })
})
