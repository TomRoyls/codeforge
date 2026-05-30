export interface Point {
  x: number
  y: number
}

export class Geometry2D {
  static cross(o: Point, a: Point, b: Point): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  }

  static distance(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }

  static distanceSquared(a: Point, b: Point): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
  }

  static midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }

  static areaTriangle(a: Point, b: Point, c: Point): number {
    return Math.abs(Geometry2D.cross(a, b, c)) / 2
  }

  static collinear(a: Point, b: Point, c: Point): boolean {
    return Geometry2D.cross(a, b, c) === 0
  }

  static orientation(o: Point, a: Point, b: Point): -1 | 0 | 1 {
    const val = Geometry2D.cross(o, a, b)
    if (val > 0) return 1
    if (val < 0) return -1
    return 0
  }

  static onSegment(p: Point, q: Point, r: Point): boolean {
    return q.x <= Math.max(p.x, r.x)
      && q.x >= Math.min(p.x, r.x)
      && q.y <= Math.max(p.y, r.y)
      && q.y >= Math.min(p.y, r.y)
  }

  static segmentsIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
    const o1 = Geometry2D.orientation(p1, q1, p2)
    const o2 = Geometry2D.orientation(p1, q1, q2)
    const o3 = Geometry2D.orientation(p2, q2, p1)
    const o4 = Geometry2D.orientation(p2, q2, q1)

    if (o1 !== o2 && o3 !== o4) return true

    if (o1 === 0 && Geometry2D.onSegment(p1, p2, q1)) return true
    if (o2 === 0 && Geometry2D.onSegment(p1, q2, q1)) return true
    if (o3 === 0 && Geometry2D.onSegment(p2, p1, q2)) return true
    if (o4 === 0 && Geometry2D.onSegment(p2, q1, q2)) return true

    return false
  }

  static polygonArea(points: Point[]): number {
    const n = points.length
    if (n < 3) return 0
    let area = 0
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += points[i]!.x * points[j]!.y
      area -= points[j]!.x * points[i]!.y
    }
    return Math.abs(area) / 2
  }

  static polygonPerimeter(points: Point[]): number {
    let perimeter = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      perimeter += Geometry2D.distance(points[i]!, points[j]!)
    }
    return perimeter
  }

  static pointInPolygon(point: Point, polygon: Point[]): boolean {
    const n = polygon.length
    let inside = false
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const pi = polygon[i]!
      const pj = polygon[j]!
      if ((pi.y > point.y) !== (pj.y > point.y)
        && point.x < (pj.x - pi.x) * (point.y - pi.y) / (pj.y - pi.y) + pi.x) {
        inside = !inside
      }
    }
    return inside
  }
}
