import type { CentroidDecompositionResult } from './types.js'

export class CentroidDecomposition {
  private n: number
  private adj: number[][]
  private built: boolean
  private decomposed: CentroidDecompositionResult | null

  constructor(n: number) {
    this.n = n
    this.adj = []
    for (let i = 0; i < n; i++) {
      this.adj.push([])
    }
    this.built = false
    this.decomposed = null
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
    this.adj[v]!.push(u)
  }

  build(): void {
    if (this.n === 0) {
      this.built = true
      this.decomposed = {
        centroidRoot: -1,
        parent: new Int32Array(0),
        depth: new Int32Array(0),
        level: new Int32Array(0),
        subtreeSize: new Int32Array(0),
        children: [],
        originalParent: new Int32Array(0),
        originalDepth: new Int32Array(0),
      }
      return
    }

    const parent = new Int32Array(this.n).fill(-1)
    const depth = new Int32Array(this.n).fill(0)
    const level = new Int32Array(this.n).fill(0)
    const subtreeSize = new Int32Array(this.n).fill(1)
    const children: number[][] = []
    for (let i = 0; i < this.n; i++) {
      children.push([])
    }

    const originalParent = new Int32Array(this.n).fill(-1)
    const originalDepth = new Int32Array(this.n).fill(0)

    const visited = new Uint8Array(this.n)
    const bfsQueue: number[] = [0]
    visited[0] = 1
    originalParent[0] = -1
    originalDepth[0] = 0

    while (bfsQueue.length > 0) {
      const node = bfsQueue.shift()!
      for (let i = 0; i < this.adj[node]!.length; i++) {
        const child = this.adj[node]![i]!
        if (!visited[child]) {
          visited[child] = 1
          originalParent[child] = node
          originalDepth[child] = originalDepth[node]! + 1
          bfsQueue.push(child)
        }
      }
    }

    const removed = new Uint8Array(this.n)
    const componentSize = new Int32Array(this.n)

    const computeSizes = (start: number): number => {
      const stack: number[] = [start, -1]
      const order: Array<[number, number]> = []

      while (stack.length > 0) {
        const par = stack.pop()!
        const node = stack.pop()!
        order.push([node, par])
        componentSize[node] = 1

        for (let i = 0; i < this.adj[node]!.length; i++) {
          const neighbor = this.adj[node]![i]!
          if (!removed[neighbor] && neighbor !== par) {
            stack.push(neighbor)
            stack.push(node)
          }
        }
      }

      for (let i = order.length - 1; i >= 1; i--) {
        const [node, par] = order[i]!
        if (par !== -1) {
          componentSize[par]! += componentSize[node]!
        }
      }

      return componentSize[start]!
    }

    const findCentroid = (start: number, treeSize: number): number => {
      let centroid = start
      let found = false
      let prevPar = -1

      while (!found) {
        found = true
        for (let i = 0; i < this.adj[centroid]!.length; i++) {
          const neighbor = this.adj[centroid]![i]!
          if (!removed[neighbor] && neighbor !== prevPar) {
            if (componentSize[neighbor]! > Math.floor(treeSize / 2)) {
              const saved = componentSize[centroid]!
              componentSize[centroid]! -= componentSize[neighbor]!
              componentSize[neighbor]! = saved
              prevPar = centroid
              centroid = neighbor
              found = false
              break
            }
          }
        }
      }
      return centroid
    }

    const decomposeRecursive = (start: number, centroidParent: number, currentLevel: number): void => {
      const treeSize = computeSizes(start)
      const centroid = findCentroid(start, treeSize)

      removed[centroid] = 1
      parent[centroid] = centroidParent
      depth[centroid] = centroidParent === -1 ? 0 : depth[centroidParent]! + 1
      level[centroid] = currentLevel
      subtreeSize[centroid] = treeSize

      if (centroidParent !== -1) {
        children[centroidParent]!.push(centroid)
      }

      for (let i = 0; i < this.adj[centroid]!.length; i++) {
        const neighbor = this.adj[centroid]![i]!
        if (!removed[neighbor]) {
          decomposeRecursive(neighbor, centroid, currentLevel + 1)
        }
      }
    }

    decomposeRecursive(0, -1, 0)

    let root = -1
    for (let i = 0; i < this.n; i++) {
      if (parent[i] === -1) {
        root = i
        break
      }
    }

    this.decomposed = {
      centroidRoot: root,
      parent,
      depth,
      level,
      subtreeSize,
      children,
      originalParent,
      originalDepth,
    }
    this.built = true
  }

  private ensureBuilt(): CentroidDecompositionResult {
    if (!this.built || !this.decomposed) {
      throw new Error('Must call build() before querying')
    }
    return this.decomposed
  }

  getCentroid(): number {
    const d = this.ensureBuilt()
    return d.centroidRoot
  }

  getDepth(node: number): number {
    const d = this.ensureBuilt()
    return d.depth[node]!
  }

  getParent(node: number): number {
    const d = this.ensureBuilt()
    return d.parent[node]!
  }

  getChildren(node: number): number[] {
    const d = this.ensureBuilt()
    return d.children[node]!.slice()
  }

  getSubtreeSize(node: number): number {
    const d = this.ensureBuilt()
    return d.subtreeSize[node]!
  }

  isInSameComponent(_u: number, _v: number): boolean {
    this.ensureBuilt()
    return true
  }

  getDistance(u: number, v: number): number {
    const d = this.ensureBuilt()
    const lca = this.getOriginalLCA(u, v)
    return (d.originalDepth[u]! - d.originalDepth[lca]!) + (d.originalDepth[v]! - d.originalDepth[lca]!)
  }

  private getOriginalLCA(u: number, v: number): number {
    const d = this.ensureBuilt()
    const depthU = d.originalDepth[u]!
    const depthV = d.originalDepth[v]!
    let a = u
    let b = v
    if (depthU > depthV) {
      for (let i = 0; i < depthU - depthV; i++) {
        a = d.originalParent[a]!
      }
    } else if (depthV > depthU) {
      for (let i = 0; i < depthV - depthU; i++) {
        b = d.originalParent[b]!
      }
    }
    while (a !== b) {
      a = d.originalParent[a]!
      b = d.originalParent[b]!
    }
    return a
  }

  getLCA(u: number, v: number): number {
    const d = this.ensureBuilt()
    let a = u
    let b = v
    const ancestorsA: number[] = [a]
    while (d.parent[a]! !== -1) {
      a = d.parent[a]!
      ancestorsA.push(a)
    }
    const ancestorSet = new Set(ancestorsA)
    while (!ancestorSet.has(b)) {
      b = d.parent[b]!
    }
    return b
  }

  getPath(u: number, v: number): number[] {
    const d = this.ensureBuilt()
    const lca = this.getLCA(u, v)
    const path: number[] = []
    let current = u
    while (current !== lca) {
      path.push(current)
      current = d.parent[current]!
    }
    path.push(lca)
    const suffix: number[] = []
    current = v
    while (current !== lca) {
      suffix.push(current)
      current = d.parent[current]!
    }
    for (let i = suffix.length - 1; i >= 0; i--) {
      path.push(suffix[i]!)
    }
    return path
  }

  getLevel(node: number): number {
    const d = this.ensureBuilt()
    return d.level[node]!
  }

  getSize(): number {
    return this.n
  }

  toArray(): number[] {
    const d = this.ensureBuilt()
    const result: number[] = []
    if (d.centroidRoot === -1) return result
    const stack: number[] = [d.centroidRoot]
    while (stack.length > 0) {
      const node = stack.pop()!
      result.push(node)
      const ch = d.children[node]!
      for (let i = ch.length - 1; i >= 0; i--) {
        stack.push(ch[i]!)
      }
    }
    return result
  }

  clone(): CentroidDecomposition {
    const copy = new CentroidDecomposition(this.n)
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.adj[i]!.length; j++) {
        if (this.adj[i]![j]! > i) {
          copy.addEdge(i, this.adj[i]![j]!)
        }
      }
    }
    if (this.built) {
      copy.build()
    }
    return copy
  }
}
