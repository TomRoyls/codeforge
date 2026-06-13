export interface Point2D { x: number; y: number }

export class Geometry2 {
  static distance(a: Point2D, b: Point2D): number {
    return Math.hypot(b.x - a.x, b.y - a.y)
  }

  static manhattanDistance(a: Point2D, b: Point2D): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
  }

  static midpoint(a: Point2D, b: Point2D): Point2D {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }

  static cross(o: Point2D, a: Point2D, b: Point2D): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  }

  static area(points: Point2D[]): number {
    let sum = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      sum += points[i].x * points[j].y - points[j].x * points[i].y
    }
    return Math.abs(sum) / 2
  }

  static perimeter(points: Point2D[]): number {
    let sum = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      sum += Geometry2.distance(points[i], points[j])
    }
    return sum
  }

  static collinear(a: Point2D, b: Point2D, c: Point2D): boolean {
    return Math.abs(Geometry2.cross(a, b, c)) < 1e-9
  }

  static angle(a: Point2D, b: Point2D): number {
    return Math.atan2(b.y - a.y, b.x - a.x)
  }

  static rotate(p: Point2D, angle: number, origin: Point2D = { x: 0, y: 0 }): Point2D {
    const cos = Math.cos(angle), sin = Math.sin(angle)
    const dx = p.x - origin.x, dy = p.y - origin.y
    return { x: dx * cos - dy * sin + origin.x, y: dx * sin + dy * cos + origin.y }
  }

  static pointInPolygon(p: Point2D, polygon: Point2D[]): boolean {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].y > p.y) !== (polygon[j].y > p.y)) &&
          (p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
        inside = !inside
      }
    }
    return inside
  }

  static circleArea(radius: number): number {
    return Math.PI * radius * radius
  }

  static circleCircumference(radius: number): number {
    return 2 * Math.PI * radius
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): Geometry2 { return new Geometry2() }
  equals(other: unknown): boolean { return other instanceof Geometry2 }
}
