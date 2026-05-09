import { describe, it, expect } from 'vitest'
import { PersistentUnionFind } from '../../src/core/persistent-union-find/persistent-union-find.js'
import type { VersionData } from '../../src/core/persistent-union-find/types.js'

describe('PersistentUnionFind', () => {
  describe('constructor', () => {
    it('should create instance with n elements', () => {
      const puf = new PersistentUnionFind(5)
      expect(puf.getSize()).toBe(5)
    })

    it('should create instance with 0 elements', () => {
      const puf = new PersistentUnionFind(0)
      expect(puf.getSize()).toBe(0)
    })

    it('should throw for negative n', () => {
      expect(() => new PersistentUnionFind(-1)).toThrow('Element count must be non-negative')
    })

    it('should start with version 0', () => {
      const puf = new PersistentUnionFind(3)
      expect(puf.getLatestVersion()).toBe(0)
      expect(puf.getVersionCount()).toBe(1)
    })

    it('should initialize all elements as self-parents', () => {
      const puf = new PersistentUnionFind(4)
      const data = puf.getVersionData(0)
      expect(data.parent).toEqual([0, 1, 2, 3])
    })

    it('should initialize all sizes to 1', () => {
      const puf = new PersistentUnionFind(4)
      const data = puf.getVersionData(0)
      expect(data.size).toEqual([1, 1, 1, 1])
    })

    it('should handle large n', () => {
      const puf = new PersistentUnionFind(1000)
      expect(puf.getSize()).toBe(1000)
      expect(puf.getComponentCount(0)).toBe(1000)
    })

    it('should handle n = 1', () => {
      const puf = new PersistentUnionFind(1)
      expect(puf.getSize()).toBe(1)
      expect(puf.find(0, 0)).toBe(0)
    })
  })

  describe('union', () => {
    it('should return new version id after union', () => {
      const puf = new PersistentUnionFind(3)
      const v = puf.union(0, 1)
      expect(v).toBe(1)
    })

    it('should increment version count after each union', () => {
      const puf = new PersistentUnionFind(4)
      puf.union(0, 1)
      puf.union(1, 2)
      expect(puf.getVersionCount()).toBe(3)
    })

    it('should create new version even for same-set union', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      const v = puf.union(0, 1)
      expect(v).toBe(2)
      expect(puf.getVersionCount()).toBe(3)
    })

    it('should create new version for self-union', () => {
      const puf = new PersistentUnionFind(3)
      const v = puf.union(0, 0)
      expect(v).toBe(1)
    })

    it('should throw for out-of-range element x', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.union(5, 0)).toThrow('Element 5 out of range')
    })

    it('should throw for out-of-range element y', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.union(0, 5)).toThrow('Element 5 out of range')
    })

    it('should throw for negative element x', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.union(-1, 0)).toThrow('Element -1 out of range')
    })

    it('should throw for negative element y', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.union(0, -1)).toThrow('Element -1 out of range')
    })

    it('should connect two elements', () => {
      const puf = new PersistentUnionFind(3)
      const v = puf.union(0, 1)
      expect(puf.connected(v, 0, 1)).toBe(true)
    })

    it('should reduce component count by 1 on successful union', () => {
      const puf = new PersistentUnionFind(4)
      expect(puf.getComponentCount(0)).toBe(4)
      const v1 = puf.union(0, 1)
      expect(puf.getComponentCount(v1)).toBe(3)
    })

    it('should not reduce component count for same-set union', () => {
      const puf = new PersistentUnionFind(3)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(0, 1)
      expect(puf.getComponentCount(v1)).toBe(2)
      expect(puf.getComponentCount(v2)).toBe(2)
    })

    it('should union three elements in chain', () => {
      const puf = new PersistentUnionFind(3)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(1, 2)
      expect(puf.connected(v2, 0, 2)).toBe(true)
      expect(puf.getComponentCount(v2)).toBe(1)
    })

    it('should return sequential version ids', () => {
      const puf = new PersistentUnionFind(5)
      expect(puf.union(0, 1)).toBe(1)
      expect(puf.union(1, 2)).toBe(2)
      expect(puf.union(2, 3)).toBe(3)
      expect(puf.union(3, 4)).toBe(4)
    })

    it('should handle union by size correctly - smaller into larger', () => {
      const puf = new PersistentUnionFind(4)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(2, 3)
      const v3 = puf.union(0, 2)
      expect(puf.connected(v3, 1, 3)).toBe(true)
      expect(puf.getSize(v3, 0)).toBe(4)
    })

    it('should handle many unions', () => {
      const puf = new PersistentUnionFind(100)
      for (let i = 1; i < 100; i++) {
        puf.union(0, i)
      }
      expect(puf.getComponentCount(puf.getLatestVersion())).toBe(1)
    })
  })

  describe('find', () => {
    it('should return element itself at version 0', () => {
      const puf = new PersistentUnionFind(5)
      expect(puf.find(0, 0)).toBe(0)
      expect(puf.find(0, 4)).toBe(4)
    })

    it('should return same root for connected elements', () => {
      const puf = new PersistentUnionFind(3)
      const v = puf.union(0, 1)
      expect(puf.find(v, 0)).toBe(puf.find(v, 1))
    })

    it('should throw for invalid version', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.find(5, 0)).toThrow('Invalid version 5')
    })

    it('should throw for negative version', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.find(-1, 0)).toThrow('Invalid version -1')
    })

    it('should throw for out-of-range element', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.find(0, 5)).toThrow('Element 5 out of range')
    })

    it('should throw for negative element', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.find(0, -1)).toThrow('Element -1 out of range')
    })

    it('should find root through chain', () => {
      const puf = new PersistentUnionFind(5)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(1, 2)
      const v3 = puf.union(2, 3)
      const v4 = puf.union(3, 4)
      const root = puf.find(v4, 4)
      expect(puf.find(v4, 0)).toBe(root)
    })

    it('should not modify historical version on find', () => {
      const puf = new PersistentUnionFind(3)
      const v0data = puf.getVersionData(0)
      puf.union(0, 1)
      const v0dataAfter = puf.getVersionData(0)
      expect(v0dataAfter.parent).toEqual(v0data.parent)
    })

    it('should return correct root at each version', () => {
      const puf = new PersistentUnionFind(3)
      expect(puf.find(0, 0)).toBe(0)
      const v1 = puf.union(0, 1)
      const root = puf.find(v1, 0)
      expect(puf.find(v1, 1)).toBe(root)
      expect(puf.find(0, 0)).toBe(0)
      expect(puf.find(0, 1)).toBe(1)
    })
  })

  describe('connected', () => {
    it('should return false for unconnected elements at version 0', () => {
      const puf = new PersistentUnionFind(3)
      expect(puf.connected(0, 0, 1)).toBe(false)
    })

    it('should return true for self at version 0', () => {
      const puf = new PersistentUnionFind(3)
      expect(puf.connected(0, 0, 0)).toBe(true)
    })

    it('should return true after union', () => {
      const puf = new PersistentUnionFind(3)
      const v = puf.union(0, 1)
      expect(puf.connected(v, 0, 1)).toBe(true)
    })

    it('should return false at older version after union', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      expect(puf.connected(0, 0, 1)).toBe(false)
    })

    it('should throw for invalid version', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.connected(99, 0, 1)).toThrow('Invalid version 99')
    })

    it('should throw for out-of-range element', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.connected(0, 5, 0)).toThrow('Element 5 out of range')
    })

    it('should be transitive', () => {
      const puf = new PersistentUnionFind(4)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(2, 3)
      const v3 = puf.union(0, 2)
      expect(puf.connected(v3, 1, 3)).toBe(true)
    })

    it('should be symmetric', () => {
      const puf = new PersistentUnionFind(3)
      const v = puf.union(0, 1)
      expect(puf.connected(v, 0, 1)).toBe(puf.connected(v, 1, 0))
    })
  })

  describe('getSize (component)', () => {
    it('should return 1 for unconnected element', () => {
      const puf = new PersistentUnionFind(3)
      expect(puf.getSize(0, 0)).toBe(1)
    })

    it('should return 2 after union of two elements', () => {
      const puf = new PersistentUnionFind(3)
      const v = puf.union(0, 1)
      expect(puf.getSize(v, 0)).toBe(2)
      expect(puf.getSize(v, 1)).toBe(2)
    })

    it('should return correct size for larger component', () => {
      const puf = new PersistentUnionFind(5)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(1, 2)
      const v3 = puf.union(2, 3)
      const v4 = puf.union(3, 4)
      expect(puf.getSize(v4, 0)).toBe(5)
    })

    it('should throw for invalid version', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.getSize(99, 0)).toThrow('Invalid version 99')
    })

    it('should throw for out-of-range element', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.getSize(0, 5)).toThrow('Element 5 out of range')
    })

    it('should reflect historical sizes correctly', () => {
      const puf = new PersistentUnionFind(3)
      const v1 = puf.union(0, 1)
      puf.union(1, 2)
      expect(puf.getSize(v1, 0)).toBe(2)
      expect(puf.getSize(0, 2)).toBe(1)
    })

    it('should return size from any member', () => {
      const puf = new PersistentUnionFind(4)
      const v = puf.union(0, 1)
      const v2 = puf.union(2, 3)
      expect(puf.getSize(v2, 0)).toBe(2)
      expect(puf.getSize(v2, 1)).toBe(2)
      expect(puf.getSize(v2, 2)).toBe(2)
      expect(puf.getSize(v2, 3)).toBe(2)
    })
  })

  describe('getComponentCount', () => {
    it('should return n at version 0', () => {
      const puf = new PersistentUnionFind(5)
      expect(puf.getComponentCount(0)).toBe(5)
    })

    it('should return 0 for n=0', () => {
      const puf = new PersistentUnionFind(0)
      expect(puf.getComponentCount(0)).toBe(0)
    })

    it('should decrease by 1 per successful union', () => {
      const puf = new PersistentUnionFind(4)
      const v1 = puf.union(0, 1)
      expect(puf.getComponentCount(v1)).toBe(3)
      const v2 = puf.union(2, 3)
      expect(puf.getComponentCount(v2)).toBe(2)
      const v3 = puf.union(0, 2)
      expect(puf.getComponentCount(v3)).toBe(1)
    })

    it('should throw for invalid version', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.getComponentCount(99)).toThrow('Invalid version 99')
    })

    it('should preserve historical component counts', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      puf.union(1, 2)
      expect(puf.getComponentCount(0)).toBe(3)
      expect(puf.getComponentCount(1)).toBe(2)
      expect(puf.getComponentCount(2)).toBe(1)
    })
  })

  describe('getLatestVersion', () => {
    it('should return 0 for fresh instance', () => {
      const puf = new PersistentUnionFind(3)
      expect(puf.getLatestVersion()).toBe(0)
    })

    it('should update after each union', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      expect(puf.getLatestVersion()).toBe(1)
      puf.union(1, 2)
      expect(puf.getLatestVersion()).toBe(2)
    })

    it('should be consistent with getVersionCount', () => {
      const puf = new PersistentUnionFind(3)
      expect(puf.getLatestVersion()).toBe(puf.getVersionCount() - 1)
      puf.union(0, 1)
      expect(puf.getLatestVersion()).toBe(puf.getVersionCount() - 1)
    })
  })

  describe('getVersionCount', () => {
    it('should return 1 initially', () => {
      const puf = new PersistentUnionFind(3)
      expect(puf.getVersionCount()).toBe(1)
    })

    it('should increase by 1 after each union', () => {
      const puf = new PersistentUnionFind(5)
      puf.union(0, 1)
      expect(puf.getVersionCount()).toBe(2)
      puf.union(1, 2)
      expect(puf.getVersionCount()).toBe(3)
      puf.union(2, 3)
      expect(puf.getVersionCount()).toBe(4)
    })
  })

  describe('getVersionData', () => {
    it('should return a copy of parent and size arrays', () => {
      const puf = new PersistentUnionFind(3)
      const data = puf.getVersionData(0)
      expect(data.parent).toEqual([0, 1, 2])
      expect(data.size).toEqual([1, 1, 1])
    })

    it('should return independent copies', () => {
      const puf = new PersistentUnionFind(3)
      const d1 = puf.getVersionData(0)
      const d2 = puf.getVersionData(0)
      expect(d1.parent).toEqual(d2.parent)
      expect(d1.parent).not.toBe(d2.parent)
      expect(d1.size).not.toBe(d2.size)
    })

    it('should throw for invalid version', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.getVersionData(99)).toThrow('Invalid version 99')
    })

    it('should reflect union changes in newer versions', () => {
      const puf = new PersistentUnionFind(3)
      const v0 = puf.getVersionData(0)
      expect(v0.parent).toEqual([0, 1, 2])
      puf.union(0, 1)
      const v1 = puf.getVersionData(1)
      const root = v1.parent[0]
      expect(v1.parent[1]).toBe(root)
      expect(v1.size[root]).toBe(2)
    })

    it('should not mutate original data when modifying returned copy', () => {
      const puf = new PersistentUnionFind(3)
      const data = puf.getVersionData(0)
      data.parent[0] = 999
      const data2 = puf.getVersionData(0)
      expect(data2.parent[0]).toBe(0)
    })
  })

  describe('persistence', () => {
    it('should preserve all historical states', () => {
      const puf = new PersistentUnionFind(4)
      puf.union(0, 1)
      puf.union(2, 3)
      puf.union(0, 2)

      expect(puf.getComponentCount(0)).toBe(4)
      expect(puf.getComponentCount(1)).toBe(3)
      expect(puf.getComponentCount(2)).toBe(2)
      expect(puf.getComponentCount(3)).toBe(1)
    })

    it('should allow querying any version independently', () => {
      const puf = new PersistentUnionFind(4)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(2, 3)

      expect(puf.connected(0, 0, 1)).toBe(false)
      expect(puf.connected(v1, 0, 1)).toBe(true)
      expect(puf.connected(v2, 0, 1)).toBe(true)
      expect(puf.connected(v1, 2, 3)).toBe(false)
      expect(puf.connected(v2, 2, 3)).toBe(true)
    })

    it('should handle branching history via clone', () => {
      const puf = new PersistentUnionFind(4)
      puf.union(0, 1)
      const branch = puf.clone()
      branch.union(2, 3)
      puf.union(0, 2)

      expect(branch.getComponentCount(branch.getLatestVersion())).toBe(2)
      expect(puf.getComponentCount(puf.getLatestVersion())).toBe(2)
    })

    it('should preserve version 0 after many unions', () => {
      const puf = new PersistentUnionFind(10)
      for (let i = 1; i < 10; i++) puf.union(0, i)
      expect(puf.getComponentCount(0)).toBe(10)
      expect(puf.connected(0, 0, 1)).toBe(false)
    })

    it('should allow querying intermediate versions', () => {
      const puf = new PersistentUnionFind(5)
      const versions: number[] = [0]
      for (let i = 1; i < 5; i++) {
        versions.push(puf.union(0, i))
      }

      expect(puf.getComponentCount(versions[0])).toBe(5)
      expect(puf.getComponentCount(versions[1])).toBe(4)
      expect(puf.getComponentCount(versions[2])).toBe(3)
      expect(puf.getComponentCount(versions[3])).toBe(2)
      expect(puf.getComponentCount(versions[4])).toBe(1)
    })

    it('should not affect version 0 data after unions', () => {
      const puf = new PersistentUnionFind(3)
      const original = puf.getVersionData(0)
      puf.union(0, 1)
      puf.union(1, 2)
      const after = puf.getVersionData(0)
      expect(after.parent).toEqual(original.parent)
      expect(after.size).toEqual(original.size)
    })

    it('should support querying every version in sequence', () => {
      const puf = new PersistentUnionFind(5)
      for (let i = 1; i < 5; i++) puf.union(0, i)

      for (let v = 0; v <= puf.getLatestVersion(); v++) {
        const count = puf.getComponentCount(v)
        expect(count).toBe(5 - v)
      }
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const puf = new PersistentUnionFind(3)
      const clone = puf.clone()
      expect(clone.getSize()).toBe(3)
      expect(clone.getLatestVersion()).toBe(0)
    })

    it('should preserve all versions in clone', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      puf.union(1, 2)
      const clone = puf.clone()
      expect(clone.getVersionCount()).toBe(3)
      expect(clone.getComponentCount(2)).toBe(1)
    })

    it('should not affect original when clone is modified', () => {
      const puf = new PersistentUnionFind(4)
      puf.union(0, 1)
      const clone = puf.clone()
      clone.union(2, 3)
      expect(puf.getVersionCount()).toBe(2)
      expect(clone.getVersionCount()).toBe(3)
    })

    it('should not affect clone when original is modified', () => {
      const puf = new PersistentUnionFind(4)
      puf.union(0, 1)
      const clone = puf.clone()
      puf.union(2, 3)
      expect(clone.getVersionCount()).toBe(2)
      expect(puf.getVersionCount()).toBe(3)
    })

    it('should deep-copy version data', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      const clone = puf.clone()
      const origData = puf.getVersionData(1)
      const cloneData = clone.getVersionData(1)
      expect(origData.parent).toEqual(cloneData.parent)
      expect(origData.parent).not.toBe(cloneData.parent)
    })

    it('should support independent branching from clone', () => {
      const base = new PersistentUnionFind(5)
      base.union(0, 1)

      const branchA = base.clone()
      const branchB = base.clone()

      branchA.union(2, 3)
      branchB.union(3, 4)

      expect(branchA.connected(branchA.getLatestVersion(), 2, 3)).toBe(true)
      expect(branchA.connected(branchA.getLatestVersion(), 3, 4)).toBe(false)
      expect(branchB.connected(branchB.getLatestVersion(), 3, 4)).toBe(true)
      expect(branchB.connected(branchB.getLatestVersion(), 2, 3)).toBe(false)
    })

    it('should clone empty structure', () => {
      const puf = new PersistentUnionFind(0)
      const clone = puf.clone()
      expect(clone.getSize()).toBe(0)
      expect(clone.getVersionCount()).toBe(1)
    })
  })

  describe('getSize (element count)', () => {
    it('should return the total element count', () => {
      const puf = new PersistentUnionFind(5)
      expect(puf.getSize()).toBe(5)
    })

    it('should not change after unions', () => {
      const puf = new PersistentUnionFind(5)
      puf.union(0, 1)
      puf.union(1, 2)
      expect(puf.getSize()).toBe(5)
    })

    it('should return 0 for empty structure', () => {
      const puf = new PersistentUnionFind(0)
      expect(puf.getSize()).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle single element', () => {
      const puf = new PersistentUnionFind(1)
      expect(puf.find(0, 0)).toBe(0)
      expect(puf.connected(0, 0, 0)).toBe(true)
      expect(puf.getSize(0, 0)).toBe(1)
      expect(puf.getComponentCount(0)).toBe(1)
    })

    it('should handle empty structure queries', () => {
      const puf = new PersistentUnionFind(0)
      expect(puf.getComponentCount(0)).toBe(0)
      expect(puf.getLatestVersion()).toBe(0)
      expect(puf.getVersionCount()).toBe(1)
    })

    it('should handle two elements', () => {
      const puf = new PersistentUnionFind(2)
      const v = puf.union(0, 1)
      expect(puf.connected(v, 0, 1)).toBe(true)
      expect(puf.getSize(v, 0)).toBe(2)
      expect(puf.getComponentCount(v)).toBe(1)
    })

    it('should handle self-union', () => {
      const puf = new PersistentUnionFind(3)
      const v = puf.union(0, 0)
      expect(puf.connected(v, 0, 0)).toBe(true)
      expect(puf.getSize(v, 0)).toBe(1)
      expect(puf.getComponentCount(v)).toBe(3)
    })

    it('should handle sequential chain of unions', () => {
      const puf = new PersistentUnionFind(10)
      for (let i = 0; i < 9; i++) {
        puf.union(i, i + 1)
      }
      const latest = puf.getLatestVersion()
      expect(puf.getComponentCount(latest)).toBe(1)
      expect(puf.connected(latest, 0, 9)).toBe(true)
    })

    it('should handle star-pattern unions', () => {
      const puf = new PersistentUnionFind(20)
      for (let i = 1; i < 20; i++) {
        puf.union(0, i)
      }
      const latest = puf.getLatestVersion()
      expect(puf.getComponentCount(latest)).toBe(1)
      expect(puf.getSize(latest, 0)).toBe(20)
    })

    it('should handle binary merge pattern', () => {
      const puf = new PersistentUnionFind(16)
      for (let stride = 1; stride < 16; stride *= 2) {
        for (let i = 0; i + stride < 16; i += stride * 2) {
          puf.union(i, i + stride)
        }
      }
      const latest = puf.getLatestVersion()
      expect(puf.getComponentCount(latest)).toBe(1)
    })

    it('should handle repeated same union', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      puf.union(0, 1)
      puf.union(0, 1)
      const latest = puf.getLatestVersion()
      expect(puf.connected(latest, 0, 1)).toBe(true)
      expect(puf.getComponentCount(latest)).toBe(2)
      expect(puf.getVersionCount()).toBe(4)
    })
  })

  describe('large structures', () => {
    it('should handle 200 elements all connected', () => {
      const puf = new PersistentUnionFind(200)
      for (let i = 1; i < 200; i++) puf.union(0, i)
      const latest = puf.getLatestVersion()
      expect(puf.getComponentCount(latest)).toBe(1)
      expect(puf.getSize(latest, 0)).toBe(200)
    })

    it('should handle 100 versions', () => {
      const puf = new PersistentUnionFind(5)
      for (let i = 0; i < 100; i++) {
        puf.union(i % 5, (i + 1) % 5)
      }
      expect(puf.getVersionCount()).toBe(101)
    })

    it('should handle querying all versions on large structure', () => {
      const puf = new PersistentUnionFind(50)
      for (let i = 1; i < 50; i++) puf.union(0, i)
      for (let v = 0; v < puf.getVersionCount(); v++) {
        const count = puf.getComponentCount(v)
        expect(count).toBeLessThanOrEqual(50)
        expect(count).toBeGreaterThan(0)
      }
    })
  })

  describe('VersionData type export', () => {
    it('should export VersionData type', () => {
      const data: VersionData = { parent: [0, 1], size: [1, 1] }
      expect(data.parent.length).toBe(2)
      expect(data.size.length).toBe(2)
    })
  })

  describe('multiple components', () => {
    it('should track separate components', () => {
      const puf = new PersistentUnionFind(6)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(2, 3)
      const v3 = puf.union(4, 5)

      expect(puf.connected(v3, 0, 1)).toBe(true)
      expect(puf.connected(v3, 2, 3)).toBe(true)
      expect(puf.connected(v3, 4, 5)).toBe(true)
      expect(puf.connected(v3, 0, 2)).toBe(false)
      expect(puf.connected(v3, 0, 4)).toBe(false)
      expect(puf.getComponentCount(v3)).toBe(3)
    })

    it('should merge components progressively', () => {
      const puf = new PersistentUnionFind(6)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(2, 3)
      const v3 = puf.union(0, 2)
      const v4 = puf.union(4, 5)
      const v5 = puf.union(0, 4)

      expect(puf.getComponentCount(v1)).toBe(5)
      expect(puf.getComponentCount(v2)).toBe(4)
      expect(puf.getComponentCount(v3)).toBe(3)
      expect(puf.getComponentCount(v4)).toBe(2)
      expect(puf.getComponentCount(v5)).toBe(1)
      expect(puf.connected(v5, 1, 5)).toBe(true)
    })

    it('should track sizes independently per component', () => {
      const puf = new PersistentUnionFind(6)
      puf.union(0, 1)
      puf.union(2, 3)
      puf.union(4, 5)

      const v = puf.getLatestVersion()
      expect(puf.getSize(v, 0)).toBe(2)
      expect(puf.getSize(v, 2)).toBe(2)
      expect(puf.getSize(v, 4)).toBe(2)
    })
  })

  describe('persistence immutability', () => {
    it('should not mutate old version parent array', () => {
      const puf = new PersistentUnionFind(3)
      const v0parent = [...puf.getVersionData(0).parent]
      puf.union(0, 1)
      expect(puf.getVersionData(0).parent).toEqual(v0parent)
    })

    it('should not mutate old version size array', () => {
      const puf = new PersistentUnionFind(3)
      const v0size = [...puf.getVersionData(0).size]
      puf.union(0, 1)
      expect(puf.getVersionData(0).size).toEqual(v0size)
    })

    it('should keep independent histories for each version', () => {
      const puf = new PersistentUnionFind(5)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(2, 3)
      const v3 = puf.union(0, 2)
      const v4 = puf.union(3, 4)

      expect(puf.connected(v1, 2, 3)).toBe(false)
      expect(puf.connected(v2, 2, 3)).toBe(true)
      expect(puf.connected(v3, 0, 3)).toBe(true)
      expect(puf.connected(v1, 0, 1)).toBe(true)
      expect(puf.connected(v2, 0, 1)).toBe(true)
    })

    it('should allow reading any version at any time', () => {
      const puf = new PersistentUnionFind(4)
      puf.union(0, 1)
      puf.union(2, 3)
      puf.union(0, 2)

      for (let v = 0; v <= 3; v++) {
        const data = puf.getVersionData(v)
        expect(data.parent.length).toBe(4)
        expect(data.size.length).toBe(4)
      }
    })
  })

  describe('validation', () => {
    it('should reject version equal to version count', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.find(1, 0)).toThrow('Invalid version 1')
    })

    it('should reject large version numbers', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.find(999999, 0)).toThrow('Invalid version 999999')
    })

    it('should reject element equal to n', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.find(0, 3)).toThrow('Element 3 out of range')
    })
  })

  describe('union by size behavior', () => {
    it('should attach smaller tree to larger tree', () => {
      const puf = new PersistentUnionFind(6)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(2, 3)
      const v3 = puf.union(4, 5)

      expect(puf.getSize(v1, 0)).toBe(2)
      expect(puf.getSize(v2, 2)).toBe(2)
      expect(puf.getSize(v3, 4)).toBe(2)

      const v4 = puf.union(0, 2)
      expect(puf.getSize(v4, 0)).toBe(4)
      expect(puf.connected(v4, 1, 3)).toBe(true)
    })

    it('should maintain correct sizes through chain unions', () => {
      const puf = new PersistentUnionFind(5)
      puf.union(0, 1)
      puf.union(1, 2)
      puf.union(2, 3)
      const v = puf.union(3, 4)

      expect(puf.getSize(v, 0)).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(puf.connected(v, 0, i)).toBe(true)
      }
    })

    it('should handle balanced merge', () => {
      const puf = new PersistentUnionFind(8)
      puf.union(0, 1)
      puf.union(2, 3)
      puf.union(4, 5)
      puf.union(6, 7)
      puf.union(0, 2)
      puf.union(4, 6)
      const v = puf.union(0, 4)

      expect(puf.getComponentCount(v)).toBe(1)
      expect(puf.getSize(v, 0)).toBe(8)
    })
  })

  describe('additional coverage', () => {
    it('should return version data with correct structure', () => {
      const puf = new PersistentUnionFind(3)
      const data = puf.getVersionData(0)
      expect(data).toHaveProperty('parent')
      expect(data).toHaveProperty('size')
      expect(Array.isArray(data.parent)).toBe(true)
      expect(Array.isArray(data.size)).toBe(true)
    })

    it('should handle getLatestVersion after many same-set unions', () => {
      const puf = new PersistentUnionFind(3)
      for (let i = 0; i < 10; i++) puf.union(0, 1)
      expect(puf.getLatestVersion()).toBe(10)
    })

    it('should maintain correctness with alternating unions', () => {
      const puf = new PersistentUnionFind(6)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(0, 1)
      const v3 = puf.union(2, 3)
      const v4 = puf.union(2, 3)
      const v5 = puf.union(0, 2)

      expect(puf.connected(v5, 0, 3)).toBe(true)
      expect(puf.connected(v1, 0, 1)).toBe(true)
      expect(puf.connected(v1, 2, 3)).toBe(false)
      expect(puf.connected(v3, 2, 3)).toBe(true)
      expect(puf.getComponentCount(v5)).toBe(3)
    })

    it('should return correct size for unconnected element at version 0', () => {
      const puf = new PersistentUnionFind(5)
      for (let i = 0; i < 5; i++) {
        expect(puf.getSize(0, i)).toBe(1)
      }
    })

    it('should handle clone of structure with many versions', () => {
      const puf = new PersistentUnionFind(5)
      for (let i = 1; i < 5; i++) puf.union(0, i)
      const clone = puf.clone()
      expect(clone.getVersionCount()).toBe(5)
      expect(clone.getComponentCount(4)).toBe(1)
      expect(clone.connected(4, 0, 4)).toBe(true)
    })

    it('should validate element in connected with both out of range', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.connected(0, 5, 5)).toThrow('Element 5 out of range')
    })

    it('should validate element in getSize with negative element', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.getSize(0, -1)).toThrow('Element -1 out of range')
    })

    it('should validate version in connected', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.connected(-1, 0, 1)).toThrow('Invalid version -1')
    })

    it('should validate version in getComponentCount', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.getComponentCount(-1)).toThrow('Invalid version -1')
    })

    it('should validate version in getVersionData', () => {
      const puf = new PersistentUnionFind(3)
      expect(() => puf.getVersionData(-1)).toThrow('Invalid version -1')
    })

    it('should handle find after many unions on same pair', () => {
      const puf = new PersistentUnionFind(3)
      for (let i = 0; i < 50; i++) puf.union(0, 1)
      const latest = puf.getLatestVersion()
      expect(puf.find(latest, 0)).toBe(puf.find(latest, 1))
    })

    it('should return independent data for consecutive getVersionData calls', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      const d1 = puf.getVersionData(1)
      const d2 = puf.getVersionData(1)
      d1.parent[0] = 9999
      expect(d2.parent[0]).not.toBe(9999)
    })

    it('should handle union of last two elements', () => {
      const puf = new PersistentUnionFind(10)
      const v = puf.union(8, 9)
      expect(puf.connected(v, 8, 9)).toBe(true)
      expect(puf.getSize(v, 8)).toBe(2)
      expect(puf.getComponentCount(v)).toBe(9)
    })

    it('should handle union of first and last element', () => {
      const puf = new PersistentUnionFind(10)
      const v = puf.union(0, 9)
      expect(puf.connected(v, 0, 9)).toBe(true)
      expect(puf.getSize(v, 0)).toBe(2)
    })

    it('should preserve disconnected elements at all versions', () => {
      const puf = new PersistentUnionFind(5)
      puf.union(0, 1)
      const v2 = puf.union(0, 2)
      puf.union(0, 3)
      puf.union(0, 4)

      expect(puf.find(0, 3)).toBe(3)
      expect(puf.find(v2, 3)).toBe(3)
      expect(puf.find(puf.getLatestVersion(), 3)).not.toBe(3)
    })

    it('should handle consecutive unions to same target', () => {
      const puf = new PersistentUnionFind(5)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(0, 2)
      const v3 = puf.union(0, 3)
      const v4 = puf.union(0, 4)

      expect(puf.getSize(v4, 0)).toBe(5)
      expect(puf.getComponentCount(v4)).toBe(1)
      expect(puf.getSize(v2, 0)).toBe(3)
      expect(puf.getSize(v1, 0)).toBe(2)
    })

    it('should handle empty clone modifications', () => {
      const puf = new PersistentUnionFind(3)
      const clone = puf.clone()
      clone.union(0, 1)
      expect(puf.getVersionCount()).toBe(1)
      expect(clone.getVersionCount()).toBe(2)
    })

    it('should correctly report version count after no-op unions', () => {
      const puf = new PersistentUnionFind(2)
      puf.union(0, 1)
      puf.union(0, 1)
      puf.union(0, 1)
      expect(puf.getVersionCount()).toBe(4)
    })

    it('should handle getComponentCount for version 0 after unions', () => {
      const puf = new PersistentUnionFind(4)
      puf.union(0, 1)
      puf.union(2, 3)
      expect(puf.getComponentCount(0)).toBe(4)
    })

    it('should support version data snapshot at each step', () => {
      const puf = new PersistentUnionFind(3)
      const snapshots: VersionData[] = [puf.getVersionData(0)]
      for (let i = 1; i < 3; i++) {
        puf.union(0, i)
        snapshots.push(puf.getVersionData(puf.getLatestVersion()))
      }
      expect(snapshots.length).toBe(3)
      expect(snapshots[0].parent).toEqual([0, 1, 2])
    })

    it('should handle element at boundary n-1', () => {
      const puf = new PersistentUnionFind(5)
      expect(puf.find(0, 4)).toBe(4)
      const v = puf.union(3, 4)
      expect(puf.connected(v, 3, 4)).toBe(true)
    })

    it('should validate element 0 is always in range for n>0', () => {
      const puf = new PersistentUnionFind(1)
      expect(puf.find(0, 0)).toBe(0)
      expect(puf.connected(0, 0, 0)).toBe(true)
    })

    it('should handle union with same elements but different order', () => {
      const puf = new PersistentUnionFind(3)
      const v1 = puf.union(0, 1)
      const puf2 = new PersistentUnionFind(3)
      const v2 = puf2.union(1, 0)
      expect(puf.connected(v1, 0, 1)).toBe(puf2.connected(v2, 0, 1))
      expect(puf.getSize(v1, 0)).toBe(puf2.getSize(v2, 0))
    })

    it('should track component count across versions correctly', () => {
      const puf = new PersistentUnionFind(5)
      const vs: number[] = []
      vs.push(puf.union(0, 1))
      vs.push(puf.union(1, 2))
      vs.push(puf.union(3, 4))
      vs.push(puf.union(0, 3))
      for (let i = 0; i < vs.length; i++) {
        expect(puf.getComponentCount(vs[i])).toBe(5 - (i + 1))
      }
    })

    it('should handle connected check at boundary version', () => {
      const puf = new PersistentUnionFind(2)
      const v = puf.union(0, 1)
      expect(puf.connected(v, 0, 1)).toBe(true)
      expect(() => puf.connected(v + 1, 0, 1)).toThrow()
    })

    it('should return correct data for all versions after full merge', () => {
      const puf = new PersistentUnionFind(4)
      const v1 = puf.union(0, 1)
      const v2 = puf.union(2, 3)
      const v3 = puf.union(0, 2)

      expect(puf.getSize(v3, 0)).toBe(4)
      expect(puf.getSize(v2, 0)).toBe(2)
      expect(puf.getSize(v1, 0)).toBe(2)
      expect(puf.getSize(0, 0)).toBe(1)
    })

    it('should handle clone after partial unions', () => {
      const puf = new PersistentUnionFind(5)
      puf.union(0, 1)
      puf.union(2, 3)
      const clone = puf.clone()

      expect(clone.getVersionCount()).toBe(3)
      expect(clone.connected(2, 0, 1)).toBe(true)
      expect(clone.connected(2, 2, 3)).toBe(true)
      expect(clone.connected(2, 0, 2)).toBe(false)
    })

    it('should handle find on cloned structure', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      const clone = puf.clone()
      expect(clone.find(0, 0)).toBe(0)
      expect(clone.find(1, 0)).toBe(clone.find(1, 1))
    })

    it('should handle getVersionData on cloned structure', () => {
      const puf = new PersistentUnionFind(3)
      puf.union(0, 1)
      const clone = puf.clone()
      const origData = puf.getVersionData(1)
      const cloneData = clone.getVersionData(1)
      expect(origData).toEqual(cloneData)
    })
  })
})
