import { LinkCutTree } from '../src/core/link-cut-tree/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('LinkCutTree', () => {
  describe('constructor', () => {
    it('creates a tree with specified nodes', () => {
      const lct = new LinkCutTree(5)
      expect(lct.size).toBe(5)
      expect(lct.getSize()).toBe(5)
    })
  })

  // ─── Link ────────────────────────────────────────────────────────────────

  describe('link', () => {
    it('links two nodes', () => {
      const lct = new LinkCutTree(3)
      lct.link(0, 1)
      expect(lct.connected(0, 1)).toBe(true)
    })

    it('does not link invalid nodes', () => {
      const lct = new LinkCutTree(2)
      lct.link(-1, 0)
      lct.link(0, 5)
      expect(lct.connected(0, 5)).toBe(false)
    })

    it('does not link same node to itself', () => {
      const lct = new LinkCutTree(2)
      lct.link(0, 0)
    })

    it('does not double-link already connected nodes', () => {
      const lct = new LinkCutTree(3)
      lct.link(0, 1)
      lct.link(0, 1)
      expect(lct.connected(0, 1)).toBe(true)
    })
  })

  // ─── Cut ─────────────────────────────────────────────────────────────────

  describe('cut', () => {
    it('cuts a node from its parent', () => {
      const lct = new LinkCutTree(3)
      lct.link(0, 1)
      lct.cut(0)
      expect(lct.connected(0, 1)).toBe(false)
    })
  })

  // ─── Connected / IsSameTree ──────────────────────────────────────────────

  describe('connected and isSameTree', () => {
    it('detects disconnected nodes', () => {
      const lct = new LinkCutTree(4)
      expect(lct.connected(0, 1)).toBe(false)
      expect(lct.isSameTree(0, 1)).toBe(false)
    })

    it('detects connected nodes through path', () => {
      const lct = new LinkCutTree(5)
      lct.link(0, 1)
      lct.link(1, 2)
      expect(lct.connected(0, 2)).toBe(true)
    })

    it('isConnected is an alias', () => {
      const lct = new LinkCutTree(3)
      lct.link(0, 1)
      expect(lct.isConnected(0, 1)).toBe(true)
    })

    it('returns false for invalid nodes', () => {
      const lct = new LinkCutTree(2)
      expect(lct.connected(-1, 0)).toBe(false)
      expect(lct.connected(0, 5)).toBe(false)
    })
  })

  // ─── FindRoot ────────────────────────────────────────────────────────────

  describe('findRoot', () => {
    it('finds root of a tree', () => {
      const lct = new LinkCutTree(3)
      lct.link(0, 1)
      expect(lct.findRoot(0)).toBe(lct.findRoot(1))
    })

    it('returns -1 for invalid node', () => {
      const lct = new LinkCutTree(2)
      expect(lct.findRoot(-1)).toBe(-1)
      expect(lct.findRoot(5)).toBe(-1)
    })
  })

  // ─── Weight Operations ───────────────────────────────────────────────────

  describe('weight operations', () => {
    it('setWeight and getWeight', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(0, 42)
      expect(lct.getWeight(0)).toBe(42)
    })

    it('getValue and setValue are aliases', () => {
      const lct = new LinkCutTree(2)
      lct.setValue(0, 10)
      expect(lct.getValue(0)).toBe(10)
    })

    it('getWeight returns 0 for invalid node', () => {
      const lct = new LinkCutTree(2)
      expect(lct.getWeight(-1)).toBe(0)
      expect(lct.getWeight(5)).toBe(0)
    })
  })

  // ─── Path Aggregate ──────────────────────────────────────────────────────

  describe('path aggregate', () => {
    it('pathMin, pathMax, pathSum on connected path', () => {
      const lct = new LinkCutTree(4)
      lct.setWeight(0, 10)
      lct.setWeight(1, 20)
      lct.setWeight(2, 30)
      lct.link(0, 1)
      lct.link(1, 2)
      expect(lct.pathMin(0, 2)).toBe(10)
      expect(lct.pathMax(0, 2)).toBe(30)
      expect(lct.pathSum(0, 2)).toBe(60)
    })

    it('returns 0 for disconnected nodes', () => {
      const lct = new LinkCutTree(3)
      expect(lct.pathSum(0, 1)).toBe(0)
    })
  })

  // ─── LCA ─────────────────────────────────────────────────────────────────

  describe('lca', () => {
    it('finds lowest common ancestor', () => {
      const lct = new LinkCutTree(4)
      lct.link(2, 1)
      lct.link(3, 1)
      const lca = lct.lca(2, 3)
      expect(lca).toBe(1)
    })

    it('returns -1 for disconnected', () => {
      const lct = new LinkCutTree(3)
      expect(lct.lca(0, 1)).toBe(-1)
    })

    it('returns node itself for same node', () => {
      const lct = new LinkCutTree(2)
      expect(lct.lca(0, 0)).toBe(0)
    })
  })

  // ─── Depth ───────────────────────────────────────────────────────────────

  describe('getDepth', () => {
    it('returns depth of node', () => {
      const lct = new LinkCutTree(4)
      lct.link(0, 1)
      lct.link(1, 2)
      expect(lct.getDepth(2)).toBe(0)
      expect(lct.getDepth(0)).toBe(2)
    })

    it('returns -1 for invalid', () => {
      const lct = new LinkCutTree(2)
      expect(lct.getDepth(-1)).toBe(-1)
    })
  })

  // ─── Clone ───────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates independent copy', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(0, 42)
      lct.link(0, 1)
      const copy = lct.clone()
      expect(copy.getWeight(0)).toBe(42)
      expect(copy.connected(0, 1)).toBe(true)
    })
  })
})
