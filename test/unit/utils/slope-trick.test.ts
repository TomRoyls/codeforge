import { describe, it, expect } from 'vitest'
import { SlopeTrick } from '../../../src/utils/slope-trick.js'

describe('SlopeTrick', () => {
  describe('basic operations', () => {
    it('handles empty slope trick', () => {
      const st = new SlopeTrick()
      expect(st.min).toBe(0)
    })

    it('computes minimum after addAbsolute', () => {
      const st = new SlopeTrick()
      st.addShiftRight(5)
      expect(st.min).toBe(0)
    })

    it('computes cost for two shifted points', () => {
      const st = new SlopeTrick()
      st.addShiftRight(0)
      st.addShiftRight(10)
      expect(st.min).toBe(0)
    })
  })

  describe('argmin', () => {
    it('returns argmin range', () => {
      const st = new SlopeTrick()
      st.addShiftRight(5)
      const { lo, hi } = st.argmin
      expect(lo).toBeLessThanOrEqual(hi)
    })
  })

  describe('absolute value minimization', () => {
    it('handles multiple shifts', () => {
      const st = new SlopeTrick()
      const points = [1, 3, 5, 7, 9]
      for (const p of points) {
        st.addShiftRight(p)
      }
      expect(st.min).toBeGreaterThanOrEqual(0)
    })
  })

  describe('addShiftLeft', () => {
    it('handles left shifts', () => {
      const st = new SlopeTrick()
      st.addShiftLeft(10)
      st.addShiftLeft(0)
      expect(st.min).toBeGreaterThanOrEqual(0)
    })
  })
})
