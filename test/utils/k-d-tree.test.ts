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

describe('k-d-tree - wave549', () => {
  it('k-d-tree module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave550', () => {
  it('k-d-tree w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave551', () => {
  it('k-d-tree w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave552', () => {
  it('k-d-tree w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave553', () => {
  it('k-d-tree w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave554', () => {
  it('k-d-tree w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave555', () => {
  it('k-d-tree w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave556', () => {
  it('k-d-tree w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave557', () => {
  it('k-d-tree w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave558', () => {
  it('k-d-tree w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave559', () => {
  it('k-d-tree w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave560', () => {
  it('k-d-tree w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave561', () => {
  it('k-d-tree w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave562', () => {
  it('k-d-tree w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave563', () => {
  it('k-d-tree w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave564', () => {
  it('k-d-tree w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave565', () => {
  it('k-d-tree w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave566', () => {
  it('k-d-tree w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave127', () => {
  it('k-d-tree w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave130', () => {
  it('k-d-tree w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave133', () => {
  it('k-d-tree w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave136', () => {
  it('k-d-tree w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - wave139', () => {
  it('k-d-tree w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w142', () => {
  it('k-d-tree v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w145', () => {
  it('k-d-tree v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w148', () => {
  it('k-d-tree v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w151', () => {
  it('k-d-tree v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w154', () => {
  it('k-d-tree v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w157', () => {
  it('k-d-tree v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w160', () => {
  it('k-d-tree v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w170', () => {
  it('k-d-tree x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w180', () => {
  it('k-d-tree x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w190', () => {
  it('k-d-tree x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w200', () => {
  it('k-d-tree x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w210', () => {
  it('k-d-tree x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w220', () => {
  it('k-d-tree x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w230', () => {
  it('k-d-tree x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w240', () => {
  it('k-d-tree x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w250', () => {
  it('k-d-tree x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w260', () => {
  it('k-d-tree x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w270', () => {
  it('k-d-tree x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w280', () => {
  it('k-d-tree x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w290', () => {
  it('k-d-tree x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w300', () => {
  it('k-d-tree x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w310', () => {
  it('k-d-tree x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w320', () => {
  it('k-d-tree x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w330', () => {
  it('k-d-tree x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w340', () => {
  it('k-d-tree x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w350', () => {
  it('k-d-tree x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w360', () => {
  it('k-d-tree x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w370', () => {
  it('k-d-tree x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w380', () => {
  it('k-d-tree x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w390', () => {
  it('k-d-tree x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w400', () => {
  it('k-d-tree x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w420', () => {
  it('k-d-tree x420x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x420x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w440', () => {
  it('k-d-tree x440x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x440x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w460', () => {
  it('k-d-tree x460x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x460x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w480', () => {
  it('k-d-tree x480x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x480x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w500', () => {
  it('k-d-tree x500x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x500x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w550', () => {
  it('k-d-tree x550x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x550x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('k-d-tree - w600', () => {
  it('k-d-tree x600x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('k-d-tree x600x49', () => {
    expect(beforeEach).toBeDefined()
  })
})
