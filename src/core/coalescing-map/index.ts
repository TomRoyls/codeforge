import type {
  CoalescingMapOptions,
  CoalescingMapRange,
  CoalescingMapForEachCallback,
} from './types.js'

type InternalRange<K, V> = {
  start: K
  end: K
  value: V
}

export class CoalescingMap<K, V> {
  private _ranges: InternalRange<K, V>[]
  private cmp: (a: K, b: K) => number
  private pred: (k: K) => K
  private succ: (k: K) => K

  constructor(options?: CoalescingMapOptions<K>) {
    this._ranges = []
    this.cmp = options?.compare ?? ((a: K, b: K) => (a as number) - (b as number))
    this.pred = options?.predecessor ?? ((k: K) => ((k as number) - 1) as K)
    this.succ = options?.successor ?? ((k: K) => ((k as number) + 1) as K)
  }

  private overlapsRange(r: InternalRange<K, V>, start: K, end: K): boolean {
    return this.cmp(r.start, end) <= 0 && this.cmp(start, r.end) <= 0
  }

  private touchesRange(r: InternalRange<K, V>, start: K, end: K): boolean {
    if (this.overlapsRange(r, start, end)) return true
    if (this.cmp(this.succ(r.end), start) === 0) return true
    if (this.cmp(this.succ(end), r.start) === 0) return true
    return false
  }

  private findRangeIndex(key: K): number {
    let lo = 0
    let hi = this._ranges.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const r = this._ranges[mid]!
      if (this.cmp(key, r.start) < 0) {
        hi = mid - 1
      } else if (this.cmp(key, r.end) > 0) {
        lo = mid + 1
      } else {
        return mid
      }
    }
    return -1
  }

  set(start: K, end: K, value: V): void {
    if (this.cmp(start, end) > 0) return

    let newStart = start
    let newEnd = end

    while (true) {
      let expanded = false
      for (const r of this._ranges) {
        if (r.value !== value) continue
        if (!this.touchesRange(r, newStart, newEnd)) continue
        if (this.cmp(r.start, newStart) < 0) {
          newStart = r.start
          expanded = true
        }
        if (this.cmp(r.end, newEnd) > 0) {
          newEnd = r.end
          expanded = true
        }
      }
      if (!expanded) break
    }

    const remaining: InternalRange<K, V>[] = []
    for (const r of this._ranges) {
      if (!this.overlapsRange(r, newStart, newEnd)) {
        remaining.push(r)
        continue
      }
      if (r.value !== value) {
        if (this.cmp(r.start, newStart) < 0) {
          remaining.push({ start: r.start, end: this.pred(newStart), value: r.value })
        }
        if (this.cmp(r.end, newEnd) > 0) {
          remaining.push({ start: this.succ(newEnd), end: r.end, value: r.value })
        }
      }
    }

    remaining.push({ start: newStart, end: newEnd, value })
    remaining.sort((a, b) => this.cmp(a.start, b.start))
    this._ranges = remaining
  }

  get(key: K): V | undefined {
    const idx = this.findRangeIndex(key)
    if (idx === -1) return undefined
    return this._ranges[idx]!.value
  }

  getRange(key: K): CoalescingMapRange<K, V> | undefined {
    const idx = this.findRangeIndex(key)
    if (idx === -1) return undefined
    const r = this._ranges[idx]!
    return { start: r.start, end: r.end, value: r.value }
  }

  delete(start: K, end: K): void {
    if (this.cmp(start, end) > 0) return
    if (this._ranges.length === 0) return

    const remaining: InternalRange<K, V>[] = []
    for (const r of this._ranges) {
      if (!this.overlapsRange(r, start, end)) {
        remaining.push(r)
        continue
      }
      if (this.cmp(r.start, start) < 0) {
        remaining.push({ start: r.start, end: this.pred(start), value: r.value })
      }
      if (this.cmp(r.end, end) > 0) {
        remaining.push({ start: this.succ(end), end: r.end, value: r.value })
      }
    }
    this._ranges = remaining
  }

  contains(key: K): boolean {
    return this.findRangeIndex(key) !== -1
  }

  overlaps(start: K, end: K): boolean {
    if (this.cmp(start, end) > 0) return false
    for (const r of this._ranges) {
      if (this.overlapsRange(r, start, end)) return true
    }
    return false
  }

  ranges(): CoalescingMapRange<K, V>[] {
    return this._ranges.map(r => ({ start: r.start, end: r.end, value: r.value }))
  }

  get size(): number {
    return this._ranges.length
  }

  get isEmpty(): boolean {
    return this._ranges.length === 0
  }

  clear(): void {
    this._ranges = []
  }

  toArray(): CoalescingMapRange<K, V>[] {
    return this._ranges.map(r => ({ start: r.start, end: r.end, value: r.value }))
  }

  forEach(callback: CoalescingMapForEachCallback<K, V>): void {
    for (const r of this._ranges) {
      callback(r.start, r.end, r.value)
    }
  }

  *[Symbol.iterator](): Iterator<CoalescingMapRange<K, V>> {
    for (const r of this._ranges) {
      yield { start: r.start, end: r.end, value: r.value }
    }
  }
}
