import { describe, it, expect } from 'vitest'
import { LinkCutTree } from '../../src/core/link-cut-tree/index.js'

function buildRootedChain(n: number): LinkCutTree {
  const lct = new LinkCutTree(n)
  for (let i = n - 1; i >= 1; i--) {
    lct.link(i, i - 1)
  }
  return lct
}

function buildRootedStar(n: number): LinkCutTree {
  const lct = new LinkCutTree(n)
  for (let i = n - 1; i >= 1; i--) {
    lct.link(i, 0)
  }
  return lct
}

function buildRootedBinaryTree(levels: number): { lct: LinkCutTree; n: number } {
  const n = (1 << levels) - 1
  const lct = new LinkCutTree(n)
  const order: number[] = []
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    order.push(i)
  }
  for (const i of order) {
    lct.link(2 * i + 2, i)
    lct.link(2 * i + 1, i)
  }
  return { lct, n }
}

describe('LinkCutTree', () => {
  describe('constructor', () => {
    it('should create LCT with size 1', () => {
      const lct = new LinkCutTree(1)
      expect(lct.getSize()).toBe(1)
    })

    it('should create LCT with size 10', () => {
      const lct = new LinkCutTree(10)
      expect(lct.getSize()).toBe(10)
    })

    it('should create LCT with size 0', () => {
      const lct = new LinkCutTree(0)
      expect(lct.getSize()).toBe(0)
    })

    it('should initialize all weights to 0', () => {
      const lct = new LinkCutTree(5)
      for (let i = 0; i < 5; i++) {
        expect(lct.getWeight(i)).toBe(0)
      }
    })

    it('should have all nodes as separate roots', () => {
      const lct = new LinkCutTree(5)
      for (let i = 0; i < 5; i++) {
        expect(lct.findRoot(i)).toBe(i)
      }
    })

    it('should have depth 0 for all isolated nodes', () => {
      const lct = new LinkCutTree(5)
      for (let i = 0; i < 5; i++) {
        expect(lct.getDepth(i)).toBe(0)
      }
    })

    it('should have no parent for isolated nodes', () => {
      const lct = new LinkCutTree(5)
      for (let i = 0; i < 5; i++) {
        expect(lct.getParent(i)).toBe(-1)
      }
    })
  })

  describe('link', () => {
    it('should link two nodes', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      expect(lct.connected(0, 1)).toBe(true)
    })

    it('should form a chain of 5', () => {
      const lct = buildRootedChain(5)
      for (let i = 0; i < 4; i++) {
        expect(lct.connected(i, i + 1)).toBe(true)
      }
      expect(lct.connected(0, 4)).toBe(true)
    })

    it('should form a star', () => {
      const lct = buildRootedStar(5)
      for (let i = 1; i < 5; i++) {
        expect(lct.connected(0, i)).toBe(true)
      }
      expect(lct.connected(1, 2)).toBe(true)
    })

    it('should not link a node to itself', () => {
      const lct = new LinkCutTree(3)
      lct.link(0, 0)
      expect(lct.connected(0, 0)).toBe(true)
    })

    it('should not create duplicate link', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      lct.link(1, 0)
      expect(lct.connected(0, 1)).toBe(true)
    })

    it('should not link already connected nodes', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(2, 0)
      expect(lct.connected(0, 2)).toBe(true)
    })

    it('should ignore out of range nodes', () => {
      const lct = new LinkCutTree(3)
      lct.link(-1, 0)
      lct.link(0, 5)
      expect(lct.connected(0, 1)).toBe(false)
    })

    it('should build binary tree', () => {
      const { lct, n } = buildRootedBinaryTree(3)
      expect(n).toBe(7)
      expect(lct.connected(0, 6)).toBe(true)
      expect(lct.connected(3, 5)).toBe(true)
    })

    it('should handle link in reverse order', () => {
      const lct = new LinkCutTree(3)
      lct.link(0, 1)
      expect(lct.connected(0, 1)).toBe(true)
    })

    it('should handle link after cut', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.cut(1)
      expect(lct.connected(0, 1)).toBe(false)
      lct.link(1, 0)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.connected(1, 2)).toBe(true)
    })

    it('should handle bidirectional connectivity', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.connected(1, 0)).toBe(true)
    })
  })

  describe('cut', () => {
    it('should cut a single edge', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      expect(lct.connected(0, 1)).toBe(true)
      lct.cut(1)
      expect(lct.connected(0, 1)).toBe(false)
    })

    it('should cut middle of chain', () => {
      const lct = buildRootedChain(5)
      lct.cut(3)
      expect(lct.connected(0, 2)).toBe(true)
      expect(lct.connected(3, 4)).toBe(true)
      expect(lct.connected(2, 3)).toBe(false)
    })

    it('should handle cut on isolated node', () => {
      const lct = new LinkCutTree(3)
      lct.cut(0)
      expect(lct.findRoot(0)).toBe(0)
    })

    it('should handle cut on leaf node', () => {
      const lct = buildRootedChain(3)
      lct.cut(2)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.connected(1, 2)).toBe(false)
    })

    it('should handle cut on internal node', () => {
      const lct = buildRootedChain(5)
      lct.cut(2)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.connected(2, 3)).toBe(true)
      expect(lct.connected(1, 2)).toBe(false)
      expect(lct.connected(0, 4)).toBe(false)
    })

    it('should handle out of range cut', () => {
      const lct = new LinkCutTree(3)
      lct.cut(-1)
      lct.cut(5)
    })

    it('should handle multiple cuts', () => {
      const lct = buildRootedChain(5)
      lct.cut(2)
      lct.cut(4)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.connected(2, 2)).toBe(true)
      expect(lct.connected(0, 2)).toBe(false)
      expect(lct.connected(3, 4)).toBe(false)
    })

    it('should handle cut and re-link', () => {
      const lct = new LinkCutTree(4)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(3, 2)
      lct.cut(2)
      lct.link(2, 0)
      expect(lct.connected(0, 3)).toBe(true)
      expect(lct.connected(0, 2)).toBe(true)
      expect(lct.connected(1, 3)).toBe(true)
    })

    it('should handle cut in star', () => {
      const lct = buildRootedStar(5)
      lct.cut(2)
      expect(lct.connected(0, 2)).toBe(false)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.connected(0, 3)).toBe(true)
    })

    it('should handle cut on root does nothing', () => {
      const lct = buildRootedChain(4)
      lct.cut(0)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.connected(1, 2)).toBe(true)
    })
  })

  describe('findRoot', () => {
    it('should return itself for isolated node', () => {
      const lct = new LinkCutTree(3)
      expect(lct.findRoot(0)).toBe(0)
    })

    it('should return root of chain', () => {
      const lct = buildRootedChain(5)
      for (let i = 0; i < 5; i++) {
        expect(lct.findRoot(i)).toBe(0)
      }
    })

    it('should return root of star', () => {
      const lct = buildRootedStar(5)
      for (let i = 0; i < 5; i++) {
        expect(lct.findRoot(i)).toBe(0)
      }
    })

    it('should update after cut', () => {
      const lct = buildRootedChain(5)
      lct.cut(3)
      expect(lct.findRoot(0)).toBe(0)
      expect(lct.findRoot(3)).toBe(3)
    })

    it('should return -1 for out of range', () => {
      const lct = new LinkCutTree(3)
      expect(lct.findRoot(-1)).toBe(-1)
      expect(lct.findRoot(5)).toBe(-1)
    })

    it('should handle root change after cut and relink', () => {
      const lct = buildRootedChain(5)
      lct.cut(2)
      expect(lct.findRoot(3)).toBe(2)
      lct.link(2, 1)
      expect(lct.findRoot(3)).toBe(0)
    })

    it('should find root in binary tree', () => {
      const { lct } = buildRootedBinaryTree(3)
      for (let i = 0; i < 7; i++) {
        expect(lct.findRoot(i)).toBe(0)
      }
    })
  })

  describe('isSameTree / connected', () => {
    it('should return true for same node', () => {
      const lct = new LinkCutTree(3)
      expect(lct.isSameTree(0, 0)).toBe(true)
    })

    it('should return false for disconnected nodes', () => {
      const lct = new LinkCutTree(3)
      expect(lct.isSameTree(0, 1)).toBe(false)
    })

    it('should return true after link', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      expect(lct.isSameTree(0, 1)).toBe(true)
    })

    it('should return false after cut', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      lct.cut(1)
      expect(lct.isSameTree(0, 1)).toBe(false)
    })

    it('should handle out of range', () => {
      const lct = new LinkCutTree(3)
      expect(lct.isSameTree(-1, 0)).toBe(false)
      expect(lct.isSameTree(0, 5)).toBe(false)
    })

    it('connected should be alias for isSameTree', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      expect(lct.connected(0, 1)).toBe(lct.isSameTree(0, 1))
    })

    it('should handle transitive connectivity', () => {
      const lct = new LinkCutTree(4)
      lct.link(1, 0)
      lct.link(3, 2)
      expect(lct.connected(0, 3)).toBe(false)
      lct.link(2, 1)
      expect(lct.connected(0, 3)).toBe(true)
    })
  })

  describe('getParent', () => {
    it('should return -1 for isolated node', () => {
      const lct = new LinkCutTree(3)
      expect(lct.getParent(0)).toBe(-1)
    })

    it('should return parent in chain', () => {
      const lct = buildRootedChain(5)
      for (let i = 1; i < 5; i++) {
        expect(lct.getParent(i)).toBe(i - 1)
      }
    })

    it('should return -1 for root of chain', () => {
      const lct = buildRootedChain(5)
      expect(lct.getParent(0)).toBe(-1)
    })

    it('should return parent in star', () => {
      const lct = buildRootedStar(5)
      for (let i = 1; i < 5; i++) {
        expect(lct.getParent(i)).toBe(0)
      }
    })

    it('should return -1 for root of star', () => {
      const lct = buildRootedStar(5)
      expect(lct.getParent(0)).toBe(-1)
    })

    it('should return -1 for out of range', () => {
      const lct = new LinkCutTree(3)
      expect(lct.getParent(-1)).toBe(-1)
      expect(lct.getParent(5)).toBe(-1)
    })

    it('should update after cut', () => {
      const lct = buildRootedChain(5)
      lct.cut(3)
      expect(lct.getParent(3)).toBe(-1)
      expect(lct.getParent(2)).toBe(1)
    })

    it('should return parent in binary tree', () => {
      const { lct } = buildRootedBinaryTree(3)
      expect(lct.getParent(0)).toBe(-1)
      expect(lct.getParent(1)).toBe(0)
      expect(lct.getParent(2)).toBe(0)
      expect(lct.getParent(3)).toBe(1)
      expect(lct.getParent(4)).toBe(1)
      expect(lct.getParent(5)).toBe(2)
      expect(lct.getParent(6)).toBe(2)
    })
  })

  describe('getDepth', () => {
    it('should return 0 for isolated node', () => {
      const lct = new LinkCutTree(3)
      expect(lct.getDepth(0)).toBe(0)
    })

    it('should return depth in chain', () => {
      const lct = buildRootedChain(5)
      for (let i = 0; i < 5; i++) {
        expect(lct.getDepth(i)).toBe(i)
      }
    })

    it('should return depth in star', () => {
      const lct = buildRootedStar(5)
      expect(lct.getDepth(0)).toBe(0)
      for (let i = 1; i < 5; i++) {
        expect(lct.getDepth(i)).toBe(1)
      }
    })

    it('should return depth in binary tree', () => {
      const { lct } = buildRootedBinaryTree(3)
      expect(lct.getDepth(0)).toBe(0)
      expect(lct.getDepth(1)).toBe(1)
      expect(lct.getDepth(2)).toBe(1)
      expect(lct.getDepth(3)).toBe(2)
      expect(lct.getDepth(4)).toBe(2)
      expect(lct.getDepth(5)).toBe(2)
      expect(lct.getDepth(6)).toBe(2)
    })

    it('should return -1 for out of range', () => {
      const lct = new LinkCutTree(3)
      expect(lct.getDepth(-1)).toBe(-1)
      expect(lct.getDepth(5)).toBe(-1)
    })

    it('should update after cut', () => {
      const lct = buildRootedChain(5)
      lct.cut(3)
      expect(lct.getDepth(0)).toBe(0)
      expect(lct.getDepth(3)).toBe(0)
      expect(lct.getDepth(4)).toBe(1)
    })
  })

  describe('lca', () => {
    it('should return the node itself for same node', () => {
      const lct = buildRootedChain(5)
      expect(lct.lca(2, 2)).toBe(2)
    })

    it('should return root for endpoints of chain', () => {
      const lct = buildRootedChain(5)
      expect(lct.lca(0, 4)).toBe(0)
    })

    it('should return ancestor in chain', () => {
      const lct = buildRootedChain(5)
      expect(lct.lca(2, 4)).toBe(2)
      expect(lct.lca(1, 3)).toBe(1)
    })

    it('should return center of star', () => {
      const lct = buildRootedStar(5)
      expect(lct.lca(1, 2)).toBe(0)
      expect(lct.lca(3, 4)).toBe(0)
      expect(lct.lca(0, 3)).toBe(0)
    })

    it('should compute lca in binary tree', () => {
      const { lct } = buildRootedBinaryTree(3)
      expect(lct.lca(3, 4)).toBe(1)
      expect(lct.lca(5, 6)).toBe(2)
      expect(lct.lca(3, 5)).toBe(0)
      expect(lct.lca(3, 6)).toBe(0)
      expect(lct.lca(1, 2)).toBe(0)
    })

    it('should return -1 for disconnected nodes', () => {
      const lct = new LinkCutTree(4)
      lct.link(1, 0)
      lct.link(3, 2)
      expect(lct.lca(0, 2)).toBe(-1)
    })

    it('should return -1 for out of range', () => {
      const lct = new LinkCutTree(3)
      expect(lct.lca(-1, 0)).toBe(-1)
      expect(lct.lca(0, 5)).toBe(-1)
    })

    it('should handle ancestor-descendant', () => {
      const { lct } = buildRootedBinaryTree(3)
      expect(lct.lca(0, 3)).toBe(0)
      expect(lct.lca(0, 6)).toBe(0)
      expect(lct.lca(1, 3)).toBe(1)
      expect(lct.lca(2, 5)).toBe(2)
    })

    it('should be commutative', () => {
      const { lct } = buildRootedBinaryTree(3)
      for (let i = 0; i < 7; i++) {
        for (let j = i + 1; j < 7; j++) {
          expect(lct.lca(i, j)).toBe(lct.lca(j, i))
        }
      }
    })

    it('should handle lca after cut and relink', () => {
      const lct = buildRootedChain(5)
      lct.cut(3)
      expect(lct.lca(2, 4)).toBe(-1)
      lct.link(3, 2)
      expect(lct.lca(0, 4)).toBe(0)
    })
  })

  describe('pathAggregate', () => {
    it('should return weight for single node path', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(0, 5)
      const result = lct.pathAggregate(0, 0)
      expect(result.min).toBe(5)
      expect(result.max).toBe(5)
      expect(result.sum).toBe(5)
      expect(result.size).toBe(1)
    })

    it('should aggregate two nodes', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      lct.setWeight(0, 3)
      lct.setWeight(1, 7)
      const result = lct.pathAggregate(0, 1)
      expect(result.min).toBe(3)
      expect(result.max).toBe(7)
      expect(result.sum).toBe(10)
      expect(result.size).toBe(2)
    })

    it('should aggregate chain', () => {
      const lct = buildRootedChain(4)
      lct.setWeight(0, 1)
      lct.setWeight(1, 5)
      lct.setWeight(2, 3)
      lct.setWeight(3, 9)
      const result = lct.pathAggregate(0, 3)
      expect(result.min).toBe(1)
      expect(result.max).toBe(9)
      expect(result.sum).toBe(18)
      expect(result.size).toBe(4)
    })

    it('should aggregate partial path', () => {
      const lct = buildRootedChain(5)
      lct.setWeight(0, 10)
      lct.setWeight(1, 20)
      lct.setWeight(2, 30)
      lct.setWeight(3, 40)
      lct.setWeight(4, 50)
      const result = lct.pathAggregate(1, 3)
      expect(result.min).toBe(20)
      expect(result.max).toBe(40)
      expect(result.sum).toBe(90)
      expect(result.size).toBe(3)
    })

    it('should return zeros for disconnected nodes', () => {
      const lct = new LinkCutTree(4)
      lct.setWeight(0, 5)
      lct.setWeight(1, 10)
      const result = lct.pathAggregate(0, 1)
      expect(result.size).toBe(0)
    })

    it('should return zeros for out of range', () => {
      const lct = new LinkCutTree(3)
      const result = lct.pathAggregate(-1, 0)
      expect(result.size).toBe(0)
    })

    it('should aggregate in star', () => {
      const lct = buildRootedStar(4)
      lct.setWeight(0, 100)
      lct.setWeight(1, 10)
      lct.setWeight(2, 20)
      lct.setWeight(3, 30)
      const result = lct.pathAggregate(1, 3)
      expect(result.min).toBe(10)
      expect(result.max).toBe(100)
      expect(result.sum).toBe(140)
      expect(result.size).toBe(3)
    })

    it('should aggregate in binary tree', () => {
      const { lct } = buildRootedBinaryTree(3)
      lct.setWeight(0, 1)
      lct.setWeight(1, 2)
      lct.setWeight(2, 3)
      lct.setWeight(3, 4)
      lct.setWeight(4, 5)
      lct.setWeight(5, 6)
      lct.setWeight(6, 7)
      const result = lct.pathAggregate(3, 6)
      expect(result.min).toBe(1)
      expect(result.max).toBe(7)
      expect(result.sum).toBe(17)
      expect(result.size).toBe(5)
    })

    it('should handle negative weights', () => {
      const lct = buildRootedChain(3)
      lct.setWeight(0, -5)
      lct.setWeight(1, 10)
      lct.setWeight(2, -3)
      const result = lct.pathAggregate(0, 2)
      expect(result.min).toBe(-5)
      expect(result.max).toBe(10)
      expect(result.sum).toBe(2)
      expect(result.size).toBe(3)
    })

    it('should update after weight change', () => {
      const lct = buildRootedChain(3)
      lct.setWeight(0, 1)
      lct.setWeight(1, 2)
      lct.setWeight(2, 3)
      let result = lct.pathAggregate(0, 2)
      expect(result.sum).toBe(6)
      lct.setWeight(1, 10)
      result = lct.pathAggregate(0, 2)
      expect(result.sum).toBe(14)
    })

    it('should handle same node aggregate', () => {
      const lct = new LinkCutTree(1)
      lct.setWeight(0, 42)
      const result = lct.pathAggregate(0, 0)
      expect(result.sum).toBe(42)
      expect(result.size).toBe(1)
    })

    it('should be commutative', () => {
      const lct = buildRootedChain(4)
      lct.setWeight(0, 1)
      lct.setWeight(1, 5)
      lct.setWeight(2, 3)
      lct.setWeight(3, 9)
      const r1 = lct.pathAggregate(0, 3)
      const r2 = lct.pathAggregate(3, 0)
      expect(r1.sum).toBe(r2.sum)
      expect(r1.min).toBe(r2.min)
      expect(r1.max).toBe(r2.max)
      expect(r1.size).toBe(r2.size)
    })
  })

  describe('setWeight / getWeight', () => {
    it('should set and get weight', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(0, 42)
      expect(lct.getWeight(0)).toBe(42)
    })

    it('should update weight', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(0, 10)
      lct.setWeight(0, 20)
      expect(lct.getWeight(0)).toBe(20)
    })

    it('should handle negative weight', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(0, -5)
      expect(lct.getWeight(0)).toBe(-5)
    })

    it('should handle zero weight', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(0, 100)
      lct.setWeight(0, 0)
      expect(lct.getWeight(0)).toBe(0)
    })

    it('should ignore out of range set', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(-1, 10)
      lct.setWeight(5, 10)
    })

    it('should return 0 for out of range get', () => {
      const lct = new LinkCutTree(3)
      expect(lct.getWeight(-1)).toBe(0)
      expect(lct.getWeight(5)).toBe(0)
    })

    it('should handle weight on linked tree', () => {
      const lct = buildRootedChain(3)
      lct.setWeight(0, 1)
      lct.setWeight(1, 2)
      lct.setWeight(2, 3)
      expect(lct.getWeight(1)).toBe(2)
    })
  })

  describe('getSize', () => {
    it('should return correct size', () => {
      const lct = new LinkCutTree(10)
      expect(lct.getSize()).toBe(10)
    })

    it('should return 0 for empty', () => {
      const lct = new LinkCutTree(0)
      expect(lct.getSize()).toBe(0)
    })

    it('should not change after link', () => {
      const lct = new LinkCutTree(5)
      lct.link(1, 0)
      expect(lct.getSize()).toBe(5)
    })

    it('should not change after cut', () => {
      const lct = buildRootedChain(5)
      lct.cut(2)
      expect(lct.getSize()).toBe(5)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const lct = buildRootedChain(3)
      const copy = lct.clone()
      expect(copy.getSize()).toBe(3)
      expect(copy.connected(0, 2)).toBe(true)
    })

    it('should preserve weights', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(0, 10)
      lct.setWeight(1, 20)
      lct.setWeight(2, 30)
      lct.link(1, 0)
      lct.link(2, 1)
      const copy = lct.clone()
      expect(copy.getWeight(0)).toBe(10)
      expect(copy.getWeight(1)).toBe(20)
      expect(copy.getWeight(2)).toBe(30)
    })

    it('should be independent after cut on original', () => {
      const lct = buildRootedChain(4)
      const copy = lct.clone()
      lct.cut(2)
      expect(lct.connected(0, 3)).toBe(false)
      expect(copy.connected(0, 3)).toBe(true)
    })

    it('should be independent after cut on clone', () => {
      const lct = buildRootedChain(4)
      const copy = lct.clone()
      copy.cut(2)
      expect(lct.connected(0, 3)).toBe(true)
      expect(copy.connected(0, 3)).toBe(false)
    })

    it('should clone star graph', () => {
      const lct = buildRootedStar(5)
      const copy = lct.clone()
      for (let i = 1; i < 5; i++) {
        expect(copy.connected(0, i)).toBe(true)
      }
    })

    it('should clone isolated nodes', () => {
      const lct = new LinkCutTree(3)
      const copy = lct.clone()
      expect(copy.connected(0, 1)).toBe(false)
    })

    it('should preserve structure of binary tree', () => {
      const { lct } = buildRootedBinaryTree(3)
      const copy = lct.clone()
      expect(copy.connected(0, 6)).toBe(true)
      expect(copy.connected(3, 5)).toBe(true)
    })
  })

  describe('dynamic tree operations', () => {
    it('should handle cut and reattach', () => {
      const lct = new LinkCutTree(5)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(3, 2)
      lct.link(4, 3)
      lct.cut(2)
      lct.link(2, 0)
      expect(lct.connected(0, 4)).toBe(true)
      expect(lct.getDepth(2)).toBe(1)
    })

    it('should handle multiple dynamic operations', () => {
      const lct = new LinkCutTree(6)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(4, 3)
      lct.link(5, 4)
      expect(lct.connected(0, 2)).toBe(true)
      expect(lct.connected(3, 5)).toBe(true)
      expect(lct.connected(0, 3)).toBe(false)
      lct.cut(1)
      lct.link(3, 2)
      expect(lct.connected(0, 5)).toBe(false)
      expect(lct.connected(1, 5)).toBe(true)
      expect(lct.connected(2, 5)).toBe(true)
      lct.link(0, 1)
      expect(lct.connected(0, 5)).toBe(true)
    })

    it('should handle long chain operations', () => {
      const lct = new LinkCutTree(5)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(3, 2)
      lct.link(4, 3)
      expect(lct.getDepth(4)).toBe(4)
      expect(lct.getParent(4)).toBe(3)
    })

    it('should handle star-like tree', () => {
      const lct = new LinkCutTree(4)
      lct.link(1, 0)
      lct.link(2, 0)
      lct.link(3, 0)
      expect(lct.connected(1, 3)).toBe(true)
      expect(lct.lca(1, 3)).toBe(0)
    })
  })

  describe('stress tests', () => {
    it('should handle 100-node chain', () => {
      const lct = buildRootedChain(100)
      expect(lct.connected(0, 99)).toBe(true)
      expect(lct.getDepth(99)).toBe(99)
      expect(lct.findRoot(99)).toBe(0)
    })

    it('should handle 100-node star', () => {
      const lct = buildRootedStar(100)
      for (let i = 1; i < 100; i++) {
        expect(lct.connected(0, i)).toBe(true)
      }
      expect(lct.lca(50, 75)).toBe(0)
    })

    it('should handle 127-node binary tree', () => {
      const { lct, n } = buildRootedBinaryTree(7)
      expect(n).toBe(127)
      expect(lct.connected(0, 126)).toBe(true)
      expect(lct.lca(64, 126)).toBe(0)
    })

    it('should handle 200-node chain with cuts', () => {
      const lct = buildRootedChain(200)
      lct.cut(100)
      expect(lct.connected(0, 99)).toBe(true)
      expect(lct.connected(100, 199)).toBe(true)
      expect(lct.connected(99, 100)).toBe(false)
    })

    it('should handle random tree operations', () => {
      const n = 50
      const lct = new LinkCutTree(n)
      for (let i = n - 1; i >= 1; i--) {
        lct.link(i, Math.floor(Math.random() * i))
      }
      expect(lct.connected(0, n - 1)).toBe(true)
    })

    it('should handle sequential link-cut cycles', () => {
      const lct = new LinkCutTree(4)
      for (let cycle = 0; cycle < 10; cycle++) {
        lct.link(1, 0)
        lct.link(2, 1)
        lct.link(3, 2)
        expect(lct.connected(0, 3)).toBe(true)
        lct.cut(1)
        expect(lct.connected(0, 3)).toBe(false)
        lct.link(1, 0)
        lct.cut(2)
        expect(lct.connected(1, 3)).toBe(false)
        lct.cut(1)
        lct.cut(2)
      }
    })

    it('should handle 500-node chain', () => {
      const lct = buildRootedChain(500)
      expect(lct.connected(0, 499)).toBe(true)
      expect(lct.getDepth(499)).toBe(499)
      expect(lct.lca(100, 400)).toBe(100)
    })

    it('should handle 500-node star', () => {
      const lct = buildRootedStar(500)
      expect(lct.connected(0, 499)).toBe(true)
      for (let i = 1; i < 500; i++) {
        expect(lct.getParent(i)).toBe(0)
        expect(lct.getDepth(i)).toBe(1)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle single node tree', () => {
      const lct = new LinkCutTree(1)
      expect(lct.findRoot(0)).toBe(0)
      expect(lct.getDepth(0)).toBe(0)
      expect(lct.getParent(0)).toBe(-1)
      expect(lct.connected(0, 0)).toBe(true)
      expect(lct.getWeight(0)).toBe(0)
    })

    it('should handle two node tree', () => {
      const lct = new LinkCutTree(2)
      lct.link(1, 0)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.findRoot(1)).toBe(0)
      expect(lct.getParent(1)).toBe(0)
      expect(lct.getDepth(1)).toBe(1)
      expect(lct.lca(0, 1)).toBe(0)
    })

    it('should handle two node tree cut', () => {
      const lct = new LinkCutTree(2)
      lct.link(1, 0)
      lct.cut(1)
      expect(lct.connected(0, 1)).toBe(false)
      expect(lct.getParent(1)).toBe(-1)
      expect(lct.getDepth(1)).toBe(0)
    })

    it('should handle empty tree', () => {
      const lct = new LinkCutTree(0)
      expect(lct.getSize()).toBe(0)
    })

    it('should handle weight of single node', () => {
      const lct = new LinkCutTree(1)
      lct.setWeight(0, 42)
      expect(lct.getWeight(0)).toBe(42)
    })

    it('should handle path aggregate of single node', () => {
      const lct = new LinkCutTree(1)
      lct.setWeight(0, 7)
      const result = lct.pathAggregate(0, 0)
      expect(result.min).toBe(7)
      expect(result.max).toBe(7)
      expect(result.sum).toBe(7)
      expect(result.size).toBe(1)
    })

    it('should handle large weights', () => {
      const lct = new LinkCutTree(2)
      lct.link(1, 0)
      lct.setWeight(0, Number.MAX_SAFE_INTEGER)
      lct.setWeight(1, Number.MAX_SAFE_INTEGER)
      const result = lct.pathAggregate(0, 1)
      expect(result.sum).toBe(Number.MAX_SAFE_INTEGER * 2)
    })
  })

  describe('lca consistency', () => {
    it('lca should be ancestor of both nodes', () => {
      const { lct } = buildRootedBinaryTree(3)
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const ancestor = lct.lca(i, j)
          expect(ancestor).toBeGreaterThanOrEqual(0)
        }
      }
    })

    it('lca should be reflexive', () => {
      const { lct } = buildRootedBinaryTree(3)
      for (let i = 0; i < 7; i++) {
        expect(lct.lca(i, i)).toBe(i)
      }
    })

    it('lca should be symmetric', () => {
      const { lct } = buildRootedBinaryTree(3)
      for (let i = 0; i < 7; i++) {
        for (let j = i + 1; j < 7; j++) {
          expect(lct.lca(i, j)).toBe(lct.lca(j, i))
        }
      }
    })

    it('depth of lca should be <= depth of both nodes', () => {
      const { lct } = buildRootedBinaryTree(3)
      for (let i = 0; i < 7; i++) {
        for (let j = i + 1; j < 7; j++) {
          const ancestor = lct.lca(i, j)
          expect(lct.getDepth(ancestor)).toBeLessThanOrEqual(lct.getDepth(i))
          expect(lct.getDepth(ancestor)).toBeLessThanOrEqual(lct.getDepth(j))
        }
      }
    })
  })

  describe('types module', () => {
    it('should export types module without error', async () => {
      const types = await import('../../src/core/link-cut-tree/types.js')
      expect(types).toBeDefined()
    })
  })

  describe('additional coverage', () => {
    it('should handle path aggregate on chain segment', () => {
      const lct = buildRootedChain(6)
      lct.setWeight(0, 1)
      lct.setWeight(1, 2)
      lct.setWeight(2, 3)
      lct.setWeight(3, 4)
      lct.setWeight(4, 5)
      lct.setWeight(5, 6)
      const result = lct.pathAggregate(2, 4)
      expect(result.sum).toBe(12)
      expect(result.size).toBe(3)
      expect(result.min).toBe(3)
      expect(result.max).toBe(5)
    })

    it('should handle pathAggregate with identical endpoints', () => {
      const lct = buildRootedStar(5)
      lct.setWeight(0, 50)
      lct.setWeight(3, 25)
      const result = lct.pathAggregate(3, 3)
      expect(result.sum).toBe(25)
      expect(result.size).toBe(1)
    })

    it('should handle lca on same component after cuts and relinks', () => {
      const lct = new LinkCutTree(5)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(3, 2)
      lct.link(4, 3)
      lct.cut(2)
      lct.link(2, 0)
      expect(lct.lca(4, 1)).toBe(0)
      expect(lct.lca(3, 4)).toBe(3)
    })

    it('should handle getDepth after rerooting via link', () => {
      const lct = new LinkCutTree(4)
      lct.link(1, 0)
      lct.link(2, 0)
      lct.link(3, 0)
      expect(lct.getDepth(1)).toBe(1)
      expect(lct.getDepth(2)).toBe(1)
      expect(lct.getDepth(3)).toBe(1)
      expect(lct.getDepth(0)).toBe(0)
    })

    it('should handle multiple components', () => {
      const lct = new LinkCutTree(6)
      lct.link(1, 0)
      lct.link(3, 2)
      lct.link(5, 4)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.connected(2, 3)).toBe(true)
      expect(lct.connected(4, 5)).toBe(true)
      expect(lct.connected(0, 2)).toBe(false)
      expect(lct.connected(0, 4)).toBe(false)
      expect(lct.connected(2, 4)).toBe(false)
      expect(lct.findRoot(1)).toBe(0)
      expect(lct.findRoot(3)).toBe(2)
      expect(lct.findRoot(5)).toBe(4)
    })

    it('should handle merging components via link', () => {
      const lct = new LinkCutTree(6)
      lct.link(1, 0)
      lct.link(3, 2)
      lct.link(5, 4)
      lct.link(2, 0)
      expect(lct.connected(0, 3)).toBe(true)
      expect(lct.connected(1, 3)).toBe(true)
      expect(lct.connected(0, 5)).toBe(false)
      lct.link(4, 2)
      expect(lct.connected(0, 5)).toBe(true)
      expect(lct.connected(1, 5)).toBe(true)
    })

    it('should handle splitting and merging repeatedly', () => {
      const lct = new LinkCutTree(4)
      for (let round = 0; round < 5; round++) {
        lct.link(1, 0)
        lct.link(2, 1)
        lct.link(3, 2)
        expect(lct.connected(0, 3)).toBe(true)
        lct.cut(2)
        expect(lct.connected(0, 1)).toBe(true)
        expect(lct.connected(2, 3)).toBe(true)
        expect(lct.connected(0, 3)).toBe(false)
        lct.cut(1)
        lct.cut(2)
        lct.cut(3)
      }
    })

    it('should handle 15-node binary tree lca', () => {
      const { lct, n } = buildRootedBinaryTree(4)
      expect(n).toBe(15)
      expect(lct.lca(7, 8)).toBe(3)
      expect(lct.lca(9, 10)).toBe(4)
      expect(lct.lca(11, 12)).toBe(5)
      expect(lct.lca(13, 14)).toBe(6)
      expect(lct.lca(7, 14)).toBe(0)
      expect(lct.lca(8, 11)).toBe(0)
    })

    it('should handle pathAggregate with zero weights', () => {
      const lct = buildRootedChain(3)
      const result = lct.pathAggregate(0, 2)
      expect(result.sum).toBe(0)
      expect(result.min).toBe(0)
      expect(result.max).toBe(0)
      expect(result.size).toBe(3)
    })

    it('should handle getParent after multiple reroots', () => {
      const lct = new LinkCutTree(5)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(3, 2)
      lct.link(4, 3)
      expect(lct.getParent(4)).toBe(3)
      lct.cut(3)
      lct.link(3, 1)
      expect(lct.getParent(4)).toBe(3)
      expect(lct.getParent(3)).toBe(1)
      expect(lct.getParent(2)).toBe(1)
    })

    it('should handle findRoot consistency across operations', () => {
      const lct = new LinkCutTree(5)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(3, 2)
      lct.link(4, 3)
      const root = lct.findRoot(4)
      expect(root).toBe(0)
      expect(lct.findRoot(0)).toBe(root)
      expect(lct.findRoot(2)).toBe(root)
    })

    it('should handle weight operations on disconnected forest', () => {
      const lct = new LinkCutTree(4)
      lct.setWeight(0, 10)
      lct.setWeight(1, 20)
      lct.setWeight(2, 30)
      lct.setWeight(3, 40)
      lct.link(1, 0)
      const result = lct.pathAggregate(0, 1)
      expect(result.sum).toBe(30)
      const empty = lct.pathAggregate(0, 2)
      expect(empty.size).toBe(0)
    })

    it('should handle lca of siblings in star', () => {
      const lct = buildRootedStar(6)
      for (let i = 1; i < 6; i++) {
        for (let j = i + 1; j < 6; j++) {
          expect(lct.lca(i, j)).toBe(0)
        }
      }
    })

    it('should handle depth after cut creates new root', () => {
      const lct = buildRootedChain(6)
      lct.cut(3)
      expect(lct.getDepth(3)).toBe(0)
      expect(lct.getDepth(4)).toBe(1)
      expect(lct.getDepth(5)).toBe(2)
      expect(lct.getDepth(0)).toBe(0)
      expect(lct.getDepth(1)).toBe(1)
      expect(lct.getDepth(2)).toBe(2)
    })
  })

  describe('isConnected', () => {
    it('returns true for same node', () => {
      const lct = new LinkCutTree(3)
      expect(lct.isConnected(0, 0)).toBe(true)
    })

    it('returns false for disconnected nodes', () => {
      const lct = new LinkCutTree(3)
      expect(lct.isConnected(0, 1)).toBe(false)
    })

    it('returns true after link', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      expect(lct.isConnected(0, 1)).toBe(true)
      expect(lct.isConnected(1, 0)).toBe(true)
    })

    it('returns false after cut', () => {
      const lct = buildRootedChain(4)
      lct.cut(2)
      expect(lct.isConnected(0, 3)).toBe(false)
      expect(lct.isConnected(0, 1)).toBe(true)
    })

    it('returns false for out of range', () => {
      const lct = new LinkCutTree(3)
      expect(lct.isConnected(-1, 0)).toBe(false)
      expect(lct.isConnected(0, 5)).toBe(false)
    })

    it('matches connected alias', () => {
      const lct = buildRootedChain(4)
      expect(lct.isConnected(0, 3)).toBe(lct.connected(0, 3))
      expect(lct.isConnected(1, 2)).toBe(lct.connected(1, 2))
    })
  })

  describe('setValue / getValue', () => {
    it('sets and gets value', () => {
      const lct = new LinkCutTree(3)
      lct.setValue(0, 42)
      expect(lct.getValue(0)).toBe(42)
    })

    it('updates value', () => {
      const lct = new LinkCutTree(3)
      lct.setValue(0, 10)
      lct.setValue(0, 20)
      expect(lct.getValue(0)).toBe(20)
    })

    it('aliases setWeight/getWeight', () => {
      const lct = new LinkCutTree(3)
      lct.setValue(0, 99)
      expect(lct.getWeight(0)).toBe(99)
      lct.setWeight(1, 77)
      expect(lct.getValue(1)).toBe(77)
    })

    it('handles negative values', () => {
      const lct = new LinkCutTree(3)
      lct.setValue(0, -100)
      expect(lct.getValue(0)).toBe(-100)
    })

    it('ignores out of range', () => {
      const lct = new LinkCutTree(3)
      lct.setValue(-1, 10)
      lct.setValue(5, 10)
      expect(lct.getValue(-1)).toBe(0)
      expect(lct.getValue(5)).toBe(0)
    })
  })

  describe('size getter', () => {
    it('returns correct size', () => {
      const lct = new LinkCutTree(10)
      expect(lct.size).toBe(10)
    })

    it('matches getSize', () => {
      const lct = new LinkCutTree(7)
      expect(lct.size).toBe(lct.getSize())
    })

    it('returns 0 for empty', () => {
      const lct = new LinkCutTree(0)
      expect(lct.size).toBe(0)
    })
  })

  describe('pathMin / pathMax / pathSum', () => {
    it('pathMin on chain', () => {
      const lct = buildRootedChain(4)
      lct.setWeight(0, 10)
      lct.setWeight(1, 3)
      lct.setWeight(2, 7)
      lct.setWeight(3, 1)
      expect(lct.pathMin(0, 3)).toBe(1)
      expect(lct.pathMin(0, 1)).toBe(3)
    })

    it('pathMax on chain', () => {
      const lct = buildRootedChain(4)
      lct.setWeight(0, 10)
      lct.setWeight(1, 3)
      lct.setWeight(2, 7)
      lct.setWeight(3, 1)
      expect(lct.pathMax(0, 3)).toBe(10)
      expect(lct.pathMax(1, 3)).toBe(7)
    })

    it('pathSum on chain', () => {
      const lct = buildRootedChain(4)
      lct.setWeight(0, 1)
      lct.setWeight(1, 2)
      lct.setWeight(2, 3)
      lct.setWeight(3, 4)
      expect(lct.pathSum(0, 3)).toBe(10)
      expect(lct.pathSum(1, 2)).toBe(5)
    })

    it('pathMin with negative weights', () => {
      const lct = buildRootedChain(3)
      lct.setWeight(0, -5)
      lct.setWeight(1, 10)
      lct.setWeight(2, -3)
      expect(lct.pathMin(0, 2)).toBe(-5)
    })

    it('pathMax with negative weights', () => {
      const lct = buildRootedChain(3)
      lct.setWeight(0, -5)
      lct.setWeight(1, 10)
      lct.setWeight(2, -3)
      expect(lct.pathMax(0, 2)).toBe(10)
    })

    it('returns 0 for disconnected nodes', () => {
      const lct = new LinkCutTree(3)
      lct.setWeight(0, 5)
      lct.setWeight(1, 10)
      expect(lct.pathMin(0, 1)).toBe(0)
      expect(lct.pathMax(0, 1)).toBe(0)
      expect(lct.pathSum(0, 1)).toBe(0)
    })
  })

  describe('pathAggregate root to node', () => {
    it('aggregate from root to leaf in chain', () => {
      const lct = buildRootedChain(5)
      lct.setWeight(0, 1)
      lct.setWeight(1, 2)
      lct.setWeight(2, 3)
      lct.setWeight(3, 4)
      lct.setWeight(4, 5)
      const result = lct.pathAggregate(0, 4)
      expect(result.sum).toBe(15)
      expect(result.min).toBe(1)
      expect(result.max).toBe(5)
      expect(result.size).toBe(5)
    })

    it('aggregate single node', () => {
      const lct = new LinkCutTree(1)
      lct.setWeight(0, 42)
      const result = lct.pathAggregate(0, 0)
      expect(result.sum).toBe(42)
      expect(result.min).toBe(42)
      expect(result.max).toBe(42)
      expect(result.size).toBe(1)
    })

    it('aggregate updates after weight change', () => {
      const lct = buildRootedChain(3)
      lct.setWeight(0, 1)
      lct.setWeight(1, 2)
      lct.setWeight(2, 3)
      expect(lct.pathAggregate(0, 2).sum).toBe(6)
      lct.setWeight(1, 10)
      expect(lct.pathAggregate(0, 2).sum).toBe(14)
    })
  })

  describe('link(child, parent) semantics', () => {
    it('link with explicit child and parent', () => {
      const lct = new LinkCutTree(4)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(3, 2)
      expect(lct.findRoot(3)).toBe(0)
      expect(lct.getParent(3)).toBe(2)
      expect(lct.getParent(2)).toBe(1)
      expect(lct.getParent(1)).toBe(0)
    })

    it('link does not create cycle', () => {
      const lct = new LinkCutTree(3)
      lct.link(1, 0)
      lct.link(2, 1)
      lct.link(0, 2)
      expect(lct.connected(0, 2)).toBe(true)
    })
  })

  describe('interleaved operations', () => {
    it('alternating link and cut', () => {
      const lct = new LinkCutTree(3)
      for (let i = 0; i < 5; i++) {
        lct.link(1, 0)
        expect(lct.connected(0, 1)).toBe(true)
        lct.cut(1)
        expect(lct.connected(0, 1)).toBe(false)
      }
    })

    it('link cut relink different parent', () => {
      const lct = new LinkCutTree(4)
      lct.link(1, 0)
      lct.link(2, 0)
      lct.link(3, 0)
      expect(lct.lca(1, 2)).toBe(0)
      lct.cut(2)
      lct.link(2, 1)
      expect(lct.getParent(2)).toBe(1)
      expect(lct.lca(2, 3)).toBe(0)
    })

    it('weight changes preserve structure', () => {
      const lct = buildRootedChain(4)
      lct.setWeight(0, 1)
      lct.setWeight(1, 2)
      lct.setWeight(2, 3)
      lct.setWeight(3, 4)
      expect(lct.connected(0, 3)).toBe(true)
      expect(lct.pathSum(0, 3)).toBe(10)
      lct.setWeight(2, 10)
      expect(lct.pathSum(0, 3)).toBe(17)
      expect(lct.findRoot(3)).toBe(0)
    })

    it('multiple cuts create forest', () => {
      const lct = buildRootedChain(6)
      lct.cut(2)
      lct.cut(4)
      expect(lct.connected(0, 1)).toBe(true)
      expect(lct.connected(2, 3)).toBe(true)
      expect(lct.connected(4, 5)).toBe(true)
      expect(lct.connected(0, 2)).toBe(false)
      expect(lct.connected(2, 4)).toBe(false)
      expect(lct.connected(0, 4)).toBe(false)
      expect(lct.findRoot(0)).toBe(0)
      expect(lct.findRoot(2)).toBe(2)
      expect(lct.findRoot(4)).toBe(4)
    })
  })
})
