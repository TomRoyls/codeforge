export class RunLengthCodec<T> {
  private runs: Array<{ value: T; count: number }> = []

  encode(items: T[]): void {
    for (const item of items) this.push(item)
  }

  push(item: T): void {
    if (this.runs.length > 0) {
      const last = this.runs[this.runs.length - 1]!
      if (last.value === item) { last.count++; return }
    }
    this.runs.push({ value: item, count: 1 })
  }

  decode(): T[] {
    const result: T[] = []
    for (const run of this.runs) {
      for (let i = 0; i < run.count; i++) result.push(run.value)
    }
    return result
  }

  get runCount(): number { return this.runs.length }
  get totalItems(): number {
    let t = 0; for (const r of this.runs) t += r.count; return t
  }
  get isEmpty(): boolean { return this.runs.length === 0 }
  getRuns(): Array<{ value: T; count: number }> { return [...this.runs] }
  clear(): void { this.runs = [] }

  toArray(): Array<{ value: T; count: number }> { return this.getRuns() }
  toString(): string { return JSON.stringify(this.runs) }
  toJSON(): Array<{ value: T; count: number }> { return this.getRuns() }

  clone(): RunLengthCodec<T> {
    const c = new RunLengthCodec<T>()
    c.runs = this.runs.map((r) => ({ ...r }))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RunLengthCodec)) return false
    if (this.runs.length !== other.runs.length) return false
    for (let i = 0; i < this.runs.length; i++) {
      const a = this.runs[i]!, b = other.runs[i]!
      if (a.value !== b.value || a.count !== b.count) return false
    }
    return true
  }
}
