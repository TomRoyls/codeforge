import { describe, it, expect } from 'vitest'
import { CentroidDecomposition } from '../../src/core/centroid-decomposition/centroid-decomposition'

function buildPath(n: number): CentroidDecomposition {
  const cd = new CentroidDecomposition(n)
  for (let i = 0; i < n - 1; i++) {
    cd.addEdge(i, i + 1)
  }
  cd.build()
  return cd
}

function buildStar(n: number): CentroidDecomposition {
  const cd = new CentroidDecomposition(n)
  for (let i = 1; i < n; i++) {
    cd.addEdge(0, i)
  }
  cd.build()
  return cd
}

function buildCompleteBinaryTree(levels: number): { cd: CentroidDecomposition; n: number } {
  const n = (1 << levels) - 1
  const cd = new CentroidDecomposition(n)
  for (let i = 0; i < Math.floor(n / 2); i++) {
    cd.addEdge(i, 2 * i + 1)
    cd.addEdge(i, 2 * i + 2)
  }
  cd.build()
  return { cd, n }
}

function buildSampleTree(): CentroidDecomposition {
  const cd = new CentroidDecomposition(10)
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 7], [4, 8], [6, 9],
  ]
  for (const [u, v] of edges) {
    cd.addEdge(u, v)
  }
  cd.build()
  return cd
}

function isCentroidProperty(
  cd: CentroidDecomposition,
  centroid: number,
  treeSize: number,
): boolean {
  const adj = getAdj(cd)
  const visited = new Uint8Array(cd.getSize())
  let maxSub = 0
  const stack: number[] = [centroid]
  visited[centroid] = 1
  const sizes = new Int32Array(cd.getSize())
  const order: number[] = [centroid]

  while (stack.length > 0) {
    const node = stack.pop()!
    for (const child of adj[node]!) {
      if (!visited[child]) {
        visited[child] = 1
        stack.push(child)
        order.push(child)
      }
    }
  }

  for (let i = order.length - 1; i >= 0; i--) {
    const node = order[i]!
    sizes[node] = 1
    for (const child of adj[node]!) {
      if (sizes[child]! > 0 && child !== cd.getParent(node) || child !== cd.getParent(node)) {
        if (sizes[child]! > 0) {
          sizes[node]! += sizes[child]!
        }
      }
    }
  }

  return true
}

function getAdj(cd: CentroidDecomposition): number[][] {
  const clone = (cd as unknown as { clone: () => CentroidDecomposition }).clone()
  const n = clone.getSize()
  const arr: number[][] = []
  for (let i = 0; i < n; i++) arr.push([])
  return arr
}

describe('CentroidDecomposition', () => {
  describe('constructor and build', () => {
    it('should create CD with single node', () => {
      const cd = new CentroidDecomposition(1)
      cd.build()
      expect(cd.getCentroid()).toBe(0)
      expect(cd.getSize()).toBe(1)
    })

    it('should handle two nodes', () => {
      const cd = new CentroidDecomposition(2)
      cd.addEdge(0, 1)
      cd.build()
      expect(cd.getSize()).toBe(2)
      const centroid = cd.getCentroid()
      expect(centroid).toBeGreaterThanOrEqual(0)
      expect(centroid).toBeLessThan(2)
    })

    it('should throw if querying before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.getCentroid()).toThrow('Must call build()')
    })

    it('should throw on getDepth before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.getDepth(0)).toThrow('Must call build()')
    })

    it('should throw on getParent before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.getParent(0)).toThrow('Must call build()')
    })

    it('should throw on getChildren before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.getChildren(0)).toThrow('Must call build()')
    })

    it('should throw on getSubtreeSize before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.getSubtreeSize(0)).toThrow('Must call build()')
    })

    it('should throw on isInSameComponent before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.isInSameComponent(0, 1)).toThrow('Must call build()')
    })

    it('should throw on getDistance before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.getDistance(0, 1)).toThrow('Must call build()')
    })

    it('should throw on getLCA before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.getLCA(0, 1)).toThrow('Must call build()')
    })

    it('should throw on getPath before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.getPath(0, 1)).toThrow('Must call build()')
    })

    it('should throw on getLevel before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.getLevel(0)).toThrow('Must call build()')
    })

    it('should throw on toArray before build', () => {
      const cd = new CentroidDecomposition(5)
      expect(() => cd.toArray()).toThrow('Must call build()')
    })

    it('should build sample tree without error', () => {
      const cd = buildSampleTree()
      expect(cd.getCentroid()).toBeGreaterThanOrEqual(0)
    })

    it('should build path graph without error', () => {
      const cd = buildPath(5)
      expect(cd.getCentroid()).toBeGreaterThanOrEqual(0)
    })

    it('should build star graph without error', () => {
      const cd = buildStar(5)
      expect(cd.getCentroid()).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getSize', () => {
    it('should return correct size for single node', () => {
      const cd = new CentroidDecomposition(1)
      expect(cd.getSize()).toBe(1)
    })

    it('should return correct size for 10 nodes', () => {
      const cd = new CentroidDecomposition(10)
      expect(cd.getSize()).toBe(10)
    })

    it('should return correct size for 0 nodes', () => {
      const cd = new CentroidDecomposition(0)
      expect(cd.getSize()).toBe(0)
    })

    it('should return correct size after build', () => {
      const cd = buildSampleTree()
      expect(cd.getSize()).toBe(10)
    })
  })

  describe('centroid root', () => {
    it('should return 0 for single node', () => {
      const cd = new CentroidDecomposition(1)
      cd.build()
      expect(cd.getCentroid()).toBe(0)
    })

    it('should return centroid of path graph as middle-ish node', () => {
      const cd = buildPath(7)
      const root = cd.getCentroid()
      expect(root).toBeGreaterThanOrEqual(0)
      expect(root).toBeLessThan(7)
      expect(cd.getParent(root)).toBe(-1)
    })

    it('should return centroid of star graph as center', () => {
      const cd = buildStar(7)
      const root = cd.getCentroid()
      expect(root).toBe(0)
    })

    it('centroid root should have parent -1', () => {
      const cd = buildSampleTree()
      expect(cd.getParent(cd.getCentroid())).toBe(-1)
    })

    it('centroid root should have depth 0', () => {
      const cd = buildSampleTree()
      expect(cd.getDepth(cd.getCentroid())).toBe(0)
    })

    it('centroid root should have level 0', () => {
      const cd = buildSampleTree()
      expect(cd.getLevel(cd.getCentroid())).toBe(0)
    })
  })

  describe('getDepth', () => {
    it('should return 0 for centroid root', () => {
      const cd = buildSampleTree()
      expect(cd.getDepth(cd.getCentroid())).toBe(0)
    })

    it('should increase for children', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      const children = cd.getChildren(root)
      for (const child of children) {
        expect(cd.getDepth(child)).toBe(1)
      }
    })

    it('should have valid depths for all nodes', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(cd.getDepth(i)).toBeGreaterThanOrEqual(0)
      }
    })

    it('should have max depth bounded by log2(n) for balanced tree', () => {
      const { cd, n } = buildCompleteBinaryTree(5)
      let maxDepth = 0
      for (let i = 0; i < n; i++) {
        maxDepth = Math.max(maxDepth, cd.getDepth(i))
      }
      expect(maxDepth).toBeLessThanOrEqual(Math.ceil(Math.log2(n)) + 1)
    })

    it('should have depth equal to distance from root in centroid tree', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        let depth = 0
        let current = i
        while (cd.getParent(current) !== -1) {
          depth++
          current = cd.getParent(current)
        }
        expect(cd.getDepth(i)).toBe(depth)
      }
    })
  })

  describe('getParent', () => {
    it('should return -1 for centroid root', () => {
      const cd = buildSampleTree()
      expect(cd.getParent(cd.getCentroid())).toBe(-1)
    })

    it('should return valid parent for non-root nodes', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      for (let i = 0; i < 10; i++) {
        if (i !== root) {
          const p = cd.getParent(i)
          expect(p).toBeGreaterThanOrEqual(0)
          expect(p).toBeLessThan(10)
        }
      }
    })

    it('should have parent with lower depth', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const p = cd.getParent(i)
        if (p !== -1) {
          expect(cd.getDepth(p)).toBeLessThan(cd.getDepth(i))
        }
      }
    })

    it('should have parent with lower level', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const p = cd.getParent(i)
        if (p !== -1) {
          expect(cd.getLevel(p)).toBeLessThan(cd.getLevel(i))
        }
      }
    })
  })

  describe('getChildren', () => {
    it('should return empty array for leaves in centroid tree', () => {
      const cd = buildPath(3)
      const visited = new Set<number>()
      for (let i = 0; i < 3; i++) {
        if (cd.getChildren(i).length === 0) {
          visited.add(i)
        }
      }
      expect(visited.size).toBeGreaterThanOrEqual(1)
    })

    it('should return children whose parent matches', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const ch = cd.getChildren(i)
        for (const child of ch) {
          expect(cd.getParent(child)).toBe(i)
        }
      }
    })

    it('should not contain duplicates', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const ch = cd.getChildren(i)
        expect(new Set(ch).size).toBe(ch.length)
      }
    })

    it('should return a copy (not internal array)', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      const ch1 = cd.getChildren(root)
      const ch2 = cd.getChildren(root)
      expect(ch1).toEqual(ch2)
      expect(ch1).not.toBe(ch2)
    })
  })

  describe('getSubtreeSize', () => {
    it('should return n for centroid root', () => {
      const cd = buildSampleTree()
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(10)
    })

    it('should return 1 for leaves in centroid tree', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        if (cd.getChildren(i).length === 0) {
          expect(cd.getSubtreeSize(i)).toBe(1)
        }
      }
    })

    it('should have subtree sizes consistent with children', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const ch = cd.getChildren(i)
        let childSum = 0
        for (const child of ch) {
          childSum += cd.getSubtreeSize(child)
        }
        expect(cd.getSubtreeSize(i)).toBe(1 + childSum)
      }
    })

    it('should have all subtree sizes positive', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(cd.getSubtreeSize(i)).toBeGreaterThan(0)
      }
    })
  })

  describe('getLevel', () => {
    it('should return 0 for centroid root', () => {
      const cd = buildSampleTree()
      expect(cd.getLevel(cd.getCentroid())).toBe(0)
    })

    it('should increase by 1 for children', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      const ch = cd.getChildren(root)
      for (const child of ch) {
        expect(cd.getLevel(child)).toBe(1)
      }
    })

    it('should equal depth for centroid tree nodes', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(cd.getLevel(i)).toBe(cd.getDepth(i))
      }
    })

    it('should have valid levels for all nodes', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(cd.getLevel(i)).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('isInSameComponent', () => {
    it('should return true for any two nodes in connected tree', () => {
      const cd = buildSampleTree()
      expect(cd.isInSameComponent(0, 9)).toBe(true)
      expect(cd.isInSameComponent(3, 7)).toBe(true)
      expect(cd.isInSameComponent(5, 8)).toBe(true)
    })

    it('should return true for node with itself', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(cd.isInSameComponent(i, i)).toBe(true)
      }
    })

    it('should return true for path graph', () => {
      const cd = buildPath(5)
      expect(cd.isInSameComponent(0, 4)).toBe(true)
      expect(cd.isInSameComponent(2, 3)).toBe(true)
    })

    it('should return true for star graph', () => {
      const cd = buildStar(5)
      expect(cd.isInSameComponent(0, 4)).toBe(true)
      expect(cd.isInSameComponent(1, 3)).toBe(true)
    })
  })

  describe('getDistance', () => {
    it('should return 0 for same node', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(cd.getDistance(i, i)).toBe(0)
      }
    })

    it('should return 1 for adjacent nodes', () => {
      const cd = buildSampleTree()
      expect(cd.getDistance(0, 1)).toBe(1)
      expect(cd.getDistance(0, 2)).toBe(1)
      expect(cd.getDistance(1, 3)).toBe(1)
      expect(cd.getDistance(1, 4)).toBe(1)
      expect(cd.getDistance(2, 5)).toBe(1)
      expect(cd.getDistance(2, 6)).toBe(1)
      expect(cd.getDistance(4, 7)).toBe(1)
      expect(cd.getDistance(4, 8)).toBe(1)
      expect(cd.getDistance(6, 9)).toBe(1)
    })

    it('should return correct distance for sample tree', () => {
      const cd = buildSampleTree()
      expect(cd.getDistance(0, 7)).toBe(3)
      expect(cd.getDistance(0, 9)).toBe(3)
      expect(cd.getDistance(3, 7)).toBe(3)
      expect(cd.getDistance(5, 9)).toBe(3)
      expect(cd.getDistance(7, 8)).toBe(2)
      expect(cd.getDistance(3, 5)).toBe(4)
    })

    it('should be symmetric', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          expect(cd.getDistance(i, j)).toBe(cd.getDistance(j, i))
        }
      }
    })

    it('should satisfy triangle inequality', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          for (let k = j + 1; k < 10; k++) {
            const dij = cd.getDistance(i, j)
            const dik = cd.getDistance(i, k)
            const djk = cd.getDistance(j, k)
            expect(dij + djk).toBeGreaterThanOrEqual(dik)
            expect(dij + dik).toBeGreaterThanOrEqual(djk)
            expect(dik + djk).toBeGreaterThanOrEqual(dij)
          }
        }
      }
    })

    it('should compute correct distances in path graph', () => {
      const cd = buildPath(10)
      expect(cd.getDistance(0, 9)).toBe(9)
      expect(cd.getDistance(3, 7)).toBe(4)
      expect(cd.getDistance(0, 0)).toBe(0)
      expect(cd.getDistance(5, 5)).toBe(0)
    })

    it('should compute correct distances in star graph', () => {
      const cd = buildStar(5)
      expect(cd.getDistance(0, 1)).toBe(1)
      expect(cd.getDistance(1, 2)).toBe(2)
      expect(cd.getDistance(1, 4)).toBe(2)
      expect(cd.getDistance(3, 4)).toBe(2)
    })

    it('should compute correct distances in binary tree', () => {
      const { cd } = buildCompleteBinaryTree(3)
      expect(cd.getDistance(0, 3)).toBe(2)
      expect(cd.getDistance(3, 4)).toBe(2)
      expect(cd.getDistance(3, 5)).toBe(4)
      expect(cd.getDistance(1, 6)).toBe(3)
    })
  })

  describe('getLCA', () => {
    it('should return node itself for LCA of same node', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        expect(cd.getLCA(i, i)).toBe(i)
      }
    })

    it('should return ancestor when one is ancestor of other in centroid tree', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      const children = cd.getChildren(root)
      if (children.length > 0) {
        expect(cd.getLCA(root, children[0]!)).toBe(root)
      }
    })

    it('should be commutative', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          expect(cd.getLCA(i, j)).toBe(cd.getLCA(j, i))
        }
      }
    })

    it('should return a node that is ancestor of both', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          const lca = cd.getLCA(i, j)
          let current: number = i
          const pathI = new Set<number>()
          pathI.add(current)
          while (cd.getParent(current) !== -1) {
            current = cd.getParent(current)
            pathI.add(current)
          }
          expect(pathI.has(lca)).toBe(true)

          current = j
          const pathJ = new Set<number>()
          pathJ.add(current)
          while (cd.getParent(current) !== -1) {
            current = cd.getParent(current)
            pathJ.add(current)
          }
          expect(pathJ.has(lca)).toBe(true)
        }
      }
    })

    it('should return centroid root for nodes from different subtrees', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      expect(cd.getLCA(0, 9)).toBe(root)
    })
  })

  describe('getPath', () => {
    it('should return single element for same node', () => {
      const cd = buildSampleTree()
      const path = cd.getPath(5, 5)
      expect(path).toEqual([5])
    })

    it('should return two elements for parent-child', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      const children = cd.getChildren(root)
      if (children.length > 0) {
        const path = cd.getPath(root, children[0]!)
        expect(path.length).toBe(2)
        expect(path[0]).toBe(root)
        expect(path[1]).toBe(children[0]!)
      }
    })

    it('should have first and last elements be u and v', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          const path = cd.getPath(i, j)
          expect(path[0]).toBe(i)
          expect(path[path.length - 1]).toBe(j)
        }
      }
    })

    it('should form a valid path in centroid tree', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          const path = cd.getPath(i, j)
          for (let k = 0; k < path.length - 1; k++) {
            const a = path[k]!
            const b = path[k + 1]!
            const parentA = cd.getParent(a)
            const parentB = cd.getParent(b)
            const valid = parentA === b || parentB === a
            expect(valid).toBe(true)
          }
        }
      }
    })

    it('should contain LCA of u and v', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          const path = cd.getPath(i, j)
          const lca = cd.getLCA(i, j)
          expect(path.includes(lca)).toBe(true)
        }
      }
    })

    it('should have no duplicates', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          const path = cd.getPath(i, j)
          expect(new Set(path).size).toBe(path.length)
        }
      }
    })

    it('path length should match depth distance', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          const path = cd.getPath(i, j)
          const lca = cd.getLCA(i, j)
          const expectedLen = (cd.getDepth(i) - cd.getDepth(lca)) + (cd.getDepth(j) - cd.getDepth(lca)) + 1
          expect(path.length).toBe(expectedLen)
        }
      }
    })
  })

  describe('toArray', () => {
    it('should return all nodes exactly once', () => {
      const cd = buildSampleTree()
      const arr = cd.toArray()
      expect(arr.length).toBe(10)
      expect(new Set(arr).size).toBe(10)
      const sorted = [...arr].sort((a, b) => a - b)
      for (let i = 0; i < 10; i++) {
        expect(sorted[i]).toBe(i)
      }
    })

    it('should return root first', () => {
      const cd = buildSampleTree()
      const arr = cd.toArray()
      expect(arr[0]).toBe(cd.getCentroid())
    })

    it('should have parent before children in traversal', () => {
      const cd = buildSampleTree()
      const arr = cd.toArray()
      for (let i = 0; i < 10; i++) {
        const p = cd.getParent(i)
        if (p !== -1) {
          const parentIdx = arr.indexOf(p)
          const childIdx = arr.indexOf(i)
          expect(parentIdx).toBeLessThan(childIdx)
        }
      }
    })

    it('should return single element for single node', () => {
      const cd = new CentroidDecomposition(1)
      cd.build()
      expect(cd.toArray()).toEqual([0])
    })

    it('should return two elements for two-node tree', () => {
      const cd = new CentroidDecomposition(2)
      cd.addEdge(0, 1)
      cd.build()
      const arr = cd.toArray()
      expect(arr.length).toBe(2)
      expect(new Set(arr).size).toBe(2)
    })
  })

  describe('clone', () => {
    it('should produce identical centroid root', () => {
      const cd = buildSampleTree()
      const copy = cd.clone()
      expect(copy.getCentroid()).toBe(cd.getCentroid())
    })

    it('should produce identical depths', () => {
      const cd = buildSampleTree()
      const copy = cd.clone()
      for (let i = 0; i < 10; i++) {
        expect(copy.getDepth(i)).toBe(cd.getDepth(i))
      }
    })

    it('should produce identical parents', () => {
      const cd = buildSampleTree()
      const copy = cd.clone()
      for (let i = 0; i < 10; i++) {
        expect(copy.getParent(i)).toBe(cd.getParent(i))
      }
    })

    it('should produce identical subtree sizes', () => {
      const cd = buildSampleTree()
      const copy = cd.clone()
      for (let i = 0; i < 10; i++) {
        expect(copy.getSubtreeSize(i)).toBe(cd.getSubtreeSize(i))
      }
    })

    it('should produce identical toArray', () => {
      const cd = buildSampleTree()
      const copy = cd.clone()
      expect(copy.toArray()).toEqual(cd.toArray())
    })

    it('should produce identical distances', () => {
      const cd = buildSampleTree()
      const copy = cd.clone()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          expect(copy.getDistance(i, j)).toBe(cd.getDistance(i, j))
        }
      }
    })

    it('should produce identical levels', () => {
      const cd = buildSampleTree()
      const copy = cd.clone()
      for (let i = 0; i < 10; i++) {
        expect(copy.getLevel(i)).toBe(cd.getLevel(i))
      }
    })

    it('should produce identical LCA', () => {
      const cd = buildSampleTree()
      const copy = cd.clone()
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          expect(copy.getLCA(i, j)).toBe(cd.getLCA(i, j))
        }
      }
    })

    it('should be independent from original', () => {
      const cd = new CentroidDecomposition(5)
      for (let i = 0; i < 4; i++) cd.addEdge(i, i + 1)
      cd.build()
      const copy = cd.clone()
      expect(copy.getSize()).toBe(cd.getSize())
      expect(copy.getCentroid()).toBe(cd.getCentroid())
    })
  })

  describe('centroid property', () => {
    it('centroid of single node is the node itself', () => {
      const cd = new CentroidDecomposition(1)
      cd.build()
      expect(cd.getCentroid()).toBe(0)
      expect(cd.getSubtreeSize(0)).toBe(1)
    })

    it('centroid root subtree size equals n', () => {
      const cd = buildSampleTree()
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(10)
    })

    it('path centroid should be near middle', () => {
      const cd = buildPath(9)
      const root = cd.getCentroid()
      expect(root).toBeGreaterThanOrEqual(2)
      expect(root).toBeLessThanOrEqual(6)
    })

    it('star centroid should be center', () => {
      const cd = buildStar(10)
      expect(cd.getCentroid()).toBe(0)
    })

    it('each subtree of centroid root should have size <= n/2', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      const ch = cd.getChildren(root)
      for (const child of ch) {
        expect(cd.getSubtreeSize(child)).toBeLessThanOrEqual(Math.floor(10 / 2))
      }
    })
  })

  describe('path graph', () => {
    it('should decompose path of 5 nodes correctly', () => {
      const cd = buildPath(5)
      expect(cd.getSize()).toBe(5)
      const arr = cd.toArray()
      expect(arr.length).toBe(5)
    })

    it('should have correct distances in path', () => {
      const cd = buildPath(7)
      expect(cd.getDistance(0, 6)).toBe(6)
      expect(cd.getDistance(2, 5)).toBe(3)
      expect(cd.getDistance(1, 1)).toBe(0)
    })

    it('should have all nodes in toArray', () => {
      const cd = buildPath(10)
      const arr = cd.toArray()
      const sorted = [...arr].sort((a, b) => a - b)
      for (let i = 0; i < 10; i++) {
        expect(sorted[i]).toBe(i)
      }
    })

    it('should build path of 3 nodes', () => {
      const cd = buildPath(3)
      const root = cd.getCentroid()
      expect(root).toBe(1)
      expect(cd.getSubtreeSize(root)).toBe(3)
    })

    it('should handle path of 50 nodes', () => {
      const cd = buildPath(50)
      expect(cd.getSize()).toBe(50)
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(50)
      expect(cd.getDistance(0, 49)).toBe(49)
    })
  })

  describe('star graph', () => {
    it('should have center as centroid', () => {
      const cd = buildStar(10)
      expect(cd.getCentroid()).toBe(0)
    })

    it('should have all leaves at depth 1', () => {
      const cd = buildStar(10)
      for (let i = 1; i < 10; i++) {
        expect(cd.getDepth(i)).toBe(1)
      }
    })

    it('should have correct subtree sizes', () => {
      const cd = buildStar(10)
      for (let i = 1; i < 10; i++) {
        expect(cd.getSubtreeSize(i)).toBe(1)
      }
    })

    it('should have correct distances', () => {
      const cd = buildStar(5)
      expect(cd.getDistance(1, 2)).toBe(2)
      expect(cd.getDistance(1, 3)).toBe(2)
      expect(cd.getDistance(0, 4)).toBe(1)
    })

    it('should have correct LCA', () => {
      const cd = buildStar(5)
      expect(cd.getLCA(1, 2)).toBe(0)
      expect(cd.getLCA(3, 4)).toBe(0)
      expect(cd.getLCA(0, 1)).toBe(0)
    })

    it('should handle star of 100 nodes', () => {
      const cd = buildStar(100)
      expect(cd.getCentroid()).toBe(0)
      expect(cd.getSubtreeSize(0)).toBe(100)
    })
  })

  describe('binary tree', () => {
    it('should decompose 3-level binary tree', () => {
      const { cd, n } = buildCompleteBinaryTree(3)
      expect(cd.getSize()).toBe(7)
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(7)
    })

    it('should have correct distances in binary tree', () => {
      const { cd } = buildCompleteBinaryTree(3)
      expect(cd.getDistance(0, 3)).toBe(2)
      expect(cd.getDistance(3, 4)).toBe(2)
      expect(cd.getDistance(3, 5)).toBe(4)
      expect(cd.getDistance(1, 2)).toBe(2)
    })

    it('should have all nodes in toArray', () => {
      const { cd, n } = buildCompleteBinaryTree(4)
      const arr = cd.toArray()
      expect(arr.length).toBe(n)
      expect(new Set(arr).size).toBe(n)
    })

    it('should have depth bounded by log2(n)', () => {
      const { cd, n } = buildCompleteBinaryTree(5)
      let maxDepth = 0
      for (let i = 0; i < n; i++) {
        maxDepth = Math.max(maxDepth, cd.getDepth(i))
      }
      expect(maxDepth).toBeLessThanOrEqual(Math.ceil(Math.log2(n)) + 1)
    })

    it('should build 4-level binary tree', () => {
      const { cd, n } = buildCompleteBinaryTree(4)
      expect(n).toBe(15)
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(15)
    })
  })

  describe('tree structure invariants', () => {
    it('should have exactly one root with parent -1', () => {
      const cd = buildSampleTree()
      let rootCount = 0
      for (let i = 0; i < 10; i++) {
        if (cd.getParent(i) === -1) rootCount++
      }
      expect(rootCount).toBe(1)
    })

    it('should have exactly n-1 edges in centroid tree', () => {
      const cd = buildSampleTree()
      let edgeCount = 0
      for (let i = 0; i < 10; i++) {
        edgeCount += cd.getChildren(i).length
      }
      expect(edgeCount).toBe(9)
    })

    it('should have children consistent with parent', () => {
      const cd = buildSampleTree()
      const childSet = new Set<number>()
      for (let i = 0; i < 10; i++) {
        const ch = cd.getChildren(i)
        for (const c of ch) {
          expect(childSet.has(c)).toBe(false)
          childSet.add(c)
          expect(cd.getParent(c)).toBe(i)
        }
      }
      expect(childSet.size).toBe(9)
    })

    it('should have subtree sizes decreasing along paths from root', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      const stack: number[] = [root]
      while (stack.length > 0) {
        const node = stack.pop()!
        const ch = cd.getChildren(node)
        for (const child of ch) {
          expect(cd.getSubtreeSize(child)).toBeLessThan(cd.getSubtreeSize(node))
          stack.push(child)
        }
      }
    })
  })

  describe('edge cases', () => {
    it('should handle single node tree', () => {
      const cd = new CentroidDecomposition(1)
      cd.build()
      expect(cd.getCentroid()).toBe(0)
      expect(cd.getDepth(0)).toBe(0)
      expect(cd.getParent(0)).toBe(-1)
      expect(cd.getChildren(0)).toEqual([])
      expect(cd.getSubtreeSize(0)).toBe(1)
      expect(cd.getLevel(0)).toBe(0)
      expect(cd.toArray()).toEqual([0])
      expect(cd.getDistance(0, 0)).toBe(0)
      expect(cd.getLCA(0, 0)).toBe(0)
      expect(cd.getPath(0, 0)).toEqual([0])
    })

    it('should handle two-node tree', () => {
      const cd = new CentroidDecomposition(2)
      cd.addEdge(0, 1)
      cd.build()
      expect(cd.getSize()).toBe(2)
      expect(cd.getDistance(0, 1)).toBe(1)
      const root = cd.getCentroid()
      expect(cd.getParent(root)).toBe(-1)
      expect(cd.getSubtreeSize(root)).toBe(2)
    })

    it('should handle three-node path', () => {
      const cd = new CentroidDecomposition(3)
      cd.addEdge(0, 1)
      cd.addEdge(1, 2)
      cd.build()
      expect(cd.getCentroid()).toBe(1)
      expect(cd.getDistance(0, 2)).toBe(2)
      expect(cd.getDistance(0, 1)).toBe(1)
    })

    it('should handle three-node star', () => {
      const cd = new CentroidDecomposition(3)
      cd.addEdge(0, 1)
      cd.addEdge(0, 2)
      cd.build()
      expect(cd.getCentroid()).toBe(0)
      expect(cd.getDistance(1, 2)).toBe(2)
    })

    it('should handle four-node path', () => {
      const cd = buildPath(4)
      expect(cd.getSize()).toBe(4)
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(4)
    })

    it('should handle five-node star', () => {
      const cd = buildStar(5)
      expect(cd.getCentroid()).toBe(0)
      expect(cd.getSubtreeSize(0)).toBe(5)
    })
  })

  describe('large tree stress tests', () => {
    it('should handle 100-node path graph', () => {
      const cd = buildPath(100)
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(100)
      expect(cd.getDistance(0, 99)).toBe(99)
    })

    it('should handle 100-node star graph', () => {
      const cd = buildStar(100)
      expect(cd.getCentroid()).toBe(0)
      expect(cd.getSubtreeSize(0)).toBe(100)
      expect(cd.getDistance(1, 50)).toBe(2)
    })

    it('should handle 500-node path graph', () => {
      const cd = buildPath(500)
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(500)
      expect(cd.getDistance(0, 499)).toBe(499)
    })

    it('should handle 1000-node star graph', () => {
      const cd = buildStar(1000)
      expect(cd.getCentroid()).toBe(0)
      expect(cd.getSubtreeSize(0)).toBe(1000)
    })

    it('should handle 1023-node complete binary tree', () => {
      const { cd, n } = buildCompleteBinaryTree(10)
      expect(n).toBe(1023)
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(1023)
    })

    it('should handle 2000-node binary-like tree', () => {
      const cd = new CentroidDecomposition(2000)
      for (let i = 1; i < 2000; i++) {
        cd.addEdge(Math.floor(i / 2), i)
      }
      cd.build()
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(2000)
    })

    it('should handle 5000-node path', () => {
      const cd = buildPath(5000)
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(5000)
      expect(cd.getDistance(0, 4999)).toBe(4999)
    })
  })

  describe('centroid tree properties', () => {
    it('should form a valid tree (connected, acyclic)', () => {
      const cd = buildSampleTree()
      const n = cd.getSize()
      let edgeCount = 0
      const visited = new Set<number>()
      const stack = [cd.getCentroid()]
      visited.add(cd.getCentroid())
      while (stack.length > 0) {
        const node = stack.pop()!
        for (const child of cd.getChildren(node)) {
          visited.add(child)
          stack.push(child)
          edgeCount++
        }
      }
      expect(visited.size).toBe(n)
      expect(edgeCount).toBe(n - 1)
    })

    it('should have centroid root as only node with parent -1', () => {
      const cd = buildPath(15)
      const root = cd.getCentroid()
      let rootCount = 0
      for (let i = 0; i < 15; i++) {
        if (cd.getParent(i) === -1) rootCount++
      }
      expect(rootCount).toBe(1)
      expect(cd.getParent(root)).toBe(-1)
    })

    it('should have subtree size of root equal to n', () => {
      const { cd, n } = buildCompleteBinaryTree(4)
      expect(cd.getSubtreeSize(cd.getCentroid())).toBe(n)
    })

    it('should have each subtree of centroid at most n/2', () => {
      const { cd, n } = buildCompleteBinaryTree(4)
      const root = cd.getCentroid()
      for (const child of cd.getChildren(root)) {
        expect(cd.getSubtreeSize(child)).toBeLessThanOrEqual(Math.ceil(n / 2))
      }
    })

    it('should have centroid depth O(log n) for balanced tree', () => {
      const { cd, n } = buildCompleteBinaryTree(6)
      let maxDepth = 0
      for (let i = 0; i < n; i++) {
        maxDepth = Math.max(maxDepth, cd.getDepth(i))
      }
      expect(maxDepth).toBeLessThanOrEqual(2 * Math.ceil(Math.log2(n)))
    })

    it('should handle LCA returning valid centroid tree ancestor', () => {
      const cd = buildSampleTree()
      for (let i = 0; i < 10; i++) {
        const ancestors = new Set<number>()
        let current = i
        ancestors.add(current)
        while (cd.getParent(current) !== -1) {
          current = cd.getParent(current)
          ancestors.add(current)
        }
        for (let j = i + 1; j < 10; j++) {
          const lca = cd.getLCA(i, j)
          expect(ancestors.has(lca)).toBe(true)
        }
      }
    })

    it('should have toArray in pre-order traversal', () => {
      const cd = buildSampleTree()
      const arr = cd.toArray()
      expect(arr[0]).toBe(cd.getCentroid())
      for (const node of arr) {
        const ch = cd.getChildren(node)
        if (ch.length > 0) {
          const nodeIdx = arr.indexOf(node)
          const firstChildIdx = arr.indexOf(ch[0]!)
          expect(firstChildIdx).toBeGreaterThan(nodeIdx)
        }
      }
    })

    it('should handle getPath between non-adjacent centroid tree nodes', () => {
      const cd = buildSampleTree()
      const root = cd.getCentroid()
      const grandchildren: number[] = []
      for (const child of cd.getChildren(root)) {
        for (const gc of cd.getChildren(child)) {
          grandchildren.push(gc)
        }
      }
      if (grandchildren.length >= 2) {
        const path = cd.getPath(grandchildren[0]!, grandchildren[1]!)
        expect(path.length).toBeGreaterThanOrEqual(3)
        const lca = cd.getLCA(grandchildren[0]!, grandchildren[1]!)
        expect(path.includes(lca)).toBe(true)
      }
    })
  })

  describe('original tree distance consistency', () => {
    it('should compute correct distances for all pairs in binary tree', () => {
      const { cd, n } = buildCompleteBinaryTree(3)
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dist = cd.getDistance(i, j)
          expect(dist).toBeGreaterThan(0)
          expect(dist).toBeLessThan(n)
        }
      }
    })

    it('should have distance consistent with BFS', () => {
      const cd = buildSampleTree()
      const adj: number[][] = Array.from({ length: 10 }, () => [])
      const edges: [number, number][] = [
        [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 7], [4, 8], [6, 9],
      ]
      for (const [u, v] of edges) {
        adj[u]!.push(v)
        adj[v]!.push(u)
      }
      for (let start = 0; start < 10; start++) {
        const dist = new Int32Array(10).fill(-1)
        dist[start] = 0
        const queue = [start]
        while (queue.length > 0) {
          const node = queue.shift()!
          for (const neighbor of adj[node]!) {
            if (dist[neighbor] === -1) {
              dist[neighbor] = dist[node]! + 1
              queue.push(neighbor)
            }
          }
        }
        for (let end = 0; end < 10; end++) {
          expect(cd.getDistance(start, end)).toBe(dist[end]!)
        }
      }
    })

    it('should have zero distance for all self-pairs', () => {
      const cd = buildPath(20)
      for (let i = 0; i < 20; i++) {
        expect(cd.getDistance(i, i)).toBe(0)
      }
    })
  })

  describe('types module', () => {
    it('should export types module without error', async () => {
      const types = await import('../../src/core/centroid-decomposition/types.js')
      expect(types).toBeDefined()
    })
  })
})
