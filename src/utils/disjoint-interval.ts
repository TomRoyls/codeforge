export class DisjointInterval {
  private intervals: [number, number][] = []

  add(l: number, r: number): void {
    if (l > r) return
    const merged: [number, number][] = []
    let i = 0
    while (i < this.intervals.length && this.intervals[i]![1]! < l - 1) {
      merged.push(this.intervals[i]!)
      i++
    }
    let newL = l
    let newR = r
    while (i < this.intervals.length && this.intervals[i]![0]! <= r + 1) {
      newL = Math.min(newL, this.intervals[i]![0]!)
      newR = Math.max(newR, this.intervals[i]![1]!)
      i++
    }
    merged.push([newL, newR])
    while (i < this.intervals.length) {
      merged.push(this.intervals[i]!)
      i++
    }
    this.intervals = merged
  }

  remove(l: number, r: number): void {
    if (l > r) return
    const result: [number, number][] = []
    for (const [il, ir] of this.intervals) {
      if (ir < l || il > r) {
        result.push([il, ir])
      } else {
        if (il < l) result.push([il, l - 1])
        if (ir > r) result.push([r + 1, ir])
      }
    }
    this.intervals = result
  }

  contains(x: number): boolean {
    let lo = 0
    let hi = this.intervals.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const [il, ir] = this.intervals[mid]!
      if (x < il) hi = mid - 1
      else if (x > ir) lo = mid + 1
      else return true
    }
    return false
  }

  covers(l: number, r: number): boolean {
    for (const [il, ir] of this.intervals) {
      if (il <= l && ir >= r) return true
    }
    return false
  }

  totalCovered(): number {
    let total = 0
    for (const [l, r] of this.intervals) total += r - l + 1
    return total
  }

  getIntervals(): [number, number][] {
    return this.intervals.map(([l, r]) => [l, r])
  }

  get count(): number {
    return this.intervals.length
  }
}
