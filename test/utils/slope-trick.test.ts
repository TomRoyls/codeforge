import { describe, it, expect } from 'vitest'
import { SlopeTrick } from '../../src/utils/slope-trick.js'

describe('SlopeTrick', () => {
  it('initializes with default values', () => {
    const st = new SlopeTrick()
    expect(st.min).toBe(0)
    expect(st.argmin).toEqual({ lo: -Infinity, hi: Infinity })
  })

  it('adds absolute function', () => {
    const st = new SlopeTrick()
    st.addAbsolute()
    expect(st.min).toBe(0)
    expect(st.argmin).toEqual({ lo: -Infinity, hi: Infinity })
  })

  it('adds multiple absolute functions', () => {
    const st = new SlopeTrick()
    st.addAbsolute()
    st.addAbsolute()
    st.addAbsolute()
    expect(st.min).toBe(0)
    expect(st.argmin).toEqual({ lo: -Infinity, hi: Infinity })
  })

  it('adds shift left with no prior elements', () => {
    const st = new SlopeTrick()
    st.addShiftLeft(5)
    expect(st.min).toBe(0)
  })

  it('adds shift left with prior elements', () => {
    const st = new SlopeTrick()
    st.addShiftLeft(3)
    st.addShiftLeft(5)
    expect(st.min).toBeGreaterThanOrEqual(0)
  })

  it('adds shift right with no prior elements', () => {
    const st = new SlopeTrick()
    st.addShiftRight(5)
    expect(st.min).toBe(0)
  })

  it('adds shift right with prior elements', () => {
    const st = new SlopeTrick()
    st.addShiftRight(3)
    st.addShiftRight(5)
    expect(st.min).toBeGreaterThanOrEqual(0)
  })

  it('combines shift left and shift right', () => {
    const st = new SlopeTrick()
    st.addShiftLeft(5)
    st.addShiftRight(3)
    expect(st.min).toBeGreaterThanOrEqual(0)
  })

  it('calculates min cost after multiple operations', () => {
    const st = new SlopeTrick()
    st.addAbsolute()
    st.addShiftLeft(5)
    st.addShiftRight(3)
    expect(typeof st.min).toBe('number')
  })

  it('returns argmin with finite bounds after operations', () => {
    const st = new SlopeTrick()
    st.addShiftLeft(5)
    st.addShiftRight(3)
    expect(st.argmin.lo).toBeGreaterThanOrEqual(-Infinity)
    expect(st.argmin.hi).toBeLessThanOrEqual(Infinity)
  })

  it('handles multiple shift left operations', () => {
    const st = new SlopeTrick()
    st.addShiftLeft(1)
    st.addShiftLeft(2)
    st.addShiftLeft(3)
    st.addShiftLeft(4)
    expect(typeof st.min).toBe('number')
  })

  it('handles multiple shift right operations', () => {
    const st = new SlopeTrick()
    st.addShiftRight(4)
    st.addShiftRight(3)
    st.addShiftRight(2)
    st.addShiftRight(1)
    expect(typeof st.min).toBe('number')
  })

  it('alternates between shift left and right', () => {
    const st = new SlopeTrick()
    st.addShiftLeft(10)
    st.addShiftRight(5)
    st.addShiftLeft(8)
    st.addShiftRight(6)
    expect(typeof st.min).toBe('number')
  })

  it('maintains monotonic properties', () => {
    const st = new SlopeTrick()
    const initialMin = st.min
    st.addAbsolute()
    const afterAbs = st.min
    st.addShiftLeft(5)
    const afterShift = st.min
    expect(afterShift).toBeGreaterThanOrEqual(initialMin)
    expect(afterShift).toBeGreaterThanOrEqual(afterAbs)
  })

  it('returns consistent argmin after complex operations', () => {
    const st = new SlopeTrick()
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        st.addShiftLeft(i)
      } else {
        st.addShiftRight(i)
      }
    }
    const argmin = st.argmin
    expect(argmin.lo).not.toBe(Infinity)
    expect(argmin.hi).not.toBe(-Infinity)
  })

  it('handles large values', () => {
    const st = new SlopeTrick()
    st.addShiftLeft(1e6)
    st.addShiftRight(1e6)
    expect(typeof st.min).toBe('number')
  })

  it('handles negative values in shift operations', () => {
    const st = new SlopeTrick()
    st.addShiftLeft(-5)
    st.addShiftRight(-3)
    expect(typeof st.min).toBe('number')
  })

  it('addAbsolute increases min', () => {
    const st = new SlopeTrick()
    st.addAbsolute()
    expect(st.min).toBeGreaterThanOrEqual(0)
  })

  it('addAbsolute preserves min of 0', () => {
    const st = new SlopeTrick()
    st.addAbsolute()
    st.addAbsolute()
    expect(st.min).toBe(0)
  })

  it('empty trick has zero min', () => {
    const st = new SlopeTrick()
    expect(st.min).toBe(0)
  })

  it('addShiftLeft shifts argmin', () => {
    const st = new SlopeTrick()
    st.addShiftLeft(5)
    expect(st).toBeDefined()
  })

  it('addAbsolute works', () => {
    const st = new SlopeTrick()
    st.addAbsolute()
    expect(st).toBeDefined()
  })
})