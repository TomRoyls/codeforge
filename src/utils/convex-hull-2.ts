import type { Point2D } from './geometry-2.js'

export class ConvexHull2 {
  static grahamScan(points: Point2D[]): Point2D[] {
    if (points.length < 3) return [...points]
    const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
    const lower: Point2D[] = []
    for (const p of sorted) {
      while (lower.length >= 2 && ConvexHull2.cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop()
      }
      lower.push(p)
    }
    const upper: Point2D[] = []
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i]
      while (upper.length >= 2 && ConvexHull2.cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop()
      }
      upper.push(p)
    }
    lower.pop()
    upper.pop()
    return [...lower, ...upper]
  }

  static jarvisMarch(points: Point2D[]): Point2D[] {
    if (points.length < 3) return [...points]
    const hull: Point2D[] = []
    let leftmost = 0
    for (let i = 1; i < points.length; i++) {
      if (points[i].x < points[leftmost].x) leftmost = i
    }
    let p = leftmost
    do {
      hull.push(points[p])
      let q = (p + 1) % points.length
      for (let i = 0; i < points.length; i++) {
        if (ConvexHull2.cross(points[p], points[i], points[q]) > 0) q = i
      }
      p = q
    } while (p !== leftmost)
    return hull
  }

  private static cross(o: Point2D, a: Point2D, b: Point2D): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  }

  static hullArea(points: Point2D[]): number {
    if (points.length < 3) return 0
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y - points[j].x * points[i].y
    }
    return Math.abs(area) / 2
  }

  toArray(): Point2D[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): ConvexHull2 { return new ConvexHull2() }
  equals(other: unknown): boolean { return other instanceof ConvexHull2 }
}
