import { beforeEach, describe, expect, it } from 'vitest'

import { KDTree } from '../../src/utils/k-d-tree.js'

// ─── Empty tree operations ─────────────────────────────
describe('KDTree empty tree operations', () => {
  it('reports size 0 for new tree', () => {
    const tree = new KDTree()
    expect(tree.size).toBe(0)
  })

  it('isEmpty returns true for new tree', () => {
    expect(new KDTree().isEmpty()).toBe(true)
  })

  it('nearestNeighbor returns null for empty tree', () => {
    expect(new KDTree().nearestNeighbor([1, 2])).toBeNull()
  })

  it('kNearestNeighbors returns empty array for empty tree', () => {
    expect(new KDTree().kNearestNeighbors([1, 2], 3)).toEqual([])
  })

  it('rangeSearch returns empty array for empty tree', () => {
    expect(new KDTree().rangeSearch([0, 0], [10, 10])).toEqual([])
  })

  it('contains returns false for empty tree', () => {
    expect(new KDTree().contains([1, 2])).toBe(false)
  })

  it('toArray returns empty array for empty tree', () => {
    expect(new KDTree().toArray()).toEqual([])
  })

  it('remove returns false for empty tree', () => {
    expect(new KDTree().remove([1, 2])).toBe(false)
  })
})

// ─── Build tree from points (2D) ──────────────────────
describe('KDTree build from 2D points', () => {
  it('builds a balanced tree from points', () => {
    const points = [
      [2, 3],
      [5, 4],
      [9, 6],
      [4, 7],
      [8, 1],
      [7, 2],
    ]
    const tree = KDTree.fromPoints(points)
    expect(tree.size).toBe(6)
    expect(tree.toArray().length).toBe(6)
  })

  it('preserves all points', () => {
    const points = [
      [1, 1],
      [2, 2],
      [3, 3],
    ]
    const tree = new KDTree(points)
    const arr = tree.toArray()
    expect(arr.length).toBe(3)
    for (const p of points) {
      expect(tree.contains(p)).toBe(true)
    }
  })
})

// ─── Build tree from points (3D) ──────────────────────
describe('KDTree build from 3D points', () => {
  it('builds and queries a 3D tree', () => {
    const points = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [2, 3, 4],
    ]
    const tree = new KDTree(points)
    expect(tree.size).toBe(4)
    expect(tree.dimensions).toBe(3)
    expect(tree.contains([4, 5, 6])).toBe(true)
    expect(tree.contains([4, 5, 7])).toBe(false)
  })
})

// ─── Insert ───────────────────────────────────────────
describe('KDTree insert', () => {
  let tree: KDTree

  beforeEach(() => {
    tree = new KDTree()
  })

  it('inserts a single point', () => {
    tree.insert([5, 5])
    expect(tree.size).toBe(1)
    expect(tree.contains([5, 5])).toBe(true)
  })

  it('inserts multiple points', () => {
    tree.insert([1, 2])
    tree.insert([3, 4])
    tree.insert([5, 6])
    expect(tree.size).toBe(3)
    expect(tree.contains([1, 2])).toBe(true)
    expect(tree.contains([3, 4])).toBe(true)
    expect(tree.contains([5, 6])).toBe(true)
  })
})

// ─── Contains ─────────────────────────────────────────
describe('KDTree contains', () => {
  const points = [
    [2, 3],
    [5, 4],
    [9, 6],
  ]
  let tree: KDTree

  beforeEach(() => {
    tree = KDTree.fromPoints(points)
  })

  it('returns true for existing points', () => {
    expect(tree.contains([2, 3])).toBe(true)
    expect(tree.contains([5, 4])).toBe(true)
    expect(tree.contains([9, 6])).toBe(true)
  })

  it('returns false for non-existing points', () => {
    expect(tree.contains([0, 0])).toBe(false)
    expect(tree.contains([2, 4])).toBe(false)
    expect(tree.contains([100, 200])).toBe(false)
  })
})

// ─── Remove ───────────────────────────────────────────
describe('KDTree remove', () => {
  it('removes an existing point', () => {
    const tree = KDTree.fromPoints([
      [1, 1],
      [2, 2],
      [3, 3],
    ])
    expect(tree.remove([2, 2])).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.contains([2, 2])).toBe(false)
    expect(tree.contains([1, 1])).toBe(true)
    expect(tree.contains([3, 3])).toBe(true)
  })

  it('returns false for non-existing point', () => {
    const tree = KDTree.fromPoints([
      [1, 1],
      [2, 2],
    ])
    expect(tree.remove([5, 5])).toBe(false)
    expect(tree.size).toBe(2)
  })
})

// ─── Nearest neighbor (2D) ───────────────────────────
describe('KDTree nearestNeighbor 2D', () => {
  it('finds closest point in 2D', () => {
    const points = [
      [2, 3],
      [5, 4],
      [9, 6],
      [4, 7],
      [8, 1],
      [7, 2],
    ]
    const tree = KDTree.fromPoints(points)
    const nn = tree.nearestNeighbor([6, 3])
    expect(nn).not.toBeNull()
    const d = (nn![0]! - 6) ** 2 + (nn![1]! - 3) ** 2
    expect(d).toBe(2)
    expect(
      (nn![0] === 5 && nn![1] === 4) || (nn![0] === 7 && nn![1] === 2),
    ).toBe(true)
  })

  it('finds exact match when target is a tree point', () => {
    const points = [
      [1, 1],
      [10, 10],
    ]
    const tree = KDTree.fromPoints(points)
    expect(tree.nearestNeighbor([1, 1])).toEqual([1, 1])
  })
})

// ─── Nearest neighbor (3D) ───────────────────────────
describe('KDTree nearestNeighbor 3D', () => {
  it('finds closest point in 3D', () => {
    const points = [
      [0, 0, 0],
      [10, 10, 10],
      [5, 5, 5],
    ]
    const tree = KDTree.fromPoints(points)
    expect(tree.nearestNeighbor([4, 4, 4])).toEqual([5, 5, 5])
  })
})

// ─── K nearest neighbors ─────────────────────────────
describe('KDTree kNearestNeighbors', () => {
  it('finds k closest points', () => {
    const points = [
      [1, 1],
      [2, 2],
      [3, 3],
      [10, 10],
      [11, 11],
    ]
    const tree = KDTree.fromPoints(points)
    const knn = tree.kNearestNeighbors([2, 2], 3)
    expect(knn.length).toBe(3)
    expect(knn[0]).toEqual([2, 2])
    expect(knn).toContainEqual([1, 1])
    expect(knn).toContainEqual([3, 3])
  })

  it('with k > size returns all points', () => {
    const points = [
      [1, 1],
      [2, 2],
    ]
    const tree = KDTree.fromPoints(points)
    const knn = tree.kNearestNeighbors([0, 0], 10)
    expect(knn.length).toBe(2)
  })

  it('with k = 0 returns empty array', () => {
    const tree = KDTree.fromPoints([
      [1, 1],
      [2, 2],
    ])
    expect(tree.kNearestNeighbors([0, 0], 0)).toEqual([])
  })
})

// ─── Range search ────────────────────────────────────
describe('KDTree rangeSearch', () => {
  it('finds points in bounding box', () => {
    const points = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [10, 10],
    ]
    const tree = KDTree.fromPoints(points)
    const result = tree.rangeSearch([2, 2], [5, 5])
    expect(result.length).toBe(4)
    expect(result).toContainEqual([2, 2])
    expect(result).toContainEqual([3, 3])
    expect(result).toContainEqual([4, 4])
    expect(result).toContainEqual([5, 5])
  })

  it('returns empty when no points in range', () => {
    const tree = KDTree.fromPoints([
      [1, 1],
      [2, 2],
      [3, 3],
    ])
    expect(tree.rangeSearch([10, 10], [20, 20])).toEqual([])
  })
})

// ─── Size tracking ───────────────────────────────────
describe('KDTree size tracking', () => {
  it('tracks size through insert and remove', () => {
    const tree = new KDTree()
    expect(tree.size).toBe(0)
    tree.insert([1, 1])
    expect(tree.size).toBe(1)
    tree.insert([2, 2])
    expect(tree.size).toBe(2)
    tree.remove([1, 1])
    expect(tree.size).toBe(1)
    tree.remove([2, 2])
    expect(tree.size).toBe(0)
  })
})

// ─── Clear ───────────────────────────────────────────
describe('KDTree clear', () => {
  it('clears the tree', () => {
    const tree = KDTree.fromPoints([
      [1, 1],
      [2, 2],
      [3, 3],
    ])
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.toArray()).toEqual([])
    expect(tree.nearestNeighbor([1, 1])).toBeNull()
  })
})

// ─── toArray ─────────────────────────────────────────
describe('KDTree toArray', () => {
  it('returns all inserted points', () => {
    const points = [
      [3, 1],
      [1, 2],
      [2, 3],
    ]
    const tree = KDTree.fromPoints(points)
    const arr = tree.toArray()
    expect(arr.length).toBe(3)
    for (const p of points) {
      expect(arr).toContainEqual(p)
    }
  })
})

// ─── Dimensions auto-detection ──────────────────────
describe('KDTree dimensions', () => {
  it('auto-detects 2D from points', () => {
    const tree = KDTree.fromPoints([
      [1, 2],
      [3, 4],
    ])
    expect(tree.dimensions).toBe(2)
  })

  it('auto-detects 3D from points', () => {
    const tree = KDTree.fromPoints([
      [1, 2, 3],
      [4, 5, 6],
    ])
    expect(tree.dimensions).toBe(3)
  })

  it('uses default dimension for empty tree', () => {
    expect(new KDTree().dimensions).toBe(2)
  })

  it('uses provided k for empty tree', () => {
    expect(new KDTree([], 5).dimensions).toBe(5)
  })
})

// ─── Single point tree ──────────────────────────────
describe('KDTree single point', () => {
  it('handles single point operations', () => {
    const tree = KDTree.fromPoints([[5, 5]])
    expect(tree.size).toBe(1)
    expect(tree.contains([5, 5])).toBe(true)
    expect(tree.nearestNeighbor([0, 0])).toEqual([5, 5])
    expect(tree.kNearestNeighbors([0, 0], 1)).toEqual([[5, 5]])
    expect(tree.rangeSearch([0, 0], [10, 10])).toEqual([[5, 5]])
    tree.remove([5, 5])
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Large dataset ──────────────────────────────────
describe('KDTree large dataset', () => {
  it('finds correct nearest neighbor among 200+ random 2D points', () => {
    const rng = (seed: number) => {
      let s = seed
      return () => {
        s = (s * 16807 + 0) % 2147483647
        return s / 2147483647
      }
    }
    const rand = rng(42)
    const points: number[][] = []
    for (let i = 0; i < 250; i++) {
      points.push([Math.floor(rand() * 1000), Math.floor(rand() * 1000)])
    }
    const tree = KDTree.fromPoints(points)
    const target = [500, 500]

    const nnResult = tree.nearestNeighbor(target)

    let bruteDist = Infinity
    let brutePoint: number[] | null = null
    for (const p of points) {
      const dx = p[0]! - target[0]!
      const dy = p[1]! - target[1]!
      const d = dx * dx + dy * dy
      if (d < bruteDist) {
        bruteDist = d
        brutePoint = p
      }
    }

    expect(nnResult).toEqual(brutePoint)
  })
})

// ─── Points with identical coordinates ──────────────
describe('KDTree duplicate points', () => {
  it('handles points with identical coordinates', () => {
    const points = [
      [1, 1],
      [1, 1],
      [2, 2],
    ]
    const tree = KDTree.fromPoints(points)
    expect(tree.size).toBe(3)
    expect(tree.contains([1, 1])).toBe(true)
    expect(tree.toArray().length).toBe(3)
  })
})

// ─── Static fromPoints ──────────────────────────────
describe('KDTree static fromPoints', () => {
  it('creates tree identical to constructor', () => {
    const points = [
      [1, 2],
      [3, 4],
    ]
    const a = new KDTree(points)
    const b = KDTree.fromPoints(points)
    expect(a.size).toBe(b.size)
    expect(a.dimensions).toBe(b.dimensions)
  })
})

// ─── Remove then reinsert ───────────────────────────
describe('KDTree remove then reinsert', () => {
  it('allows reinserting a removed point', () => {
    const tree = KDTree.fromPoints([
      [1, 1],
      [2, 2],
      [3, 3],
    ])
    tree.remove([2, 2])
    expect(tree.contains([2, 2])).toBe(false)
    tree.insert([2, 2])
    expect(tree.contains([2, 2])).toBe(true)
    expect(tree.size).toBe(3)
  })
})

// ─── KNN sorted by distance ─────────────────────────
describe('KDTree KNN order', () => {
  it('returns results sorted by distance', () => {
    const points = [
      [0, 0],
      [1, 0],
      [0, 1],
      [3, 3],
      [10, 10],
    ]
    const tree = KDTree.fromPoints(points)
    const knn = tree.kNearestNeighbors([0, 0], 4)

    for (let i = 1; i < knn.length; i++) {
      const dPrev = (knn[i - 1]![0]!) ** 2 + (knn[i - 1]![1]!) ** 2
      const dCurr = (knn[i]![0]!) ** 2 + (knn[i]![1]!) ** 2
      expect(dCurr).toBeGreaterThanOrEqual(dPrev)
    }
  })
})
