export class IntervalGraph {
  private intervals: [number, number][] = []

  addInterval(start: number, end: number): void {
    this.intervals.push([start, end])
  }

  isIntervalGraph(): boolean {
    const n = this.intervals.length
    if (n <= 2) return true
    const adj: Set<number>[] = Array.from({ length: n }, () => new Set())
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const [a1, a2] = this.intervals[i]!
        const [b1, b2] = this.intervals[j]!
        if (a1 < b2 && b1 < a2) {
          adj[i]!.add(j)
          adj[j]!.add(i)
        }
      }
    }
    return this.checkChordal(adj)
  }

  maxOverlap(): number {
    const events: [number, number][] = []
    for (const [start, end] of this.intervals) {
      events.push([start, 1])
      events.push([end, -1])
    }
    events.sort((a, b) => a[0]! - b[0]! || b[1]! - a[1]!)
    let count = 0
    let max = 0
    for (const [, delta] of events) {
      count += delta
      max = Math.max(max, count)
    }
    return max
  }

  totalOverlap(): number {
    const events: [number, number][] = []
    for (const [start, end] of this.intervals) {
      events.push([start, 1])
      events.push([end, -1])
    }
    events.sort((a, b) => a[0]! - b[0]!)
    let count = 0
    let total = 0
    let prev = 0
    for (const [x, delta] of events) {
      total += count * (x - prev)
      prev = x
      count += delta
    }
    return total
  }

  private checkChordal(adj: Set<number>[]): boolean {
    const n = adj.length
    const degree = adj.map(s => s.size)
    const used = new Array(n).fill(false)
    const order: number[] = []
    for (let step = 0; step < n; step++) {
      let best = -1
      let bestDeg = Infinity
      for (let i = 0; i < n; i++) {
        if (!used[i] && degree[i]! < bestDeg) {
          bestDeg = degree[i]!
          best = i
        }
      }
      order.push(best!)
      used[best!] = true
      degree[best!] = 0
      for (const v of adj[best!]!) {
        if (!used[v]) degree[v]!--
      }
    }
    const pos = new Array(n).fill(0)
    for (let i = 0; i < n; i++) pos[order[i]!] = i
    for (let i = 0; i < n; i++) {
      const u = order[i]!
      const later = [...adj[u]!].filter(v => pos[v]! > i).sort((a, b) => pos[a]! - pos[b]!)
      if (later.length === 0) continue
      const first = later[0]!
      for (let j = 1; j < later.length; j++) {
        if (!adj[first]!.has(later[j]!)) return false
      }
    }
    return true
  }
}
