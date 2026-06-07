export class BipartiteMatching {
  private readonly adj: number[][]
  private pairU: number[]
  private pairV: number[]
  private dist: number[]
  private _edgeCount = 0

  public readonly leftSize: number
  public readonly rightSize: number

  constructor(leftSize: number, rightSize: number) {
    this.leftSize = leftSize
    this.rightSize = rightSize
    this.adj = Array.from({ length: leftSize }, () => [])
    this.pairU = Array.from({ length: leftSize }, () => -1)
    this.pairV = Array.from({ length: rightSize }, () => -1)
    this.dist = Array.from({ length: leftSize }, () => 0)
  }

  public addEdge(left: number, right: number): void {
    if (left < 0 || left >= this.leftSize) {
      throw new RangeError(`left node ${left} out of range [0, ${this.leftSize})`)
    }
    if (right < 0 || right >= this.rightSize) {
      throw new RangeError(`right node ${right} out of range [0, ${this.rightSize})`)
    }
    const edges = this.adj[left]!
    if (!edges.includes(right)) {
      edges.push(right)
      this._edgeCount++
    }
  }

  public get edgeCount(): number {
    return this._edgeCount
  }

  private bfs(): boolean {
    const queue: number[] = []
    for (let u = 0; u < this.leftSize; u++) {
      if (this.pairU[u] === -1) {
        this.dist[u] = 0
        queue.push(u)
      } else {
        this.dist[u] = Infinity
      }
    }
    let found = false
    let _qi = 0
    while (_qi < queue.length) {
      const u = queue[_qi]!
      _qi++
      if (this.dist[u]! < Infinity) {
        for (const v of this.adj[u]!) {
          const u2 = this.pairV[v]!
          if (u2 === -1) {
            found = true
          } else if (this.dist[u2]! === Infinity) {
            this.dist[u2] = this.dist[u]! + 1
            queue.push(u2)
          }
        }
      }
    }
    return found
  }

  private dfs(u: number): boolean {
    for (const v of this.adj[u]!) {
      const u2 = this.pairV[v]!
      if (u2 === -1 || (this.dist[u2]! === this.dist[u]! + 1 && this.dfs(u2))) {
        this.pairU[u] = v
        this.pairV[v] = u
        return true
      }
    }
    this.dist[u] = Infinity
    return false
  }

  public maxMatching(): number {
    this.pairU = Array.from({ length: this.leftSize }, () => -1)
    this.pairV = Array.from({ length: this.rightSize }, () => -1)
    let matching = 0
    while (this.bfs()) {
      for (let u = 0; u < this.leftSize; u++) {
        if (this.pairU[u] === -1 && this.dfs(u)) {
          matching++
        }
      }
    }
    return matching
  }

  public getMatching(): Map<number, number> {
    const result = new Map<number, number>()
    for (let u = 0; u < this.leftSize; u++) {
      const v = this.pairU[u]!
      if (v !== -1) {
        result.set(u, v)
      }
    }
    return result
  }

  public isMatched(left: number): boolean {
    if (left < 0 || left >= this.leftSize) {
      throw new RangeError(`left node ${left} out of range [0, ${this.leftSize})`)
    }
    return this.pairU[left]! !== -1
  }

  public getMatch(left: number): number | undefined {
    if (left < 0 || left >= this.leftSize) {
      throw new RangeError(`left node ${left} out of range [0, ${this.leftSize})`)
    }
    const v = this.pairU[left]!
    return v === -1 ? undefined : v
  }

  public clear(): void {
    for (let u = 0; u < this.leftSize; u++) {
      this.adj[u] = []
    }
    this.pairU = Array.from({ length: this.leftSize }, () => -1)
    this.pairV = Array.from({ length: this.rightSize }, () => -1)
    this._edgeCount = 0
  }

  toString(): string {
    return `BipartiteMatching(left=${this.leftSize}, right=${this.rightSize}, edges=${this._edgeCount})`
  }

  toJSON(): unknown {
    return {
      leftSize: this.leftSize,
      rightSize: this.rightSize,
      adj: this.adj.map(row => [...row]),
      edgeCount: this._edgeCount,
    }
  }

  clone(): this {
    const c = new BipartiteMatching(this.leftSize, this.rightSize)
    for (let u = 0; u < this.leftSize; u++) {
      for (const v of this.adj[u]!) {
        c.addEdge(u, v)
      }
    }
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BipartiteMatching)) return false
    if (this.leftSize !== other.leftSize) return false
    if (this.rightSize !== other.rightSize) return false
    if (this._edgeCount !== other._edgeCount) return false
    for (let i = 0; i < this.adj.length; i++) {
      const a = new Set(this.adj[i]!)
      const b = new Set(other.adj[i]!)
      if (a.size !== b.size) return false
      for (const v of a) {
        if (!b.has(v)) return false
      }
    }
    return true
  }
}