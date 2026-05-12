import { describe, it, expect } from 'vitest'
import { PathCopyingTree } from '../../src/core/path-copying-tree/index.js'

describe('PathCopyingTree', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates with custom comparator', () => {
      const tree = new PathCopyingTree<number, string>({ comparator: (a, b) => b - a })
      const t2 = tree.insert(1, 'one')
      const t3 = t2.insert(2, 'two')
      const t4 = t3.insert(3, 'three')
      expect(t4.toArray().map((e) => e.key)).toEqual([3, 2, 1])
    })

    it('creates with default comparator', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(3, 'three')
      const t3 = t2.insert(1, 'one')
      const t4 = t3.insert(2, 'two')
      expect(t4.toArray().map((e) => e.key)).toEqual([1, 2, 3])
    })

    it('accepts string keys', () => {
      const tree = new PathCopyingTree<string, number>()
      const t2 = tree.insert('b', 2)
      const t3 = t2.insert('a', 1)
      const t4 = t3.insert('c', 3)
      expect(t4.toArray().map((e) => e.key)).toEqual(['a', 'b', 'c'])
    })
  })

  describe('insert', () => {
    it('inserts single key-value pair', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      expect(t2.size).toBe(1)
      expect(t2.isEmpty()).toBe(false)
      expect(t2.get(1)).toBe('one')
    })

    it('inserts multiple key-value pairs', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(5, 'five')
      const t3 = t2.insert(3, 'three')
      const t4 = t3.insert(7, 'seven')
      expect(t4.size).toBe(3)
      expect(t4.get(5)).toBe('five')
      expect(t4.get(3)).toBe('three')
      expect(t4.get(7)).toBe('seven')
    })

    it('overwrites existing key', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.insert(1, 'ONE')
      expect(t3.size).toBe(1)
      expect(t3.get(1)).toBe('ONE')
    })

    it('returns new tree without modifying original', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.insert(2, 'two')
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(t2.size).toBe(1)
      expect(t2.get(2)).toBeUndefined()
      expect(t3.size).toBe(2)
      expect(t3.get(2)).toBe('two')
    })

    it('inserts in sorted order', () => {
      const tree = new PathCopyingTree<number, string>()
      let t: PathCopyingTree<number, string> = tree
      const keys = [5, 3, 7, 1, 4, 6, 8]
      for (const k of keys) {
        t = t.insert(k, `v${k}`)
      }
      expect(t.toArray().map((e) => e.key)).toEqual([1, 3, 4, 5, 6, 7, 8])
    })

    it('handles descending insertions', () => {
      const tree = new PathCopyingTree<number, string>()
      let t: PathCopyingTree<number, string> = tree
      for (let i = 10; i >= 1; i--) {
        t = t.insert(i, `v${i}`)
      }
      expect(t.toArray().map((e) => e.key)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles ascending insertions', () => {
      const tree = new PathCopyingTree<number, string>()
      let t: PathCopyingTree<number, string> = tree
      for (let i = 1; i <= 10; i++) {
        t = t.insert(i, `v${i}`)
      }
      expect(t.toArray().map((e) => e.key)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('preserves old version on insert', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one')
      const v2 = v1.insert(2, 'two')
      expect(v1.has(2)).toBe(false)
      expect(v2.has(1)).toBe(true)
      expect(v2.has(2)).toBe(true)
    })

    it('does not increase size on overwrite', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.insert(1, 'ONE')
      expect(t3.size).toBe(1)
    })

    it('inserts with null values', () => {
      const tree = new PathCopyingTree<number, string | null>()
      const t2 = tree.insert(1, null)
      expect(t2.get(1)).toBeNull()
    })

    it('inserts with undefined values', () => {
      const tree = new PathCopyingTree<number, string | undefined>()
      const t2 = tree.insert(1, undefined)
      expect(t2.get(1)).toBeUndefined()
      expect(t2.has(1)).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.delete(1)
      expect(t3.size).toBe(0)
      expect(t3.has(1)).toBe(false)
    })

    it('returns same tree on delete of non-existent key', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.delete(99)
      expect(t3).toBe(t2)
    })

    it('returns same tree on delete from empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.delete(1)
      expect(t2).toBe(tree)
    })

    it('preserves original tree after delete', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.insert(2, 'two')
      const t4 = t3.delete(1)
      expect(t3.has(1)).toBe(true)
      expect(t3.get(1)).toBe('one')
      expect(t4.has(1)).toBe(false)
      expect(t4.has(2)).toBe(true)
    })

    it('deletes leaf node', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree.insert(2, 'two').insert(1, 'one').insert(3, 'three')
      t = t.delete(1)
      expect(t.toArray().map((e) => e.key)).toEqual([2, 3])
    })

    it('deletes node with one child', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree.insert(3, 'three').insert(2, 'two').insert(1, 'one')
      t = t.delete(2)
      expect(t.toArray().map((e) => e.key)).toEqual([1, 3])
    })

    it('deletes node with two children', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree.insert(2, 'two').insert(1, 'one').insert(3, 'three')
      t = t.delete(2)
      expect(t.toArray().map((e) => e.key)).toEqual([1, 3])
    })

    it('deletes root', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.delete(1)
      expect(t3.size).toBe(0)
      expect(t3.isEmpty()).toBe(true)
    })

    it('deletes multiple keys', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      for (let i = 1; i <= 5; i++) {
        t = t.insert(i, `v${i}`)
      }
      t = t.delete(2).delete(4)
      expect(t.toArray().map((e) => e.key)).toEqual([1, 3, 5])
    })

    it('handles delete and reinsert', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.delete(1)
      const t4 = t3.insert(1, 'ONE')
      expect(t4.get(1)).toBe('ONE')
      expect(t4.size).toBe(1)
    })

    it('size decrements on delete', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one').insert(2, 'two').insert(3, 'three')
      expect(t2.size).toBe(3)
      const t3 = t2.delete(2)
      expect(t3.size).toBe(2)
      const t4 = t3.delete(1)
      expect(t4.size).toBe(1)
      const t5 = t4.delete(3)
      expect(t5.size).toBe(0)
    })
  })

  describe('get', () => {
    it('returns undefined for non-existent key', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.get(1)).toBeUndefined()
    })

    it('returns value for existing key', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      expect(t2.get(1)).toBe('one')
    })

    it('returns updated value after overwrite', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.insert(1, 'ONE')
      expect(t3.get(1)).toBe('ONE')
    })

    it('returns undefined after delete', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.delete(1)
      expect(t3.get(1)).toBeUndefined()
    })

    it('gets from various positions in tree', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      for (let i = 1; i <= 10; i++) {
        t = t.insert(i, `v${i}`)
      }
      for (let i = 1; i <= 10; i++) {
        expect(t.get(i)).toBe(`v${i}`)
      }
    })
  })

  describe('has', () => {
    it('returns false for empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.has(1)).toBe(false)
    })

    it('returns true for existing key', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      expect(t2.has(1)).toBe(true)
    })

    it('returns false for non-existent key', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      expect(t2.has(2)).toBe(false)
    })

    it('returns false after delete', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.delete(1)
      expect(t3.has(1)).toBe(false)
    })

    it('returns true for overwritten key', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.insert(1, 'ONE')
      expect(t3.has(1)).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.size).toBe(0)
    })

    it('size increments on insert', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      expect(t2.size).toBe(1)
      const t3 = t2.insert(2, 'two')
      expect(t3.size).toBe(2)
    })

    it('size does not increment on overwrite', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.insert(1, 'ONE')
      expect(t3.size).toBe(1)
    })

    it('isEmpty returns true for empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insert', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      expect(t2.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after deleting all', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      const t3 = t2.delete(1)
      expect(t3.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.toArray()).toEqual([])
    })

    it('returns single entry', () => {
      const tree = new PathCopyingTree<number, string>()
      const t2 = tree.insert(1, 'one')
      expect(t2.toArray()).toEqual([{ key: 1, value: 'one' }])
    })

    it('returns entries in sorted order', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      const pairs: Array<[number, string]> = [[3, 'c'], [1, 'a'], [2, 'b']]
      for (const [k, v] of pairs) {
        t = t.insert(k, v)
      }
      expect(t.toArray()).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })

    it('does not modify original on toArray after delete', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree.insert(3, 'c').insert(1, 'a').insert(2, 'b')
      const t2 = t.delete(2)
      expect(t.toArray().length).toBe(3)
      expect(t2.toArray().length).toBe(2)
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      let called = false
      tree.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('calls callback for each entry in order', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree.insert(3, 'c').insert(1, 'a').insert(2, 'b')
      const keys: number[] = []
      t.forEach((entry) => { keys.push(entry.key) })
      expect(keys).toEqual([1, 2, 3])
    })

    it('passes index correctly', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree.insert(1, 'a').insert(2, 'b').insert(3, 'c')
      const indices: number[] = []
      t.forEach((_entry, i) => { indices.push(i) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides correct entries', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(1, 'a').insert(2, 'b')
      const entries: Array<{ key: number; value: string }> = []
      t.forEach((e) => { entries.push(e) })
      expect(entries).toEqual([{ key: 1, value: 'a' }, { key: 2, value: 'b' }])
    })
  })

  describe('entries', () => {
    it('returns empty iterator for empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect([...tree.entries()]).toEqual([])
    })

    it('returns entries in sorted order', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(3, 'c').insert(1, 'a').insert(2, 'b')
      const result = [...t.entries()]
      expect(result).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })

    it('can be iterated partially', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(1, 'a').insert(2, 'b').insert(3, 'c')
      const gen = t.entries()
      expect(gen.next().value).toEqual({ key: 1, value: 'a' })
      expect(gen.next().value).toEqual({ key: 2, value: 'b' })
    })
  })

  describe('keys', () => {
    it('returns empty iterator for empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect([...tree.keys()]).toEqual([])
    })

    it('returns keys in sorted order', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(3, 'c').insert(1, 'a').insert(2, 'b')
      expect([...t.keys()]).toEqual([1, 2, 3])
    })
  })

  describe('values', () => {
    it('returns empty iterator for empty tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect([...tree.values()]).toEqual([])
    })

    it('returns values in key sorted order', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(3, 'c').insert(1, 'a').insert(2, 'b')
      expect([...t.values()]).toEqual(['a', 'b', 'c'])
    })
  })

  describe('persistence', () => {
    it('old version unchanged after insert', () => {
      const tree = new PathCopyingTree<number, string>()
      const v0 = tree
      const v1 = v0.insert(1, 'one')
      const v2 = v1.insert(2, 'two')
      const v3 = v2.insert(3, 'three')
      expect(v0.size).toBe(0)
      expect(v1.size).toBe(1)
      expect(v2.size).toBe(2)
      expect(v3.size).toBe(3)
      expect(v1.has(2)).toBe(false)
      expect(v2.has(3)).toBe(false)
    })

    it('old version unchanged after delete', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one').insert(2, 'two').insert(3, 'three')
      const v2 = v1.delete(2)
      expect(v1.has(2)).toBe(true)
      expect(v1.get(2)).toBe('two')
      expect(v2.has(2)).toBe(false)
      expect(v2.size).toBe(2)
    })

    it('old version unchanged after overwrite', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one')
      const v2 = v1.insert(1, 'ONE')
      expect(v1.get(1)).toBe('one')
      expect(v2.get(1)).toBe('ONE')
    })

    it('multiple versions coexist', () => {
      const tree = new PathCopyingTree<number, string>()
      const versions: PathCopyingTree<number, string>[] = [tree]
      for (let i = 1; i <= 5; i++) {
        versions.push(versions[versions.length - 1]!.insert(i, `v${i}`))
      }
      for (let i = 0; i <= 5; i++) {
        expect(versions[i]!.size).toBe(i)
      }
    })

    it('shared subtrees are not mutated', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(10, 'ten').insert(5, 'five').insert(15, 'fifteen')
      const v2 = v1.insert(3, 'three')
      expect(v1.has(3)).toBe(false)
      expect(v2.has(3)).toBe(true)
      expect(v1.get(5)).toBe('five')
      expect(v2.get(5)).toBe('five')
    })

    it('branched modifications are independent', () => {
      const tree = new PathCopyingTree<number, string>()
      const base = tree.insert(1, 'one').insert(2, 'two').insert(3, 'three')
      const branchA = base.insert(4, 'four')
      const branchB = base.delete(2)
      expect(base.size).toBe(3)
      expect(branchA.size).toBe(4)
      expect(branchB.size).toBe(2)
      expect(branchA.has(4)).toBe(true)
      expect(branchB.has(2)).toBe(false)
    })
  })

  describe('version tracking', () => {
    it('previousVersion returns undefined for initial tree', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.previousVersion()).toBeUndefined()
    })

    it('previousVersion returns the tree before last mutation', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one')
      expect(v1.previousVersion()).toBe(tree)
    })

    it('previousVersion chains correctly', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one')
      const v2 = v1.insert(2, 'two')
      expect(v2.previousVersion()).toBe(v1)
      expect(v1.previousVersion()).toBe(tree)
    })

    it('previousVersion reflects delete', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one').insert(2, 'two')
      const v2 = v1.delete(1)
      expect(v2.previousVersion()).toBe(v1)
    })

    it('versionCount starts at 1', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.versionCount).toBe(1)
    })

    it('versionCount increments on insert', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one')
      expect(v1.versionCount).toBe(2)
      expect(tree.versionCount).toBe(1)
    })

    it('versionCount increments on delete', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one')
      const v2 = v1.delete(1)
      expect(v2.versionCount).toBe(3)
      expect(v1.versionCount).toBe(2)
    })

    it('getVersion returns specific version', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one')
      const v2 = v1.insert(2, 'two')
      expect(v2.getVersion(0)).toBe(tree)
      expect(v2.getVersion(1)).toBe(v1)
      expect(v2.getVersion(2)).toBe(v2)
    })

    it('getVersion returns undefined for out of range', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.getVersion(-1)).toBeUndefined()
      expect(tree.getVersion(5)).toBeUndefined()
    })

    it('getVersion returns this for current version', () => {
      const tree = new PathCopyingTree<number, string>()
      const v1 = tree.insert(1, 'one')
      const v2 = v1.insert(2, 'two')
      expect(v2.getVersion(v2.versionCount - 1)).toBe(v2)
    })
  })

  describe('custom comparator', () => {
    it('supports reverse order', () => {
      const tree = new PathCopyingTree<number, string>({ comparator: (a, b) => b - a })
      const t = tree.insert(1, 'one').insert(2, 'two').insert(3, 'three')
      expect(t.toArray().map((e) => e.key)).toEqual([3, 2, 1])
    })

    it('supports string comparison', () => {
      const tree = new PathCopyingTree<string, number>()
      const t = tree.insert('banana', 2).insert('apple', 1).insert('cherry', 3)
      expect(t.toArray().map((e) => e.key)).toEqual(['apple', 'banana', 'cherry'])
    })

    it('supports complex object keys with comparator', () => {
      interface Obj { id: number }
      const tree = new PathCopyingTree<Obj, string>({
        comparator: (a, b) => a.id - b.id,
      })
      const t = tree.insert({ id: 2 }, 'b').insert({ id: 1 }, 'a')
      expect(t.toArray().map((e) => e.value)).toEqual(['a', 'b'])
    })
  })

  describe('edge cases', () => {
    it('handles many insertions', () => {
      const tree = new PathCopyingTree<number, number>()
      let t = tree
      for (let i = 0; i < 100; i++) {
        t = t.insert(i, i * 10)
      }
      expect(t.size).toBe(100)
      expect(t.toArray().length).toBe(100)
    })

    it('handles sequential delete all', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      for (let i = 1; i <= 10; i++) {
        t = t.insert(i, `v${i}`)
      }
      for (let i = 1; i <= 10; i++) {
        t = t.delete(i)
      }
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('handles duplicate insert delete cycle', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      for (let cycle = 0; cycle < 5; cycle++) {
        t = t.insert(1, `cycle${cycle}`)
        t = t.delete(1)
      }
      expect(t.has(1)).toBe(false)
    })

    it('handles alternating insert delete', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree.insert(1, 'one')
      t = t.delete(1)
      t = t.insert(1, 'ONE')
      expect(t.size).toBe(1)
      expect(t.get(1)).toBe('ONE')
    })

    it('handles negative keys', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(-1, 'neg').insert(0, 'zero').insert(1, 'pos')
      expect(t.toArray().map((e) => e.key)).toEqual([-1, 0, 1])
    })

    it('handles zero key', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(0, 'zero')
      expect(t.get(0)).toBe('zero')
      expect(t.has(0)).toBe(true)
    })

    it('handles large keys', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(Number.MAX_SAFE_INTEGER, 'max').insert(Number.MIN_SAFE_INTEGER, 'min')
      expect(t.get(Number.MAX_SAFE_INTEGER)).toBe('max')
      expect(t.get(Number.MIN_SAFE_INTEGER)).toBe('min')
    })

    it('handles empty string key', () => {
      const tree = new PathCopyingTree<string, number>()
      const t = tree.insert('', 0)
      expect(t.get('')).toBe(0)
      expect(t.has('')).toBe(true)
    })

    it('iterate over tree with many elements', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      for (let i = 0; i < 50; i++) {
        t = t.insert(i, `v${i}`)
      }
      let count = 0
      t.forEach(() => { count++ })
      expect(count).toBe(50)
    })

    it('Symbol.iterator works', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(2, 'b').insert(1, 'a').insert(3, 'c')
      const result = [...t]
      expect(result).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })

    it('delete from single element tree', () => {
      const tree = new PathCopyingTree<number, string>()
      const t1 = tree.insert(1, 'one')
      const t2 = t1.delete(1)
      expect(t2.size).toBe(0)
      expect(t2.isEmpty()).toBe(true)
      expect(t1.size).toBe(1)
    })

    it('delete non-existent from populated tree', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(1, 'one').insert(2, 'two')
      const t2 = t.delete(999)
      expect(t2).toBe(t)
    })

    it('insert after deleting all', () => {
      const tree = new PathCopyingTree<number, string>()
      const t1 = tree.insert(1, 'one')
      const t2 = t1.delete(1)
      const t3 = t2.insert(1, 'ONE')
      expect(t3.size).toBe(1)
      expect(t3.get(1)).toBe('ONE')
    })
  })

  describe('generics', () => {
    it('works with number keys and string values', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(1, 'hello')
      expect(t.get(1)).toBe('hello')
    })

    it('works with string keys and number values', () => {
      const tree = new PathCopyingTree<string, number>()
      const t = tree.insert('age', 25)
      expect(t.get('age')).toBe(25)
    })

    it('works with number keys and object values', () => {
      const tree = new PathCopyingTree<number, { name: string }>()
      const t = tree.insert(1, { name: 'Alice' })
      expect(t.get(1)?.name).toBe('Alice')
    })

    it('works with string keys and array values', () => {
      const tree = new PathCopyingTree<string, number[]>()
      const t = tree.insert('nums', [1, 2, 3])
      expect(t.get('nums')).toEqual([1, 2, 3])
    })

    it('works with boolean values', () => {
      const tree = new PathCopyingTree<number, boolean>()
      const t = tree.insert(1, true).insert(2, false)
      expect(t.get(1)).toBe(true)
      expect(t.get(2)).toBe(false)
    })
  })

  describe('structural sharing', () => {
    it('does not deeply copy unchanged subtrees', () => {
      const tree = new PathCopyingTree<number, string>()
      const base = tree.insert(5, 'five').insert(3, 'three').insert(7, 'seven')
        .insert(1, 'one').insert(4, 'four').insert(6, 'six').insert(8, 'eight')
      const modified = base.insert(2, 'two')
      expect(base.get(5)).toBe('five')
      expect(base.get(3)).toBe('three')
      expect(base.get(7)).toBe('seven')
      expect(modified.get(2)).toBe('two')
      expect(modified.get(5)).toBe('five')
      expect(modified.get(8)).toBe('eight')
    })

    it('preserves full history via version chain', () => {
      const tree = new PathCopyingTree<number, string>()
      const v0 = tree
      const v1 = v0.insert(1, 'a')
      const v2 = v1.insert(2, 'b')
      const v3 = v2.delete(1)
      const v4 = v3.insert(1, 'A')
      expect(v0.size).toBe(0)
      expect(v1.size).toBe(1)
      expect(v1.get(1)).toBe('a')
      expect(v2.size).toBe(2)
      expect(v2.get(1)).toBe('a')
      expect(v2.get(2)).toBe('b')
      expect(v3.size).toBe(1)
      expect(v3.has(1)).toBe(false)
      expect(v3.get(2)).toBe('b')
      expect(v4.size).toBe(2)
      expect(v4.get(1)).toBe('A')
      expect(v4.get(2)).toBe('b')
    })
  })

  describe('advanced operations', () => {
    it('bulk insert preserves order', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      const data = [10, 20, 30, 40, 50, 25, 15, 5, 35, 45]
      for (const k of data) {
        t = t.insert(k, `v${k}`)
      }
      expect(t.toArray().map((e) => e.key)).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
    })

    it('bulk delete preserves order', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      for (let i = 1; i <= 10; i++) {
        t = t.insert(i, `v${i}`)
      }
      for (const k of [2, 4, 6, 8, 10]) {
        t = t.delete(k)
      }
      expect(t.toArray().map((e) => e.key)).toEqual([1, 3, 5, 7, 9])
    })

    it('insert delete interleaved', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      t = t.insert(1, 'a')
      t = t.insert(2, 'b')
      t = t.delete(1)
      t = t.insert(3, 'c')
      t = t.insert(1, 'd')
      expect(t.toArray().map((e) => e.key)).toEqual([1, 2, 3])
      expect(t.get(1)).toBe('d')
    })

    it('overwrites maintain tree structure', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      for (let i = 1; i <= 5; i++) {
        t = t.insert(i, `v${i}`)
      }
      for (let i = 1; i <= 5; i++) {
        t = t.insert(i, `V${i}`)
      }
      expect(t.size).toBe(5)
      expect(t.toArray().map((e) => e.value)).toEqual(['V1', 'V2', 'V3', 'V4', 'V5'])
    })

    it('delete root of multi-level tree', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(5, 'five').insert(3, 'three').insert(7, 'seven')
        .insert(2, 'two').insert(4, 'four')
      const t2 = t.delete(5)
      expect(t2.size).toBe(4)
      expect(t2.has(5)).toBe(false)
      expect(t2.toArray().length).toBe(4)
    })

    it('delete rightmost leaf', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(2, 'two').insert(1, 'one').insert(3, 'three')
      const t2 = t.delete(3)
      expect(t2.toArray().map((e) => e.key)).toEqual([1, 2])
    })

    it('delete leftmost leaf', () => {
      const tree = new PathCopyingTree<number, string>()
      const t = tree.insert(2, 'two').insert(1, 'one').insert(3, 'three')
      const t2 = t.delete(1)
      expect(t2.toArray().map((e) => e.key)).toEqual([2, 3])
    })
  })

  describe('version history depth', () => {
    it('tracks 20 versions', () => {
      const tree = new PathCopyingTree<number, string>()
      let t = tree
      for (let i = 1; i <= 20; i++) {
        t = t.insert(i, `v${i}`)
      }
      expect(t.versionCount).toBe(21)
      expect(t.previousVersion()?.size).toBe(19)
    })

    it('can navigate to any version via getVersion', () => {
      const tree = new PathCopyingTree<number, string>()
      const versions: PathCopyingTree<number, string>[] = [tree]
      for (let i = 1; i <= 10; i++) {
        versions.push(versions[versions.length - 1]!.insert(i, `v${i}`))
      }
      const latest = versions[10]!
      for (let i = 0; i <= 10; i++) {
        const v = latest.getVersion(i)
        expect(v).toBeDefined()
        expect(v!.size).toBe(i)
      }
    })

    it('getVersion on initial tree returns self for version 0', () => {
      const tree = new PathCopyingTree<number, string>()
      expect(tree.getVersion(0)).toBe(tree)
    })

    it('version history survives branching', () => {
      const tree = new PathCopyingTree<number, string>()
      const base = tree.insert(1, 'one').insert(2, 'two')
      const branchA = base.insert(3, 'three')
      const branchB = base.delete(1)
      expect(branchA.getVersion(0)).toBe(tree)
      expect(branchB.getVersion(0)).toBe(tree)
      expect(branchA.previousVersion()).toBe(base)
      expect(branchB.previousVersion()).toBe(base)
    })
  })
})
