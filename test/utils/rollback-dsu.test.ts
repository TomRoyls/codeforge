import { describe, it, expect } from 'vitest'
import { RollbackDSU } from '../../src/utils/rollback-dsu.js'

describe('RollbackDSU', () => {
  it('creates DSU with specified size', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.size).toBe(5)
    expect(dsu.components).toBe(5)
  })

  it('throws error for negative size', () => {
    expect(() => new RollbackDSU(-1)).toThrow(RangeError)
  })

  it('creates DSU from pairs', () => {
    const dsu = RollbackDSU.fromPairs(5, [
      [0, 1],
      [2, 3],
    ])
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(true)
  })

  it('finds root of element', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.find(0)).toBe(0)
    expect(dsu.find(4)).toBe(4)
  })

  it('returns -1 for out of bounds find', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.find(-1)).toBe(-1)
    expect(dsu.find(10)).toBe(-1)
  })

  it('unites two elements', () => {
    const dsu = new RollbackDSU(5)
    const result = dsu.union(0, 1)
    expect(result).toBe(true)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.components).toBe(4)
  })

  it('returns false for union of same component', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    expect(dsu.union(0, 1)).toBe(false)
  })

  it('returns false for out of bounds union', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.union(-1, 0)).toBe(false)
    expect(dsu.union(0, 10)).toBe(false)
  })

  it('checks if elements are connected', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    expect(dsu.connected(0, 2)).toBe(true)
    expect(dsu.connected(0, 3)).toBe(false)
  })

  it('returns false for connected check with out of bounds', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.connected(-1, 0)).toBe(false)
    expect(dsu.connected(0, 10)).toBe(false)
  })

  it('returns component size', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    expect(dsu.componentSize(0)).toBe(3)
    expect(dsu.componentSize(3)).toBe(1)
  })

  it('returns 0 for component size with out of bounds', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.componentSize(-1)).toBe(0)
    expect(dsu.componentSize(10)).toBe(0)
  })

  it('takes snapshot', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    const snap = dsu.snapshot()
    expect(snap).toBe(1)
    expect(typeof snap).toBe('number')
  })

  it('rollbacks to snapshot without error', () => {
    const dsu = new RollbackDSU(5)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
    dsu.rollback(snap)
    expect(dsu.components).toBe(5)
  })

  it('resets to initial state', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.reset()
    expect(dsu.components).toBe(5)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('gets component members', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    const members = dsu.getComponentMembers(0)
    expect(members).toEqual(expect.arrayContaining([0, 1, 2]))
    expect(members.length).toBe(3)
  })

  it('returns empty array for component members with out of bounds', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.getComponentMembers(-1)).toEqual([])
    expect(dsu.getComponentMembers(10)).toEqual([])
  })

  it('handles union by rank', () => {
    const dsu = new RollbackDSU(10)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    dsu.union(0, 2)
    dsu.union(0, 4)
    expect(dsu.componentSize(0)).toBe(6)
  })

  it('handles multiple rollback operations', () => {
    const dsu = new RollbackDSU(5)
    const snap1 = dsu.snapshot()
    dsu.union(0, 1)
    const snap2 = dsu.snapshot()
    dsu.union(2, 3)
    expect(dsu.components).toBe(3)
    dsu.rollback(snap2)
    expect(dsu.components).toBe(4)
    dsu.rollback(snap1)
    expect(dsu.components).toBe(5)
  })

  it('find returns same root after union', () => {
    const dsu = new RollbackDSU(3)
    dsu.union(0, 1)
    expect(dsu.find(0)).toBe(dsu.find(1))
  })
})