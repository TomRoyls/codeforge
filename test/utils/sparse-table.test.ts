import { describe, it, expect } from 'vitest'
import { SparseTable } from '../../src/utils/sparse-table.js'

describe('SparseTable', () => {
  it('constructs with min function', () => {
    const st = SparseTable.min([3, 1, 4, 1, 5])
    expect(st.length).toBe(5)
  })

  it('constructs with max function', () => {
    const st = SparseTable.max([3, 1, 4, 1, 5])
    expect(st.length).toBe(5)
  })

  it('constructs with gcd function', () => {
    const st = SparseTable.gcd([12, 18, 24])
    expect(st.length).toBe(3)
  })

  it('constructs with sum function', () => {
    const st = SparseTable.sum([1, 2, 3, 4])
    expect(st.length).toBe(4)
  })

  it('constructs empty table', () => {
    const st = new SparseTable<number>([], (a, b) => a + b)
    expect(st.length).toBe(0)
    expect(st.isEmpty()).toBe(true)
  })

  it('queries min range correctly', () => {
    const st = SparseTable.min([3, 1, 4, 1, 5])
    expect(st.query(1, 4)).toBe(1)
  })

  it('queries max range correctly', () => {
    const st = SparseTable.max([3, 1, 4, 1, 5])
    expect(st.query(0, 5)).toBe(5)
  })

  it('queries gcd range correctly', () => {
    const st = SparseTable.gcd([12, 18, 24])
    expect(st.query(0, 3)).toBe(6)
  })

  it('queries sum with idempotent min', () => {
    const st = new SparseTable<number>([1, 2, 3, 4], Math.min, { idempotent: true })
    expect(st.query(1, 3)).toBe(2)
  })

  it('queries single element', () => {
    const st = SparseTable.min([3, 1, 4])
    expect(st.query(1, 2)).toBe(1)
  })

  it('returns undefined for invalid query start', () => {
    const st = SparseTable.min([3, 1, 4])
    expect(st.query(-1, 2)).toBeUndefined()
  })

  it('returns undefined for invalid query end', () => {
    const st = SparseTable.min([3, 1, 4])
    expect(st.query(0, 10)).toBeUndefined()
  })

  it('returns undefined for invalid query range', () => {
    const st = SparseTable.min([3, 1, 4])
    expect(st.query(2, 1)).toBeUndefined()
  })

  it('gets single element', () => {
    const st = SparseTable.min([3, 1, 4])
    expect(st.get(1)).toBe(1)
  })

  it('returns undefined for invalid get index', () => {
    const st = SparseTable.min([3, 1, 4])
    expect(st.get(10)).toBeUndefined()
  })

  it('returns correct length', () => {
    const st = SparseTable.min([3, 1, 4, 1, 5])
    expect(st.length).toBe(5)
  })

  it('returns empty correctly', () => {
    const st = new SparseTable<number>([], (a, b) => a + b)
    expect(st.isEmpty()).toBe(true)
  })

  it('returns not empty correctly', () => {
    const st = SparseTable.min([3, 1, 4])
    expect(st.isEmpty()).toBe(false)
  })

  it('converts to array', () => {
    const st = SparseTable.min([3, 1, 4])
    expect(st.toArray()).toEqual([3, 1, 4])
  })

  it('queries idempotent operation', () => {
    const st = new SparseTable<number>([5, 3, 8, 2], Math.min, { idempotent: true })
    expect(st.query(0, 4)).toBe(2)
  })

  it('queries multiple min operations', () => {
    const st = new SparseTable<number>([5, 3, 8, 2, 9], Math.min)
    expect(st.query(0, 5)).toBe(2)
    expect(st.query(1, 4)).toBe(2)
    expect(st.query(2, 3)).toBe(8)
  })

  it('uses fromArray static method', () => {
    const st = SparseTable.fromArray([1, 2, 3], Math.max)
    expect(st.query(0, 3)).toBe(3)
  })

  it('handles custom combine function', () => {
    const st = new SparseTable<string>(['a', 'bb', 'ccc'], (a, b) => (a.length > b.length ? a : b))
    expect(st.query(0, 3)).toBe('ccc')
  })

  it('handles empty data with min', () => {
    const st = SparseTable.min([])
    expect(st.isEmpty()).toBe(true)
  })

  it('handles empty data with max', () => {
    const st = SparseTable.max([])
    expect(st.isEmpty()).toBe(true)
  })
})