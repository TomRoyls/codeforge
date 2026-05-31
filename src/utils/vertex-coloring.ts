export class VertexColoring {
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

  greedyColor(): number[] {
    const result = new Array(this.n).fill(-1)
    result[0] = 0
    const available = new Array(this.n).fill(false)

    for (let u = 1; u < this.n; u++) {
      for (const v of this.adj[u]!) {
        if (result[v]! !== -1) available[result[v]!] = true
      }
      let cr: number
      for (cr = 0; cr < this.n; cr++) {
        if (!available[cr]) break
      }
      result[u] = cr
      for (const v of this.adj[u]!) {
        if (result[v]! !== -1) available[result[v]!] = false
      }
    }
    return result
  }

  chromaticNumber(): number {
    const colors = this.greedyColor()
    return Math.max(...colors) + 1
  }

  isProperColoring(colors: number[]): boolean {
    for (let u = 0; u < this.n; u++) {
      for (const v of this.adj[u]!) {
        if (colors[u] === colors[v]) return false
      }
    }
    return true
  }

  maxDegree(): number {
    let max = 0
    for (let i = 0; i < this.n; i++) {
      max = Math.max(max, this.adj[i]!.size)
    }
    return max
  }
}
