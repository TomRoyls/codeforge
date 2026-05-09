import { describe, it, expect } from 'vitest'
import { PersistentSegmentTree } from '../../src/core/persistent-segment-tree/persistent-segment-tree.js'
import type { PSTNode, PersistentSegmentTreeOptions } from '../../src/core/persistent-segment-tree/types.js'

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

describe('PersistentSegmentTree', () => {
  describe('constructor with sum operation', () => {
    it('should create tree with initial values', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      expect(pst.size()).toBe(5)
      expect(pst.versionCount()).toBe(1)
      expect(pst.query(0, 0, 4)).toBe(15)
    })

    it('should create tree without initial values', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
      })
      expect(pst.size()).toBe(5)
      expect(pst.versionCount()).toBe(1)
      expect(pst.query(0, 0, 4)).toBe(0)
    })

    it('should create tree with single element', () => {
      const pst = new PersistentSegmentTree({
        size: 1,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [42],
      })
      expect(pst.size()).toBe(1)
      expect(pst.query(0, 0, 0)).toBe(42)
    })

    it('should handle size 0', () => {
      const pst = new PersistentSegmentTree({
        size: 0,
        operation: (a, b) => a + b,
        identity: 0,
      })
      expect(pst.size()).toBe(0)
      expect(pst.versionCount()).toBe(1)
    })

    it('should handle large initial values', () => {
      const vals = Array.from({ length: 100 }, (_, i) => i + 1)
      const pst = new PersistentSegmentTree({
        size: 100,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: vals,
      })
      expect(pst.query(0, 0, 99)).toBe(5050)
    })
  })

  describe('update', () => {
    it('should create new version on update', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      const v1 = pst.update(0, 2, 10)
      expect(v1).toBe(1)
      expect(pst.versionCount()).toBe(2)
    })

    it('should preserve old version after update', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      pst.update(0, 2, 10)
      expect(pst.query(0, 0, 4)).toBe(15)
      expect(pst.query(1, 0, 4)).toBe(22)
    })

    it('should update first element', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v = pst.update(0, 0, 100)
      expect(pst.query(v, 0, 0)).toBe(100)
      expect(pst.query(v, 0, 2)).toBe(105)
    })

    it('should update last element', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v = pst.update(0, 2, 100)
      expect(pst.query(v, 2, 2)).toBe(100)
      expect(pst.query(v, 0, 2)).toBe(103)
    })

    it('should chain updates creating multiple versions', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 0, 10)
      const v2 = pst.update(v1, 1, 20)
      const v3 = pst.update(v2, 2, 30)
      expect(pst.versionCount()).toBe(4)
      expect(pst.query(0, 0, 2)).toBe(6)
      expect(pst.query(v1, 0, 2)).toBe(15)
      expect(pst.query(v2, 0, 2)).toBe(33)
      expect(pst.query(v3, 0, 2)).toBe(60)
    })

    it('should throw for invalid version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(() => pst.update(5, 0, 10)).toThrow(RangeError)
      expect(() => pst.update(-1, 0, 10)).toThrow(RangeError)
    })

    it('should throw for invalid index', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(() => pst.update(0, -1, 10)).toThrow(RangeError)
      expect(() => pst.update(0, 3, 10)).toThrow(RangeError)
    })

    it('should update based on a non-latest version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 0, 10)
      const v2 = pst.update(v1, 1, 20)
      const v3 = pst.update(0, 2, 30)
      expect(pst.query(v3, 0, 2)).toBe(33)
      expect(pst.query(v2, 0, 2)).toBe(33)
    })
  })

  describe('query', () => {
    it('should query full range', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      expect(pst.query(0, 0, 4)).toBe(15)
    })

    it('should query partial range', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      expect(pst.query(0, 1, 3)).toBe(9)
    })

    it('should query single element', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      expect(pst.query(0, 2, 2)).toBe(3)
    })

    it('should query on different versions', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 1, 10)
      expect(pst.query(0, 1, 1)).toBe(2)
      expect(pst.query(v1, 1, 1)).toBe(10)
    })

    it('should throw for invalid version in query', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(() => pst.query(5, 0, 2)).toThrow(RangeError)
    })

    it('should throw for invalid range in query', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      expect(() => pst.query(0, -1, 3)).toThrow(RangeError)
      expect(() => pst.query(0, 0, 5)).toThrow(RangeError)
      expect(() => pst.query(0, 3, 1)).toThrow(RangeError)
    })

    it('should return identity for empty tree query', () => {
      const pst = new PersistentSegmentTree({
        size: 0,
        operation: (a, b) => a + b,
        identity: 0,
      })
      expect(pst.query(0, 0, 0)).toBe(0)
    })

    it('should query range from start', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      expect(pst.query(0, 0, 2)).toBe(6)
    })

    it('should query range to end', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      expect(pst.query(0, 3, 4)).toBe(9)
    })
  })

  describe('pointQuery', () => {
    it('should query single point', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [10, 20, 30, 40, 50],
      })
      expect(pst.pointQuery(0, 0)).toBe(10)
      expect(pst.pointQuery(0, 2)).toBe(30)
      expect(pst.pointQuery(0, 4)).toBe(50)
    })

    it('should query point on updated version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 1, 99)
      expect(pst.pointQuery(0, 1)).toBe(2)
      expect(pst.pointQuery(v1, 1)).toBe(99)
    })

    it('should throw for invalid version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(() => pst.pointQuery(5, 0)).toThrow(RangeError)
    })

    it('should throw for invalid index', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(() => pst.pointQuery(0, -1)).toThrow(RangeError)
      expect(() => pst.pointQuery(0, 3)).toThrow(RangeError)
    })

    it('should match query with single-element range', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [10, 20, 30, 40, 50],
      })
      for (let i = 0; i < 5; i++) {
        expect(pst.pointQuery(0, i)).toBe(pst.query(0, i, i))
      }
    })
  })

  describe('min operation', () => {
    it('should find minimum in range', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => Math.min(a, b),
        identity: Infinity,
        initialValues: [5, 3, 8, 1, 9],
      })
      expect(pst.query(0, 0, 4)).toBe(1)
      expect(pst.query(0, 0, 2)).toBe(3)
      expect(pst.query(0, 3, 4)).toBe(1)
    })

    it('should find min after updates', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => Math.min(a, b),
        identity: Infinity,
        initialValues: [5, 3, 8, 1, 9],
      })
      const v1 = pst.update(0, 3, 10)
      expect(pst.query(v1, 0, 4)).toBe(3)
      expect(pst.query(0, 0, 4)).toBe(1)
    })

    it('should find min on single element', () => {
      const pst = new PersistentSegmentTree({
        size: 1,
        operation: (a, b) => Math.min(a, b),
        identity: Infinity,
        initialValues: [42],
      })
      expect(pst.query(0, 0, 0)).toBe(42)
    })

    it('should handle negative values for min', () => {
      const pst = new PersistentSegmentTree({
        size: 4,
        operation: (a, b) => Math.min(a, b),
        identity: Infinity,
        initialValues: [-5, 10, -3, 8],
      })
      expect(pst.query(0, 0, 3)).toBe(-5)
      expect(pst.query(0, 1, 3)).toBe(-3)
    })
  })

  describe('max operation', () => {
    it('should find maximum in range', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => Math.max(a, b),
        identity: -Infinity,
        initialValues: [5, 3, 8, 1, 9],
      })
      expect(pst.query(0, 0, 4)).toBe(9)
      expect(pst.query(0, 0, 2)).toBe(8)
      expect(pst.query(0, 3, 4)).toBe(9)
    })

    it('should find max after updates', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => Math.max(a, b),
        identity: -Infinity,
        initialValues: [5, 3, 8, 1, 9],
      })
      const v1 = pst.update(0, 0, 100)
      expect(pst.query(v1, 0, 4)).toBe(100)
      expect(pst.query(0, 0, 4)).toBe(9)
    })

    it('should handle negative values for max', () => {
      const pst = new PersistentSegmentTree({
        size: 4,
        operation: (a, b) => Math.max(a, b),
        identity: -Infinity,
        initialValues: [-5, -10, -3, -8],
      })
      expect(pst.query(0, 0, 3)).toBe(-3)
    })
  })

  describe('gcd operation', () => {
    it('should compute gcd of range', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => gcd(a, b),
        identity: 0,
        initialValues: [12, 18, 24, 9, 15],
      })
      expect(pst.query(0, 0, 4)).toBe(3)
      expect(pst.query(0, 0, 1)).toBe(6)
      expect(pst.query(0, 2, 3)).toBe(3)
    })

    it('should compute gcd after update', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => gcd(a, b),
        identity: 0,
        initialValues: [6, 10, 15],
      })
      const v1 = pst.update(0, 1, 12)
      expect(pst.query(v1, 0, 2)).toBe(3)
      expect(pst.query(0, 0, 2)).toBe(1)
    })

    it('should compute gcd of two elements', () => {
      const pst = new PersistentSegmentTree({
        size: 2,
        operation: (a, b) => gcd(a, b),
        identity: 0,
        initialValues: [8, 12],
      })
      expect(pst.query(0, 0, 1)).toBe(4)
    })
  })

  describe('product operation', () => {
    it('should compute product of range', () => {
      const pst = new PersistentSegmentTree({
        size: 4,
        operation: (a, b) => a * b,
        identity: 1,
        initialValues: [2, 3, 4, 5],
      })
      expect(pst.query(0, 0, 3)).toBe(120)
      expect(pst.query(0, 0, 1)).toBe(6)
      expect(pst.query(0, 2, 3)).toBe(20)
    })

    it('should compute product after update', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a * b,
        identity: 1,
        initialValues: [2, 3, 4],
      })
      const v1 = pst.update(0, 1, 5)
      expect(pst.query(v1, 0, 2)).toBe(40)
      expect(pst.query(0, 0, 2)).toBe(24)
    })
  })

  describe('versionCount', () => {
    it('should start with 1 version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(pst.versionCount()).toBe(1)
    })

    it('should increment on each update', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      pst.update(0, 0, 10)
      expect(pst.versionCount()).toBe(2)
      pst.update(1, 1, 20)
      expect(pst.versionCount()).toBe(3)
    })

    it('should increment on cloneVersion', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      pst.cloneVersion(0)
      expect(pst.versionCount()).toBe(2)
    })
  })

  describe('getVersion', () => {
    it('should return root node for valid version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const root = pst.getVersion(0)
      expect(root).not.toBeNull()
      expect((root as PSTNode<number>).value).toBe(6)
    })

    it('should return null for empty tree', () => {
      const pst = new PersistentSegmentTree({
        size: 0,
        operation: (a, b) => a + b,
        identity: 0,
      })
      expect(pst.getVersion(0)).toBeNull()
    })

    it('should throw for invalid version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(() => pst.getVersion(5)).toThrow(RangeError)
      expect(() => pst.getVersion(-1)).toThrow(RangeError)
    })

    it('should return different nodes for different versions', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 0, 10)
      const root0 = pst.getVersion(0)
      const root1 = pst.getVersion(v1)
      expect(root0).not.toBe(root1)
    })
  })

  describe('cloneVersion', () => {
    it('should create identical version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const cloned = pst.cloneVersion(0)
      expect(pst.query(cloned, 0, 2)).toBe(pst.query(0, 0, 2))
    })

    it('should return new version number', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v = pst.cloneVersion(0)
      expect(v).toBe(1)
    })

    it('should share the same root node', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v = pst.cloneVersion(0)
      expect(pst.getVersion(v)).toBe(pst.getVersion(0))
    })

    it('should throw for invalid version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(() => pst.cloneVersion(5)).toThrow(RangeError)
    })

    it('should allow update from cloned version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const cloned = pst.cloneVersion(0)
      const v2 = pst.update(cloned, 0, 10)
      expect(pst.query(v2, 0, 2)).toBe(15)
      expect(pst.query(cloned, 0, 2)).toBe(6)
    })
  })

  describe('toArray', () => {
    it('should return initial values', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      expect(pst.toArray(0)).toEqual([1, 2, 3, 4, 5])
    })

    it('should return updated values', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 1, 10)
      expect(pst.toArray(v1)).toEqual([1, 10, 3])
    })

    it('should preserve old version array', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      pst.update(0, 1, 10)
      expect(pst.toArray(0)).toEqual([1, 2, 3])
    })

    it('should return empty array for size 0', () => {
      const pst = new PersistentSegmentTree({
        size: 0,
        operation: (a, b) => a + b,
        identity: 0,
      })
      expect(pst.toArray(0)).toEqual([])
    })

    it('should throw for invalid version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(() => pst.toArray(5)).toThrow(RangeError)
    })

    it('should return identity-filled array for tree without initial values', () => {
      const pst = new PersistentSegmentTree({
        size: 4,
        operation: (a, b) => a + b,
        identity: 0,
      })
      expect(pst.toArray(0)).toEqual([0, 0, 0, 0])
    })
  })

  describe('rollback', () => {
    it('should discard versions after given version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 0, 10)
      pst.update(v1, 1, 20)
      expect(pst.versionCount()).toBe(3)
      pst.rollback(v1)
      expect(pst.versionCount()).toBe(2)
    })

    it('should preserve target version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 0, 10)
      pst.rollback(v1)
      expect(pst.query(v1, 0, 2)).toBe(15)
    })

    it('should allow new updates after rollback', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 0, 10)
      pst.update(v1, 1, 20)
      pst.rollback(v1)
      const v2 = pst.update(v1, 2, 30)
      expect(pst.query(v2, 0, 2)).toBe(42)
      expect(pst.versionCount()).toBe(3)
    })

    it('should handle rollback to version 0', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      pst.update(0, 0, 10)
      pst.update(1, 1, 20)
      pst.rollback(0)
      expect(pst.versionCount()).toBe(1)
    })

    it('should handle rollback to current version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 0, 10)
      pst.rollback(v1)
      expect(pst.versionCount()).toBe(2)
    })

    it('should throw for invalid version', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      expect(() => pst.rollback(5)).toThrow(RangeError)
      expect(() => pst.rollback(-1)).toThrow(RangeError)
    })
  })

  describe('size', () => {
    it('should return configured size', () => {
      const pst = new PersistentSegmentTree({
        size: 10,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: Array.from({ length: 10 }, (_, i) => i),
      })
      expect(pst.size()).toBe(10)
    })

    it('should return 0 for empty tree', () => {
      const pst = new PersistentSegmentTree({
        size: 0,
        operation: (a, b) => a + b,
        identity: 0,
      })
      expect(pst.size()).toBe(0)
    })

    it('should return 1 for single element', () => {
      const pst = new PersistentSegmentTree({
        size: 1,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [42],
      })
      expect(pst.size()).toBe(1)
    })
  })

  describe('path sharing', () => {
    it('should share unchanged subtrees between versions', () => {
      const pst = new PersistentSegmentTree({
        size: 8,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5, 6, 7, 8],
      })
      const root0 = pst.getVersion(0) as PSTNode<number>
      const v1 = pst.update(0, 0, 100)
      const root1 = pst.getVersion(v1) as PSTNode<number>
      expect(root1.right).toBe(root0.right)
    })

    it('should share left subtree when updating right', () => {
      const pst = new PersistentSegmentTree({
        size: 8,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5, 6, 7, 8],
      })
      const root0 = pst.getVersion(0) as PSTNode<number>
      const v1 = pst.update(0, 7, 100)
      const root1 = pst.getVersion(v1) as PSTNode<number>
      expect(root1.left).toBe(root0.left)
    })
  })

  describe('edge cases', () => {
    it('should handle single element tree', () => {
      const pst = new PersistentSegmentTree({
        size: 1,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [42],
      })
      expect(pst.query(0, 0, 0)).toBe(42)
      const v1 = pst.update(0, 0, 99)
      expect(pst.query(v1, 0, 0)).toBe(99)
      expect(pst.query(0, 0, 0)).toBe(42)
    })

    it('should handle two element tree', () => {
      const pst = new PersistentSegmentTree({
        size: 2,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [3, 7],
      })
      expect(pst.query(0, 0, 1)).toBe(10)
      const v1 = pst.update(0, 0, 10)
      expect(pst.query(v1, 0, 1)).toBe(17)
    })

    it('should handle update to zero', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 1, 0)
      expect(pst.query(v1, 0, 2)).toBe(4)
    })

    it('should handle update to negative value', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 1, -5)
      expect(pst.query(v1, 0, 2)).toBe(-1)
    })

    it('should handle identical values', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [7, 7, 7, 7, 7],
      })
      expect(pst.query(0, 0, 4)).toBe(35)
    })

    it('should handle non-power-of-two sizes', () => {
      const pst = new PersistentSegmentTree({
        size: 7,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5, 6, 7],
      })
      expect(pst.query(0, 0, 6)).toBe(28)
    })

    it('should handle power-of-two sizes', () => {
      const pst = new PersistentSegmentTree({
        size: 8,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5, 6, 7, 8],
      })
      expect(pst.query(0, 0, 7)).toBe(36)
    })
  })

  describe('type exports', () => {
    it('should support PSTNode type', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const root = pst.getVersion(0) as PSTNode<number>
      expect(typeof root.value).toBe('number')
      expect(root.left).not.toBeNull()
      expect(root.right).not.toBeNull()
    })

    it('should support PersistentSegmentTreeOptions type', () => {
      const opts: PersistentSegmentTreeOptions<number> = {
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      }
      const pst = new PersistentSegmentTree(opts)
      expect(pst.size()).toBe(3)
    })
  })

  describe('string operation', () => {
    it('should concatenate strings', () => {
      const pst = new PersistentSegmentTree({
        size: 4,
        operation: (a, b) => a + b,
        identity: '',
        initialValues: ['a', 'b', 'c', 'd'],
      })
      expect(pst.query(0, 0, 3)).toBe('abcd')
      expect(pst.query(0, 1, 2)).toBe('bc')
    })

    it('should handle string update', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: '',
        initialValues: ['x', 'y', 'z'],
      })
      const v1 = pst.update(0, 1, 'Y')
      expect(pst.query(v1, 0, 2)).toBe('xYz')
      expect(pst.query(0, 0, 2)).toBe('xyz')
    })
  })

  describe('stress test', () => {
    it('should handle 100+ updates and verify all versions', () => {
      const size = 50
      const initialValues = Array.from({ length: size }, (_, i) => i + 1)
      const pst = new PersistentSegmentTree({
        size,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues,
      })
      const versions: number[] = [0]
      let currentVersion = 0
      for (let i = 0; i < 100; i++) {
        currentVersion = pst.update(currentVersion, i % size, (i + 1) * 10)
        versions.push(currentVersion)
      }
      expect(pst.versionCount()).toBe(101)
      for (const v of versions) {
        const result = pst.query(v, 0, size - 1)
        expect(typeof result).toBe('number')
        expect(result).toBeGreaterThanOrEqual(0)
      }
    })

    it('should handle branching version history', () => {
      const pst = new PersistentSegmentTree({
        size: 5,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3, 4, 5],
      })
      const branch1 = pst.update(0, 0, 10)
      const branch1b = pst.update(branch1, 1, 20)
      const branch2 = pst.update(0, 2, 30)
      const branch2b = pst.update(branch2, 3, 40)
      expect(pst.query(0, 0, 4)).toBe(15)
      expect(pst.query(branch1, 0, 4)).toBe(24)
      expect(pst.query(branch1b, 0, 4)).toBe(42)
      expect(pst.query(branch2, 0, 4)).toBe(42)
      expect(pst.query(branch2b, 0, 4)).toBe(78)
    })

    it('should handle many versions on same index', () => {
      const pst = new PersistentSegmentTree({
        size: 1,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [0],
      })
      let v = 0
      for (let i = 1; i <= 50; i++) {
        v = pst.update(v, 0, i)
      }
      expect(pst.pointQuery(v, 0)).toBe(50)
      expect(pst.pointQuery(0, 0)).toBe(0)
      expect(pst.versionCount()).toBe(51)
    })

    it('should handle interleaved updates and queries', () => {
      const pst = new PersistentSegmentTree({
        size: 10,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: Array.from({ length: 10 }, (_, i) => i + 1),
      })
      let v = 0
      for (let i = 0; i < 10; i++) {
        v = pst.update(v, i, (i + 1) * 10)
        expect(pst.query(v, 0, i)).toBeGreaterThanOrEqual(0)
      }
      expect(pst.toArray(v)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    })
  })

  describe('rollback combined with other operations', () => {
    it('should rollback then update with min operation', () => {
      const pst = new PersistentSegmentTree({
        size: 4,
        operation: (a, b) => Math.min(a, b),
        identity: Infinity,
        initialValues: [10, 20, 30, 40],
      })
      const v1 = pst.update(0, 0, 5)
      const v2 = pst.update(v1, 1, 3)
      pst.rollback(v1)
      expect(pst.versionCount()).toBe(2)
      const v3 = pst.update(v1, 2, 1)
      expect(pst.query(v3, 0, 3)).toBe(1)
    })

    it('should rollback then clone', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 0, 10)
      pst.update(v1, 1, 20)
      pst.rollback(v1)
      const cloned = pst.cloneVersion(v1)
      expect(pst.versionCount()).toBe(3)
      expect(pst.query(cloned, 0, 2)).toBe(15)
    })
  })

  describe('multiple operations on same tree', () => {
    it('should correctly track versions across update, clone, and rollback', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const v1 = pst.update(0, 0, 10)
      const v2 = pst.cloneVersion(v1)
      const v3 = pst.update(v2, 1, 20)
      pst.rollback(v2)
      expect(pst.versionCount()).toBe(3)
      expect(pst.query(0, 0, 2)).toBe(6)
      expect(pst.query(v1, 0, 2)).toBe(15)
      expect(pst.query(v2, 0, 2)).toBe(15)
    })
  })

  describe('large array queries', () => {
    it('should handle range queries on large array', () => {
      const vals = Array.from({ length: 1000 }, (_, i) => i + 1)
      const pst = new PersistentSegmentTree({
        size: 1000,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: vals,
      })
      expect(pst.query(0, 0, 999)).toBe(500500)
      expect(pst.query(0, 100, 199)).toBe(15050)
      expect(pst.pointQuery(0, 500)).toBe(501)
    })
  })

  describe('persistence verification', () => {
    it('should maintain all versions immutable after many updates', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const versions: number[] = [0]
      const expectedArrays: number[][] = [[1, 2, 3]]
      let current = 0
      for (let i = 0; i < 10; i++) {
        current = pst.update(current, i % 3, (i + 1) * 10)
        versions.push(current)
        const arr = [...expectedArrays[expectedArrays.length - 1]!]
        arr[i % 3] = (i + 1) * 10
        expectedArrays.push(arr)
      }
      for (let i = 0; i < versions.length; i++) {
        expect(pst.toArray(versions[i]!)).toEqual(expectedArrays[i])
      }
    })

    it('should maintain branching version history correctly', () => {
      const pst = new PersistentSegmentTree({
        size: 3,
        operation: (a, b) => a + b,
        identity: 0,
        initialValues: [1, 2, 3],
      })
      const branchA = pst.update(0, 0, 10)
      const branchA2 = pst.update(branchA, 1, 20)
      const branchB = pst.update(0, 2, 30)
      expect(pst.toArray(0)).toEqual([1, 2, 3])
      expect(pst.toArray(branchA)).toEqual([10, 2, 3])
      expect(pst.toArray(branchA2)).toEqual([10, 20, 3])
      expect(pst.toArray(branchB)).toEqual([1, 2, 30])
    })
  })
})
