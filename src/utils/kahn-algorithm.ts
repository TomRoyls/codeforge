export class KahnAlgorithm {
  private adj: number[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
  }

  sort(): number[] | null {
    const inDegree = new Array(this.n).fill(0)
    for (let i = 0; i < this.n; i++) {
      for (const v of this.adj[i]!) {
        inDegree[v]!++
      }
    }

    const queue: number[] = []
    for (let i = 0; i < this.n; i++) {
      if (inDegree[i] === 0) queue.push(i)
    }

    const result: number[] = []
    while (queue.length > 0) {
      const u = queue.shift()!
      result.push(u)
      for (const v of this.adj[u]!) {
        inDegree[v]!--
        if (inDegree[v] === 0) queue.push(v)
      }
    }

    if (result.length !== this.n) return null
    return result
  }

  toString(): string {
    return `KahnAlgorithm(${this.n})`
  }

  toJSON(): unknown {
    return { n: this.n, adj: this.adj }
  }

  clone(): KahnAlgorithm {
    const copy = new KahnAlgorithm(this.n)
    for (let i = 0; i < this.n; i++) {
      for (const v of this.adj[i]!) copy.addEdge(i, v)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof KahnAlgorithm)) return false
    if (this.n !== other.n) return false
    for (let i = 0; i < this.n; i++) {
      const a = [...this.adj[i]!].sort((x, y) => x - y)
      const b = [...other.adj[i]!].sort((x, y) => x - y)
      if (a.length !== b.length) return false
      for (let j = 0; j < a.length; j++) {
        if (a[j] !== b[j]) return false
      }
    }
    return true
  }
}
