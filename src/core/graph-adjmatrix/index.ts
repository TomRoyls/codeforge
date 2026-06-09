export class GraphAdjMatrix<T extends string | number> {
  private vertices: Map<T, number> = new Map()
  private indices: T[] = []
  private weightMatrix: (number | null)[][] = []
  private connectionMatrix: boolean[][] = []
  private directed: boolean = false
  private weighted: boolean = false

  constructor(directed: boolean = false, weighted: boolean = false) {
    this.directed = directed
    this.weighted = weighted
  }

  addVertex(v: T): void {
    if (this.vertices.has(v)) return
    const idx = this.vertices.size
    this.vertices.set(v, idx)
    this.indices.push(v)
    for (const row of this.weightMatrix) {
      row.push(null)
    }
    const newWeightRow = new Array(this.weightMatrix.length + 1).fill(null)
    this.weightMatrix.push(newWeightRow)
    for (const row of this.connectionMatrix) {
      row.push(false)
    }
    const newConnectionRow = new Array(this.connectionMatrix.length + 1).fill(false)
    this.connectionMatrix.push(newConnectionRow)
  }

  removeVertex(v: T): void {
    const idx = this.vertices.get(v)
    if (idx === undefined) return
    this.vertices.delete(v)
    this.indices.splice(idx, 1)
    this.weightMatrix.splice(idx, 1)
    for (const row of this.weightMatrix) {
      row.splice(idx, 1)
    }
    this.connectionMatrix.splice(idx, 1)
    for (const row of this.connectionMatrix) {
      row.splice(idx, 1)
    }
    const entries = Array.from(this.vertices.entries())
    for (const [vertex, oldIdx] of entries) {
      if (oldIdx > idx) {
        this.vertices.set(vertex, oldIdx - 1)
      }
    }
  }

  addEdge(from: T, to: T, weight?: number): void {
    const fromIdx = this.vertices.get(from)
    const toIdx = this.vertices.get(to)
    if (fromIdx === undefined || toIdx === undefined) return
    const edgeWeight = this.weighted ? (weight !== undefined ? weight : 1) : null
    this.weightMatrix[fromIdx]![toIdx] = edgeWeight
    this.connectionMatrix[fromIdx]![toIdx] = true
    if (!this.directed) {
      this.weightMatrix[toIdx]![fromIdx] = edgeWeight
      this.connectionMatrix[toIdx]![fromIdx] = true
    }
  }

  removeEdge(from: T, to: T): void {
    const fromIdx = this.vertices.get(from)
    const toIdx = this.vertices.get(to)
    if (fromIdx === undefined || toIdx === undefined) return
    this.weightMatrix[fromIdx]![toIdx] = null
    this.connectionMatrix[fromIdx]![toIdx] = false
    if (!this.directed) {
      this.weightMatrix[toIdx]![fromIdx] = null
      this.connectionMatrix[toIdx]![fromIdx] = false
    }
  }

  hasVertex(v: T): boolean {
    return this.vertices.has(v)
  }

  hasEdge(from: T, to: T): boolean {
    const fromIdx = this.vertices.get(from)
    const toIdx = this.vertices.get(to)
    if (fromIdx === undefined || toIdx === undefined) return false
    return this.connectionMatrix[fromIdx]![toIdx]!
  }

  getEdgeWeight(from: T, to: T): number | null {
    const fromIdx = this.vertices.get(from)
    const toIdx = this.vertices.get(to)
    if (fromIdx === undefined || toIdx === undefined) return null
    if (!this.connectionMatrix[fromIdx]![toIdx]) return null
    return this.weighted ? this.weightMatrix[fromIdx]![toIdx]! : null
  }

  getNeighbors(v: T): T[] {
    const idx = this.vertices.get(v)
    if (idx === undefined) return []
    const neighbors: T[] = []
    for (let i = 0; i < this.connectionMatrix[idx]!.length; i++) {
      if (this.connectionMatrix[idx]![i]) {
        neighbors.push(this.indices[i]!)
      }
    }
    return neighbors
  }

  getVertices(): T[] {
    return [...this.indices]
  }

  getEdges(): Array<[from: T, to: T, weight: number | null]> {
    const edges: Array<[from: T, to: T, weight: number | null]> = []
    for (let i = 0; i < this.indices.length; i++) {
      for (let j = 0; j < this.indices.length; j++) {
        if (this.connectionMatrix[i]![j]) {
          if (this.directed) {
            edges.push([this.indices[i]!, this.indices[j]!, this.weighted ? this.weightMatrix[i]![j]! : null])
          } else if (i < j) {
            edges.push([this.indices[i]!, this.indices[j]!, this.weighted ? this.weightMatrix[i]![j]! : null])
          }
        }
      }
    }
    return edges
  }

  get vertexCount(): number {
    return this.vertices.size
  }

  get edgeCount(): number {
    let count = 0
    for (let i = 0; i < this.indices.length; i++) {
      for (let j = 0; j < this.indices.length; j++) {
        if (this.connectionMatrix[i]![j]) {
          if (this.directed) {
            count++
          } else if (i < j) {
            count++
          }
        }
      }
    }
    return count
  }

  isEmpty(): boolean {
    return this.vertices.size === 0
  }

  clear(): void {
    this.vertices.clear()
    this.indices = []
    this.weightMatrix = []
    this.connectionMatrix = []
  }

  bfs(start: T, callback: (vertex: T) => void): void {
    const startIdx = this.vertices.get(start)
    if (startIdx === undefined) return
    const visited = new Set<number>()
    const queue: number[] = [startIdx]
    visited.add(startIdx)
    let _qi = 0
    while (_qi < queue.length) {
      const idx = queue[_qi++]!
      callback(this.indices[idx]!)
      for (let i = 0; i < this.connectionMatrix[idx]!.length; i++) {
        if (this.connectionMatrix[idx]![i] && !visited.has(i)) {
          visited.add(i)
          queue.push(i)
        }
      }
    }
  }

  dfs(start: T, callback: (vertex: T) => void): void {
    const startIdx = this.vertices.get(start)
    if (startIdx === undefined) return
    const visited = new Set<number>()
    const stack: number[] = [startIdx]
    while (stack.length > 0) {
      const idx = stack.pop()!
      if (visited.has(idx)) continue
      visited.add(idx)
      callback(this.indices[idx]!)
      for (let i = this.connectionMatrix[idx]!.length - 1; i >= 0; i--) {
        if (this.connectionMatrix[idx]![i] && !visited.has(i)) {
          stack.push(i)
        }
      }
    }
  }

  degree(v: T): number {
    const idx = this.vertices.get(v)
    if (idx === undefined) return 0
    if (this.directed) {
      let count = 0
      for (let i = 0; i < this.connectionMatrix[idx]!.length; i++) {
        if (this.connectionMatrix[idx]![i]) count++
      }
      return count
    } else {
      let count = 0
      for (let i = 0; i < this.connectionMatrix[idx]!.length; i++) {
        if (this.connectionMatrix[idx]![i]) count++
      }
      return count
    }
  }

  hasPath(from: T, to: T): boolean {
    const fromIdx = this.vertices.get(from)
    const toIdx = this.vertices.get(to)
    if (fromIdx === undefined || toIdx === undefined) return false
    if (fromIdx === toIdx) return true
    const visited = new Set<number>()
    const queue: number[] = [fromIdx]
    visited.add(fromIdx)
    let _qi = 0
    while (_qi < queue.length) {
      const idx = queue[_qi++]!
      if (idx === toIdx) return true
      for (let i = 0; i < this.connectionMatrix[idx]!.length; i++) {
        if (this.connectionMatrix[idx]![i] && !visited.has(i)) {
          visited.add(i)
          queue.push(i)
        }
      }
    }
    return false
  }
  *[Symbol.iterator]() {
    yield* this.getEdges()
  }

  toArray() {
    return this.getEdges()
  }
}
