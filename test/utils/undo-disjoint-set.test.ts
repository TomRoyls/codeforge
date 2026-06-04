import { describe, it, expect } from 'vitest'
import { UndoDisjointSet } from '../../src/utils/undo-disjoint-set.js'

describe('UndoDisjointSet', () => {
  it('unites two elements', () => {
    const dsu = new UndoDisjointSet(3)
    expect(dsu.union(0, 1)).toBe(true)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)
  })

  it('returns false for already connected', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    expect(dsu.union(0, 1)).toBe(false)
  })

  it('tracks component count', () => {
    const dsu = new UndoDisjointSet(4)
    expect(dsu.components).toBe(4)
    dsu.union(0, 1)
    expect(dsu.components).toBe(3)
    dsu.union(2, 3)
    expect(dsu.components).toBe(2)
  })

  it('undoes last union', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
    dsu.undo()
    expect(dsu.connected(0, 1)).toBe(false)
    expect(dsu.components).toBe(3)
  })

  it('undoes multiple unions', () => {
    const dsu = new UndoDisjointSet(4)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(0, 2)
    expect(dsu.components).toBe(1)
    dsu.undo()
    expect(dsu.components).toBe(2)
    dsu.undo()
    expect(dsu.components).toBe(3)
  })

  it('snapshot and rollback', () => {
    const dsu = new UndoDisjointSet(4)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(0, 2)
    expect(dsu.components).toBe(1)
    dsu.rollback(snap)
    expect(dsu.components).toBe(4)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('undo returns false when empty', () => {
    const dsu = new UndoDisjointSet(3)
    expect(dsu.undo()).toBe(false)
  })

  it('reports correct size', () => {
    const dsu = new UndoDisjointSet(10)
    expect(dsu.size).toBe(10)
  })

  it('find returns root', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(3, 4)
    expect(dsu.find(0)).toBe(dsu.find(2))
    expect(dsu.find(3)).toBe(dsu.find(4))
  })

  it('undo restores rank correctly for repeated unions', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    dsu.union(0, 2)
    expect(dsu.components).toBe(1)
    dsu.undo()
    expect(dsu.components).toBe(2)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)
    dsu.undo()
    expect(dsu.connected(0, 1)).toBe(false)
    expect(dsu.components).toBe(3)
  })

  it('partial rollback preserves earlier unions', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    const snap = dsu.snapshot()
    dsu.union(2, 3)
    dsu.union(3, 4)
    dsu.rollback(snap)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(false)
    expect(dsu.components).toBe(4)
  })

  it('re-union after undo works', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    dsu.undo()
    dsu.union(0, 2)
    expect(dsu.connected(0, 2)).toBe(true)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('snapshot returns increasing values', () => {
    const dsu = new UndoDisjointSet(4)
    const s0 = dsu.snapshot()
    dsu.union(0, 1)
    const s1 = dsu.snapshot()
    dsu.union(2, 3)
    const s2 = dsu.snapshot()
    expect(s1).toBeGreaterThan(s0)
    expect(s2).toBeGreaterThan(s1)
  })

  it('handles large number of elements', () => {
    const dsu = new UndoDisjointSet(100)
    for (let i = 0; i < 99; i++) {
      dsu.union(i, i + 1)
    }
    expect(dsu.components).toBe(1)
    expect(dsu.connected(0, 99)).toBe(true)
  })

  it('rollback to initial state restores everything', () => {
    const dsu = new UndoDisjointSet(5)
    const initial = dsu.snapshot()
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(3, 4)
    dsu.rollback(initial)
    expect(dsu.components).toBe(5)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('multiple undos then re-unions work', () => {
    const dsu = new UndoDisjointSet(4)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.undo()
    dsu.undo()
    expect(dsu.components).toBe(4)
    dsu.union(0, 2)
    dsu.union(1, 3)
    expect(dsu.connected(0, 2)).toBe(true)
    expect(dsu.connected(1, 3)).toBe(true)
    expect(dsu.components).toBe(2)
  })

  it('single element is its own set', () => {
    const dsu = new UndoDisjointSet(1)
    expect(dsu.find(0)).toBe(0)
    expect(dsu.components).toBe(1)
  })

  it('two separate nodes have two components', () => {
    const dsu = new UndoDisjointSet(2)
    expect(dsu.components).toBe(2)
    expect(dsu.find(0)).toBe(0)
    expect(dsu.find(1)).toBe(1)
  })

  it('undo reverts union', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    expect(dsu.components).toBe(2)
    dsu.undo()
    expect(dsu.components).toBe(3)
  })

  it('find returns root after union', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    expect(dsu.find(0)).toBe(dsu.find(1))
  })

  it('undo reverts last union', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    dsu.undo()
    expect(dsu.find(0)).not.toBe(dsu.find(1))
  })

  it('size reports correct count', () => {
    const dsu = new UndoDisjointSet(3)
    expect(dsu.size).toBe(3)
  })

  it('connected returns false for separate sets', () => {
    const dsu = new UndoDisjointSet(3)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('undo reverts last union', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
    dsu.undo()
    expect(dsu.connected(0, 1)).toBe(false)
  })
})
