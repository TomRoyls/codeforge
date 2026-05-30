import { describe, it, expect } from 'vitest'
import { RedBlackTree } from '../src/utils/red-black-tree.js'
import { SkipList } from '../src/utils/skip-list.js'
import { ScapegoatTree } from '../src/utils/scapegoat-tree.js'

describe('Tree invariants', () => {
  describe('RedBlackTree', () => {
    it('inOrder traversal is always sorted', () => {
      const tree = new RedBlackTree<number, string>()
      const values = [5, 3, 8, 1, 4, 7, 9, 2, 6]
      for (const v of values) tree.insert(v, `v${v}`)
      const result = tree.inOrder().map(e => e.key)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('stays balanced after sequential inserts', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 0; i < 1000; i++) tree.insert(i, i)
      expect(tree.height).toBeLessThanOrEqual(2 * Math.ceil(Math.log2(1001)))
    })

    it('stays balanced after random inserts', () => {
      const tree = new RedBlackTree<number, number>()
      const shuffled = Array.from({ length: 1000 }, (_, i) => i)
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
      }
      for (const v of shuffled) tree.insert(v, v)
      expect(tree.height).toBeLessThanOrEqual(2 * Math.ceil(Math.log2(1001)))
    })

    it('delete maintains sorted order', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      tree.delete(5)
      tree.delete(10)
      tree.delete(15)
      const keys = tree.inOrder().map(e => e.key)
      expect(keys).not.toContain(5)
      expect(keys).not.toContain(10)
      expect(keys).not.toContain(15)
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]!).toBeGreaterThan(keys[i - 1]!)
      }
    })

    it('min/max are correct', () => {
      const tree = new RedBlackTree<number, number>()
      expect(tree.min).toBeUndefined()
      expect(tree.max).toBeUndefined()
      for (let i = 0; i < 100; i++) tree.insert(i, i)
      expect(tree.min).toBe(0)
      expect(tree.max).toBe(99)
    })

    it('size tracks actual count after inserts and deletes', () => {
      const tree = new RedBlackTree<number, number>()
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      expect(tree.size).toBe(50)
      for (let i = 0; i < 25; i++) tree.delete(i)
      expect(tree.size).toBe(25)
    })
  })

  describe('SkipList', () => {
    it('forEach produces sorted order', () => {
      const sl = new SkipList<number, number>()
      for (let i = 0; i < 100; i++) sl.insert(i, i)
      const keys: number[] = []
      sl.forEach((k) => keys.push(k))
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]).toBeGreaterThan(keys[i - 1]!)
      }
    })

    it('range returns correct subset', () => {
      const sl = new SkipList<number, number>()
      for (let i = 0; i < 100; i++) sl.insert(i, i)
      const range = sl.range(20, 30)
      expect(range.length).toBe(11)
      expect(range[0]!.key).toBe(20)
      expect(range[range.length - 1]!.key).toBe(30)
    })

    it('min/max are correct', () => {
      const sl = new SkipList<number, number>()
      expect(sl.min).toBeUndefined()
      expect(sl.max).toBeUndefined()
      for (let i = 0; i < 50; i++) sl.insert(i, i)
      expect(sl.min).toBe(0)
      expect(sl.max).toBe(49)
    })
  })

  describe('ScapegoatTree', () => {
    it('inOrderTraversal is sorted after many operations', () => {
      const tree = new ScapegoatTree<number, number>(0.6)
      for (let i = 0; i < 100; i++) tree.insert(i, i)
      for (let i = 0; i < 50; i++) tree.delete(i)
      const items = tree.inOrderTraversal()
      for (let i = 1; i < items.length; i++) {
        expect(items[i]!.key).toBeGreaterThan(items[i - 1]!.key)
      }
    })

    it('get works after rebalancing', () => {
      const tree = new ScapegoatTree<number, number>(0.6)
      for (let i = 0; i < 200; i++) tree.insert(i, i)
      for (let i = 0; i < 100; i++) tree.delete(i)
      for (let i = 100; i < 200; i++) {
        expect(tree.get(i)).toBe(i)
      }
    })
  })
})
