import { describe, expect, it } from 'vitest'
import { HashComputer } from '../../../src/core/change-detector/hash-computer.js'

describe('HashComputer', () => {
  describe('constructor', () => {
    it('defaults to djb2 algorithm', () => {
      const hc = new HashComputer()
      expect(hc.getAlgorithm()).toBe('djb2')
    })

    it('accepts simple algorithm', () => {
      const hc = new HashComputer('simple')
      expect(hc.getAlgorithm()).toBe('simple')
    })

    it('accepts djb2 algorithm', () => {
      const hc = new HashComputer('djb2')
      expect(hc.getAlgorithm()).toBe('djb2')
    })

    it('accepts fnv1a algorithm', () => {
      const hc = new HashComputer('fnv1a')
      expect(hc.getAlgorithm()).toBe('fnv1a')
    })
  })

  describe('getAlgorithm', () => {
    it('returns current algorithm', () => {
      const hc = new HashComputer('simple')
      expect(hc.getAlgorithm()).toBe('simple')
      hc.setAlgorithm('fnv1a')
      expect(hc.getAlgorithm()).toBe('fnv1a')
    })
  })

  describe('setAlgorithm', () => {
    it('changes algorithm from simple to djb2', () => {
      const hc = new HashComputer('simple')
      hc.setAlgorithm('djb2')
      expect(hc.getAlgorithm()).toBe('djb2')
    })

    it('changes algorithm from djb2 to fnv1a', () => {
      const hc = new HashComputer('djb2')
      hc.setAlgorithm('fnv1a')
      expect(hc.getAlgorithm()).toBe('fnv1a')
    })

    it('changes algorithm from fnv1a to simple', () => {
      const hc = new HashComputer('fnv1a')
      hc.setAlgorithm('simple')
      expect(hc.getAlgorithm()).toBe('simple')
    })
  })

  describe('compute', () => {
    it('delegates to computeSimple when algorithm is simple', () => {
      const hc = new HashComputer('simple')
      expect(hc.compute('test')).toBe(hc.computeSimple('test'))
    })

    it('delegates to computeDjb2 when algorithm is djb2', () => {
      const hc = new HashComputer('djb2')
      expect(hc.compute('test')).toBe(hc.computeDjb2('test'))
    })

    it('delegates to computeFNV1a when algorithm is fnv1a', () => {
      const hc = new HashComputer('fnv1a')
      expect(hc.compute('test')).toBe(hc.computeFNV1a('test'))
    })
  })

  describe('computeSimple', () => {
    it('handles empty string', () => {
      const hc = new HashComputer('simple')
      expect(hc.computeSimple('')).toBe('0')
    })

    it('handles single character', () => {
      const hc = new HashComputer('simple')
      expect(hc.computeSimple('a')).toBe('61')
    })

    it('handles unicode characters', () => {
      const hc = new HashComputer('simple')
      expect(hc.computeSimple('日本語')).toBeDefined()
      expect(typeof hc.computeSimple('日本語')).toBe('string')
    })

    it('handles long strings', () => {
      const hc = new HashComputer('simple')
      const longString = 'a'.repeat(1000)
      const result = hc.computeSimple(longString)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('produces deterministic output', () => {
      const hc = new HashComputer('simple')
      const input = 'test string'
      const first = hc.computeSimple(input)
      const second = hc.computeSimple(input)
      expect(first).toBe(second)
    })

    it('sums character codes correctly', () => {
      const hc = new HashComputer('simple')
      expect(hc.computeSimple('ab')).toBe('c3')
    })
  })

  describe('computeDjb2', () => {
    it('handles empty string', () => {
      const hc = new HashComputer('djb2')
      expect(hc.computeDjb2('')).toBe('1505')
    })

    it('handles single character', () => {
      const hc = new HashComputer('djb2')
      expect(hc.computeDjb2('a')).toBeDefined()
      expect(typeof hc.computeDjb2('a')).toBe('string')
    })

    it('handles unicode characters', () => {
      const hc = new HashComputer('djb2')
      expect(hc.computeDjb2('日本語')).toBeDefined()
      expect(typeof hc.computeDjb2('日本語')).toBe('string')
    })

    it('handles long strings', () => {
      const hc = new HashComputer('djb2')
      const longString = 'a'.repeat(1000)
      const result = hc.computeDjb2(longString)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('produces deterministic output', () => {
      const hc = new HashComputer('djb2')
      const input = 'test string'
      const first = hc.computeDjb2(input)
      const second = hc.computeDjb2(input)
      expect(first).toBe(second)
    })

    it('produces hex string output', () => {
      const hc = new HashComputer('djb2')
      const result = hc.computeDjb2('test')
      expect(/^[0-9a-f]+$/.test(result)).toBe(true)
    })
  })

  describe('computeFNV1a', () => {
    it('handles empty string', () => {
      const hc = new HashComputer('fnv1a')
      expect(hc.computeFNV1a('')).toBe('811c9dc5')
    })

    it('handles single character', () => {
      const hc = new HashComputer('fnv1a')
      expect(hc.computeFNV1a('a')).toBe('e40c292c')
    })

    it('handles unicode characters', () => {
      const hc = new HashComputer('fnv1a')
      expect(hc.computeFNV1a('日本語')).toBeDefined()
      expect(typeof hc.computeFNV1a('日本語')).toBe('string')
    })

    it('handles long strings', () => {
      const hc = new HashComputer('fnv1a')
      const longString = 'a'.repeat(1000)
      const result = hc.computeFNV1a(longString)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('produces deterministic output', () => {
      const hc = new HashComputer('fnv1a')
      const input = 'test string'
      const first = hc.computeFNV1a(input)
      const second = hc.computeFNV1a(input)
      expect(first).toBe(second)
    })

    it('produces hex string output', () => {
      const hc = new HashComputer('fnv1a')
      const result = hc.computeFNV1a('test')
      expect(/^[0-9a-f]+$/.test(result)).toBe(true)
    })
  })

  describe('collision resistance', () => {
    it('different inputs produce different hashes for simple', () => {
      const hc = new HashComputer('simple')
      const hash1 = hc.computeSimple('hello')
      const hash2 = hc.computeSimple('world')
      expect(hash1).not.toBe(hash2)
    })

    it('different inputs produce different hashes for djb2', () => {
      const hc = new HashComputer('djb2')
      const hash1 = hc.computeDjb2('hello')
      const hash2 = hc.computeDjb2('world')
      expect(hash1).not.toBe(hash2)
    })

    it('different inputs produce different hashes for fnv1a', () => {
      const hc = new HashComputer('fnv1a')
      const hash1 = hc.computeFNV1a('hello')
      const hash2 = hc.computeFNV1a('world')
      expect(hash1).not.toBe(hash2)
    })

    it('small input change produces different hash for simple', () => {
      const hc = new HashComputer('simple')
      const hash1 = hc.computeSimple('test')
      const hash2 = hc.computeSimple('Test')
      expect(hash1).not.toBe(hash2)
    })

    it('small input change produces different hash for djb2', () => {
      const hc = new HashComputer('djb2')
      const hash1 = hc.computeDjb2('test')
      const hash2 = hc.computeDjb2('Test')
      expect(hash1).not.toBe(hash2)
    })

    it('small input change produces different hash for fnv1a', () => {
      const hc = new HashComputer('fnv1a')
      const hash1 = hc.computeFNV1a('test')
      const hash2 = hc.computeFNV1a('Test')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('algorithm differences', () => {
    it('simple and djb2 produce different hashes for same input', () => {
      const simple = new HashComputer('simple')
      const djb2 = new HashComputer('djb2')
      expect(simple.compute('test')).not.toBe(djb2.compute('test'))
    })

    it('djb2 and fnv1a produce different hashes for same input', () => {
      const djb2 = new HashComputer('djb2')
      const fnv1a = new HashComputer('fnv1a')
      expect(djb2.compute('test')).not.toBe(fnv1a.compute('test'))
    })

    it('simple and fnv1a produce different hashes for same input', () => {
      const simple = new HashComputer('simple')
      const fnv1a = new HashComputer('fnv1a')
      expect(simple.compute('test')).not.toBe(fnv1a.compute('test'))
    })

    it('all three algorithms produce different hashes', () => {
      const simple = new HashComputer('simple')
      const djb2 = new HashComputer('djb2')
      const fnv1a = new HashComputer('fnv1a')
      const input = 'comprehensive test string'
      const hashes = [
        simple.compute(input),
        djb2.compute(input),
        fnv1a.compute(input)
      ]
      expect(new Set(hashes).size).toBe(3)
    })
  })

  describe('special characters', () => {
    it('handles whitespace characters with simple', () => {
      const hc = new HashComputer('simple')
      expect(hc.computeSimple('hello world')).toBeDefined()
    })

    it('handles whitespace characters with djb2', () => {
      const hc = new HashComputer('djb2')
      expect(hc.computeDjb2('hello world')).toBeDefined()
    })

    it('handles whitespace characters with fnv1a', () => {
      const hc = new HashComputer('fnv1a')
      expect(hc.computeFNV1a('hello world')).toBeDefined()
    })

    it('handles special symbols with simple', () => {
      const hc = new HashComputer('simple')
      expect(hc.computeSimple('!@#$%^&*()')).toBeDefined()
    })

    it('handles special symbols with djb2', () => {
      const hc = new HashComputer('djb2')
      expect(hc.computeDjb2('!@#$%^&*()')).toBeDefined()
    })

    it('handles special symbols with fnv1a', () => {
      const hc = new HashComputer('fnv1a')
      expect(hc.computeFNV1a('!@#$%^&*()')).toBeDefined()
    })

    it('handles newlines and tabs with simple', () => {
      const hc = new HashComputer('simple')
      expect(hc.computeSimple('line1\nline2\ttab')).toBeDefined()
    })

    it('handles newlines and tabs with djb2', () => {
      const hc = new HashComputer('djb2')
      expect(hc.computeDjb2('line1\nline2\ttab')).toBeDefined()
    })

    it('handles newlines and tabs with fnv1a', () => {
      const hc = new HashComputer('fnv1a')
      expect(hc.computeFNV1a('line1\nline2\ttab')).toBeDefined()
    })
  })
})