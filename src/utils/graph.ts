export interface GraphOptions {
  directed?: boolean
}

import { increment } from './map-helpers.js'
import { PriorityQueue } from './priority-queue.js'

interface EdgeEntry {
  to: string
  weight: number
}

export class Graph<V = undefined> {
  private readonly adjacency = new Map<string, EdgeEntry[]>()
  private readonly vertices = new Map<string, V>()
  private readonly directed: boolean
  private _edgeCount = 0

  constructor(options?: GraphOptions) {
    this.directed = options?.directed ?? false
  }

  public addVertex(id: string, data?: V): void {
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, [])
    }
    if (arguments.length >= 2) {
      this.vertices.set(id, data as V)
    } else if (!this.vertices.has(id)) {
      this.vertices.set(id, undefined as V)
    }
  }

  public removeVertex(id: string): void {
    if (!this.adjacency.has(id)) return

    if (this.directed) {
      const outgoing = this.adjacency.get(id)!
      this._edgeCount -= outgoing.length
      this.adjacency.delete(id)
      this.vertices.delete(id)

      const entries = Array.from(this.adjacency.entries())
      for (const [vertex, edges] of entries) {
        const before = edges.length
        const filtered = edges.filter((e) => e.to !== id)
        if (filtered.length !== before) {
          this.adjacency.set(vertex, filtered)
          this._edgeCount -= before - filtered.length
        }
      }
    } else {
      const edgesToRemove = this.adjacency.get(id)!
      this.adjacency.delete(id)
      this.vertices.delete(id)

      for (const edge of edgesToRemove) {
        if (edge.to === id) continue
        const neighborEdges = this.adjacency.get(edge.to)
        if (neighborEdges) {
          const idx = neighborEdges.findIndex((e) => e.to === id)
          if (idx !== -1) neighborEdges.splice(idx, 1)
        }
      }

      this._edgeCount -= edgesToRemove.filter((e) => e.to !== id).length
      const selfLoops = edgesToRemove.filter((e) => e.to === id).length
      this._edgeCount -= selfLoops
    }
  }

  public addEdge(from: string, to: string, weight = 1): void {
    if (!this.adjacency.has(from)) this.addVertex(from)
    if (!this.adjacency.has(to)) this.addVertex(to)

    const edges = this.adjacency.get(from)!
    const existing = edges.find((e) => e.to === to)
    if (existing) {
      existing.weight = weight
      if (!this.directed && from !== to) {
        const reverseEdges = this.adjacency.get(to)!
        const reverseExisting = reverseEdges.find((e) => e.to === from)
        if (reverseExisting) reverseExisting.weight = weight
      }
      return
    }

    edges.push({ to, weight })
    this._edgeCount++

    if (!this.directed && from !== to) {
      const reverseEdges = this.adjacency.get(to)!
      const reverseExisting = reverseEdges.find((e) => e.to === from)
      if (!reverseExisting) {
        reverseEdges.push({ to: from, weight })
      }
    }
  }

  public removeEdge(from: string, to: string): void {
    if (!this.adjacency.has(from)) return

    const edges = this.adjacency.get(from)!
    const idx = edges.findIndex((e) => e.to === to)
    if (idx === -1) return

    edges.splice(idx, 1)
    this._edgeCount--

    if (!this.directed) {
      const reverseEdges = this.adjacency.get(to)
      if (reverseEdges) {
        const ridx = reverseEdges.findIndex((e) => e.to === from)
        if (ridx !== -1) {
          reverseEdges.splice(ridx, 1)
        }
      }
    }
  }

  public hasVertex(id: string): boolean {
    return this.adjacency.has(id)
  }

  public hasEdge(from: string, to: string): boolean {
    const edges = this.adjacency.get(from)
    if (!edges) return false
    return edges.some((e) => e.to === to)
  }

  public getEdgeWeight(from: string, to: string): number | undefined {
    const edges = this.adjacency.get(from)
    if (!edges) return undefined
    const edge = edges.find((e) => e.to === to)
    return edge?.weight
  }

  public getNeighbors(id: string): string[] {
    const edges = this.adjacency.get(id)
    if (!edges) return []
    return edges.map((e) => e.to)
  }

  public getVertices(): string[] {
    return Array.from(this.adjacency.keys())
  }

  public getEdges(): [string, string, number][] {
    const result: [string, string, number][] = []
    const seen = new Set<string>()

    const entries = Array.from(this.adjacency.entries())
    for (const [from, edges] of entries) {
      for (const edge of edges) {
        const key = this.directed ? `${from}->${edge.to}` : [from, edge.to].sort().join('<->')
        if (!seen.has(key)) {
          seen.add(key)
          result.push([from, edge.to, edge.weight])
        }
      }
    }
    return result
  }

  public get vertexCount(): number {
    return this.adjacency.size
  }

  public get edgeCount(): number {
    return this._edgeCount
  }

  public bfs(start: string): string[] {
    if (!this.adjacency.has(start)) return []

    const visited = new Set<string>()
    const result: string[] = []
    const queue: string[] = [start]
    visited.add(start)

    let _qi = 0
    while (_qi < queue.length) {
      const vertex = queue[_qi]!
      _qi++
      result.push(vertex)

      const edges = this.adjacency.get(vertex) ?? []
      for (const edge of edges) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to)
          queue.push(edge.to)
        }
      }
    }

    return result
  }

  public dfs(start: string): string[] {
    if (!this.adjacency.has(start)) return []

    const visited = new Set<string>()
    const result: string[] = []

    const stack: string[] = [start]
    while (stack.length > 0) {
      const vertex = stack.pop()!
      if (visited.has(vertex)) continue
      visited.add(vertex)
      result.push(vertex)

      const edges = this.adjacency.get(vertex) ?? []
      for (let i = edges.length - 1; i >= 0; i--) {
        if (!visited.has(edges[i]!.to)) {
          stack.push(edges[i]!.to)
        }
      }
    }

    return result
  }

  public shortestPath(
    from: string,
    to: string,
  ): { path: string[]; distance: number } | undefined {
    if (!this.adjacency.has(from) || !this.adjacency.has(to)) return undefined
    if (from === to) return { path: [from], distance: 0 }

    const dist = new Map<string, number>()
    const prev = new Map<string, string>()
    const visited = new Set<string>()

    Array.from(this.adjacency.keys()).forEach((v) => dist.set(v, Infinity))
    dist.set(from, 0)

    const pq = new PriorityQueue<{ id: string; d: number }>({
      comparator: (a, b) => a.d - b.d,
    })
    pq.enqueue({ id: from, d: 0 })

    while (!pq.isEmpty()) {
      const { id: u, d: uDist } = pq.dequeue()!
      if (visited.has(u)) continue
      visited.add(u)
      if (u === to) break

      const edges = this.adjacency.get(u) ?? []
      for (const edge of edges) {
        if (visited.has(edge.to)) continue
        const alt = uDist + edge.weight
        if (alt < dist.get(edge.to)!) {
          dist.set(edge.to, alt)
          prev.set(edge.to, u)
          pq.enqueue({ id: edge.to, d: alt })
        }
      }
    }

    const totalDist = dist.get(to)!
    if (totalDist === Infinity) return undefined

    const path: string[] = []
    let current: string | undefined = to
    while (current !== undefined) {
      path.unshift(current)
      current = prev.get(current)
    }

    return { path, distance: totalDist }
  }

  public isConnected(): boolean {
    if (this.adjacency.size <= 1) return true

    if (this.directed) {
      const start = this.adjacency.keys().next().value as string

      const verts = Array.from(this.adjacency.keys())
      for (const target of verts) {
        if (target === start) continue
        if (this.shortestPath(start, target) === undefined) return false
      }

      const reversed = new Graph<V>({ directed: true })
      for (const v of verts) {
        reversed.addVertex(v)
      }
      const entries = Array.from(this.adjacency.entries())
      for (const [from, edges] of entries) {
        for (const edge of edges) {
          reversed.addEdge(edge.to, from, edge.weight)
        }
      }

      for (const target of verts) {
        if (target === start) continue
        if (reversed.shortestPath(start, target) === undefined) return false
      }
      return true
    }

    const start = this.adjacency.keys().next().value as string
    const visited = this.bfs(start)
    return visited.length === this.adjacency.size
  }

  public topologicalSort(): string[] | undefined {
    const inDegree = new Map<string, number>()
    Array.from(this.adjacency.keys()).forEach((v) => inDegree.set(v, 0))

    const entries = Array.from(this.adjacency.entries())
    for (const [, edges] of entries) {
      for (const edge of edges) {
        increment(inDegree, edge.to)
      }
    }

    const queue: string[] = []
    for (const [v, deg] of inDegree) {
      if (deg === 0) queue.push(v)
    }

    const result: string[] = []
    let _qi = 0
    while (_qi < queue.length) {
      const vertex = queue[_qi]!
      _qi++
      result.push(vertex)

      const edges = this.adjacency.get(vertex) ?? []
      for (const edge of edges) {
        const newDeg = inDegree.get(edge.to)! - 1
        inDegree.set(edge.to, newDeg)
        if (newDeg === 0) {
          queue.push(edge.to)
        }
      }
    }

    return result.length === this.adjacency.size ? result : undefined
  }

  public hasCycle(): boolean {
    if (this.directed) {
      const WHITE = 0
      const GRAY = 1
      const BLACK = 2
      const color = new Map<string, number>()
      Array.from(this.adjacency.keys()).forEach((v) => color.set(v, WHITE))

      const dfsVisit = (v: string): boolean => {
        color.set(v, GRAY)
        const edges = this.adjacency.get(v) ?? []
        for (const edge of edges) {
          const c = color.get(edge.to)!
          if (c === GRAY) return true
          if (c === WHITE && dfsVisit(edge.to)) return true
        }
        color.set(v, BLACK)
        return false
      }

      const verts = Array.from(this.adjacency.keys())
      for (const v of verts) {
        if (color.get(v) === WHITE && dfsVisit(v)) return true
      }
      return false
    }

    const visited = new Set<string>()

    const visit = (v: string, par: string): boolean => {
      visited.add(v)
      const edges = this.adjacency.get(v) ?? []
      for (const edge of edges) {
        if (edge.to === par) continue
        if (visited.has(edge.to)) return true
        if (visit(edge.to, v)) return true
      }
      return false
    }

    const verts = Array.from(this.adjacency.keys())
    for (const v of verts) {
      if (!visited.has(v) && visit(v, '')) return true
    }
    return false
  }

  public clear(): void {
    this.adjacency.clear()
    this.vertices.clear()
    this._edgeCount = 0
  }
}
