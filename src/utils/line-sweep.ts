export interface SweepEvent {
  x: number
  type: 'open' | 'close'
  id: number
}

export class LineSweep {
  static countOverlappingIntervals(intervals: Array<{ start: number; end: number }>): number {
    const events: SweepEvent[] = []
    for (let i = 0; i < intervals.length; i++) {
      events.push({ x: intervals[i]!.start, type: 'open', id: i })
      events.push({ x: intervals[i]!.end + 1, type: 'close', id: i })
    }
    events.sort((a, b) => a.x - b.x || (a.type === 'close' ? -1 : 1))
    let maxOverlap = 0
    let current = 0
    for (const event of events) {
      if (event.type === 'open') current++
      else current--
      maxOverlap = Math.max(maxOverlap, current)
    }
    return maxOverlap
  }

  static findOverlapPoints(intervals: Array<{ start: number; end: number }>): Map<number, number> {
    const events: SweepEvent[] = []
    for (let i = 0; i < intervals.length; i++) {
      events.push({ x: intervals[i]!.start, type: 'open', id: i })
      events.push({ x: intervals[i]!.end + 1, type: 'close', id: i })
    }
    events.sort((a, b) => a.x - b.x || (a.type === 'close' ? -1 : 1))
    const result = new Map<number, number>()
    let current = 0
    for (const event of events) {
      if (event.type === 'open') current++
      else current--
      result.set(event.x, current)
    }
    return result
  }

  static mergeIntervals(intervals: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
    if (intervals.length === 0) return []
    const sorted = [...intervals].sort((a, b) => a.start - b.start)
    const result: Array<{ start: number; end: number }> = [sorted[0]!]
    for (let i = 1; i < sorted.length; i++) {
      const last = result[result.length - 1]!
      if (sorted[i]!.start <= last.end) {
        last.end = Math.max(last.end, sorted[i]!.end)
      } else {
        result.push({ ...sorted[i]! })
      }
    }
    return result
  }

  static totalCoveredLength(intervals: Array<{ start: number; end: number }>): number {
    const merged = LineSweep.mergeIntervals(intervals)
    return merged.reduce((sum, iv) => sum + (iv.end - iv.start + 1), 0)
  }
}
