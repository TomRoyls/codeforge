export interface SweepEvent {
  x: number
  type: 'start' | 'end'
  index: number
}

export class SweepLine {
  static findIntersections(segments: { x1: number; y1: number; x2: number; y2: number }[]): [number, number][] {
    const result: [number, number][] = []
    const events: { x: number; y: number; type: 'start' | 'end'; idx: number }[] = []
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i]!
      const startFromLeft = s.x1 <= s.x2
      events.push({
        x: startFromLeft ? s.x1 : s.x2,
        y: startFromLeft ? s.y1 : s.y2,
        type: 'start',
        idx: i,
      })
      events.push({
        x: startFromLeft ? s.x2 : s.x1,
        y: startFromLeft ? s.y2 : s.y1,
        type: 'end',
        idx: i,
      })
    }
    events.sort((a, b) => a.x - b.x || a.type.localeCompare(b.type))
    const active = new Set<number>()
    for (const event of events) {
      if (event.type === 'start') {
        for (const otherIdx of active) {
          if (SweepLine.segmentsIntersect(segments[event.idx]!, segments[otherIdx]!)) {
            result.push([Math.min(event.idx, otherIdx), Math.max(event.idx, otherIdx)])
          }
        }
        active.add(event.idx)
      } else {
        active.delete(event.idx)
      }
    }
    return result
  }

  static segmentsIntersect(
    a: { x1: number; y1: number; x2: number; y2: number },
    b: { x1: number; y1: number; x2: number; y2: number },
  ): boolean {
    const d1 = SweepLine.crossProduct(b.x1, b.y1, b.x2, b.y2, a.x1, a.y1)
    const d2 = SweepLine.crossProduct(b.x1, b.y1, b.x2, b.y2, a.x2, a.y2)
    const d3 = SweepLine.crossProduct(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1)
    const d4 = SweepLine.crossProduct(a.x1, a.y1, a.x2, a.y2, b.x2, b.y2)
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true
    if (d1 === 0 && SweepLine.onSegment(b.x1, b.y1, b.x2, b.y2, a.x1, a.y1)) return true
    if (d2 === 0 && SweepLine.onSegment(b.x1, b.y1, b.x2, b.y2, a.x2, a.y2)) return true
    if (d3 === 0 && SweepLine.onSegment(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1)) return true
    if (d4 === 0 && SweepLine.onSegment(a.x1, a.y1, a.x2, a.y2, b.x2, b.y2)) return true
    return false
  }

  private static crossProduct(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
  }

  private static onSegment(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
    return (
      Math.min(ax, bx) <= cx && cx <= Math.max(ax, bx) &&
      Math.min(ay, by) <= cy && cy <= Math.max(ay, by)
    )
  }

  static closestPair(points: { x: number; y: number }[]): { p1: number; p2: number; dist: number } | null {
    if (points.length < 2) return null
    const sorted = points.map((p, i) => ({ ...p, i })).sort((a, b) => a.x - b.x)
    let minDist = Infinity
    let p1 = 0
    let p2 = 1
    const strip: typeof sorted = []
    for (let i = 0; i < sorted.length; i++) {
      for (let j = strip.length - 1; j >= 0; j--) {
        const dx = sorted[i]!.x - strip[j]!.x
        if (dx >= minDist) {
          strip.splice(0, j + 1)
          break
        }
        const dy = sorted[i]!.y - strip[j]!.y
        const d = dx * dx + dy * dy
        if (d < minDist) {
          minDist = d
          p1 = sorted[i]!.i
          p2 = strip[j]!.i
        }
      }
      strip.push(sorted[i]!)
    }
    return { p1, p2, dist: Math.sqrt(minDist) }
  }
}
