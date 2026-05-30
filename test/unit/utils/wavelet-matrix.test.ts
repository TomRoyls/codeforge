import { describe, it, expect } from 'vitest'
import { WaveletMatrix } from '../../../src/utils/wavelet-matrix.js'

describe('WaveletMatrix', () => {
  describe('construction', () => {
    it('creates from empty array', () => {
      const wm = new WaveletMatrix([])
      expect(wm.length).toBe(0)
      expect(wm.maxValue).toBe(0)
    })

    it('creates from single element', () => {
      const wm = new WaveletMatrix([42])
      expect(wm.length).toBe(1)
      expect(wm.maxValue).toBe(42)
      expect(wm.access(0)).toBe(42)
    })

    it('creates from small array', () => {
      const wm = new WaveletMatrix([3, 1, 4, 1, 5])
      expect(wm.length).toBe(5)
      expect(wm.maxValue).toBe(5)
    })

    it('creates from array with zeros', () => {
      const wm = new WaveletMatrix([0, 0, 0])
      expect(wm.access(0)).toBe(0)
      expect(wm.access(1)).toBe(0)
    })
  })

  describe('access', () => {
    it('returns original values', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6]
      const wm = new WaveletMatrix(data)
      for (let i = 0; i < data.length; i++) {
        expect(wm.access(i)).toBe(data[i])
      }
    })

    it('returns -1 for out of bounds', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.access(-1)).toBe(-1)
      expect(wm.access(3)).toBe(-1)
    })

    it('handles duplicate values', () => {
      const data = [2, 2, 2, 2]
      const wm = new WaveletMatrix(data)
      for (let i = 0; i < data.length; i++) {
        expect(wm.access(i)).toBe(2)
      }
    })

    it('handles single-bit values', () => {
      const data = [0, 1, 1, 0, 1]
      const wm = new WaveletMatrix(data)
      for (let i = 0; i < data.length; i++) {
        expect(wm.access(i)).toBe(data[i])
      }
    })
  })

  describe('rank', () => {
    it('counts occurrences up to index', () => {
      const data = [1, 2, 1, 3, 1, 2, 1]
      const wm = new WaveletMatrix(data)
      expect(wm.rank(1, 0)).toBe(1)
      expect(wm.rank(1, 2)).toBe(2)
      expect(wm.rank(1, 6)).toBe(4)
    })

    it('returns 0 for value not present', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.rank(5, 2)).toBe(0)
    })

    it('returns 0 for out of bounds index', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.rank(1, -1)).toBe(0)
      expect(wm.rank(1, 10)).toBe(0)
    })

    it('handles rank of zeros', () => {
      const data = [0, 1, 0, 1, 0]
      const wm = new WaveletMatrix(data)
      expect(wm.rank(0, 2)).toBe(2)
      expect(wm.rank(0, 4)).toBe(3)
    })
  })

  describe('quantile', () => {
    it('finds k-th smallest in range', () => {
      const data = [5, 2, 8, 1, 9, 3]
      const wm = new WaveletMatrix(data)
      expect(wm.quantile(0, 0, 5)).toBe(1)
      expect(wm.quantile(5, 0, 5)).toBe(9)
    })

    it('finds median', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6]
      const wm = new WaveletMatrix(data)
      expect(wm.quantile(0, 0, 7)).toBe(1)
      expect(wm.quantile(7, 0, 7)).toBe(9)
    })

    it('finds quantile in sub-range', () => {
      const data = [5, 2, 8, 1, 9]
      const wm = new WaveletMatrix(data)
      expect(wm.quantile(0, 1, 3)).toBe(1)
    })

    it('returns -1 for invalid inputs', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.quantile(-1, 0, 2)).toBe(-1)
      expect(wm.quantile(5, 0, 2)).toBe(-1)
      expect(wm.quantile(0, 2, 0)).toBe(-1)
    })
  })

  describe('rangeCount', () => {
    it('counts value in range', () => {
      const data = [1, 2, 1, 3, 1, 2, 1]
      const wm = new WaveletMatrix(data)
      expect(wm.rangeCount(1, 0, 6)).toBe(4)
      expect(wm.rangeCount(2, 0, 6)).toBe(2)
      expect(wm.rangeCount(3, 0, 6)).toBe(1)
    })

    it('counts in sub-range', () => {
      const data = [1, 2, 1, 3, 1]
      const wm = new WaveletMatrix(data)
      expect(wm.rangeCount(1, 1, 4)).toBe(2)
    })

    it('returns 0 for absent value', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.rangeCount(5, 0, 2)).toBe(0)
    })
  })

  describe('roundtrip', () => {
    it('access recovers all original values', () => {
      const data = [7, 3, 9, 1, 5, 2, 8, 4, 6]
      const wm = new WaveletMatrix(data)
      const recovered = Array.from({ length: data.length }, (_, i) => wm.access(i))
      expect(recovered).toEqual(data)
    })

    it('rank matches brute force', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
      const wm = new WaveletMatrix(data)
      for (const target of [1, 2, 3, 4, 5, 6, 9]) {
        for (let i = 0; i < data.length; i++) {
          const expected = data.slice(0, i + 1).filter(v => v === target).length
          expect(wm.rank(target, i)).toBe(expected)
        }
      }
    })
  })
})
