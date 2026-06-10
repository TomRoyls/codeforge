import type { Edge, MSTResult, RandomizedMSTOptions } from './types.js'
import { DEFAULT_RANDOMIZED_MST_OPTIONS } from './types.js'

class SeededRandom {
  private state: number

  constructor(seed?: number) {
    this.state = seed ?? (Math.random() * 2147483647) | 0
    if (this.state <= 0) this.state = 1
  }

  next(): number {
    this.state = (this.state * 16807) % 2147483647
    return (this.state - 1) / 2147483646
  }

  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }

  shuffle<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i)
      const tmp = result[i]!
      result[i] = result[j]!
      result[j] = tmp
    }
    return result
  }
}

class UnionFind<V> {
  private parent: Map<V, V>
  private rank: Map<V, number>

  constructor(vertices: Iterable<V>) {
    this.parent = new Map()
    this.rank = new Map()
    for (const v of vertices) {
      this.parent.set(v, v)
      this.rank.set(v, 0)
    }
  }

  find(x: V): V {
    let root = x
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!
    }
    let current = x
    while (current !== root) {
      const next = this.parent.get(current)!
      this.parent.set(current, root)
      current = next
    }
    return root
  }

  union(a: V, b: V): boolean {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return false
    const rankA = this.rank.get(ra)!
    const rankB = this.rank.get(rb)!
    if (rankA < rankB) {
      this.parent.set(ra, rb)
    } else if (rankA > rankB) {
      this.parent.set(rb, ra)
    } else {
      this.parent.set(rb, ra)
      this.rank.set(ra, rankA + 1)
    }
    return true
  }

  connected(a: V, b: V): boolean {
    return this.find(a) === this.find(b)
  }

  getComponents(): Map<V, V[]> {
    const comps = new Map<V, V[]>()
    for (const [v] of this.parent) {
      const root = this.find(v)
      if (!comps.has(root)) {
        comps.set(root, [])
      }
      comps.get(root)!.push(v)
    }
    return comps
  }

  componentCount(): number {
    const roots = new Set<V>()
    for (const [v] of this.parent) {
      roots.add(this.find(v))
    }
    return roots.size
  }
}

export class RandomizedMST<V> {
  private edges: Edge<V>[] = []
  private vertices: Set<V> = new Set()
  private mstResult: MSTResult<V> | null = null
  private rng: SeededRandom
  private dirty = true

  constructor(
    edges?: Iterable<Edge<V>>,
    vertices?: Iterable<V>,
    options?: RandomizedMSTOptions
  ) {
    const opts: RandomizedMSTOptions = { ...DEFAULT_RANDOMIZED_MST_OPTIONS, ...options }
    this.rng = new SeededRandom(opts.seed)
    if (vertices) {
      for (const v of vertices) {
        this.vertices.add(v)
      }
    }
    if (edges) {
      for (const e of edges) {
        this.addEdgeInternal(e.from, e.to, e.weight)
      }
    }
  }

  private addEdgeInternal(from: V, to: V, weight: number): void {
    if (weight < 0) {
      throw new RangeError('Edge weight must be non-negative')
    }
    this.edges.push({ from, to, weight })
    this.vertices.add(from)
    this.vertices.add(to)
    this.dirty = true
  }

  addEdge(from: V, to: V, weight: number): void {
    this.addEdgeInternal(from, to, weight)
  }

  private randomizedKruskal(edges: Edge<V>[], vertexSet: Set<V>): MSTResult<V> {
    const verts = [...vertexSet]
    if (verts.length === 0) {
      return { edges: [], totalWeight: 0, components: new Map() }
    }
    const uf = new UnionFind(verts)
    const shuffled = this.rng.shuffle(edges)
    const sorted = shuffled.sort((a, b) => a.weight - b.weight)
    const mstEdges: Edge<V>[] = []

    for (const e of sorted) {
      if (uf.union(e.from, e.to)) {
        mstEdges.push(e)
        if (mstEdges.length === verts.length - 1) break
      }
    }

    const totalWeight = mstEdges.reduce((sum, e) => sum + e.weight, 0)
    return {
      edges: mstEdges,
      totalWeight,
      components: uf.getComponents(),
    }
  }

  private randomizedMSTRecursive(edges: Edge<V>[], vertexSet: Set<V>): MSTResult<V> {
    const verts = [...vertexSet]
    if (verts.length <= 1) {
      return this.randomizedKruskal(edges, vertexSet)
    }
    if (edges.length === 0) {
      return this.randomizedKruskal(edges, vertexSet)
    }

    if (verts.length <= 6 || edges.length <= 10) {
      return this.randomizedKruskal(edges, vertexSet)
    }

    const sampled = edges.filter(() => this.rng.next() < 0.5)
    if (sampled.length === 0) {
      return this.randomizedKruskal(edges, vertexSet)
    }

    const sampleResult = this.randomizedMSTRecursive(sampled, vertexSet)

    const filtered = this.filterHeavyEdges(edges, sampleResult, vertexSet)
    return this.randomizedKruskal(filtered, vertexSet)
  }

  private filterHeavyEdges(
    allEdges: Edge<V>[],
    sampleMST: MSTResult<V>,
    vertexSet: Set<V>
  ): Edge<V>[] {
    if (sampleMST.edges.length === 0) {
      return [...allEdges]
    }

    const adj = new Map<V, Array<{ neighbor: V; weight: number }>>()
    for (const v of vertexSet) {
      adj.set(v, [])
    }
    for (const e of sampleMST.edges) {
      adj.get(e.from)!.push({ neighbor: e.to, weight: e.weight })
      adj.get(e.to)!.push({ neighbor: e.from, weight: e.weight })
    }

    const mstEdgeSet = new Set<string>()
    for (const e of sampleMST.edges) {
      const keyA = `${String(e.from)}|${String(e.to)}|${e.weight}`
      const keyB = `${String(e.to)}|${String(e.from)}|${e.weight}`
      mstEdgeSet.add(keyA)
      mstEdgeSet.add(keyB)
    }

    const compUF = new UnionFind(vertexSet)
    for (const e of sampleMST.edges) {
      compUF.union(e.from, e.to)
    }

    return allEdges.filter(e => {
      const key = `${String(e.from)}|${String(e.to)}|${e.weight}`
      if (mstEdgeSet.has(key)) return true

      if (!compUF.connected(e.from, e.to)) return true

      const maxOnPath = this.findMaxWeightOnPath(e.from, e.to, adj, vertexSet)
      return e.weight < maxOnPath
    })
  }

  private findMaxWeightOnPath(
    start: V,
    end: V,
    adj: Map<V, Array<{ neighbor: V; weight: number }>>,
    _vertexSet: Set<V>
  ): number {
    const visited = new Set<V>()
    const parent = new Map<V, V>()
    const parentWeight = new Map<V, number>()
    const queue: V[] = [start]
    visited.add(start)
    let _qi = 0

    while (_qi < queue.length) {
      const current = queue[_qi++]!
      if (current === end) break
      for (const { neighbor, weight } of adj.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          parent.set(neighbor, current)
          parentWeight.set(neighbor, weight)
          queue.push(neighbor)
        }
      }
    }

    if (!visited.has(end)) return 0

    let maxW = 0
    let cur: V | undefined = end
    while (cur !== undefined && cur !== start) {
      const w = parentWeight.get(cur)
      if (w !== undefined && w > maxW) maxW = w
      cur = parent.get(cur)
    }
    return maxW
  }

  compute(): MSTResult<V> {
    if (this.vertices.size === 0) {
      this.mstResult = { edges: [], totalWeight: 0, components: new Map() }
      return this.mstResult
    }
    this.mstResult = this.randomizedMSTRecursive(this.edges, new Set(this.vertices))
    this.dirty = false
    return this.mstResult
  }

  getMST(): Edge<V>[] {
    if (this.dirty || !this.mstResult) this.compute()
    return [...this.mstResult!.edges]
  }

  getTotalWeight(): number {
    if (this.dirty || !this.mstResult) this.compute()
    return this.mstResult!.totalWeight
  }

  getTree(): Map<V, Array<{ neighbor: V; weight: number }>> {
    if (this.dirty || !this.mstResult) this.compute()
    const tree = new Map<V, Array<{ neighbor: V; weight: number }>>()
    for (const v of this.vertices) {
      tree.set(v, [])
    }
    for (const e of this.mstResult!.edges) {
      tree.get(e.from)!.push({ neighbor: e.to, weight: e.weight })
      tree.get(e.to)!.push({ neighbor: e.from, weight: e.weight })
    }
    return tree
  }

  isConnected(): boolean {
    if (this.vertices.size <= 1) return true
    if (this.dirty || !this.mstResult) this.compute()
    return this.mstResult!.edges.length === this.vertices.size - 1
  }

  getComponents(): Map<V, V[]> {
    if (this.dirty || !this.mstResult) this.compute()
    return this.mstResult!.components
  }

  vertexCount(): number {
    return this.vertices.size
  }

  edgeCount(): number {
    return this.edges.length
  }

  toString(): string {
    return `RandomizedMST({ size: ${this.edges.length} })`
  }

  get [Symbol.toStringTag](): string {
    return 'RandomizedMST'
  }
}
