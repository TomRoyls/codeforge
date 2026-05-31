export class EdgeColoring {
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

  maxDegree(): number {
    let max = 0
    for (let i = 0; i < this.n; i++) {
      max = Math.max(max, this.adj[i]!.size)
    }
    return max
  }

  greedyColor(): Map<string, number> {
    const colors = new Map<string, number>()
    const maxDeg = this.maxDegree()
    const numColors = maxDeg + 1
    const used = new Array(numColors).fill(false)

    for (let u = 0; u < this.n; u++) {
      for (const v of this.adj[u]!) {
        const key = this.edgeKey(u, v)
        if (colors.has(key)) continue
        used.fill(false)
        for (const w of this.adj[u]!) {
          const wk = this.edgeKey(u, w)
          if (colors.has(wk)) used[colors.get(wk)!] = true
        }
        for (const w of this.adj[v]!) {
          const wk = this.edgeKey(v, w)
          if (colors.has(wk)) used[colors.get(wk)!] = true
        }
        let c = 0
        while (c < numColors && used[c]) c++
        colors.set(key, c)
      }
    }
    return colors
  }

  chromaticIndex(): number {
    let max = 0
    const colors = this.greedyColor()
    for (const c of colors.values()) {
      max = Math.max(max, c + 1)
    }
    return max
  }

  get edgeCount(): number {
    let count = 0
    for (let i = 0; i < this.n; i++) count += this.adj[i]!.size
    return count / 2
  }

  private edgeKey(u: number, v: number): string {
    return u < v ? `${u},${v}` : `${v},${u}`
  }
}
