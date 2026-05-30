export class RunLengthEncoder<T> {
  private runs: Array<{ value: T; count: number }> = []
  private _length: number = 0

  append(value: T): void {
    this._length++
    if (this.runs.length > 0) {
      const last = this.runs[this.runs.length - 1]!
      if (last.value === value) {
        last.count++
        return
      }
    }
    this.runs.push({ value, count: 1 })
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    let offset = 0
    for (const run of this.runs) {
      if (index < offset + run.count) return run.value
      offset += run.count
    }
    return undefined
  }

  decode(): T[] {
    const result: T[] = []
    for (const run of this.runs) {
      for (let i = 0; i < run.count; i++) {
        result.push(run.value)
      }
    }
    return result
  }

  indexOf(value: T): number {
    let offset = 0
    for (const run of this.runs) {
      if (run.value === value) return offset
      offset += run.count
    }
    return -1
  }

  countOf(value: T): number {
    let total = 0
    for (const run of this.runs) {
      if (run.value === value) total += run.count
    }
    return total
  }

  compressRatio(): number {
    if (this._length === 0) return 1
    return this.runs.length / this._length
  }

  slice(start: number, end?: number): RunLengthEncoder<T> {
    const result = new RunLengthEncoder<T>()
    const e = end ?? this._length
    for (let i = start; i < e; i++) {
      result.append(this.get(i)!)
    }
    return result
  }

  get runCount(): number {
    return this.runs.length
  }

  get length(): number {
    return this._length
  }

  static fromArray<T>(arr: T[]): RunLengthEncoder<T> {
    const enc = new RunLengthEncoder<T>()
    for (const item of arr) {
      enc.append(item)
    }
    return enc
  }
}
