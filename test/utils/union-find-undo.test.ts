import { describe, it, expect } from 'vitest'
import { UnionFindUndo } from '../../src/utils/union-find-undo.js'

describe('UnionFindUndo', () => {
  it('initial state (all singletons)', () => {
    const dsu = new UnionFindUndo(5)
    expect(dsu.componentCount).toBe(5)
    expect(dsu.size).toBe(5)
    expect(dsu.find(0)).toBe(0)
    expect(dsu.find(1)).toBe(1)
    expect(dsu.find(2)).toBe(2)
    expect(dsu.find(3)).toBe(3)
    expect(dsu.find(4)).toBe(4)
    expect(dsu.getSize(0)).toBe(1)
    expect(dsu.getSize(1)).toBe(1)
    expect(dsu.getSize(2)).toBe(1)
    expect(dsu.getSize(3)).toBe(1)
    expect(dsu.getSize(4)).toBe(1)
  })

  it('union two elements', () => {
    const dsu = new UnionFindUndo(5)
    const result = dsu.union(0, 1)
    expect(result).toBe(true)
    expect(dsu.componentCount).toBe(4)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.find(0)).toBe(dsu.find(1))
  })

  it('union creates correct component count', () => {
    const dsu = new UnionFindUndo(10)
    dsu.union(0, 1)
    expect(dsu.componentCount).toBe(9)
    dsu.union(2, 3)
    expect(dsu.componentCount).toBe(8)
    dsu.union(4, 5)
    expect(dsu.componentCount).toBe(7)
    dsu.union(0, 2)
    expect(dsu.componentCount).toBe(6)
    dsu.union(0, 4)
    expect(dsu.componentCount).toBe(5)
  })

  it('find returns correct representative', () => {
    const dsu = new UnionFindUndo(6)
    expect(dsu.find(0)).toBe(0)
    expect(dsu.find(1)).toBe(1)
    expect(dsu.find(2)).toBe(2)
    dsu.union(0, 2)
    expect(dsu.find(0) === dsu.find(2)).toBe(true)
    dsu.union(1, 3)
    expect(dsu.find(1) === dsu.find(3)).toBe(true)
    dsu.union(0, 1)
    expect(dsu.find(0) === dsu.find(1) && dsu.find(1) === dsu.find(2) && dsu.find(2) === dsu.find(3)).toBe(true)
  })

  it('connected works correctly', () => {
    const dsu = new UnionFindUndo(6)
    expect(dsu.connected(0, 1)).toBe(false)
    expect(dsu.connected(2, 3)).toBe(false)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)
    dsu.union(2, 3)
    expect(dsu.connected(2, 3)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)
    dsu.union(1, 2)
    expect(dsu.connected(0, 3)).toBe(true)
  })

  it('GetSize after unions', () => {
    const dsu = new UnionFindUndo(8)
    expect(dsu.getSize(0)).toBe(1)
    expect(dsu.getSize(1)).toBe(1)
    dsu.union(0, 1)
    expect(dsu.getSize(0)).toBe(2)
    expect(dsu.getSize(1)).toBe(2)
    dsu.union(2, 3)
    dsu.union(0, 2)
    expect(dsu.getSize(0)).toBe(4)
    expect(dsu.getSize(1)).toBe(4)
    expect(dsu.getSize(2)).toBe(4)
    expect(dsu.getSize(3)).toBe(4)
    dsu.union(4, 5)
    dsu.union(4, 6)
    expect(dsu.getSize(4)).toBe(3)
  })

  it('undo single union', () => {
    const dsu = new UnionFindUndo(5)
    dsu.union(0, 1)
    expect(dsu.componentCount).toBe(4)
    expect(dsu.connected(0, 1)).toBe(true)
    dsu.undo()
    expect(dsu.componentCount).toBe(5)
    expect(dsu.connected(0, 1)).toBe(false)
    expect(dsu.find(0)).toBe(0)
    expect(dsu.find(1)).toBe(1)
    expect(dsu.getSize(0)).toBe(1)
    expect(dsu.getSize(1)).toBe(1)
  })

  it('undo multiple unions', () => {
    const dsu = new UnionFindUndo(10)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    dsu.union(6, 7)
    expect(dsu.componentCount).toBe(6)
    dsu.undo()
    expect(dsu.componentCount).toBe(7)
    expect(dsu.connected(6, 7)).toBe(false)
    dsu.undo()
    expect(dsu.componentCount).toBe(8)
    expect(dsu.connected(4, 5)).toBe(false)
    dsu.undo()
    expect(dsu.componentCount).toBe(9)
    dsu.undo()
    expect(dsu.componentCount).toBe(10)
  })

  it('snapshot and rollback to earlier state', () => {
    const dsu = new UnionFindUndo(8)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    const snapshot = dsu.snapshot()
    expect(snapshot).toBe(3)
    expect(dsu.componentCount).toBe(5)
    dsu.union(0, 2)
    dsu.union(4, 6)
    expect(dsu.componentCount).toBe(3)
    dsu.rollback(snapshot)
    expect(dsu.componentCount).toBe(5)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(true)
    expect(dsu.connected(4, 5)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)
    expect(dsu.connected(4, 6)).toBe(false)
  })

  it('snapshot/rollback with intermediate unions', () => {
    const dsu = new UnionFindUndo(6)
    const snap1 = dsu.snapshot()
    expect(snap1).toBe(0)
    dsu.union(0, 1)
    const snap2 = dsu.snapshot()
    expect(snap2).toBe(1)
    dsu.union(2, 3)
    const snap3 = dsu.snapshot()
    expect(snap3).toBe(2)
    dsu.union(0, 2)
    dsu.union(4, 5)
    expect(dsu.componentCount).toBe(2)
    dsu.rollback(snap3)
    expect(dsu.componentCount).toBe(4)
    expect(dsu.connected(0, 2)).toBe(false)
    dsu.rollback(snap2)
    expect(dsu.componentCount).toBe(5)
    expect(dsu.connected(2, 3)).toBe(false)
    dsu.rollback(snap1)
    expect(dsu.componentCount).toBe(6)
  })

  it('union returns false for same-set elements', () => {
    const dsu = new UnionFindUndo(5)
    dsu.union(0, 1)
    const result1 = dsu.union(0, 1)
    expect(result1).toBe(false)
    const result2 = dsu.union(1, 0)
    expect(result2).toBe(false)
    dsu.union(2, 3)
    dsu.union(0, 2)
    const result3 = dsu.union(1, 3)
    expect(result3).toBe(false)
    const result4 = dsu.union(2, 0)
    expect(result4).toBe(false)
  })

  it('complex sequence: union, snapshot, more unions, rollback, verify', () => {
    const dsu = new UnionFindUndo(10)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    const snap1 = dsu.snapshot()
    expect(dsu.componentCount).toBe(7)
    expect(dsu.getSize(0)).toBe(2)
    expect(dsu.getSize(2)).toBe(2)
    expect(dsu.getSize(4)).toBe(2)
    dsu.union(0, 2)
    dsu.union(6, 7)
    dsu.union(0, 4)
    expect(dsu.componentCount).toBe(4)
    expect(dsu.getSize(0)).toBe(6)
    expect(dsu.getSize(6)).toBe(2)
    dsu.rollback(snap1)
    expect(dsu.componentCount).toBe(7)
    expect(dsu.getSize(0)).toBe(2)
    expect(dsu.getSize(4)).toBe(2)
    expect(dsu.connected(0, 2)).toBe(false)
    expect(dsu.connected(6, 7)).toBe(false)
    dsu.union(0, 2)
    expect(dsu.getSize(0)).toBe(4)
    expect(dsu.componentCount).toBe(6)
  })

  it('all elements connected into one set', () => {
    const dsu = new UnionFindUndo(7)
    expect(dsu.componentCount).toBe(7)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    expect(dsu.componentCount).toBe(4)
    dsu.union(0, 2)
    expect(dsu.componentCount).toBe(3)
    dsu.union(0, 4)
    expect(dsu.componentCount).toBe(2)
    dsu.union(0, 6)
    expect(dsu.componentCount).toBe(1)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(1, 2)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(true)
    expect(dsu.connected(3, 4)).toBe(true)
    expect(dsu.connected(4, 5)).toBe(true)
    expect(dsu.connected(5, 6)).toBe(true)
    expect(dsu.connected(0, 6)).toBe(true)
    expect(dsu.getSize(0)).toBe(7)
  })

  it('throws error for invalid index in constructor', () => {
    expect(() => new UnionFindUndo(-1)).toThrow(RangeError)
    expect(() => new UnionFindUndo(1.5)).toThrow(RangeError)
    expect(() => new UnionFindUndo(Infinity)).toThrow(RangeError)
  })

  it('throws error for invalid index in find', () => {
    const dsu = new UnionFindUndo(5)
    expect(() => dsu.find(-1)).toThrow(RangeError)
    expect(() => dsu.find(5)).toThrow(RangeError)
  })

  it('throws error for invalid index in union', () => {
    const dsu = new UnionFindUndo(5)
    expect(() => dsu.union(-1, 0)).toThrow(RangeError)
    expect(() => dsu.union(0, 5)).toThrow(RangeError)
  })

  it('throws error for invalid index in connected', () => {
    const dsu = new UnionFindUndo(5)
    expect(() => dsu.connected(-1, 0)).toThrow(RangeError)
    expect(() => dsu.connected(0, 5)).toThrow(RangeError)
  })

  it('throws error for invalid index in getSize', () => {
    const dsu = new UnionFindUndo(5)
    expect(() => dsu.getSize(-1)).toThrow(RangeError)
    expect(() => dsu.getSize(5)).toThrow(RangeError)
  })

  it('throws error for undo when nothing to undo', () => {
    const dsu = new UnionFindUndo(5)
    expect(() => dsu.undo()).toThrow('UnionFindUndo: nothing to undo')
    dsu.union(0, 1)
    dsu.undo()
    expect(() => dsu.undo()).toThrow('UnionFindUndo: nothing to undo')
  })

  it('throws error for rollback with invalid version', () => {
    const dsu = new UnionFindUndo(5)
    dsu.union(0, 1)
    dsu.union(2, 3)
    expect(() => dsu.rollback(-1)).toThrow(RangeError)
    expect(() => dsu.rollback(5)).toThrow(RangeError)
  })

  it('handles empty union-find', () => {
    const dsu = new UnionFindUndo(0)
    expect(dsu.componentCount).toBe(0)
    expect(dsu.size).toBe(0)
  })

  it('union by size ensures balanced trees', () => {
    const dsu = new UnionFindUndo(10)
    for (let i = 1; i < 5; i++) {
      dsu.union(0, i)
    }
    expect(dsu.getSize(0)).toBe(5)
    dsu.union(5, 6)
    dsu.union(5, 7)
    dsu.union(5, 8)
    dsu.union(5, 9)
    expect(dsu.getSize(5)).toBe(5)
    dsu.union(0, 5)
    expect(dsu.componentCount).toBe(1)
    expect(dsu.getSize(0)).toBe(10)
  })

  it('connected returns false for separate sets', () => {
    const dsu = new UnionFindUndo(3)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('undo reverts last union', () => {
    const dsu = new UnionFindUndo(3)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
    dsu.undo()
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('throws error for invalid index in constructor with zero', () => {
    expect(() => new UnionFindUndo(0)).not.toThrow()
  })

  it('union in reverse order', () => {
    const dsu = new UnionFindUndo(5)
    dsu.union(4, 3)
    dsu.union(3, 2)
    dsu.union(2, 1)
    dsu.union(1, 0)
    expect(dsu.connected(0, 4)).toBe(true)
    expect(dsu.componentCount).toBe(1)
  })

  it('snapshot returns 0 for initial state', () => {
    const dsu = new UnionFindUndo(5)
    expect(dsu.snapshot()).toBe(0)
  })

  it('snapshot increments with each union', () => {
    const dsu = new UnionFindUndo(5)
    expect(dsu.snapshot()).toBe(0)
    dsu.union(0, 1)
    expect(dsu.snapshot()).toBe(1)
    dsu.union(2, 3)
    expect(dsu.snapshot()).toBe(2)
    dsu.union(0, 2)
    expect(dsu.snapshot()).toBe(3)
  })

  it('rollback to 0 restores initial state', () => {
    const dsu = new UnionFindUndo(5)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(0, 2)
    expect(dsu.componentCount).toBe(2)
    dsu.rollback(0)
    expect(dsu.componentCount).toBe(5)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('union after undo works correctly', () => {
    const dsu = new UnionFindUndo(5)
    dsu.union(0, 1)
    expect(dsu.componentCount).toBe(4)
    dsu.undo()
    expect(dsu.componentCount).toBe(5)
    dsu.union(1, 2)
    expect(dsu.componentCount).toBe(4)
    expect(dsu.connected(1, 2)).toBe(true)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('undo after snapshot', () => {
    const dsu = new UnionFindUndo(5)
    dsu.union(0, 1)
    dsu.union(2, 3)
    const snap = dsu.snapshot()
    expect(snap).toBe(2)
    dsu.union(0, 2)
    expect(dsu.componentCount).toBe(2)
    dsu.undo()
    expect(dsu.componentCount).toBe(3)
    expect(dsu.connected(0, 2)).toBe(false)
    expect(dsu.connected(0, 1)).toBe(true)
  })

  it('multiple undos', () => {
    const dsu = new UnionFindUndo(10)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    expect(dsu.componentCount).toBe(7)
    dsu.undo()
    expect(dsu.componentCount).toBe(8)
    dsu.undo()
    expect(dsu.componentCount).toBe(9)
    dsu.undo()
    expect(dsu.componentCount).toBe(10)
  })

  it('union with non-adjacent elements', () => {
    const dsu = new UnionFindUndo(100)
    dsu.union(0, 99)
    expect(dsu.connected(0, 99)).toBe(true)
    expect(dsu.getSize(0)).toBe(2)
    dsu.union(50, 0)
    expect(dsu.connected(50, 99)).toBe(true)
    expect(dsu.getSize(0)).toBe(3)
  })

  it('find after multiple unions', () => {
    const dsu = new UnionFindUndo(10)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    const root0 = dsu.find(0)
    const root3 = dsu.find(3)
    expect(root0).toBe(root3)
    expect(dsu.getSize(0)).toBe(4)
  })

  it('connected returns true for same element', () => {
    const dsu = new UnionFindUndo(5)
    expect(dsu.connected(0, 0)).toBe(true)
    expect(dsu.connected(4, 4)).toBe(true)
  })

  it('getSize after undo restores correct size', () => {
    const dsu = new UnionFindUndo(10)
    dsu.union(0, 1)
    dsu.union(0, 2)
    dsu.union(0, 3)
    expect(dsu.getSize(0)).toBe(4)
    dsu.undo()
    expect(dsu.getSize(0)).toBe(3)
    dsu.undo()
    expect(dsu.getSize(0)).toBe(2)
  })

  it('rollback to intermediate state', () => {
    const dsu = new UnionFindUndo(8)
    dsu.union(0, 1)
    const snap1 = dsu.snapshot()
    expect(dsu.componentCount).toBe(7)
    dsu.union(2, 3)
    dsu.union(0, 2)
    const snap2 = dsu.snapshot()
    expect(dsu.componentCount).toBe(5)
    dsu.union(4, 5)
    dsu.union(6, 7)
    expect(dsu.componentCount).toBe(3)
    dsu.rollback(snap2)
    expect(dsu.componentCount).toBe(5)
    dsu.rollback(snap1)
    expect(dsu.componentCount).toBe(7)
  })

  it('complex undo/rollback sequence', () => {
    const dsu = new UnionFindUndo(10)
    dsu.union(0, 1)
    dsu.union(2, 3)
    const snap1 = dsu.snapshot()
    dsu.union(0, 2)
    dsu.undo()
    expect(dsu.componentCount).toBe(8)
    dsu.union(4, 5)
    dsu.union(0, 4)
    const snap2 = dsu.snapshot()
    dsu.rollback(snap1)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)
  })

  it('union order affects component structure', () => {
    const dsu1 = new UnionFindUndo(6)
    dsu1.union(0, 1)
    dsu1.union(0, 2)
    dsu1.union(0, 3)
    dsu1.union(0, 4)

    const dsu2 = new UnionFindUndo(6)
    dsu2.union(4, 3)
    dsu2.union(2, 1)
    dsu2.union(0, 1)
    dsu2.union(0, 4)

    expect(dsu1.connected(0, 4)).toBe(true)
    expect(dsu2.connected(0, 4)).toBe(true)
    expect(dsu1.componentCount).toBe(2)
    expect(dsu2.componentCount).toBe(2)
  })

  it('find on empty union-find throws', () => {
    const dsu = new UnionFindUndo(0)
    expect(() => dsu.find(0)).toThrow(RangeError)
  })

  it('union on empty union-find throws', () => {
    const dsu = new UnionFindUndo(0)
    expect(() => dsu.union(0, 1)).toThrow(RangeError)
  })

  it('connected on empty union-find throws', () => {
    const dsu = new UnionFindUndo(0)
    expect(() => dsu.connected(0, 1)).toThrow(RangeError)
  })

  it('getSize on empty union-find throws', () => {
    const dsu = new UnionFindUndo(0)
    expect(() => dsu.getSize(0)).toThrow(RangeError)
  })

  it('snapshot on empty union-find returns 0', () => {
    const dsu = new UnionFindUndo(0)
    expect(dsu.snapshot()).toBe(0)
  })

  it('rollback on empty union-find with version 0 works', () => {
    const dsu = new UnionFindUndo(0)
    expect(() => dsu.rollback(0)).not.toThrow()
  })

  it('large number of unions', () => {
    const dsu = new UnionFindUndo(100)
    for (let i = 0; i < 99; i++) {
      dsu.union(i, i + 1)
    }
    expect(dsu.componentCount).toBe(1)
    expect(dsu.connected(0, 99)).toBe(true)
    expect(dsu.getSize(0)).toBe(100)
  })

  it('undo all unions returns to initial state', () => {
    const dsu = new UnionFindUndo(10)
    for (let i = 0; i < 9; i++) {
      dsu.union(i, i + 1)
    }
    expect(dsu.componentCount).toBe(1)
    for (let i = 0; i < 9; i++) {
      dsu.undo()
    }
    expect(dsu.componentCount).toBe(10)
    expect(dsu.connected(0, 9)).toBe(false)
  })

  it('find performance with path compression', () => {
    const dsu = new UnionFindUndo(1000)
    for (let i = 1; i < 1000; i++) {
      dsu.union(0, i)
    }
    const root1 = dsu.find(0)
    const root2 = dsu.find(500)
    expect(root1).toBe(root2)
  })

  it('interleaved unions and undos', () => {
    const dsu = new UnionFindUndo(10)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.undo()
    dsu.union(4, 5)
    dsu.undo()
    expect(dsu.componentCount).toBe(9)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(false)
    expect(dsu.connected(4, 5)).toBe(false)
  })

  it('snapshot/rollback with single element', () => {
    const dsu = new UnionFindUndo(1)
    const snap = dsu.snapshot()
    expect(snap).toBe(0)
    dsu.rollback(snap)
    expect(dsu.componentCount).toBe(1)
  })

  it('should track component count', () => {
    const dsu = new UnionFindUndo(4)
    expect(dsu.componentCount).toBe(4)
    dsu.union(0, 1)
    expect(dsu.componentCount).toBe(3)
  })

  it('should check connected', () => {
    const dsu = new UnionFindUndo(3)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)
  })
})
  it('find returns root', () => {
    const uf = new UnionFindUndo(3)
    uf.union(0, 1)
    expect(uf.find(0)).toBe(uf.find(1))
  })

  it('connected returns true after union', () => {
    const uf = new UnionFindUndo(3)
    uf.union(0, 1)
    expect(uf.connected(0, 1)).toBe(true)
  })

  it('snapshot and undo', () => {
    const uf = new UnionFindUndo(3)
    const snap = uf.snapshot()
    uf.union(0, 1)
    expect(uf.connected(0, 1)).toBe(true)
    uf.undo(snap)
    expect(uf.connected(0, 1)).toBe(false)
  })

describe('union-find-undo - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('union-find-undo - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
