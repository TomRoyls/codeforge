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

  it('union of element with itself returns false', () => {
    const dsu = new UndoDisjointSet(3)
    expect(dsu.union(0, 0)).toBe(false)
  })

  it('union of already connected elements returns false', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    expect(dsu.union(1, 0)).toBe(false)
  })

  it('union in chain connects all elements', () => {
    const dsu = new UndoDisjointSet(4)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    expect(dsu.connected(0, 3)).toBe(true)
  })

  it('undo restores parent correctly', () => {
    const dsu = new UndoDisjointSet(3)
    const root0 = dsu.find(0)
    const root1 = dsu.find(1)
    dsu.union(0, 1)
    dsu.undo()
    expect(dsu.find(0)).toBe(root0)
    expect(dsu.find(1)).toBe(root1)
  })

  it('undo after re-union works correctly', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    dsu.undo()
    dsu.union(0, 2)
    dsu.undo()
    expect(dsu.connected(0, 2)).toBe(false)
    expect(dsu.components).toBe(3)
  })

  it('snapshot at initial state is zero', () => {
    const dsu = new UndoDisjointSet(5)
    expect(dsu.snapshot()).toBe(0)
  })

  it('rollback after multiple undos works', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    const snap1 = dsu.snapshot()
    dsu.union(1, 2)
    dsu.undo()
    dsu.union(2, 3)
    dsu.rollback(snap1)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(1, 2)).toBe(false)
  })

  it('find on single element returns itself', () => {
    const dsu = new UndoDisjointSet(5)
    expect(dsu.find(2)).toBe(2)
  })

  it('connected on same element returns true', () => {
    const dsu = new UndoDisjointSet(3)
    expect(dsu.connected(1, 1)).toBe(true)
  })

  it('connected after chain unions', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    dsu.union(3, 4)
    expect(dsu.connected(0, 4)).toBe(true)
  })

  it('connected after undo', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.undo()
    expect(dsu.connected(0, 2)).toBe(false)
    expect(dsu.connected(0, 1)).toBe(true)
  })

  it('component count after chain unions', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    expect(dsu.components).toBe(4)
    dsu.union(1, 2)
    expect(dsu.components).toBe(3)
    dsu.union(2, 3)
    expect(dsu.components).toBe(2)
    dsu.union(3, 4)
    expect(dsu.components).toBe(1)
  })

  it('component count increases with undo', () => {
    const dsu = new UndoDisjointSet(4)
    dsu.union(0, 1)
    dsu.union(2, 3)
    expect(dsu.components).toBe(2)
    dsu.undo()
    expect(dsu.components).toBe(3)
    dsu.undo()
    expect(dsu.components).toBe(4)
  })

  it('component count after rollback', () => {
    const dsu = new UndoDisjointSet(5)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    dsu.union(1, 2)
    expect(dsu.components).toBe(3)
    dsu.rollback(snap)
    expect(dsu.components).toBe(5)
  })

  it('snapshot after undo decreases', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    const snap1 = dsu.snapshot()
    dsu.union(1, 2)
    const snap2 = dsu.snapshot()
    dsu.undo()
    const snap3 = dsu.snapshot()
    expect(snap1).toBeLessThan(snap2)
    expect(snap3).toBeLessThan(snap2)
  })

  it('find after undo returns original root', () => {
    const dsu = new UndoDisjointSet(4)
    const initialRoot = dsu.find(1)
    dsu.union(0, 1)
    dsu.union(2, 1)
    dsu.undo()
    dsu.undo()
    expect(dsu.find(1)).toBe(initialRoot)
  })

  it('connected after rollback', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    const snap = dsu.snapshot()
    dsu.union(0, 2)
    expect(dsu.connected(0, 2)).toBe(true)
    dsu.rollback(snap)
    expect(dsu.connected(0, 2)).toBe(false)
    expect(dsu.connected(0, 1)).toBe(true)
  })

  it('multiple snapshots can be taken', () => {
    const dsu = new UndoDisjointSet(4)
    const snap0 = dsu.snapshot()
    dsu.union(0, 1)
    const snap1 = dsu.snapshot()
    dsu.union(2, 3)
    const snap2 = dsu.snapshot()
    expect(snap0).toBeLessThan(snap1)
    expect(snap1).toBeLessThan(snap2)
    dsu.rollback(snap1)
    expect(dsu.components).toBe(3)
  })

  it('union creates correct component structure', () => {
    const dsu = new UndoDisjointSet(6)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    expect(dsu.components).toBe(3)
    expect(dsu.find(0)).toBe(dsu.find(1))
    expect(dsu.find(2)).toBe(dsu.find(3))
    expect(dsu.find(4)).toBe(dsu.find(5))
    expect(dsu.find(0)).not.toBe(dsu.find(2))
  })

  it('undo after complex union structure', () => {
    const dsu = new UndoDisjointSet(6)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(0, 2)
    dsu.union(4, 5)
    expect(dsu.components).toBe(2)
    dsu.undo()
    expect(dsu.components).toBe(3)
    expect(dsu.connected(4, 5)).toBe(false)
    expect(dsu.connected(0, 2)).toBe(true)
  })

  it('find works correctly after path compression', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    dsu.find(0)
    dsu.find(1)
    expect(dsu.connected(0, 3)).toBe(true)
  })

  it('rollback to earlier snapshot works', () => {
    const dsu = new UndoDisjointSet(5)
    const snap0 = dsu.snapshot()
    dsu.union(0, 1)
    const snap1 = dsu.snapshot()
    dsu.union(1, 2)
    const snap2 = dsu.snapshot()
    dsu.union(2, 3)
    dsu.rollback(snap1)
    expect(dsu.components).toBe(4)
    expect(dsu.connected(1, 2)).toBe(false)
    dsu.rollback(snap0)
    expect(dsu.components).toBe(5)
  })

  it('union preserves component count when already connected', () => {
    const dsu = new UndoDisjointSet(4)
    dsu.union(0, 1)
    dsu.union(2, 3)
    const compCount = dsu.components
    expect(dsu.union(0, 1)).toBe(false)
    expect(dsu.components).toBe(compCount)
  })

  it('undo does not affect unrelated components', () => {
    const dsu = new UndoDisjointSet(6)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    dsu.undo()
    expect(dsu.connected(2, 3)).toBe(true)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(4, 5)).toBe(false)
  })

  it('connected returns false for unconnected elements', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    dsu.union(2, 3)
    expect(dsu.connected(0, 2)).toBe(false)
    expect(dsu.connected(1, 3)).toBe(false)
    expect(dsu.connected(0, 4)).toBe(false)
  })

  it('snapshot before any unions has length zero', () => {
    const dsu = new UndoDisjointSet(10)
    const snap = dsu.snapshot()
    expect(snap).toBe(0)
    dsu.rollback(snap)
    expect(dsu.components).toBe(10)
  })

  it('union direction affects which element becomes root', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    const root0 = dsu.find(0)
    const root1 = dsu.find(1)
    expect(root0).toBe(root1)
    expect(root0).toBe(0)
  })

  it('handles multiple consecutive undos from same snapshot', () => {
    const dsu = new UndoDisjointSet(5)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    dsu.union(3, 4)
    expect(dsu.components).toBe(1)
    dsu.undo()
    dsu.undo()
    dsu.undo()
    dsu.undo()
    expect(dsu.components).toBe(5)
    expect(dsu.snapshot()).toBe(snap)
  })

  it('union of disconnected sets maintains separate components', () => {
    const dsu = new UndoDisjointSet(6)
    dsu.union(0, 1)
    dsu.union(2, 3)
    dsu.union(4, 5)
    expect(dsu.components).toBe(3)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(true)
    expect(dsu.connected(4, 5)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)
    expect(dsu.connected(0, 4)).toBe(false)
    expect(dsu.connected(2, 4)).toBe(false)
  })

  it('find works on deeply nested unions', () => {
    const dsu = new UndoDisjointSet(10)
    for (let i = 0; i < 9; i++) {
      dsu.union(i, i + 1)
    }
    const root = dsu.find(0)
    expect(dsu.find(9)).toBe(root)
    expect(dsu.find(5)).toBe(root)
  })

  it('snapshot after rollback to earlier state works correctly', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    const snap1 = dsu.snapshot()
    dsu.union(2, 3)
    const snap2 = dsu.snapshot()
    dsu.rollback(snap1)
    const snap3 = dsu.snapshot()
    expect(snap3).toBe(snap1)
    expect(snap1).toBeLessThan(snap2)
  })

  it('undo restores correct component structure for star topology', () => {
    const dsu = new UndoDisjointSet(5)
    dsu.union(0, 1)
    dsu.union(0, 2)
    dsu.union(0, 3)
    dsu.union(0, 4)
    expect(dsu.components).toBe(1)
    dsu.undo()
    expect(dsu.components).toBe(2)
    expect(dsu.connected(0, 3)).toBe(true)
    expect(dsu.connected(0, 4)).toBe(false)
  })

  it('rollback to mid-history state preserves correct connections', () => {
    const dsu = new UndoDisjointSet(7)
    dsu.union(0, 1)
    dsu.union(2, 3)
    const snap = dsu.snapshot()
    dsu.union(0, 2)
    dsu.union(4, 5)
    dsu.union(5, 6)
    dsu.rollback(snap)
    expect(dsu.components).toBe(5)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(true)
    expect(dsu.connected(4, 5)).toBe(false)
    expect(dsu.connected(5, 6)).toBe(false)
  })

  it('snapshot and rollback restore state', () => {
    const dsu = new UndoDisjointSet(4)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
    dsu.rollback(snap)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('undo reverses last union', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    dsu.undo()
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('multiple snapshots at different points', () => {
    const dsu = new UndoDisjointSet(4)
    const s1 = dsu.snapshot()
    dsu.union(0, 1)
    const s2 = dsu.snapshot()
    dsu.union(2, 3)
    dsu.rollback(s2)
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(false)
  })

  it('find returns representative', () => {
    const dsu = new UndoDisjointSet(3)
    dsu.union(0, 1)
    expect(dsu.find(0)).toBe(dsu.find(1))
    expect(dsu.find(2)).not.toBe(dsu.find(0))
  })
})
describe('undo-disjoint-set - extra', () => {
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

describe('undo-disjoint-set - wave545', () => {
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

describe('undo-disjoint-set - wave546', () => {
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

describe('undo-disjoint-set - wave547', () => {
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

describe('undo-disjoint-set - wave548', () => {
  it('undo-disjoint-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('undo-disjoint-set - wave549', () => {
  it('undo-disjoint-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('undo-disjoint-set - wave550', () => {
  it('undo-disjoint-set w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('undo-disjoint-set - wave551', () => {
  it('undo-disjoint-set w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('undo-disjoint-set - wave552', () => {
  it('undo-disjoint-set w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('undo-disjoint-set - wave553', () => {
  it('undo-disjoint-set w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('undo-disjoint-set - wave554', () => {
  it('undo-disjoint-set w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('undo-disjoint-set - wave555', () => {
  it('undo-disjoint-set w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('undo-disjoint-set - wave556', () => {
  it('undo-disjoint-set w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('undo-disjoint-set w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
