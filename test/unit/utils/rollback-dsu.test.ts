import { describe, expect, it } from 'vitest'
import { RollbackDSU } from '../../../src/utils/rollback-dsu.js'

describe('RollbackDSU', () => {
  describe('constructor', () => {
    it('should create DSU with n=0', () => {
      const dsu = new RollbackDSU(0)
      expect(dsu.size).toBe(0)
      expect(dsu.components).toBe(0)
    })

    it('should create DSU with n=1', () => {
      const dsu = new RollbackDSU(1)
      expect(dsu.size).toBe(1)
      expect(dsu.components).toBe(1)
      expect(dsu.find(0)).toBe(0)
      expect(dsu.componentSize(0)).toBe(1)
    })

    it('should create DSU with n=5', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.size).toBe(5)
      expect(dsu.components).toBe(5)
      expect(dsu.find(0)).toBe(0)
      expect(dsu.find(4)).toBe(4)
      expect(dsu.componentSize(0)).toBe(1)
      expect(dsu.componentSize(4)).toBe(1)
    })

    it('should throw for negative n', () => {
      expect(() => new RollbackDSU(-1)).toThrow(RangeError)
    })
  })

  describe('find', () => {
    it('should return root for single element', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.find(0)).toBe(0)
      expect(dsu.find(2)).toBe(2)
    })

    it('should return -1 for out of bounds', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.find(-1)).toBe(-1)
      expect(dsu.find(5)).toBe(-1)
      expect(dsu.find(10)).toBe(-1)
    })

    it('should find root after union', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      expect(dsu.find(0)).toBe(0)
      expect(dsu.find(1)).toBe(0)
    })

    it('should find root through chain', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      expect(dsu.find(2)).toBe(0)
    })
  })

  describe('union', () => {
    it('should return true for successful union', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.union(0, 1)).toBe(true)
    })

    it('should return false for same element', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.union(0, 0)).toBe(false)
    })

    it('should return false for already connected', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      expect(dsu.union(0, 1)).toBe(false)
      expect(dsu.union(1, 0)).toBe(false)
    })

    it('should return false for out of bounds', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.union(-1, 0)).toBe(false)
      expect(dsu.union(0, 5)).toBe(false)
      expect(dsu.union(-1, -1)).toBe(false)
      expect(dsu.union(10, 20)).toBe(false)
    })

    it('should decrement components count', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.components).toBe(5)
      dsu.union(0, 1)
      expect(dsu.components).toBe(4)
      dsu.union(2, 3)
      expect(dsu.components).toBe(3)
    })

    it('should create single component from all elements', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      dsu.union(3, 4)
      dsu.union(2, 3)
      expect(dsu.components).toBe(1)
      expect(dsu.find(0)).toBe(dsu.find(4))
    })

    it('should handle union by rank', () => {
      const dsu = new RollbackDSU(8)
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(0, 2)
      dsu.union(4, 5)
      dsu.union(6, 7)
      dsu.union(4, 6)
      dsu.union(0, 4)
      expect(dsu.components).toBe(1)
    })
  })

  describe('connected', () => {
    it('should return true for same element', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.connected(0, 0)).toBe(true)
    })

    it('should return false for different unconnected elements', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.connected(0, 1)).toBe(false)
    })

    it('should return true for connected elements', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.connected(1, 0)).toBe(true)
    })

    it('should return true for transitively connected elements', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      expect(dsu.connected(0, 2)).toBe(true)
    })

    it('should return false for out of bounds', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.connected(-1, 0)).toBe(false)
      expect(dsu.connected(0, 5)).toBe(false)
    })
  })

  describe('componentSize', () => {
    it('should return 1 for single element', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.componentSize(0)).toBe(1)
    })

    it('should return 0 for out of bounds', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.componentSize(-1)).toBe(0)
      expect(dsu.componentSize(5)).toBe(0)
    })

    it('should return correct size after union', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      expect(dsu.componentSize(0)).toBe(2)
      expect(dsu.componentSize(1)).toBe(2)
    })

    it('should return correct size for chain unions', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      dsu.union(3, 4)
      expect(dsu.componentSize(0)).toBe(3)
      expect(dsu.componentSize(2)).toBe(3)
      expect(dsu.componentSize(3)).toBe(2)
      expect(dsu.componentSize(4)).toBe(2)
    })
  })

  describe('components', () => {
    it('should return initial n', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.components).toBe(5)
    })

    it('should decrement with each union', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      expect(dsu.components).toBe(4)
      dsu.union(2, 3)
      expect(dsu.components).toBe(3)
      dsu.union(1, 2)
      expect(dsu.components).toBe(2)
    })

    it('should return 0 for empty DSU', () => {
      const dsu = new RollbackDSU(0)
      expect(dsu.components).toBe(0)
    })
  })

  describe('size', () => {
    it('should return n', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.size).toBe(5)
    })

    it('should return 0 for empty DSU', () => {
      const dsu = new RollbackDSU(0)
      expect(dsu.size).toBe(0)
    })
  })

  describe('snapshot', () => {
    it('should return 0 for empty DSU', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.snapshot()).toBe(0)
    })

    it('should increment with each union', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.snapshot()).toBe(0)
      dsu.union(0, 1)
      expect(dsu.snapshot()).toBe(1)
      dsu.union(2, 3)
      expect(dsu.snapshot()).toBe(2)
    })

    it('should not increment for failed union', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      expect(dsu.snapshot()).toBe(1)
      dsu.union(0, 1)
      expect(dsu.snapshot()).toBe(1)
    })
  })

  describe('rollback', () => {
    it('should rollback to empty state', () => {
      const dsu = new RollbackDSU(5)
      const snap = dsu.snapshot()
      dsu.union(0, 1)
      dsu.union(2, 3)
      expect(dsu.components).toBe(3)
      dsu.rollback(snap)
      expect(dsu.components).toBe(5)
      expect(dsu.componentSize(0)).toBe(1)
    })

    it('should rollback partially', () => {
      const dsu = new RollbackDSU(5)
      const snap1 = dsu.snapshot()
      dsu.union(0, 1)
      const snap2 = dsu.snapshot()
      dsu.union(2, 3)
      dsu.union(3, 4)
      expect(dsu.components).toBe(2)
      dsu.rollback(snap2)
      expect(dsu.components).toBe(4)
      expect(dsu.connected(0, 1)).toBe(true)
    })

    it('should handle multiple rollbacks', () => {
      const dsu = new RollbackDSU(5)
      const snap = dsu.snapshot()
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(1, 2)
      expect(dsu.components).toBe(2)
      dsu.rollback(snap)
      expect(dsu.components).toBe(5)
    })

    it('should handle nested snapshots', () => {
      const dsu = new RollbackDSU(5)
      const snap0 = dsu.snapshot()
      dsu.union(0, 1)
      const snap1 = dsu.snapshot()
      dsu.union(2, 3)
      const snap2 = dsu.snapshot()
      dsu.union(3, 4)
      expect(dsu.components).toBe(2)
      dsu.rollback(snap2)
      expect(dsu.components).toBe(3)
      dsu.rollback(snap1)
      expect(dsu.components).toBe(4)
      dsu.rollback(snap0)
      expect(dsu.components).toBe(5)
    })

    it('should restore component sizes', () => {
      const dsu = new RollbackDSU(5)
      const snap = dsu.snapshot()
      dsu.union(0, 1)
      dsu.union(2, 3)
      expect(dsu.componentSize(0)).toBe(2)
      expect(dsu.componentSize(2)).toBe(2)
      dsu.rollback(snap)
      expect(dsu.componentSize(0)).toBe(1)
      expect(dsu.componentSize(2)).toBe(1)
    })

    it('should handle rollback to same snapshot', () => {
      const dsu = new RollbackDSU(5)
      const snap = dsu.snapshot()
      dsu.union(0, 1)
      dsu.rollback(snap)
      dsu.rollback(snap)
      expect(dsu.components).toBe(5)
    })
  })

  describe('reset', () => {
    it('should reset to initial state', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(1, 2)
      expect(dsu.components).toBe(2)
      dsu.reset()
      expect(dsu.components).toBe(5)
      expect(dsu.connected(0, 1)).toBe(false)
      expect(dsu.find(0)).toBe(0)
      expect(dsu.componentSize(0)).toBe(1)
    })

    it('should clear snapshot stack', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      const snap = dsu.snapshot()
      dsu.reset()
      expect(dsu.snapshot()).toBe(0)
    })

    it('should handle reset on empty DSU', () => {
      const dsu = new RollbackDSU(0)
      dsu.reset()
      expect(dsu.size).toBe(0)
      expect(dsu.components).toBe(0)
    })
  })

  describe('getComponentMembers', () => {
    it('should return single member for isolated element', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.getComponentMembers(0)).toEqual([0])
    })

    it('should return empty array for out of bounds', () => {
      const dsu = new RollbackDSU(5)
      expect(dsu.getComponentMembers(-1)).toEqual([])
      expect(dsu.getComponentMembers(5)).toEqual([])
    })

    it('should return all members of component', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      const members = dsu.getComponentMembers(0)
      expect(members).toContain(0)
      expect(members).toContain(1)
      expect(members).toContain(2)
      expect(members.length).toBe(3)
    })

    it('should return same members for any element in component', () => {
      const dsu = new RollbackDSU(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      expect(dsu.getComponentMembers(0)).toEqual(dsu.getComponentMembers(1))
      expect(dsu.getComponentMembers(1)).toEqual(dsu.getComponentMembers(2))
    })

    it('should handle multiple components', () => {
      const dsu = new RollbackDSU(6)
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(3, 4)
      expect(dsu.getComponentMembers(0)).toEqual([0, 1])
      expect(dsu.getComponentMembers(2)).toContain(2)
      expect(dsu.getComponentMembers(2)).toContain(3)
      expect(dsu.getComponentMembers(2)).toContain(4)
      expect(dsu.getComponentMembers(5)).toEqual([5])
    })
  })

  describe('fromPairs', () => {
    it('should create DSU from pairs', () => {
      const dsu = RollbackDSU.fromPairs(5, [
        [0, 1],
        [2, 3],
      ])
      expect(dsu.components).toBe(3)
      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.connected(2, 3)).toBe(true)
      expect(dsu.connected(1, 2)).toBe(false)
    })

    it('should handle empty pairs array', () => {
      const dsu = RollbackDSU.fromPairs(5, [])
      expect(dsu.components).toBe(5)
    })

    it('should handle complex pair connections', () => {
      const dsu = RollbackDSU.fromPairs(6, [
        [0, 1],
        [1, 2],
        [3, 4],
        [2, 3],
      ])
      expect(dsu.components).toBe(2)
      expect(dsu.connected(0, 4)).toBe(true)
      expect(dsu.getComponentMembers(0)).toContain(0)
      expect(dsu.getComponentMembers(0)).toContain(1)
      expect(dsu.getComponentMembers(0)).toContain(2)
      expect(dsu.getComponentMembers(0)).toContain(3)
      expect(dsu.getComponentMembers(0)).toContain(4)
    })

    it('should ignore duplicate pairs', () => {
      const dsu = RollbackDSU.fromPairs(5, [
        [0, 1],
        [1, 0],
        [0, 1],
      ])
      expect(dsu.components).toBe(4)
    })
  })
})