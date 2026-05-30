export interface Point {
  x: number
  y: number
}

export interface Segment {
  a: Point
  b: Point
}

export function segmentsIntersect(s1: Segment, s2: Segment): boolean {
  const d1 = cross(s2.a, s2.b, s1.a)
  const d2 = cross(s2.a, s2.b, s1.b)
  const d3 = cross(s1.a, s1.b, s2.a)
  const d4 = cross(s1.a, s1.b, s2.b)

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0))
    && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }

  if (d1 === 0 && onSegment(s2.a, s2.b, s1.a)) return true
  if (d2 === 0 && onSegment(s2.a, s2.b, s1.b)) return true
  if (d3 === 0 && onSegment(s1.a, s1.b, s2.a)) return true
  if (d4 === 0 && onSegment(s1.a, s1.b, s2.b)) return true

  return false
}

export function segmentIntersectionPoint(s1: Segment, s2: Segment): Point | null {
  const x1 = s1.a.x, y1 = s1.a.y
  const x2 = s1.b.x, y2 = s1.b.y
  const x3 = s2.a.x, y3 = s2.a.y
  const x4 = s2.b.x, y4 = s2.b.y

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(denom) < 1e-10) return null

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
    }
  }

  return null
}

export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function pointToSegmentDistance(point: Point, segment: Segment): number {
  const dx = segment.b.x - segment.a.x
  const dy = segment.b.y - segment.a.y
  const lenSq = dx * dx + dy * dy

  if (lenSq === 0) return distance(point, segment.a)

  let t = ((point.x - segment.a.x) * dx + (point.y - segment.a.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))

  return distance(point, {
    x: segment.a.x + t * dx,
    y: segment.a.y + t * dy,
  })
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

function onSegment(a: Point, b: Point, p: Point): boolean {
  return p.x <= Math.max(a.x, b.x)
    && p.x >= Math.min(a.x, b.x)
    && p.y <= Math.max(a.y, b.y)
    && p.y >= Math.min(a.y, b.y)
}
