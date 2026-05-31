export class ClosestPairBrute {
  private points: [number, number][] = []

  addPoint(x: number, y: number): void {
    this.points.push([x, y])
  }

  findClosest(): { pair: [[number, number], [number, number]], distance: number } | null {
    if (this.points.length < 2) return null
    let minDist = Infinity
    let bestPair: [[number, number], [number, number]] = [this.points[0]!, this.points[1]!]
    for (let i = 0; i < this.points.length; i++) {
      for (let j = i + 1; j < this.points.length; j++) {
        const d = this.dist(this.points[i]!, this.points[j]!)
        if (d < minDist) {
          minDist = d
          bestPair = [this.points[i]!, this.points[j]!]
        }
      }
    }
    return { pair: bestPair, distance: Math.sqrt(minDist) }
  }

  findKNearest(k: number): { points: [[number, number], [number, number]], distance: number }[] {
    const pairs: { points: [[number, number], [number, number]], distance: number }[] = []
    for (let i = 0; i < this.points.length; i++) {
      for (let j = i + 1; j < this.points.length; j++) {
        pairs.push({
          points: [this.points[i]!, this.points[j]!],
          distance: Math.sqrt(this.dist(this.points[i]!, this.points[j]!))
        })
      }
    }
    pairs.sort((a, b) => a.distance - b.distance)
    return pairs.slice(0, k)
  }

  minimumSpanningTreeLength(): number {
    if (this.points.length < 2) return 0
    const inTree = new Array(this.points.length).fill(false)
    const minDist = new Array(this.points.length).fill(Infinity)
    minDist[0] = 0
    let total = 0
    for (let i = 0; i < this.points.length; i++) {
      let u = -1
      for (let v = 0; v < this.points.length; v++) {
        if (!inTree[v] && (u === -1 || minDist[v]! < minDist[u]!)) u = v
      }
      inTree[u] = true
      total += Math.sqrt(minDist[u]!)
      for (let v = 0; v < this.points.length; v++) {
        if (!inTree[v]) {
          const d = this.dist(this.points[u]!, this.points[v]!)
          if (d < minDist[v]!) minDist[v] = d
        }
      }
    }
    return total
  }

  get size(): number {
    return this.points.length
  }

  private dist(a: [number, number], b: [number, number]): number {
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
  }
}
