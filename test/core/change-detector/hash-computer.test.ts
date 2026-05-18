import { describe, expect, it } from 'vitest'

import { HashComputer } from '../../../src/core/change-detector/hash-computer.js'

// ─── Constructor ───

describe('HashComputer', () => {
  describe('constructor', () => {
    it('defaults to djb2 algorithm', () => {
      const computer = new HashComputer()
      expect(computer.getAlgorithm()).toBe('djb2')
    })

    it('accepts simple algorithm', () => {
      const computer = new HashComputer('simple')
      expect(computer.getAlgorithm()).toBe('simple')
    })

    it('accepts fnv1a algorithm', () => {
      const computer = new HashComputer('fnv1a')
      expect(computer.getAlgorithm()).toBe('fnv1a')
    })
  })

  // ─── setAlgorithm / getAlgorithm ───

  describe('setAlgorithm', () => {
    it('changes the algorithm', () => {
      const computer = new HashComputer('simple')
      computer.setAlgorithm('fnv1a')
      expect(computer.getAlgorithm()).toBe('fnv1a')
    })
  })

  // ─── compute ───

  describe('compute', () => {
    it('returns consistent hash for same input', () => {
      const computer = new HashComputer()
      expect(computer.compute('hello')).toBe(computer.compute('hello'))
    })

    it('returns different hashes for different inputs', () => {
      const computer = new HashComputer()
      expect(computer.compute('hello')).not.toBe(computer.compute('world'))
    })

    it('returns hex string', () => {
      const computer = new HashComputer()
      const hash = computer.compute('test')
      expect(hash).toMatch(/^[0-9a-f]+$/)
    })

    it('handles empty string', () => {
      const computer = new HashComputer()
      const hash = computer.compute('')
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })
  })

  // ─── computeSimple ───

  describe('computeSimple', () => {
    it('sums character codes', () => {
      const computer = new HashComputer('simple')
      const hash = computer.compute('ab')
      const expected = (97 + 98).toString(16)
      expect(hash).toBe(expected)
    })

    it('returns same result via compute and computeSimple', () => {
      const computer = new HashComputer('simple')
      expect(computer.compute('test')).toBe(computer.computeSimple('test'))
    })
  })

  // ─── computeDjb2 ───

  describe('computeDjb2', () => {
    it('returns consistent results', () => {
      const computer = new HashComputer('djb2')
      expect(computer.computeDjb2('test')).toBe(computer.computeDjb2('test'))
    })

    it('returns same result via compute and computeDjb2', () => {
      const computer = new HashComputer('djb2')
      expect(computer.compute('test')).toBe(computer.computeDjb2('test'))
    })

    it('produces unsigned hex', () => {
      const computer = new HashComputer('djb2')
      const hash = computer.computeDjb2('some long string with lots of chars')
      expect(hash).toMatch(/^[0-9a-f]+$/)
    })
  })

  // ─── computeFNV1a ───

  describe('computeFNV1a', () => {
    it('returns consistent results', () => {
      const computer = new HashComputer('fnv1a')
      expect(computer.computeFNV1a('test')).toBe(computer.computeFNV1a('test'))
    })

    it('returns same result via compute and computeFNV1a', () => {
      const computer = new HashComputer('fnv1a')
      expect(computer.compute('test')).toBe(computer.computeFNV1a('test'))
    })

    it('produces unsigned hex', () => {
      const computer = new HashComputer('fnv1a')
      const hash = computer.computeFNV1a('another test string')
      expect(hash).toMatch(/^[0-9a-f]+$/)
    })
  })

  // ─── algorithm switching ───

  describe('algorithm switching', () => {
    it('produces different hashes for different algorithms', () => {
      const simple = new HashComputer('simple').compute('test')
      const djb2 = new HashComputer('djb2').compute('test')
      const fnv1a = new HashComputer('fnv1a').compute('test')

      expect(simple).not.toBe(djb2)
      expect(djb2).not.toBe(fnv1a)
      expect(simple).not.toBe(fnv1a)
    })

    it('reflects algorithm change in compute output', () => {
      const computer = new HashComputer('simple')
      const hash1 = computer.compute('test')
      computer.setAlgorithm('djb2')
      const hash2 = computer.compute('test')
      expect(hash1).not.toBe(hash2)
    })
  })
})
