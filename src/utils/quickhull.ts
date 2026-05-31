export interface Point {
  x: number
  y: number
}

export class Quickhull {
  static convexHull(points: Point[]): Point[] {
    if (points.length < 2) return [...points]
    if (points.length === 2) return [...points]
    let minX = points[0]!
    let maxX = points[0]!
    for (const p of points) {
      if (p.x < minX.x || (p.x === minX.x && p.y < minX.y)) minX = p
      if (p.x > maxX.x || (p.x === maxX.x && p.y > maxX.y)) maxX = p
    }
    if (minX.x === maxX.x && minX.y === maxX.y) return [minX]
    const left: Point[] = []
    const right: Point[] = []
    for (const p of points) {
      const cross = Quickhull.cross(minX, maxX, p)
      if (cross > 0) left.push(p)
      else if (cross < 0) right.push(p)
    }
    const upper = Quickhull.quickHullRec(left, minX, maxX)
    const lower = Quickhull.quickHullRec(right, maxX, minX)
    return [minX, ...upper, maxX, ...lower]
  }

  private static quickHullRec(points: Point[], p1: Point, p2: Point): Point[] {
    if (points.length === 0) return []
    let maxDist = -1
    let farthest: Point = points[0]!
    for (const p of points) {
      const d = Quickhull.cross(p1, p2, p)
      if (d > maxDist) {
        maxDist = d
        farthest = p
      }
    }
    const left: Point[] = []
    const right: Point[] = []
    for (const p of points) {
      if (p === farthest) continue
      if (Quickhull.cross(p1, farthest, p) > 0) left.push(p)
      else if (Quickhull.cross(farthest, p2, p) > 0) right.push(p)
    }
    const upper = Quickhull.quickHullRec(left, p1, farthest)
    const lower = Quickhull.quickHullRec(right, farthest, p2)
    return [...upper, farthest, ...lower]
  }

  static cross(o: Point, a: Point, b: Point): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  }

  static hullArea(hull: Point[]): number {
    if (hull.length < 3) return 0
    let area = 0
    for (let i = 0; i < hull.length; i++) {
      const j = (i + 1) % hull.length
      area += hull[i]!.x * hull[j]!.y
      area -= hull[j]!.x * hull[i]!.y
    }
    return Math.abs(area) / 2
  }

  static isConvex(hull: Point[]): boolean {
    if (hull.length < 3) return false
    let sign = 0
    for (let i = 0; i < hull.length; i++) {
      const a = hull[i]!
      const b = hull[(i + 1) % hull.length]!
      const c = hull[(i + 2) % hull.length]!
      const cross = Quickhull.cross(a, b, c)
      if (cross !== 0) {
        if (sign === 0) sign = cross > 0 ? 1 : -1
        else if ((cross > 0 ? 1 : -1) !== sign) return false
      }
    }
    return true
  }
}
