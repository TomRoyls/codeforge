export class DiscreteHistogram {
  private counts = new Map<number, number>()
  private _sum = 0
  private _count = 0

  add(value: number, count = 1): void {
    this.counts.set(value, (this.counts.get(value) ?? 0) + count)
    this._sum += value * count
    this._count += count
  }

  get(value: number): number {
    return this.counts.get(value) ?? 0
  }

  get mean(): number {
    return this._count > 0 ? this._sum / this._count : 0
  }

  get total(): number {
    return this._count
  }

  get uniqueValues(): number {
    return this.counts.size
  }

  get isEmpty(): boolean {
    return this._count === 0
  }

  median(): number {
    if (this._count === 0) return 0
    const sorted = Array.from(this.counts.entries()).sort((a, b) => a[0] - b[0])
    let acc = 0
    const target = this._count / 2
    for (const [val, cnt] of sorted) {
      acc += cnt
      if (acc >= target) return val
    }
    return sorted[sorted.length - 1]![0]
  }

  mode(): number {
    let maxVal = 0
    let maxCount = 0
    for (const [val, cnt] of this.counts) {
      if (cnt > maxCount) {
        maxCount = cnt
        maxVal = val
      }
    }
    return maxVal
  }

  percentile(p: number): number {
    if (this._count === 0) return 0
    const sorted = Array.from(this.counts.entries()).sort((a, b) => a[0] - b[0])
    const target = (p / 100) * this._count
    let acc = 0
    for (const [val, cnt] of sorted) {
      acc += cnt
      if (acc >= target) return val
    }
    return sorted[sorted.length - 1]![0]
  }

  clear(): void {
    this.counts.clear()
    this._sum = 0
    this._count = 0
  }

  toArray(): Array<[number, number]> {
    return Array.from(this.counts.entries()).sort((a, b) => a[0] - b[0])
  }

  toString(): string {
    return JSON.stringify(Object.fromEntries(this.counts))
  }

  toJSON(): Record<string, number> {
    return Object.fromEntries(this.counts)
  }

  clone(): DiscreteHistogram {
    const copy = new DiscreteHistogram()
    copy.counts = new Map(this.counts)
    copy._sum = this._sum
    copy._count = this._count
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DiscreteHistogram)) return false
    if (this._count !== other._count) return false
    for (const [k, v] of this.counts) {
      if (other.counts.get(k) !== v) return false
    }
    return true
  }
}
