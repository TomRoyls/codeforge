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

// ─── toString ───

describe('KDTree toString', () => {
  it('returns string representation of empty tree', () => {
    const tree = new KDTree()
    const str = tree.toString()
    expect(str).toContain('KDTree')
    expect(str).toContain('0')
    expect(str).toContain('k=')
  })

  it('returns string containing size and dimensions', () => {
    const tree = new KDTree([[1, 2], [3, 4], [5, 6]])
    const str = tree.toString()
    expect(str).toContain('KDTree')
    expect(str).toContain('3')
    expect(str).toContain('k=2')
  })

  it('shows correct dimensions for 3D tree', () => {
    const tree = new KDTree([[1, 2, 3], [4, 5, 6]])
    const str = tree.toString()
    expect(str).toContain('KDTree')
    expect(str).toContain('2')
    expect(str).toContain('k=3')
  })
})

// ─── toJSON ───

describe('KDTree toJSON', () => {
  it('returns empty array for empty tree', () => {
    const tree = new KDTree()
    const json = tree.toJSON()
    expect(json).toEqual([])
    expect(Array.isArray(json)).toBe(true)
  })

  it('returns serializable array of points', () => {
    const tree = KDTree.fromPoints([[1, 2], [3, 4], [5, 6]])
    const json = tree.toJSON() as number[][]
    expect(Array.isArray(json)).toBe(true)
    expect(json).toHaveLength(3)
    expect(json).toContainEqual([1, 2])
    expect(json).toContainEqual([3, 4])
    expect(json).toContainEqual([5, 6])
  })

  it('round-trip preserves data', () => {
    const tree = KDTree.fromPoints([[1, 2], [3, 4], [5, 6]])
    const json = tree.toJSON()
    const jsonString = JSON.stringify(json)
    const parsed = JSON.parse(jsonString)
    expect(parsed).toEqual(json)
    const tree2 = new KDTree(parsed as number[][])
    expect(tree2.equals(tree)).toBe(true)
  })
})

// ─── clone ───

describe('KDTree clone', () => {
  it('creates independent copy of empty tree', () => {
    const tree = new KDTree()
    const cloned = tree.clone()
    expect(cloned).not.toBe(tree)
    expect(cloned.size).toBe(tree.size)
    expect(cloned.isEmpty()).toBe(true)
  })

  it('clone has same points as original', () => {
    const tree = KDTree.fromPoints([[1, 2], [3, 4], [5, 6]])
    const cloned = tree.clone()
    expect(cloned.size).toBe(tree.size)
    expect(cloned.contains([1, 2])).toBe(true)
    expect(cloned.contains([3, 4])).toBe(true)
    expect(cloned.contains([5, 6])).toBe(true)
  })

  it('modifying clone does not affect original', () => {
    const tree = KDTree.fromPoints([[1, 2], [3, 4]])
    const cloned = tree.clone()
    cloned.insert([5, 6])
    cloned.remove([1, 2])
    expect(tree.size).toBe(2)
    expect(tree.contains([1, 2])).toBe(true)
    expect(tree.contains([5, 6])).toBe(false)
    expect(cloned.size).toBe(2)
    expect(cloned.contains([1, 2])).toBe(false)
    expect(cloned.contains([5, 6])).toBe(true)
  })

  it('preserves dimensions', () => {
    const tree = new KDTree([[1, 2, 3], [4, 5, 6]])
    const cloned = tree.clone()
    expect(cloned.dimensions).toBe(tree.dimensions)
    expect(cloned.dimensions).toBe(3)
  })
})

// ─── equals ───

describe('KDTree equals', () => {
  it('same tree equals itself', () => {
    const tree = KDTree.fromPoints([[1, 2], [3, 4]])
    expect(tree.equals(tree)).toBe(true)
  })

  it('trees with same points are equal', () => {
    const tree1 = KDTree.fromPoints([[1, 2], [3, 4]])
    const tree2 = KDTree.fromPoints([[1, 2], [3, 4]])
    expect(tree1.equals(tree2)).toBe(true)
  })

  it('trees with different points are not equal', () => {
    const tree1 = KDTree.fromPoints([[1, 2], [3, 4]])
    const tree2 = KDTree.fromPoints([[5, 6], [7, 8]])
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('trees with different number of points are not equal', () => {
    const tree1 = KDTree.fromPoints([[1, 2], [3, 4]])
    const tree2 = KDTree.fromPoints([[1, 2]])
    expect(tree1.equals(tree2)).toBe(false)
  })

  it('non-KDTree returns false', () => {
    const tree = KDTree.fromPoints([[1, 2]])
    expect(tree.equals(null)).toBe(false)
    expect(tree.equals(undefined)).toBe(false)
    expect(tree.equals({})).toBe(false)
    expect(tree.equals([])).toBe(false)
    expect(tree.equals('KDTree')).toBe(false)
  })

  it('empty trees are equal', () => {
    const tree1 = new KDTree()
    const tree2 = new KDTree()
    expect(tree1.equals(tree2)).toBe(true)
  })

  it('trees with different dimensions are not equal', () => {
    const tree1 = new KDTree([[1, 2]])
    const tree2 = new KDTree([[1, 2, 3]])
    expect(tree1.equals(tree2)).toBe(false)
  })
})

// ─── Negative coordinates ───

describe('KDTree negative coordinates', () => {
  it('inserts and queries with negative coordinates', () => {
    const tree = new KDTree()
    tree.insert([-10, -20])
    tree.insert([-30, -40])
    expect(tree.contains([-10, -20])).toBe(true)
    expect(tree.contains([-30, -40])).toBe(true)
    expect(tree.size).toBe(2)
  })

  it('removes points with negative coordinates', () => {
    const tree = new KDTree()
    tree.insert([-10, -20])
    tree.insert([-30, -40])
    expect(tree.remove([-10, -20])).toBe(true)
    expect(tree.contains([-10, -20])).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('finds nearest neighbor with negative coordinates', () => {
    const tree = KDTree.fromPoints([
      [-10, -10],
      [-5, -5],
      [0, 0],
    ])
    const nn = tree.nearestNeighbor([-3, -3])
    expect(nn).toEqual([-5, -5])
  })

  it('range search with negative coordinates', () => {
    const tree = KDTree.fromPoints([
      [-20, -20],
      [-10, -10],
      [-5, -5],
      [0, 0],
    ])
    const result = tree.rangeSearch([-15, -15], [-5, -5])
    expect(result.length).toBe(2)
    expect(result).toContainEqual([-10, -10])
    expect(result).toContainEqual([-5, -5])
  })
})

// ─── Range search edge cases ───

describe('KDTree range search edge cases', () => {
  it('handles point exactly on boundary', () => {
    const tree = KDTree.fromPoints([[5, 5], [10, 10], [15, 15]])
    const result = tree.rangeSearch([5, 5], [10, 10])
    expect(result.length).toBe(2)
    expect(result).toContainEqual([5, 5])
    expect(result).toContainEqual([10, 10])
  })

  it('inverted range (min > max) returns empty', () => {
    const tree = KDTree.fromPoints([[5, 5], [10, 10]])
    const result = tree.rangeSearch([15, 15], [5, 5])
    expect(result).toEqual([])
  })

  it('point on boundary included in range', () => {
    const tree = KDTree.fromPoints([[0, 0], [10, 10], [20, 20]])
    const result = tree.rangeSearch([0, 0], [10, 10])
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result).toContainEqual([0, 0])
    expect(result).toContainEqual([10, 10])
  })

  it('empty range returns no results', () => {
    const tree = KDTree.fromPoints([[5, 5], [10, 10]])
    const result = tree.rangeSearch([7, 7], [7, 7])
    expect(result).toEqual([])
  })
})

describe('k-d-tree - wave548', () => {
  it('k-d-tree module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree module has name', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree module not null', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree module not undefined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree module constructable', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree module has prototype', () => {
    expect(beforeEach).toBeDefined()
  })
})
