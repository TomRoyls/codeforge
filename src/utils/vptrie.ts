export class VPTrie {
  private n: number
  private points: number[][] = []
  private built = false

  constructor(n: number) {
    this.n = n
  }

  addPoint(point: number[]): void {
    this.points.push(point)
    this.built = false
  }

  nearest(query: number[]): number[] | null {
    if (this.points.length === 0) return null
    let best: number[] | null = null
    let bestDist = Infinity
    for (const p of this.points) {
      const d = this.dist(p, query)
      if (d < bestDist) {
        bestDist = d
        best = p
      }
    }
    return best
  }

  kNearest(query: number[], k: number): number[][] {
    const dists: [number, number[]][] = this.points.map(p => [this.dist(p, query), p])
    dists.sort((a, b) => a[0] - b[0])
    return dists.slice(0, k).map(d => d[1])
  }

  findAllWithin(query: number[], radius: number): number[][] {
    return this.points.filter(p => this.dist(p, query) <= radius)
  }

  get size(): number {
    return this.points.length
  }

  private dist(a: number[], b: number[]): number {
    let sum = 0
    for (let i = 0; i < this.n; i++) {
      const d = (a[i] ?? 0) - (b[i] ?? 0)
      sum += d * d
    }
    return Math.sqrt(sum)
  }
}
