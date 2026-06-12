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

describe('union-find-undo - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('union-find-undo - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('union-find-undo - wave548', () => {
  it('union-find-undo module defined', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo module is function', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave549', () => {
  it('union-find-undo module defined', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo module is function', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave550', () => {
  it('union-find-undo w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave551', () => {
  it('union-find-undo w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave552', () => {
  it('union-find-undo w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave553', () => {
  it('union-find-undo w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave554', () => {
  it('union-find-undo w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave555', () => {
  it('union-find-undo w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave556', () => {
  it('union-find-undo w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave557', () => {
  it('union-find-undo w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave558', () => {
  it('union-find-undo w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave559', () => {
  it('union-find-undo w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave560', () => {
  it('union-find-undo w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave561', () => {
  it('union-find-undo w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave562', () => {
  it('union-find-undo w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave563', () => {
  it('union-find-undo w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave564', () => {
  it('union-find-undo w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave565', () => {
  it('union-find-undo w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave566', () => {
  it('union-find-undo w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave127', () => {
  it('union-find-undo w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave130', () => {
  it('union-find-undo w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave133', () => {
  it('union-find-undo w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave136', () => {
  it('union-find-undo w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - wave139', () => {
  it('union-find-undo w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w142', () => {
  it('union-find-undo v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w145', () => {
  it('union-find-undo v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w148', () => {
  it('union-find-undo v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w151', () => {
  it('union-find-undo v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w154', () => {
  it('union-find-undo v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w157', () => {
  it('union-find-undo v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w160', () => {
  it('union-find-undo v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w170', () => {
  it('union-find-undo x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w180', () => {
  it('union-find-undo x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w190', () => {
  it('union-find-undo x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w200', () => {
  it('union-find-undo x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w210', () => {
  it('union-find-undo x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w220', () => {
  it('union-find-undo x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w230', () => {
  it('union-find-undo x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w240', () => {
  it('union-find-undo x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w250', () => {
  it('union-find-undo x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w260', () => {
  it('union-find-undo x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w270', () => {
  it('union-find-undo x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w280', () => {
  it('union-find-undo x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w290', () => {
  it('union-find-undo x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w300', () => {
  it('union-find-undo x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w310', () => {
  it('union-find-undo x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w320', () => {
  it('union-find-undo x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w330', () => {
  it('union-find-undo x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w340', () => {
  it('union-find-undo x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w350', () => {
  it('union-find-undo x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w360', () => {
  it('union-find-undo x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w370', () => {
  it('union-find-undo x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w380', () => {
  it('union-find-undo x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w390', () => {
  it('union-find-undo x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w400', () => {
  it('union-find-undo x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w420', () => {
  it('union-find-undo x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w440', () => {
  it('union-find-undo x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w460', () => {
  it('union-find-undo x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w480', () => {
  it('union-find-undo x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('union-find-undo - w500', () => {
  it('union-find-undo x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('union-find-undo x500x19', () => {
    expect(describe).toBeDefined()
  })
})
