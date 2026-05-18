import { describe, it, expect } from 'vitest'
import { Tree, Zipper } from '../../src/core/zipper-tree-2/index.js'

describe('Tree', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates a leaf node', () => {
      const t = new Tree(1)
      expect(t.getValue()).toBe(1)
      expect(t.getLeft()).toBeUndefined()
      expect(t.getRight()).toBeUndefined()
    })

    it('creates a node with children', () => {
      const left = new Tree(2)
      const right = new Tree(3)
      const t = new Tree(1, left, right)
      expect(t.getLeft()).toBe(left)
      expect(t.getRight()).toBe(right)
    })
  })

  // ─── getValue ───
  describe('getValue', () => {
    it('returns the node value', () => {
      const t = new Tree('hello')
      expect(t.getValue()).toBe('hello')
    })
  })

  // ─── getLeft / getRight ───
  describe('getLeft and getRight', () => {
    it('returns undefined when no children', () => {
      const t = new Tree(1)
      expect(t.getLeft()).toBeUndefined()
      expect(t.getRight()).toBeUndefined()
    })

    it('returns child when present', () => {
      const left = new Tree(2)
      const right = new Tree(3)
      const t = new Tree(1, left, right)
      expect(t.getLeft()?.getValue()).toBe(2)
      expect(t.getRight()?.getValue()).toBe(3)
    })
  })

  // ─── isLeaf ───
  describe('isLeaf', () => {
    it('returns true for node without children', () => {
      expect(new Tree(1).isLeaf()).toBe(true)
    })

    it('returns false for node with left child', () => {
      const t = new Tree(1, new Tree(2))
      expect(t.isLeaf()).toBe(false)
    })

    it('returns false for node with right child', () => {
      const t = new Tree(1, undefined, new Tree(3))
      expect(t.isLeaf()).toBe(false)
    })
  })

  // ─── Map ───
  describe('map', () => {
    it('transforms all values', () => {
      const t = new Tree(1, new Tree(2), new Tree(3))
      const mapped = t.map(v => v * 10)
      expect(mapped.getValue()).toBe(10)
      expect(mapped.getLeft()?.getValue()).toBe(20)
      expect(mapped.getRight()?.getValue()).toBe(30)
    })

    it('preserves structure for leaf', () => {
      const t = new Tree(5)
      const mapped = t.map(v => v + 1)
      expect(mapped.getValue()).toBe(6)
      expect(mapped.isLeaf()).toBe(true)
    })

    it('works with type transformation', () => {
      const t = new Tree(1, new Tree(2))
      const mapped = t.map(v => String(v))
      expect(mapped.getValue()).toBe('1')
      expect(mapped.getLeft()?.getValue()).toBe('2')
    })
  })
})

describe('Zipper', () => {
  // ─── fromTree ───
  describe('fromTree', () => {
    it('creates zipper from tree', () => {
      const t = new Tree(1)
      const z = Zipper.fromTree(t)
      expect(z.getValue()).toBe(1)
    })

    it('starts at root', () => {
      const t = new Tree(1)
      const z = Zipper.fromTree(t)
      expect(z.isRoot()).toBe(true)
    })
  })

  // ─── goLeft / goRight ───
  describe('goLeft', () => {
    it('navigates to left child', () => {
      const t = new Tree(1, new Tree(2), new Tree(3))
      const z = Zipper.fromTree(t).goLeft()
      expect(z).not.toBeNull()
      expect(z!.getValue()).toBe(2)
      expect(z!.isRoot()).toBe(false)
    })

    it('returns null when no left child', () => {
      const t = new Tree(1, undefined, new Tree(3))
      const z = Zipper.fromTree(t).goLeft()
      expect(z).toBeNull()
    })

    it('returns null on leaf', () => {
      const t = new Tree(1)
      const z = Zipper.fromTree(t).goLeft()
      expect(z).toBeNull()
    })
  })

  describe('goRight', () => {
    it('navigates to right child', () => {
      const t = new Tree(1, new Tree(2), new Tree(3))
      const z = Zipper.fromTree(t).goRight()
      expect(z).not.toBeNull()
      expect(z!.getValue()).toBe(3)
    })

    it('returns null when no right child', () => {
      const t = new Tree(1, new Tree(2))
      const z = Zipper.fromTree(t).goRight()
      expect(z).toBeNull()
    })
  })

  // ─── goUp ───
  describe('goUp', () => {
    it('navigates back to parent', () => {
      const t = new Tree(1, new Tree(2), new Tree(3))
      const z = Zipper.fromTree(t).goLeft()!.goUp()
      expect(z).not.toBeNull()
      expect(z!.getValue()).toBe(1)
    })

    it('returns null at root', () => {
      const t = new Tree(1)
      const z = Zipper.fromTree(t).goUp()
      expect(z).toBeNull()
    })

    it('round-trips left then up', () => {
      const t = new Tree(1, new Tree(2), new Tree(3))
      const z = Zipper.fromTree(t).goLeft()!.goUp()!
      expect(z.getValue()).toBe(1)
      expect(z.goRight()!.getValue()).toBe(3)
    })

    it('round-trips right then up', () => {
      const t = new Tree(1, new Tree(2), new Tree(3))
      const z = Zipper.fromTree(t).goRight()!.goUp()!
      expect(z.getValue()).toBe(1)
      expect(z.goLeft()!.getValue()).toBe(2)
    })
  })

  // ─── Deep Navigation ───
  describe('deep navigation', () => {
    it('navigates multiple levels', () => {
      const leaf = new Tree(4)
      const t = new Tree(1, new Tree(2, leaf, new Tree(5)), new Tree(3))
      const z = Zipper.fromTree(t).goLeft()!.goLeft()!
      expect(z.getValue()).toBe(4)
      expect(z.getPath()).toBe('LL')
    })

    it('navigates left then right', () => {
      const t = new Tree(1, new Tree(2, new Tree(4), new Tree(5)), new Tree(3))
      const z = Zipper.fromTree(t).goLeft()!.goRight()!
      expect(z.getValue()).toBe(5)
      expect(z.getPath()).toBe('LR')
    })

    it('navigates up from deep level', () => {
      const t = new Tree(1, new Tree(2, new Tree(4), new Tree(5)), new Tree(3))
      const z = Zipper.fromTree(t).goLeft()!.goLeft()!.goUp()!
      expect(z.getValue()).toBe(2)
    })
  })

  // ─── setValue ───
  describe('setValue', () => {
    it('changes the focused value', () => {
      const t = new Tree(1)
      const z = Zipper.fromTree(t).setValue(99)
      expect(z.getValue()).toBe(99)
    })

    it('does not mutate original tree', () => {
      const t = new Tree(1)
      Zipper.fromTree(t).setValue(99)
      expect(t.getValue()).toBe(1)
    })
  })

  // ─── insertLeft / insertRight ───
  describe('insertLeft', () => {
    it('inserts a subtree as left child', () => {
      const t = new Tree(1)
      const newLeft = new Tree(10)
      const z = Zipper.fromTree(t).insertLeft(newLeft)
      expect(z.getValue()).toBe(1)
      const tree = z.toTree()
      expect(tree.getLeft()?.getValue()).toBe(10)
    })
  })

  describe('insertRight', () => {
    it('inserts a subtree as right child', () => {
      const t = new Tree(1)
      const newRight = new Tree(20)
      const z = Zipper.fromTree(t).insertRight(newRight)
      expect(z.getValue()).toBe(1)
      const tree = z.toTree()
      expect(tree.getRight()?.getValue()).toBe(20)
    })
  })

  // ─── delete ───
  describe('delete', () => {
    it('deletes a leaf node', () => {
      const t = new Tree(1, new Tree(2), new Tree(3))
      const z = Zipper.fromTree(t).goLeft()!.delete()
      expect(z).not.toBeNull()
      expect(z!.getValue()).toBe(1)
      const reconstructed = z!.toTree()
      expect(reconstructed.getLeft()).toBeUndefined()
      expect(reconstructed.getRight()?.getValue()).toBe(3)
    })

    it('returns null when deleting root', () => {
      const t = new Tree(1)
      const z = Zipper.fromTree(t).delete()
      expect(z).toBeNull()
    })
  })

  // ─── isRoot ───
  describe('isRoot', () => {
    it('returns true at root', () => {
      const t = new Tree(1)
      expect(Zipper.fromTree(t).isRoot()).toBe(true)
    })

    it('returns false after navigation', () => {
      const t = new Tree(1, new Tree(2))
      expect(Zipper.fromTree(t).goLeft()!.isRoot()).toBe(false)
    })
  })

  // ─── getPath ───
  describe('getPath', () => {
    it('returns empty string at root', () => {
      const t = new Tree(1)
      expect(Zipper.fromTree(t).getPath()).toBe('')
    })

    it('tracks left navigation', () => {
      const t = new Tree(1, new Tree(2))
      expect(Zipper.fromTree(t).goLeft()!.getPath()).toBe('L')
    })

    it('tracks right navigation', () => {
      const t = new Tree(1, undefined, new Tree(3))
      expect(Zipper.fromTree(t).goRight()!.getPath()).toBe('R')
    })

    it('tracks deep path', () => {
      const t = new Tree(1, new Tree(2, new Tree(4), new Tree(5)), new Tree(3))
      expect(Zipper.fromTree(t).goLeft()!.goRight()!.getPath()).toBe('LR')
    })
  })

  // ─── toTree ───
  describe('toTree', () => {
    it('reconstructs original tree from root', () => {
      const t = new Tree(1, new Tree(2), new Tree(3))
      const z = Zipper.fromTree(t)
      expect(z.toTree().getValue()).toBe(1)
    })

    it('reconstructs modified tree after setValue', () => {
      const t = new Tree(1, new Tree(2), new Tree(3))
      const z = Zipper.fromTree(t).goLeft()!.setValue(99)
      const reconstructed = z.toTree()
      expect(reconstructed.getValue()).toBe(1)
      expect(reconstructed.getLeft()?.getValue()).toBe(99)
      expect(reconstructed.getRight()?.getValue()).toBe(3)
    })

    it('reconstructs after deep modification via goUp chain', () => {
      const t = new Tree(1, new Tree(2, new Tree(4), new Tree(5)), new Tree(3))
      const z = Zipper.fromTree(t).goLeft()!.goLeft()!.setValue(40)
      const root = z.goUp()!.goUp()!
      const reconstructed = root.toTree()
      expect(reconstructed.getLeft()?.getLeft()?.getValue()).toBe(40)
      expect(reconstructed.getRight()?.getValue()).toBe(3)
    })

    it('toTree from root returns original structure', () => {
      const t = new Tree(1, new Tree(2, new Tree(4), new Tree(5)), new Tree(3))
      const reconstructed = Zipper.fromTree(t).toTree()
      expect(reconstructed.getValue()).toBe(1)
      expect(reconstructed.getLeft()?.getValue()).toBe(2)
      expect(reconstructed.getRight()?.getValue()).toBe(3)
    })
  })
})
