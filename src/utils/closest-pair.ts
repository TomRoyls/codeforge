export interface Point2D {
  x: number
  y: number
}

export class ClosestPair {
  static distance(p1: Point2D, p2: Point2D): number {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  static bruteForce(points: Point2D[]): { p1: Point2D; p2: Point2D; distance: number } | null {
    if (points.length < 2) return null
    let minDist = Infinity
    let best: { p1: Point2D; p2: Point2D; distance: number } | null = null
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = ClosestPair.distance(points[i]!, points[j]!)
        if (d < minDist) {
          minDist = d
          best = { p1: points[i]!, p2: points[j]!, distance: d }
        }
      }
    }
    return best
  }

  static find(points: Point2D[]): { p1: Point2D; p2: Point2D; distance: number } | null {
    if (points.length < 2) return null
    const sorted = [...points].sort((a, b) => a.x - b.x)
    return ClosestPair.findRec(sorted)
  }

  private static findRec(px: Point2D[]): { p1: Point2D; p2: Point2D; distance: number } | null {
    if (px.length <= 3) return ClosestPair.bruteForce(px)
    const mid = Math.floor(px.length / 2)
    const midPoint = px[mid]!
    const left = px.slice(0, mid)
    const right = px.slice(mid)
    const leftResult = ClosestPair.findRec(left)
    const rightResult = ClosestPair.findRec(right)
    let best: { p1: Point2D; p2: Point2D; distance: number }
    if (leftResult === null && rightResult === null) return null
    if (leftResult === null) best = rightResult!
    else if (rightResult === null) best = leftResult
    else best = leftResult.distance < rightResult.distance ? leftResult : rightResult
    const strip: Point2D[] = []
    for (const p of px) {
      if (Math.abs(p.x - midPoint.x) < best.distance) strip.push(p)
    }
    strip.sort((a, b) => a.y - b.y)
    for (let i = 0; i < strip.length; i++) {
      for (let j = i + 1; j < strip.length && strip[j]!.y - strip[i]!.y < best.distance; j++) {
        const d = ClosestPair.distance(strip[i]!, strip[j]!)
        if (d < best.distance) {
          best = { p1: strip[i]!, p2: strip[j]!, distance: d }
        }
      }
    }
    return best
  }

  static minDistance(points: Point2D[]): number {
    const result = ClosestPair.find(points)
    return result?.distance ?? Infinity
  }
}
