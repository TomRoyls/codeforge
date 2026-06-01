import { describe, expect, it } from 'vitest'
import { Bisect } from '../../src/utils/bisect.js'

describe('Bisect', () => {
  it('bisectLeft finds insertion point', () => {
    expect(Bisect.bisectLeft([1, 2, 4, 4, 5], 4)).toBe(2)
  })

  it('bisectLeft for element not in array', () => {
    expect(Bisect.bisectLeft([1, 3, 5], 2)).toBe(1)
  })

  it('bisectLeft for element before array', () => {
    expect(Bisect.bisectLeft([2, 4, 6], 1)).toBe(0)
  })

  it('bisectLeft for element after array', () => {
    expect(Bisect.bisectLeft([2, 4, 6], 7)).toBe(3)
  })

  it('bisectRight finds insertion point', () => {
    expect(Bisect.bisectRight([1, 2, 4, 4, 5], 4)).toBe(4)
  })

  it('bisectRight for element not in array', () => {
    expect(Bisect.bisectRight([1, 3, 5], 2)).toBe(1)
  })

  it('insortLeft inserts at correct position', () => {
    const arr = [1, 2, 4, 5]
    Bisect.insortLeft(arr, 3)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('insortRight inserts at correct position', () => {
    const arr = [1, 2, 4, 5]
    Bisect.insortRight(arr, 3)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('insortLeft handles duplicates', () => {
    const arr = [1, 2, 2, 3]
    Bisect.insortLeft(arr, 2)
    expect(arr).toEqual([1, 2, 2, 2, 3])
  })

  it('insortRight handles duplicates', () => {
    const arr = [1, 2, 2, 3]
    Bisect.insortRight(arr, 2)
    expect(arr).toEqual([1, 2, 2, 2, 3])
  })

  it('bisectLeftBy with custom comparator', () => {
    const arr = [{ v: 1 }, { v: 3 }, { v: 5 }]
    const idx = Bisect.bisectLeftBy(arr, { v: 3 }, (a, b) => a.v - b.v)
    expect(idx).toBe(1)
  })

  it('findRange returns correct bounds', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8]
    const [lo, hi] = Bisect.findRange(arr, 3, 6)
    expect(lo).toBe(2)
    expect(hi).toBe(6)
  })

  it('findRange handles out-of-bounds', () => {
    const arr = [1, 2, 3]
    const [lo, hi] = Bisect.findRange(arr, 5, 10)
    expect(lo).toBe(3)
    expect(hi).toBe(3)
  })

  it('bisectLeft for empty array', () => {
    expect(Bisect.bisectLeft([], 5)).toBe(0)
  })

  it('bisectRight for empty array', () => {
    expect(Bisect.bisectRight([], 5)).toBe(0)
  })

  it('bisectLeft finds first of duplicates', () => {
    expect(Bisect.bisectLeft([1, 2, 2, 2, 3], 2)).toBe(1)
    expect(Bisect.bisectRight([1, 2, 2, 2, 3], 2)).toBe(4)
  })

  it('bisectLeft for value less than all', () => {
    expect(Bisect.bisectLeft([5, 10, 15], 0)).toBe(0)
  })
})
