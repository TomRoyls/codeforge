export class EulerianPath {
  readonly path: number[]
  readonly isEulerian: boolean
  readonly type: 'circuit' | 'path' | 'none'

  constructor(adj: number[][]) {
    const n = adj.length

    let oddCount = 0
    let startNode = 0
    for (let i = 0; i < n; i++) {
      if (adj[i]!.length % 2 !== 0) {
        oddCount++
        startNode = i
      }
    }

    if (oddCount === 0) {
      this.type = 'circuit'
      this.isEulerian = true
      for (let i = 0; i < n; i++) {
        if (adj[i]!.length > 0) { startNode = i; break }
      }
    } else if (oddCount === 2) {
      this.type = 'path'
      this.isEulerian = true
    } else {
      this.type = 'none'
      this.isEulerian = false
      this.path = []
      return
    }

    const totalHalfEdges = adj.reduce((sum, neighbors) => sum + neighbors.length, 0)
    const edgeCount = totalHalfEdges / 2
    if (edgeCount === 0) {
      this.path = []
      this.isEulerian = true
      this.type = 'circuit'
      return
    }

    const adjSets: Set<number>[] = adj.map(row => new Set(row))
    this.path = []
    const stack: number[] = [startNode]

    while (stack.length > 0) {
      const u = stack[stack.length - 1]!
      const neighbors = adjSets[u]!
      if (neighbors.size > 0) {
        const v = neighbors.values().next().value as number
        neighbors.delete(v)
        adjSets[v]!.delete(u)
        stack.push(v)
      } else {
        this.path.push(stack.pop()!)
      }
    }

    this.path.reverse()

    if (this.path.length !== edgeCount + 1) {
      this.isEulerian = false
      this.type = 'none'
    }
  }

  static hasEulerianCircuit(adj: number[][]): boolean {
    const ep = new EulerianPath(adj)
    return ep.type === 'circuit'
  }

  static hasEulerianPath(adj: number[][]): boolean {
    const ep = new EulerianPath(adj)
    return ep.isEulerian
  }

  toString(): string {
    return `EulerianPath(type=${this.type}, length=${this.path.length})`
  }

  toJSON(): { path: number[]; type: string; isEulerian: boolean } {
    return { path: [...this.path], type: this.type, isEulerian: this.isEulerian }
  }

  clone(): EulerianPath {
    const c = Object.create(EulerianPath.prototype) as EulerianPath
    Object.defineProperty(c, 'path', { value: [...this.path], writable: false, enumerable: true, configurable: true })
    Object.defineProperty(c, 'isEulerian', { value: this.isEulerian, writable: false, enumerable: true, configurable: true })
    Object.defineProperty(c, 'type', { value: this.type, writable: false, enumerable: true, configurable: true })
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof EulerianPath)) return false
    if (this.type !== other.type || this.isEulerian !== other.isEulerian) return false
    if (this.path.length !== other.path.length) return false
    for (let i = 0; i < this.path.length; i++) if (this.path[i] !== other.path[i]) return false
    return true
  }
}
