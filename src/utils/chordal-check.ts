export class ChordalCheck {
  private adj: Set<number>[] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push(new Set())
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.add(v)
    this.adj[v]!.add(u)
  }

  isChordal(): boolean {
    const order = this.peo()
    const pos = new Array(this.n).fill(0)
    for (let i = 0; i < this.n; i++) pos[order[i]!] = i

    for (let i = 0; i < this.n; i++) {
      const u = order[i]!
      const later = [...this.adj[u]!].filter(v => pos[v]! > i).sort((a, b) => pos[a]! - pos[b]!)
      if (later.length === 0) continue
      const first = later[0]!
      for (let j = 1; j < later.length; j++) {
        if (!this.adj[first]!.has(later[j]!)) return false
      }
    }
    return true
  }

  private peo(): number[] {
    const degree = this.adj.map(s => s.size)
    const used = new Array(this.n).fill(false)
    const order: number[] = []

    for (let step = 0; step < this.n; step++) {
      let best = -1
      let bestDeg = Infinity
      for (let i = 0; i < this.n; i++) {
        if (!used[i] && degree[i]! < bestDeg) {
          bestDeg = degree[i]!
          best = i
        }
      }
      order.push(best!)
      used[best!] = true
      degree[best!] = 0
      for (const v of this.adj[best!]!) {
        if (!used[v]) degree[v]!--
      }
    }
    return order
  }
}
