import { describe, it, expect } from 'vitest'
import { EphemeralArray } from '../../src/core/ephemeral-array/index.js'

describe('EphemeralArray', () => {
  describe('constructor', () => {
    it('creates empty array with no arguments', () => {
      const arr = new EphemeralArray()
      expect(arr.size).toBe(0)
      expect(arr.isEmpty).toBe(true)
    })

    it('creates array with size and no default', () => {
      const arr = new EphemeralArray<number>(5)
      expect(arr.size).toBe(5)
      expect(arr.isEmpty).toBe(false)
    })

    it('creates array with size and default value', () => {
      const arr = new EphemeralArray(3, 42)
      expect(arr.size).toBe(3)
      expect(arr.toArray()).toEqual([42, 42, 42])
    })

    it('creates array with initial data', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(arr.size).toBe(3)
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('creates array with empty initial data', () => {
      const arr = new EphemeralArray<number>([])
      expect(arr.size).toBe(0)
      expect(arr.isEmpty).toBe(true)
    })

    it('initializes with root version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(arr.getLatestVersion()).toBe(0)
      expect(arr.versions).toBe(1)
    })

    it('creates with size 0', () => {
      const arr = new EphemeralArray<number>(0)
      expect(arr.size).toBe(0)
    })

    it('creates with string default', () => {
      const arr = new EphemeralArray<string>(2, 'hello')
      expect(arr.toArray()).toEqual(['hello', 'hello'])
    })

    it('creates with null default', () => {
      const arr = new EphemeralArray<null>(3, null)
      expect(arr.toArray()).toEqual([null, null, null])
    })

    it('creates with boolean default', () => {
      const arr = new EphemeralArray<boolean>(4, false)
      expect(arr.toArray()).toEqual([false, false, false, false])
    })

    it('does not share data with input array', () => {
      const input = [1, 2, 3]
      const arr = new EphemeralArray(input)
      input[0] = 99
      expect(arr.get(0)).toBe(1)
    })
  })

  describe('get', () => {
    it('returns element at valid index', () => {
      const arr = new EphemeralArray([10, 20, 30])
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(20)
      expect(arr.get(2)).toBe(30)
    })

    it('returns element at specific version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v0 = arr.snapshot()
      arr.set(1, 99)
      expect(arr.get(1, v0)).toBe(2)
      expect(arr.get(1)).toBe(99)
    })

    it('throws on negative index', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(() => arr.get(-1)).toThrow(RangeError)
    })

    it('throws on index equal to size', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(() => arr.get(3)).toThrow(RangeError)
    })

    it('throws on index beyond size', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.get(100)).toThrow(RangeError)
    })

    it('throws on empty array', () => {
      const arr = new EphemeralArray<number>()
      expect(() => arr.get(0)).toThrow(RangeError)
    })

    it('throws on invalid version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(() => arr.get(0, 999)).toThrow(RangeError)
    })

    it('returns default value for unset slots', () => {
      const arr = new EphemeralArray<number>(3, 0)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(1)).toBe(0)
      expect(arr.get(2)).toBe(0)
    })
  })

  describe('set', () => {
    it('returns new version id', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v = arr.set(1, 99)
      expect(v).toBe(1)
      expect(typeof v).toBe('number')
    })

    it('updates value at current version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(1, 99)
      expect(arr.get(1)).toBe(99)
    })

    it('increments version count', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(arr.versions).toBe(1)
      arr.set(0, 10)
      expect(arr.versions).toBe(2)
      arr.set(1, 20)
      expect(arr.versions).toBe(3)
    })

    it('does not modify previous version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v0 = arr.snapshot()
      arr.set(0, 99)
      expect(arr.get(0, v0)).toBe(1)
      expect(arr.get(0)).toBe(99)
    })

    it('sets first element', () => {
      const arr = new EphemeralArray([10, 20, 30])
      arr.set(0, 5)
      expect(arr.toArray()).toEqual([5, 20, 30])
    })

    it('sets last element', () => {
      const arr = new EphemeralArray([10, 20, 30])
      arr.set(2, 5)
      expect(arr.toArray()).toEqual([10, 20, 5])
    })

    it('throws on negative index', () => {
      const arr = new EphemeralArray([1, 2])
      expect(() => arr.set(-1, 0)).toThrow(RangeError)
    })

    it('throws on out of bounds index', () => {
      const arr = new EphemeralArray([1, 2])
      expect(() => arr.set(5, 0)).toThrow(RangeError)
    })

    it('preserves size', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(1, 99)
      expect(arr.size).toBe(3)
    })

    it('returns sequential version ids', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(arr.set(0, 10)).toBe(1)
      expect(arr.set(1, 20)).toBe(2)
      expect(arr.set(2, 30)).toBe(3)
    })
  })

  describe('snapshot', () => {
    it('returns current version id', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(arr.snapshot()).toBe(0)
    })

    it('returns updated version after set', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 99)
      expect(arr.snapshot()).toBe(1)
    })

    it('can capture multiple snapshots', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const s0 = arr.snapshot()
      arr.set(0, 10)
      const s1 = arr.snapshot()
      arr.set(1, 20)
      const s2 = arr.snapshot()
      expect(s0).toBe(0)
      expect(s1).toBe(1)
      expect(s2).toBe(2)
    })

    it('snapshot preserves original values', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const s0 = arr.snapshot()
      arr.set(0, 99)
      arr.set(1, 88)
      expect(arr.get(0, s0)).toBe(1)
      expect(arr.get(1, s0)).toBe(2)
      expect(arr.get(2, s0)).toBe(3)
    })
  })

  describe('getLatestVersion', () => {
    it('returns 0 initially', () => {
      const arr = new EphemeralArray([1])
      expect(arr.getLatestVersion()).toBe(0)
    })

    it('returns latest after sets', () => {
      const arr = new EphemeralArray([1])
      arr.set(0, 2)
      expect(arr.getLatestVersion()).toBe(1)
      arr.set(0, 3)
      expect(arr.getLatestVersion()).toBe(2)
    })
  })

  describe('getVersion', () => {
    it('returns valid version id', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(arr.getVersion(0)).toBe(0)
    })

    it('throws for non-existent version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(() => arr.getVersion(999)).toThrow(RangeError)
    })

    it('returns newly created versions', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v = arr.set(0, 10)
      expect(arr.getVersion(v)).toBe(v)
    })
  })

  describe('size', () => {
    it('returns correct size', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(arr.size).toBe(3)
    })

    it('returns 0 for empty', () => {
      const arr = new EphemeralArray()
      expect(arr.size).toBe(0)
    })

    it('returns size from constructor', () => {
      const arr = new EphemeralArray<number>(10)
      expect(arr.size).toBe(10)
    })
  })

  describe('toArray', () => {
    it('returns current version as array', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(arr.toArray()).toEqual([1, 2, 3])
    })

    it('returns specific version as array', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v0 = arr.snapshot()
      arr.set(0, 99)
      expect(arr.toArray(v0)).toEqual([1, 2, 3])
      expect(arr.toArray()).toEqual([99, 2, 3])
    })

    it('returns mutable copy', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const copy = arr.toArray()
      copy[0] = 99
      expect(arr.get(0)).toBe(1)
    })

    it('returns empty for empty array', () => {
      const arr = new EphemeralArray<number>()
      expect(arr.toArray()).toEqual([])
    })

    it('throws on invalid version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(() => arr.toArray(999)).toThrow(RangeError)
    })
  })

  describe('checkout', () => {
    it('restores current version to specified version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v0 = arr.snapshot()
      arr.set(0, 99)
      expect(arr.getLatestVersion()).toBe(1)
      arr.checkout(v0)
      expect(arr.getLatestVersion()).toBe(0)
      expect(arr.get(0)).toBe(1)
    })

    it('throws for non-existent version', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.checkout(999)).toThrow(RangeError)
    })

    it('allows setting from checked out version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v0 = arr.snapshot()
      arr.set(0, 99)
      arr.checkout(v0)
      const v2 = arr.set(1, 88)
      expect(arr.get(0, v2)).toBe(1)
      expect(arr.get(1, v2)).toBe(88)
    })
  })

  describe('fork', () => {
    it('creates new version from specified version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 99)
      const forked = arr.fork(0)
      expect(forked).toBe(2)
    })

    it('forked version shares base data', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 99)
      const forked = arr.fork(0)
      expect(arr.get(0, forked)).toBe(1)
      expect(arr.get(1, forked)).toBe(2)
    })

    it('throws for non-existent version', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.fork(999)).toThrow(RangeError)
    })

    it('updates current version to forked version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 99)
      const forked = arr.fork(0)
      expect(arr.getLatestVersion()).toBe(forked)
    })
  })

  describe('forEach', () => {
    it('iterates all elements in order', () => {
      const arr = new EphemeralArray([10, 20, 30])
      const result: number[] = []
      arr.forEach(v => result.push(v))
      expect(result).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const arr = new EphemeralArray(['a', 'b', 'c'])
      const indices: number[] = []
      arr.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates specific version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v0 = arr.snapshot()
      arr.set(0, 99)
      const result: number[] = []
      arr.forEach(v => result.push(v), v0)
      expect(result).toEqual([1, 2, 3])
    })

    it('does nothing on empty array', () => {
      const arr = new EphemeralArray<number>()
      let count = 0
      arr.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('map', () => {
    it('transforms elements', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const mapped = arr.map(x => x * 2)
      expect(mapped).toEqual([2, 4, 6])
    })

    it('provides correct indices', () => {
      const arr = new EphemeralArray(['a', 'b'])
      const mapped = arr.map((_v, i) => i)
      expect(mapped).toEqual([0, 1])
    })

    it('maps specific version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v0 = arr.snapshot()
      arr.set(0, 99)
      const mapped = arr.map(x => x * 2, v0)
      expect(mapped).toEqual([2, 4, 6])
    })

    it('can change type', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const mapped = arr.map(x => String(x))
      expect(mapped).toEqual(['1', '2', '3'])
    })

    it('returns empty for empty array', () => {
      const arr = new EphemeralArray<number>()
      const mapped = arr.map(x => x * 2)
      expect(mapped).toEqual([])
    })
  })

  describe('versions property', () => {
    it('returns 1 initially', () => {
      const arr = new EphemeralArray([1])
      expect(arr.versions).toBe(1)
    })

    it('increments with each set', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 10)
      arr.set(1, 20)
      arr.set(2, 30)
      expect(arr.versions).toBe(4)
    })

    it('increments with fork', () => {
      const arr = new EphemeralArray([1])
      arr.fork(0)
      expect(arr.versions).toBe(2)
    })
  })

  describe('parentOf', () => {
    it('root has null parent', () => {
      const arr = new EphemeralArray([1])
      expect(arr.parentOf(0)).toBeNull()
    })

    it('set creates child of current', () => {
      const arr = new EphemeralArray([1])
      const v = arr.set(0, 2)
      expect(arr.parentOf(v)).toBe(0)
    })

    it('throws for non-existent version', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.parentOf(999)).toThrow(RangeError)
    })

    it('chains correctly', () => {
      const arr = new EphemeralArray([1])
      const v1 = arr.set(0, 2)
      const v2 = arr.set(0, 3)
      expect(arr.parentOf(v2)).toBe(v1)
    })
  })

  describe('hasVersion / versionExists', () => {
    it('returns true for root', () => {
      const arr = new EphemeralArray([1])
      expect(arr.hasVersion(0)).toBe(true)
      expect(arr.versionExists(0)).toBe(true)
    })

    it('returns true for created version', () => {
      const arr = new EphemeralArray([1])
      const v = arr.set(0, 2)
      expect(arr.hasVersion(v)).toBe(true)
      expect(arr.versionExists(v)).toBe(true)
    })

    it('returns false for non-existent', () => {
      const arr = new EphemeralArray([1])
      expect(arr.hasVersion(999)).toBe(false)
      expect(arr.versionExists(999)).toBe(false)
    })
  })

  describe('equals', () => {
    it('same version equals itself', () => {
      const arr = new EphemeralArray([1, 2, 3])
      expect(arr.equals(0, 0)).toBe(true)
    })

    it('different values are not equal', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 99)
      expect(arr.equals(0, v1)).toBe(false)
    })

    it('same values in different versions are equal', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 99)
      arr.set(0, 1)
      expect(arr.equals(0, 2)).toBe(true)
    })

    it('branched versions with same data are equal', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 10)
      const v2 = arr.fork(v1)
      expect(arr.equals(v1, v2)).toBe(true)
    })
  })

  describe('diff', () => {
    it('returns empty diff for identical versions', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const diff = arr.diff(0, 0)
      expect(diff.size).toBe(0)
    })

    it('returns changed indices', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(1, 99)
      const diff = arr.diff(0, v1)
      expect(diff.size).toBe(1)
      expect(diff.get(1)).toEqual({ a: 2, b: 99 })
    })

    it('returns multiple changes', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 10)
      const v2 = arr.set(2, 30)
      const diff = arr.diff(0, v2)
      expect(diff.size).toBe(2)
      expect(diff.get(0)).toEqual({ a: 1, b: 10 })
      expect(diff.get(2)).toEqual({ a: 3, b: 30 })
    })

    it('returns diff between arbitrary versions', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 10)
      const v2 = arr.set(1, 20)
      const diff = arr.diff(v1, v2)
      expect(diff.size).toBe(1)
      expect(diff.get(1)).toEqual({ a: 2, b: 20 })
    })
  })

  describe('reset', () => {
    it('resets to root version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 99)
      arr.set(1, 88)
      arr.reset()
      expect(arr.getLatestVersion()).toBe(0)
      expect(arr.get(0)).toBe(1)
      expect(arr.get(1)).toBe(2)
    })

    it('does not remove versions', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 99)
      arr.reset()
      expect(arr.versions).toBe(2)
      expect(arr.hasVersion(v1)).toBe(true)
    })
  })

  describe('branch', () => {
    it('creates branch from specific version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 10)
      arr.set(0, 20)
      const v3 = arr.branch(v1, 1, 99)
      expect(arr.get(0, v3)).toBe(10)
      expect(arr.get(1, v3)).toBe(99)
      expect(arr.get(2, v3)).toBe(3)
    })

    it('does not change current version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 10)
      arr.set(0, 20)
      const latestBefore = arr.getLatestVersion()
      arr.branch(v1, 1, 99)
      expect(arr.getLatestVersion()).toBe(latestBefore)
    })

    it('throws for non-existent version', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.branch(999, 0, 1)).toThrow(RangeError)
    })

    it('throws for out of bounds index', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.branch(0, 5, 1)).toThrow(RangeError)
    })
  })

  describe('lineage', () => {
    it('returns lineage from version to root', () => {
      const arr = new EphemeralArray([1])
      const v1 = arr.set(0, 2)
      const v2 = arr.set(0, 3)
      const lineage = arr.lineage(v2)
      expect(lineage).toEqual([v2, v1, 0])
    })

    it('root lineage is just root', () => {
      const arr = new EphemeralArray([1])
      expect(arr.lineage(0)).toEqual([0])
    })

    it('throws for non-existent version', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.lineage(999)).toThrow(RangeError)
    })
  })

  describe('childrenOf', () => {
    it('returns children of root', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 10)
      expect(arr.childrenOf(0)).toEqual([v1])
    })

    it('returns empty for leaf', () => {
      const arr = new EphemeralArray([1])
      const v1 = arr.set(0, 2)
      expect(arr.childrenOf(v1)).toEqual([])
    })

    it('returns multiple children', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v0 = arr.snapshot()
      arr.set(0, 10)
      arr.checkout(v0)
      arr.set(1, 20)
      const children = arr.childrenOf(0)
      expect(children.length).toBe(2)
    })

    it('throws for non-existent version', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.childrenOf(999)).toThrow(RangeError)
    })
  })

  describe('rootVersion / isRoot', () => {
    it('rootVersion returns 0', () => {
      const arr = new EphemeralArray([1])
      expect(arr.rootVersion()).toBe(0)
    })

    it('isRoot returns true for root', () => {
      const arr = new EphemeralArray([1])
      expect(arr.isRoot(0)).toBe(true)
    })

    it('isRoot returns false for non-root', () => {
      const arr = new EphemeralArray([1])
      const v1 = arr.set(0, 2)
      expect(arr.isRoot(v1)).toBe(false)
    })

    it('isRoot throws for non-existent', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.isRoot(999)).toThrow(RangeError)
    })
  })

  describe('depthOf', () => {
    it('root has depth 0', () => {
      const arr = new EphemeralArray([1])
      expect(arr.depthOf(0)).toBe(0)
    })

    it('child of root has depth 1', () => {
      const arr = new EphemeralArray([1])
      const v1 = arr.set(0, 2)
      expect(arr.depthOf(v1)).toBe(1)
    })

    it('grandchild has depth 2', () => {
      const arr = new EphemeralArray([1])
      const v1 = arr.set(0, 2)
      const v2 = arr.set(0, 3)
      expect(arr.depthOf(v2)).toBe(2)
    })

    it('throws for non-existent', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.depthOf(999)).toThrow(RangeError)
    })
  })

  describe('setMany', () => {
    it('sets multiple values in one version', () => {
      const arr = new EphemeralArray([1, 2, 3, 4])
      const v = arr.setMany([[0, 10], [2, 30]])
      expect(arr.get(0)).toBe(10)
      expect(arr.get(1)).toBe(2)
      expect(arr.get(2)).toBe(30)
      expect(arr.get(3)).toBe(4)
      expect(arr.versions).toBe(2)
    })

    it('throws on out of bounds index', () => {
      const arr = new EphemeralArray([1, 2])
      expect(() => arr.setMany([[0, 10], [5, 50]])).toThrow(RangeError)
    })

    it('returns new version id', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v = arr.setMany([[0, 10]])
      expect(v).toBe(1)
    })

    it('empty updates still creates version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v = arr.setMany([])
      expect(v).toBe(1)
      expect(arr.versions).toBe(2)
    })
  })

  describe('setAt', () => {
    it('creates version from specific parent', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 10)
      arr.set(0, 20)
      const v3 = arr.setAt(v1, 1, 99)
      expect(arr.get(0, v3)).toBe(10)
      expect(arr.get(1, v3)).toBe(99)
    })

    it('throws for non-existent version', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.setAt(999, 0, 1)).toThrow(RangeError)
    })

    it('throws for out of bounds', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.setAt(0, 5, 1)).toThrow(RangeError)
    })
  })

  describe('toArrayAt', () => {
    it('returns array at specific version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 99)
      expect(arr.toArrayAt(0)).toEqual([1, 2, 3])
      expect(arr.toArrayAt(v1)).toEqual([99, 2, 3])
    })

    it('throws for non-existent version', () => {
      const arr = new EphemeralArray([1])
      expect(() => arr.toArrayAt(999)).toThrow(RangeError)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty', () => {
      const arr = new EphemeralArray<number>()
      expect(arr.isEmpty).toBe(true)
    })

    it('returns false for non-empty', () => {
      const arr = new EphemeralArray([1])
      expect(arr.isEmpty).toBe(false)
    })

    it('returns true for size 0', () => {
      const arr = new EphemeralArray<number>(0)
      expect(arr.isEmpty).toBe(true)
    })
  })

  describe('version history and branching', () => {
    it('maintains linear version chain', () => {
      const arr = new EphemeralArray([0, 0, 0])
      const v0 = arr.snapshot()
      const v1 = arr.set(0, 1)
      const v2 = arr.set(1, 2)
      const v3 = arr.set(2, 3)
      expect(arr.parentOf(v1)).toBe(v0)
      expect(arr.parentOf(v2)).toBe(v1)
      expect(arr.parentOf(v3)).toBe(v2)
      expect(arr.toArray(v0)).toEqual([0, 0, 0])
      expect(arr.toArray(v1)).toEqual([1, 0, 0])
      expect(arr.toArray(v2)).toEqual([1, 2, 0])
      expect(arr.toArray(v3)).toEqual([1, 2, 3])
    })

    it('supports branching from any version', () => {
      const arr = new EphemeralArray([0, 0, 0])
      const v1 = arr.set(0, 1)
      arr.set(1, 2)
      const branchV = arr.branch(v1, 2, 99)
      expect(arr.toArray(branchV)).toEqual([1, 0, 99])
    })

    it('supports multiple branches from same parent', () => {
      const arr = new EphemeralArray([0, 0, 0])
      const v1 = arr.set(0, 1)
      const b1 = arr.branch(v1, 1, 10)
      const b2 = arr.branch(v1, 2, 20)
      const b3 = arr.branch(v1, 0, 30)
      expect(arr.toArray(b1)).toEqual([1, 10, 0])
      expect(arr.toArray(b2)).toEqual([1, 0, 20])
      expect(arr.toArray(b3)).toEqual([30, 0, 0])
    })

    it('all branches share base data', () => {
      const arr = new EphemeralArray([10, 20, 30])
      arr.set(0, 99)
      const branchV = arr.branch(0, 1, 88)
      expect(arr.get(2, branchV)).toBe(30)
    })
  })

  describe('edge cases', () => {
    it('handles single element array', () => {
      const arr = new EphemeralArray([42])
      expect(arr.size).toBe(1)
      expect(arr.get(0)).toBe(42)
      const v = arr.set(0, 99)
      expect(arr.get(0)).toBe(99)
      expect(arr.get(0, v)).toBe(99)
      expect(arr.get(0, 0)).toBe(42)
    })

    it('handles large arrays', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i)
      const arr = new EphemeralArray(data)
      expect(arr.size).toBe(1000)
      expect(arr.get(0)).toBe(0)
      expect(arr.get(999)).toBe(999)
      const v = arr.set(500, 9999)
      expect(arr.get(500)).toBe(9999)
      expect(arr.get(500, 0)).toBe(500)
    })

    it('handles many versions', () => {
      const arr = new EphemeralArray([0])
      const snapshots: number[] = [0]
      for (let i = 1; i <= 100; i++) {
        snapshots.push(arr.set(0, i))
      }
      expect(arr.versions).toBe(101)
      for (let i = 0; i <= 100; i++) {
        expect(arr.get(0, snapshots[i])).toBe(i)
      }
    })

    it('handles setting same value multiple times', () => {
      const arr = new EphemeralArray([1])
      arr.set(0, 1)
      arr.set(0, 1)
      arr.set(0, 1)
      expect(arr.versions).toBe(4)
      expect(arr.get(0)).toBe(1)
    })

    it('handles alternating sets', () => {
      const arr = new EphemeralArray([0])
      arr.set(0, 1)
      arr.set(0, 0)
      expect(arr.get(0)).toBe(0)
      expect(arr.equals(0, 2)).toBe(true)
    })

    it('handles objects as values', () => {
      const arr = new EphemeralArray<{ x: number }>([{ x: 1 }, { x: 2 }])
      const v = arr.set(0, { x: 99 })
      expect(arr.get(0).x).toBe(99)
      expect(arr.get(0, 0).x).toBe(1)
    })

    it('handles undefined values in array', () => {
      const arr = new EphemeralArray<number>(3)
      arr.set(1, 42)
      expect(arr.get(0)).toBeUndefined()
      expect(arr.get(1)).toBe(42)
      expect(arr.get(2)).toBeUndefined()
    })

    it('empty array with no operations', () => {
      const arr = new EphemeralArray<number>()
      expect(arr.size).toBe(0)
      expect(arr.versions).toBe(1)
      expect(arr.isEmpty).toBe(true)
      expect(arr.toArray()).toEqual([])
      expect(arr.getLatestVersion()).toBe(0)
      expect(arr.snapshot()).toBe(0)
    })

    it('structural sharing: set does not copy all data', () => {
      const arr = new EphemeralArray([1, 2, 3, 4, 5])
      const v0 = arr.snapshot()
      arr.set(2, 99)
      expect(arr.get(0)).toBe(1)
      expect(arr.get(1)).toBe(2)
      expect(arr.get(2)).toBe(99)
      expect(arr.get(3)).toBe(4)
      expect(arr.get(4)).toBe(5)
      expect(arr.get(2, v0)).toBe(3)
    })

    it('checkout and continue modifying', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v0 = arr.snapshot()
      arr.set(0, 10)
      arr.set(1, 20)
      arr.checkout(v0)
      const v3 = arr.set(2, 30)
      expect(arr.get(0, v3)).toBe(1)
      expect(arr.get(1, v3)).toBe(2)
      expect(arr.get(2, v3)).toBe(30)
    })

    it('fork and modify independently', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 10)
      const forked = arr.fork(0)
      arr.checkout(forked)
      arr.set(1, 20)
      expect(arr.toArray()).toEqual([1, 20, 3])
    })

    it('large number of branches from root', () => {
      const arr = new EphemeralArray([0, 0, 0])
      const branchIds: number[] = []
      for (let i = 0; i < 50; i++) {
        branchIds.push(arr.branch(0, i % 3, i))
      }
      expect(arr.versions).toBe(51)
      expect(arr.childrenOf(0).length).toBe(50)
    })

    it('deep version chain', () => {
      const arr = new EphemeralArray([0])
      for (let i = 1; i <= 50; i++) {
        arr.set(0, i)
      }
      expect(arr.depthOf(50)).toBe(50)
      expect(arr.get(0)).toBe(50)
      expect(arr.get(0, 0)).toBe(0)
      expect(arr.get(0, 25)).toBe(25)
    })

    it('overwrites within a chain', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 10)
      arr.set(0, 20)
      arr.set(0, 30)
      expect(arr.get(0)).toBe(30)
      expect(arr.toArray()).toEqual([30, 2, 3])
    })
  })

  describe('structural sharing verification', () => {
    it('multiple branches share base data', () => {
      const arr = new EphemeralArray([10, 20, 30, 40, 50])
      const v1 = arr.set(0, 100)
      const v2 = arr.set(2, 300)
      expect(arr.get(1, v1)).toBe(20)
      expect(arr.get(1, v2)).toBe(20)
      expect(arr.get(3, v1)).toBe(40)
      expect(arr.get(3, v2)).toBe(40)
      expect(arr.get(4, v1)).toBe(50)
      expect(arr.get(4, v2)).toBe(50)
    })

    it('branch preserves original values at unchanged indices', () => {
      const arr = new EphemeralArray([1, 2, 3, 4, 5])
      const v1 = arr.set(1, 99)
      const branchV = arr.branch(v1, 3, 88)
      expect(arr.get(0, branchV)).toBe(1)
      expect(arr.get(1, branchV)).toBe(99)
      expect(arr.get(2, branchV)).toBe(3)
      expect(arr.get(3, branchV)).toBe(88)
      expect(arr.get(4, branchV)).toBe(5)
    })
  })

  describe('complex version trees', () => {
    it('diamond pattern: merge via checkout', () => {
      const arr = new EphemeralArray([0, 0, 0])
      const v1 = arr.set(0, 1)
      const b1 = arr.branch(0, 1, 2)
      arr.checkout(b1)
      const v3 = arr.set(2, 3)
      expect(arr.toArray(v3)).toEqual([0, 2, 3])
      expect(arr.toArray(v1)).toEqual([1, 0, 0])
    })

    it('three-way branch', () => {
      const arr = new EphemeralArray([0, 0, 0])
      const v1 = arr.set(0, 1)
      const b1 = arr.branch(v1, 1, 10)
      const b2 = arr.branch(v1, 1, 20)
      const b3 = arr.branch(v1, 1, 30)
      expect(arr.toArray(b1)).toEqual([1, 10, 0])
      expect(arr.toArray(b2)).toEqual([1, 20, 0])
      expect(arr.toArray(b3)).toEqual([1, 30, 0])
    })

    it('branch then branch of branch', () => {
      const arr = new EphemeralArray([0, 0, 0])
      const v1 = arr.set(0, 1)
      const b1 = arr.branch(v1, 1, 10)
      const bb1 = arr.branch(b1, 2, 100)
      expect(arr.toArray(bb1)).toEqual([1, 10, 100])
      expect(arr.depthOf(bb1)).toBe(3)
    })

    it('checkout to different versions and verify data', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 10)
      arr.set(1, 20)
      arr.set(2, 30)
      arr.checkout(1)
      expect(arr.toArray()).toEqual([10, 2, 3])
      arr.checkout(0)
      expect(arr.toArray()).toEqual([1, 2, 3])
      arr.checkout(3)
      expect(arr.toArray()).toEqual([10, 20, 30])
    })
  })

  describe('diff between versions', () => {
    it('diff between root and modified', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(1, 99)
      const diff = arr.diff(0, v1)
      expect(diff.size).toBe(1)
      expect(diff.get(1)).toEqual({ a: 2, b: 99 })
    })

    it('diff between non-consecutive versions', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 10)
      arr.set(1, 20)
      const diff = arr.diff(0, 2)
      expect(diff.size).toBe(2)
    })

    it('diff between branches', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(0, 10)
      const b1 = arr.branch(0, 1, 20)
      const diff = arr.diff(v1, b1)
      expect(diff.size).toBe(2)
      expect(diff.get(0)).toEqual({ a: 10, b: 1 })
      expect(diff.get(1)).toEqual({ a: 2, b: 20 })
    })
  })

  describe('iteration across versions', () => {
    it('forEach at root version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const result: number[] = []
      arr.forEach(v => result.push(v), 0)
      expect(result).toEqual([1, 2, 3])
    })

    it('map at modified version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const v1 = arr.set(1, 99)
      const mapped = arr.map(x => x * 2, v1)
      expect(mapped).toEqual([2, 198, 6])
    })

    it('forEach on branched version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 10)
      const b1 = arr.branch(0, 2, 30)
      const result: number[] = []
      arr.forEach(v => result.push(v), b1)
      expect(result).toEqual([1, 2, 30])
    })
  })

  describe('type safety', () => {
    it('works with string arrays', () => {
      const arr = new EphemeralArray(['a', 'b', 'c'])
      arr.set(1, 'x')
      expect(arr.get(1)).toBe('x')
      expect(arr.get(1, 0)).toBe('b')
    })

    it('works with object arrays', () => {
      const arr = new EphemeralArray([{ val: 1 }, { val: 2 }])
      arr.set(0, { val: 99 })
      expect(arr.get(0).val).toBe(99)
      expect(arr.get(0, 0).val).toBe(1)
    })

    it('works with nullable types', () => {
      const arr = new EphemeralArray<number | null>([1, null, 3])
      arr.set(1, 2)
      expect(arr.get(1)).toBe(2)
      expect(arr.get(1, 0)).toBeNull()
    })
  })

  describe('additional coverage', () => {
    it('setMany with single update', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.setMany([[1, 99]])
      expect(arr.get(1)).toBe(99)
      expect(arr.get(0)).toBe(1)
    })

    it('setAt does not change current version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 10)
      const before = arr.getLatestVersion()
      arr.setAt(0, 1, 77)
      expect(arr.getLatestVersion()).toBe(before)
    })

    it('map with object transformation', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const mapped = arr.map(x => ({ val: x * 10 }))
      expect(mapped).toEqual([{ val: 10 }, { val: 20 }, { val: 30 }])
    })

    it('reset after multiple operations', () => {
      const arr = new EphemeralArray([1, 2, 3])
      arr.set(0, 10)
      arr.set(1, 20)
      arr.set(2, 30)
      arr.reset()
      expect(arr.toArray()).toEqual([1, 2, 3])
      expect(arr.getLatestVersion()).toBe(0)
      expect(arr.versions).toBe(4)
    })

    it('fork from root version', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const f = arr.fork(0)
      expect(arr.parentOf(f)).toBe(0)
      expect(arr.toArray(f)).toEqual([1, 2, 3])
    })

    it('equals with identical objects at same reference', () => {
      const obj = { x: 1 }
      const arr = new EphemeralArray([obj])
      const v = arr.set(0, obj)
      expect(arr.equals(0, v)).toBe(true)
    })

    it('diff with no differences', () => {
      const arr = new EphemeralArray([1, 2, 3])
      const f = arr.fork(0)
      const diff = arr.diff(0, f)
      expect(diff.size).toBe(0)
    })

    it('lineage for branched version', () => {
      const arr = new EphemeralArray([1])
      const v1 = arr.set(0, 2)
      const b = arr.branch(v1, 0, 3)
      const lin = arr.lineage(b)
      expect(lin).toEqual([b, v1, 0])
    })
  })
})
