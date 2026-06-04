export class OfflineDynamicConnectivity {
  private parent: number[]
  private rank: number[]
  private events: [number, number, number, number, number][] = []

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rank = new Array(n).fill(0)
  }

  addEdge(u: number, v: number, start: number, end: number): void {
    this.events.push([start, 0, u, v, end])
  }

  addQuery(u: number, v: number, time: number): void {
    this.events.push([time, 1, u, v, -1])
  }

  solve(): boolean[] {
    this.events.sort((a, b) => a[0] - b[0] || a[1] - b[1])
    const results: boolean[] = []
    const activeEdges = new Map<string, number>()

    for (const ev of this.events) {
      const [_time, type, u, v, end] = ev
      if (type === 0) {
        const key = u < v ? `${u},${v}` : `${v},${u}`
        activeEdges.set(key, end)
        this.union(u, v)
      } else {
        results.push(this.find(u) === this.find(v))
      }
    }
    return results
  }

  private find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]!]!
      x = this.parent[x]!
    }
    return x
  }

  private union(x: number, y: number): void {
    const rx = this.find(x)
    const ry = this.find(y)
    if (rx === ry) return
    if (this.rank[rx]! < this.rank[ry]!) {
      this.parent[rx] = ry
    } else if (this.rank[rx]! > this.rank[ry]!) {
      this.parent[ry] = rx
    } else {
      this.parent[ry] = rx
      this.rank[rx]!++
    }
  }
}
