export class SpanTracker<T> {
  private spans: Array<{ start: number; end: number; data: T }> = []

  add(start: number, end: number, data: T): void {
    if (start > end) [start, end] = [end, start]
    this.spans.push({ start, end, data })
  }

  query(point: number): T[] {
    return this.spans.filter((s) => point >= s.start && point <= s.end).map((s) => s.data)
  }

  queryRange(start: number, end: number): T[] {
    return this.spans.filter((s) => s.start <= end && s.end >= start).map((s) => s.data)
  }

  get count(): number {
    return this.spans.length
  }

  get isEmpty(): boolean {
    return this.spans.length === 0
  }

  get minStart(): number | undefined {
    return this.spans.length > 0 ? Math.min(...this.spans.map((s) => s.start)) : undefined
  }

  get maxEnd(): number | undefined {
    return this.spans.length > 0 ? Math.max(...this.spans.map((s) => s.end)) : undefined
  }

  totalSpan(): number {
    if (this.spans.length === 0) return 0
    return (this.maxEnd ?? 0) - (this.minStart ?? 0)
  }

  remove(index: number): boolean {
    if (index < 0 || index >= this.spans.length) return false
    this.spans.splice(index, 1)
    return true
  }

  clear(): void {
    this.spans = []
  }

  toArray(): Array<{ start: number; end: number; data: T }> {
    return this.spans.map((s) => ({ ...s }))
  }

  toString(): string {
    return JSON.stringify(this.spans)
  }

  toJSON(): Array<{ start: number; end: number; data: T }> {
    return this.toArray()
  }

  clone(): SpanTracker<T> {
    const copy = new SpanTracker<T>()
    copy.spans = this.spans.map((s) => ({ ...s }))
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SpanTracker)) return false
    if (this.count !== other.count) return false
    return true
  }
}
