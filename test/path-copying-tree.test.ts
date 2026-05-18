import { describe, it, expect } from 'vitest'
import { PathCopyingTree } from '../src/core/path-copying-tree/index.js'

describe('PathCopyingTree', () => {
  // ─── Construction & Empty State ───
  describe('construction and empty state', () => {
    it('creates an empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates with custom comparator', () => {
      const tree = new PathCopyingTree<string, number>({
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(tree.size).toBe(0)
    })
  })

  // ─── Insert & Get ───
  describe('insert and get', () => {
    it('insert returns a new tree (immutable)', () => {
      const tree = new PathCopyingTree<number, string>()
      const v2 = tree.insert(1, 'a')
      expect(tree.size).toBe(0)
      expect(v2.size).toBe(1)
    })

    it('get retrieves inserted value', () => {
      const tree = new PathCopyingTree<number, string>()
      const v2 = tree.insert(1, 'a')
      expect(v2.get(1)).toBe('a')
    })

    it('has checks key existence', () => {
      const tree = new PathCopyingTree<number, string>().insert(1, 'a')
      expect(tree.has(1)).toBe(true)
      expect(tree.has(2)).toBe(false)
    })

    it('update existing key preserves immutability', () => {
      const v1 = new PathCopyingTree<number, string>().insert(1, 'a')
      const v2 = v1.insert(1, 'b')
      expect(v1.get(1)).toBe('a')
      expect(v2.get(1)).toBe('b')
      expect(v2.size).toBe(1)
    })

    it('inserts multiple keys in order', () => {
      let tree = new PathCopyingTree<number, string>()
      tree = tree.insert(3, 'c')
      tree = tree.insert(1, 'a')
      tree = tree.insert(2, 'b')
      expect(tree.toArray().map(e => e.key)).toEqual([1, 2, 3])
    })
  })

  // ─── Delete ───
  describe('delete', () => {
    it('delete returns new tree without the key', () => {
      let tree = new PathCopyingTree<number, string>()
      tree = tree.insert(1, 'a')
      tree = tree.insert(2, 'b')
      const v3 = tree.delete(1)
      expect(v3.has(1)).toBe(false)
      expect(v3.has(2)).toBe(true)
      expect(v3.size).toBe(1)
    })

    it('delete non-existing key returns same tree', () => {
      const v1 = new PathCopyingTree<number, string>().insert(1, 'a')
      const v2 = v1.delete(99)
      expect(v2).toBe(v1)
    })
  })

  // ─── Iteration ───
  describe('iteration', () => {
    it('entries yields in-order pairs', () => {
      let tree = new PathCopyingTree<number, string>()
      tree = tree.insert(3, 'c').insert(1, 'a').insert(2, 'b')
      const entries = [...tree.entries()]
      expect(entries.map(e => e.key)).toEqual([1, 2, 3])
    })

    it('keys yields in-order keys', () => {
      let tree = new PathCopyingTree<number, string>()
      tree = tree.insert(2, 'b').insert(1, 'a')
      expect([...tree.keys()]).toEqual([1, 2])
    })

    it('values yields in-order values', () => {
      let tree = new PathCopyingTree<number, string>()
      tree = tree.insert(2, 'b').insert(1, 'a')
      expect([...tree.values()]).toEqual(['a', 'b'])
    })

    it('forEach calls callback in order', () => {
      let tree = new PathCopyingTree<number, string>()
      tree = tree.insert(2, 'b').insert(1, 'a')
      const keys: number[] = []
      tree.forEach((e) => keys.push(e.key))
      expect(keys).toEqual([1, 2])
    })

    it('Symbol.iterator yields entries', () => {
      let tree = new PathCopyingTree<number, string>()
      tree = tree.insert(1, 'a')
      const entries = [...tree]
      expect(entries).toHaveLength(1)
    })
  })

  // ─── Versioning ───
  describe('versioning', () => {
    it('tracks version history', () => {
      const v1 = new PathCopyingTree<number, string>()
      const v2 = v1.insert(1, 'a')
      const v3 = v2.insert(2, 'b')
      expect(v3.versionCount).toBe(3)
    })

    it('previousVersion returns the last version', () => {
      const v1 = new PathCopyingTree<number, string>()
      const v2 = v1.insert(1, 'a')
      expect(v2.previousVersion()).toBe(v1)
    })

    it('getVersion retrieves specific version', () => {
      const v1 = new PathCopyingTree<number, string>()
      const v2 = v1.insert(1, 'a')
      const v3 = v2.insert(2, 'b')
      expect(v3.getVersion(0)).toBe(v1)
      expect(v3.getVersion(1)).toBe(v2)
      expect(v3.getVersion(2)).toBe(v3)
    })

    it('getVersion returns undefined for out of range', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.getVersion(-1)).toBeUndefined()
      expect(tree.getVersion(1)).toBeUndefined()
    })

    it('previousVersion returns undefined for initial tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.previousVersion()).toBeUndefined()
    })

    it('old versions remain unchanged after mutations', () => {
      const v1 = new PathCopyingTree<number, string>()
      const v2 = v1.insert(1, 'a')
      const v3 = v2.insert(2, 'b')
      expect(v1.size).toBe(0)
      expect(v2.size).toBe(1)
      expect(v2.get(2)).toBeUndefined()
      expect(v3.size).toBe(2)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.toArray()).toEqual([])
    })

    it('returns sorted entries', () => {
      let tree = new PathCopyingTree<number, string>()
      tree = tree.insert(3, 'c').insert(1, 'a').insert(2, 'b')
      const arr = tree.toArray()
      expect(arr[0]).toEqual({ key: 1, value: 'a' })
      expect(arr[2]).toEqual({ key: 3, value: 'c' })
    })
  })
})
