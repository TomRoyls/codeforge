import type { HLDDecompositionResult, HLDPathSegment } from './types.js'

export class HeavyLightDecomposition {
  private n: number
  private adj: number[][]
  private built: boolean
  private decomposed: HLDDecompositionResult | null

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

  build(root: number = 0): void {
    if (this.n === 0) {
      this.built = true
      this.decomposed = {
        head: new Int32Array(0),
        pos: new Int32Array(0),
        depth: new Int32Array(0),
        parent: new Int32Array(0),
        subtreeSize: new Int32Array(0),
      }
      return
    }

    const head = new Int32Array(this.n).fill(-1)
    const pos = new Int32Array(this.n).fill(-1)
    const depth = new Int32Array(this.n).fill(0)
    const parent = new Int32Array(this.n).fill(-1)
    const subtreeSize = new Int32Array(this.n).fill(1)
    const heavy = new Int32Array(this.n).fill(-1)

    const dfsOrder: number[] = []
    const stack: number[] = [root]
    const visited = new Uint8Array(this.n)
    parent[root] = -1
    depth[root] = 0
    visited[root] = 1

    while (stack.length > 0) {
      const node = stack.pop()!
      dfsOrder.push(node)
      for (let i = 0; i < this.adj[node]!.length; i++) {
        const child = this.adj[node]![i]!
        if (!visited[child]) {
          visited[child] = 1
          parent[child] = node
          depth[child] = depth[node]! + 1
          stack.push(child)
        }
      }
    }

    for (let i = dfsOrder.length - 1; i >= 0; i--) {
      const node = dfsOrder[i]!
      let maxSubtree = 0
      for (let j = 0; j < this.adj[node]!.length; j++) {
        const child = this.adj[node]![j]!
        if (child !== parent[node]!) {
          subtreeSize[node]! += subtreeSize[child]!
          if (subtreeSize[child]! > maxSubtree) {
            maxSubtree = subtreeSize[child]!
            heavy[node]! = child
          }
        }
      }
    }

    let currentPosition = 0
    head[root] = root
    const decomposeStack: Array<[number, number]> = [[root, root]]

    while (decomposeStack.length > 0) {
      const [current, currentHead] = decomposeStack.pop()!
      head[current] = currentHead
      pos[current] = currentPosition++
      const heavyChild = heavy[current]!
      if (heavyChild !== -1) {
        decomposeStack.push([heavyChild, currentHead])
      }
      for (let i = 0; i < this.adj[current]!.length; i++) {
        const child = this.adj[current]![i]!
        if (child !== parent[current]! && child !== heavyChild) {
          decomposeStack.push([child, child])
        }
      }
    }

    this.decomposed = { head, pos, depth, parent, subtreeSize }
    this.built = true
  }

  private ensureBuilt(): HLDDecompositionResult {
    if (!this.built || !this.decomposed) {
      throw new Error('Must call build() before querying')
    }
    return this.decomposed
  }

  lca(u: number, v: number): number {
    const d = this.ensureBuilt()
    let a = u
    let b = v
    while (d.head[a] !== d.head[b]) {
      if (d.depth[d.head[a]!]! > d.depth[d.head[b]!]!) {
        a = d.parent[d.head[a]!]!
      } else {
        b = d.parent[d.head[b]!]!
      }
    }
    return d.depth[a]! < d.depth[b]! ? a : b
  }

  pathQuery(u: number, v: number): HLDPathSegment[] {
    const d = this.ensureBuilt()
    const segments: HLDPathSegment[] = []
    let a = u
    let b = v
    while (d.head[a] !== d.head[b]) {
      if (d.depth[d.head[a]!]! > d.depth[d.head[b]!]!) {
        segments.push({ node: a, head: d.head[a]! })
        a = d.parent[d.head[a]!]!
      } else {
        segments.push({ node: b, head: d.head[b]! })
        b = d.parent[d.head[b]!]!
      }
    }
    segments.push({ node: b, head: d.head[a]! })
    return segments
  }

  getDepth(node: number): number {
    const d = this.ensureBuilt()
    return d.depth[node]!
  }

  getParent(node: number): number {
    const d = this.ensureBuilt()
    return d.parent[node]!
  }

  getSubtreeSize(node: number): number {
    const d = this.ensureBuilt()
    return d.subtreeSize[node]!
  }

  getHead(node: number): number {
    const d = this.ensureBuilt()
    return d.head[node]!
  }

  getPos(node: number): number {
    const d = this.ensureBuilt()
    return d.pos[node]!
  }

  isAncestor(ancestor: number, descendant: number): boolean {
    const d = this.ensureBuilt()
    if (ancestor === descendant) return true
    let current = descendant
    while (current !== -1) {
      const p = d.parent[current]!
      if (p === ancestor) return true
      current = p
    }
    return false
  }

  subtreeRange(node: number): [number, number] {
    const d = this.ensureBuilt()
    const pos = d.pos[node]!
    return [pos, pos + d.subtreeSize[node]!]
  }
}
