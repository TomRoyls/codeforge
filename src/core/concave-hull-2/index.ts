interface Point {
  x: number
  y: number
}

export class ConcaveHull2 {
  private points: Point[]

  constructor(points: Point[]) {
    this.points = [...points]
  }

  compute(concavity: number = 0.7): Point[] {
    if (this.points.length === 0) return []
    if (this.points.length === 1) return [...this.points]
    if (this.points.length === 2) return [...this.points]

    const uniquePoints = this.removeDuplicates()
    if (uniquePoints.length <= 2) return uniquePoints

    let hull = this.computeConvexHull(uniquePoints)

    if (concavity >= 1 || hull.length <= 3) return hull

    hull = this.refineEdges(hull, concavity)

    return hull
  }

  getPoints(): Point[] {
    return [...this.points]
  }

  get size(): number {
    return this.points.length
  }

  isEmpty(): boolean {
    return this.points.length === 0
  }

  private removeDuplicates(): Point[] {
    const seen = new Set<string>()
    const unique: Point[] = []

    for (const p of this.points) {
      const key = `${p.x},${p.y}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(p)
      }
    }

    return unique
  }

  private computeConvexHull(points: Point[]): Point[] {
    const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y)

    if (sorted.length <= 1) return sorted

    const lower: Point[] = []
    for (const p of sorted) {
      while (lower.length >= 2 && this.crossProduct(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) {
        lower.pop()
      }
      lower.push(p)
    }

    const upper: Point[] = []
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i]!
      while (upper.length >= 2 && this.crossProduct(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) {
        upper.pop()
      }
      upper.push(p)
    }

    upper.pop()
    lower.pop()

    return [...lower, ...upper]
  }

  private crossProduct(a: Point, b: Point, c: Point): number {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  }

  private refineEdges(hull: Point[], concavity: number): Point[] {
    const interiorPoints = this.getInteriorPoints(hull)
    let refined = [...hull]
    let changed = true

    while (changed && interiorPoints.length > 0) {
      changed = false

      for (let i = 0; i < refined.length; i++) {
        const p1 = refined[i]!
        const p2 = refined[(i + 1) % refined.length]!

        let bestCandidate: Point | null = null
        let bestScore = -Infinity

        for (const p of interiorPoints) {
          if (this.canInsertPoint(p1, p2, p, refined)) {
            const score = this.scoreInsertion(p1, p2, p, concavity)
            if (score > bestScore) {
              bestScore = score
              bestCandidate = p
            }
          }
        }

        if (bestCandidate) {
          refined.splice(i + 1, 0, bestCandidate)
          interiorPoints.splice(interiorPoints.indexOf(bestCandidate), 1)
          changed = true
          break
        }
      }
    }

    return refined
  }

  private getInteriorPoints(hull: Point[]): Point[] {
    return this.points.filter(p => !hull.includes(p))
  }

  private canInsertPoint(p1: Point, p2: Point, p: Point, currentHull: Point[]): boolean {
    if (!this.isLeftOfEdge(p1, p2, p)) return false
    if (!this.isInsideHull(currentHull, p)) return false

    const dist = this.distanceToLine(p1, p2, p)
    const edgeLength = this.distance(p1, p2)

    return dist > 0 && dist <= edgeLength * 0.5
  }

  private scoreInsertion(p1: Point, p2: Point, p: Point, concavity: number): number {
    const dist = this.distanceToLine(p1, p2, p)
    const edgeLength = this.distance(p1, p2)

    return dist / (edgeLength * (2 - concavity))
  }

  private distanceToLine(a: Point, b: Point, p: Point): number {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.sqrt(dx * dx + dy * dy)

    if (len === 0) return this.distance(a, p)

    return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len
  }

  private distance(a: Point, b: Point): number {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  private isLeftOfEdge(p1: Point, p2: Point, p: Point): boolean {
    return this.crossProduct(p1, p2, p) > 0
  }

  private isInsideHull(hull: Point[], p: Point): boolean {
    let inside = false

    for (let i = 0; i < hull.length; i++) {
      const p1 = hull[i]!
      const p2 = hull[(i + 1) % hull.length]!

      if ((p1.y > p.y) !== (p2.y > p.y)) {
        const xIntersect = ((p2.x - p1.x) * (p.y - p1.y)) / (p2.y - p1.y) + p1.x
        if (p.x < xIntersect) {
          inside = !inside
        }
      }
    }

    return inside
  }

  toString(): string {
    return `${ConcaveHull2}({ size: ${this.size} })`
  }
}
