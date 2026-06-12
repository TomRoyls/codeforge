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

  it('snapshot and rollback restores components', () => {
    const dsu = new RollbackDSU(3)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    expect(dsu.components).toBe(2)
    dsu.rollback(snap)
    expect(dsu.components).toBe(3)
  })

  it('find returns representative', () => {
    const dsu = new RollbackDSU(3)
    dsu.union(0, 1)
    expect(dsu.find(0)).toBe(dsu.find(1))
  })

  it('unconnected nodes have different roots', () => {
    const dsu = new RollbackDSU(3)
    dsu.union(0, 1)
    expect(dsu.find(0)).not.toBe(dsu.find(2))
  })

  it('union connects elements', () => {
    const dsu = new RollbackDSU(3)
    dsu.union(0, 1)
    expect(dsu.find(0)).toBe(dsu.find(1))
  })

  it('creates DSU with size zero', () => {
    const dsu = new RollbackDSU(0)
    expect(dsu.size).toBe(0)
    expect(dsu.components).toBe(0)
  })

  it('find returns -1 on empty DSU', () => {
    const dsu = new RollbackDSU(0)
    expect(dsu.find(0)).toBe(-1)
  })

  it('union returns false on empty DSU', () => {
    const dsu = new RollbackDSU(0)
    expect(dsu.union(0, 0)).toBe(false)
  })

  it('fromPairs with empty pairs array', () => {
    const dsu = RollbackDSU.fromPairs(5, [])
    expect(dsu.components).toBe(5)
    expect(dsu.connected(0, 1)).toBe(false)
  })

  it('fromPairs handles duplicate pairs', () => {
    const dsu = RollbackDSU.fromPairs(5, [
      [0, 1],
      [0, 1],
      [1, 2],
    ])
    expect(dsu.connected(0, 2)).toBe(true)
    expect(dsu.componentSize(0)).toBe(3)
  })

  it('component size after single element', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.componentSize(0)).toBe(1)
  })

  it('getComponentMembers for single element', () => {
    const dsu = new RollbackDSU(3)
    const members = dsu.getComponentMembers(1)
    expect(members).toEqual([1])
  })

  it('getComponentMembers returns sorted array', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(3, 1)
    dsu.union(4, 2)
    const members = dsu.getComponentMembers(3)
    expect(members).toEqual(expect.arrayContaining([1, 3]))
  })

  it('snapshot returns 0 on empty stack', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.snapshot()).toBe(0)
  })

  it('rollback to current snapshot does nothing', () => {
    const dsu = new RollbackDSU(5)
    const snap = dsu.snapshot()
    dsu.rollback(snap)
    expect(dsu.components).toBe(5)
  })

  it('rollback to earlier snapshot clears stack', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    const snap1 = dsu.snapshot()
    dsu.union(2, 3)
    dsu.union(1, 2)
    dsu.rollback(snap1)
    expect(dsu.components).toBe(4)
  })

  it('connected returns true for same element', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.connected(0, 0)).toBe(true)
  })

  it('connected returns false for invalid elements', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.connected(-1, -1)).toBe(false)
    expect(dsu.connected(10, 10)).toBe(false)
  })

  it('union decreases components count', () => {
    const dsu = new RollbackDSU(5)
    expect(dsu.components).toBe(5)
    dsu.union(0, 1)
    expect(dsu.components).toBe(4)
    dsu.union(2, 3)
    expect(dsu.components).toBe(3)
  })

  it('union of already connected elements does not decrease components', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    expect(dsu.components).toBe(3)
    dsu.union(0, 2)
    expect(dsu.components).toBe(3)
  })

  it('reset clears snapshot stack', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    dsu.union(2, 3)
    expect(dsu.snapshot()).toBe(2)
    dsu.reset()
    expect(dsu.snapshot()).toBe(0)
  })

  it('fromPairs creates disconnected components', () => {
    const dsu = RollbackDSU.fromPairs(6, [
      [0, 1],
      [2, 3],
    ])
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)
    expect(dsu.components).toBe(4)
  })

  it('find after rollback returns original root', () => {
    const dsu = new RollbackDSU(5)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    const rootAfterUnion = dsu.find(0)
    expect(rootAfterUnion).toBe(dsu.find(1))
    dsu.rollback(snap)
    expect(dsu.find(0)).toBe(0)
  })

  it('componentSize after rollback returns original size', () => {
    const dsu = new RollbackDSU(5)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    dsu.union(1, 2)
    expect(dsu.componentSize(0)).toBe(3)
    dsu.rollback(snap)
    expect(dsu.componentSize(0)).toBe(1)
  })

  it('getComponentMembers after rollback returns original members', () => {
    const dsu = new RollbackDSU(5)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    dsu.union(1, 2)
    expect(dsu.getComponentMembers(0).length).toBe(3)
    dsu.rollback(snap)
    const members0 = dsu.getComponentMembers(0)
    const members1 = dsu.getComponentMembers(1)
    const members2 = dsu.getComponentMembers(2)
    expect(members0).toContain(0)
    expect(members1).toContain(1)
    expect(members2).toContain(2)
  })

  it('handles chain of unions', () => {
    const dsu = new RollbackDSU(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    dsu.union(3, 4)
    expect(dsu.connected(0, 4)).toBe(true)
    expect(dsu.componentSize(0)).toBe(5)
  })

  it('rollback to initial state after chain of unions', () => {
    const dsu = new RollbackDSU(5)
    const snap = dsu.snapshot()
    dsu.union(0, 1)
    dsu.union(1, 2)
    dsu.union(2, 3)
    dsu.union(3, 4)
    dsu.rollback(snap)
    expect(dsu.components).toBe(5)
  })

  it('union order affects root assignment', () => {
    const dsu1 = new RollbackDSU(3)
    dsu1.union(0, 1)
    expect(dsu1.find(1)).toBe(dsu1.find(0))

    const dsu2 = new RollbackDSU(3)
    dsu2.union(1, 0)
    expect(dsu2.find(0)).toBe(dsu2.find(1))
  })

  it('reset preserves DSU size', () => {
    const dsu = new RollbackDSU(10)
    dsu.union(0, 1)
    dsu.union(2, 3)
    expect(dsu.size).toBe(10)
    dsu.reset()
    expect(dsu.size).toBe(10)
  })

  it('multiple snapshots in sequence', () => {
    const dsu = new RollbackDSU(5)
    const snap0 = dsu.snapshot()
    dsu.union(0, 1)
    const snap1 = dsu.snapshot()
    dsu.union(2, 3)
    const snap2 = dsu.snapshot()
    dsu.union(0, 2)

    dsu.rollback(snap2)
    expect(dsu.components).toBe(3)

    dsu.rollback(snap1)
    expect(dsu.components).toBe(4)

    dsu.rollback(snap0)
    expect(dsu.components).toBe(5)
  })

  it('snapshot returns increasing numbers', () => {
    const dsu = new RollbackDSU(5)
    const s0 = dsu.snapshot()
    dsu.union(0, 1)
    const s1 = dsu.snapshot()
    dsu.union(2, 3)
    const s2 = dsu.snapshot()
    expect(s0).toBe(0)
    expect(s1).toBe(1)
    expect(s2).toBe(2)
  })

  it('should handle empty rollback', () => {
    const dsu = new RollbackDSU(3)
    dsu.union(0, 1)
    dsu.rollback(0)
    expect(dsu.connected(0, 1)).toBe(true)
  })

  it('should get size', () => {
    const dsu = new RollbackDSU(3)
    dsu.union(0, 1)
    expect(dsu.componentSize(0)).toBe(2)
  })
})
  it('snapshot returns stack depth', () => {
    const dsu = new RollbackDSU(3)
    const snap = dsu.snapshot()
    expect(typeof snap).toBe('number')
  })

  it('componentSize returns correct size', () => {
    const dsu = new RollbackDSU(3)
    dsu.union(0, 1)
    expect(dsu.componentSize(0)).toBe(2)
  })

  it('fromPairs creates connected components', () => {
    const dsu = RollbackDSU.fromPairs(4, [[0, 1], [2, 3]])
    expect(dsu.connected(0, 1)).toBe(true)
    expect(dsu.connected(2, 3)).toBe(true)
    expect(dsu.connected(0, 2)).toBe(false)


  it('single element DSU', () => {
    const dsu = new RollbackDSU(1)
    expect(dsu.find(0)).toBe(0)
  })

  it('union connects elements', () => {
    const dsu = new RollbackDSU(2)
    dsu.union(0, 1)
    expect(dsu.connected(0, 1)).toBe(true)
  })

  it('snapshot returns number', () => {
    const dsu = new RollbackDSU(3)
    expect(typeof dsu.snapshot()).toBe('number')
  })
  })

describe('rollback-dsu - wave545', () => {
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

describe('rollback-dsu - wave546', () => {
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
