export class BandwidthMinimization {
  private adj: number[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
    this.adj[v]!.push(u)
  }

  cuthillMcKee(): number[] {
    const visited = new Array(this.n).fill(false)
    const order: number[] = []
    const degree = this.adj.map(a => a.length)
    const start = this.findPeripheral(degree)
    const queue = [start]
    visited[start] = true

    while (queue.length > 0) {
      const u = queue.shift()!
      order.push(u)
      const neighbors = this.adj[u]!.filter(v => !visited[v]).sort((a, b) => degree[a]! - degree[b]!)
      for (const v of neighbors) {
        visited[v] = true
        queue.push(v)
      }
    }

    for (let i = 0; i < this.n; i++) {
      if (!visited[i]) order.push(i)
    }

    return order
  }

  bandwidth(order?: number[]): number {
    const perm = order ?? this.cuthillMcKee()
    const pos = new Array(this.n).fill(0)
    for (let i = 0; i < this.n; i++) pos[perm[i]!] = i

    let max = 0
    for (let u = 0; u < this.n; u++) {
      for (const v of this.adj[u]!) {
        max = Math.max(max, Math.abs(pos[u]! - pos[v]!))
      }
    }
    return max
  }

  private findPeripheral(degree: number[]): number {
    let best = 0
    let minDeg = Infinity
    for (let i = 0; i < this.n; i++) {
      if (degree[i]! < minDeg) {
        minDeg = degree[i]!
        best = i
      }
    }
    return best
  }

  toString(): string {
    return `BandwidthMinimization(n=${this.n})`
  }

  toJSON(): unknown {
    return {
      n: this.n,
      adj: this.adj.map(row => [...row]),
    }
  }

  clone(): this {
    const c = new BandwidthMinimization(this.n)
    c.adj = this.adj.map(row => [...row])
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BandwidthMinimization)) return false
    if (this.n !== other.n) return false
    if (this.adj.length !== other.adj.length) return false
    for (let i = 0; i < this.adj.length; i++) {
      const a = this.adj[i]!
      const b = other.adj[i]!
      if (a.length !== b.length) return false
      const aset = new Set(a)
      for (const v of b) {
        if (!aset.has(v)) return false
      }
    }
    return true
  }
}
