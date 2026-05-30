export interface Point {
  x: number
  y: number
}

export function convexHull(points: Point[]): Point[] {
  if (points.length <= 1) return [...points]

  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  const n = sorted.length

  if (n <= 2) return sorted

  const lower: Point[] = []
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) {
      lower.pop()
    }
    lower.push(p)
  }

  const upper: Point[] = []
  for (let i = n - 1; i >= 0; i--) {
    const p = sorted[i]!
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) {
      upper.pop()
    }
    upper.push(p)
  }

  lower.pop()
  upper.pop()

  return [...lower, ...upper]
}

export function polygonArea(hull: Point[]): number {
  if (hull.length < 3) return 0
  let area = 0
  for (let i = 0; i < hull.length; i++) {
    const j = (i + 1) % hull.length
    area += hull[i]!.x * hull[j]!.y
    area -= hull[j]!.x * hull[i]!.y
  }
  return Math.abs(area) / 2
}

export function polygonPerimeter(hull: Point[]): number {
  if (hull.length < 2) return 0
  let perimeter = 0
  for (let i = 0; i < hull.length; i++) {
    const j = (i + 1) % hull.length
    const dx = hull[j]!.x - hull[i]!.x
    const dy = hull[j]!.y - hull[i]!.y
    perimeter += Math.sqrt(dx * dx + dy * dy)
  }
  return perimeter
}

export function pointInConvexPolygon(point: Point, hull: Point[]): boolean {
  if (hull.length < 3) return false
  let sign = 0
  for (let i = 0; i < hull.length; i++) {
    const j = (i + 1) % hull.length
    const cp = cross(hull[i]!, hull[j]!, point)
    if (cp === 0) continue
    if (sign === 0) sign = cp > 0 ? 1 : -1
    else if ((cp > 0 ? 1 : -1) !== sign) return false
  }
  return true
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}
