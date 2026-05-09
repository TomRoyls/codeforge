import type { SparseTableOptions } from "./types.js"

export class SparseTable<T> {
  private readonly _values: T[]
  private readonly _operation: (a: T, b: T) => T
  private readonly _isIdempotent: boolean
  private readonly _table: T[][]
  private readonly _log: number[]

  constructor(options: SparseTableOptions<T>) {
    this._values = [...options.values]
    this._operation = options.operation
    this._isIdempotent = options.isIdempotent ?? false

    const n = this._values.length
    if (n === 0) {
      this._table = []
      this._log = []
      return
    }

    this._log = new Array(n + 1)
    this._log[0] = 0
    this._log[1] = 0
    for (let i = 2; i <= n; i++) {
      this._log[i] = (this._log[Math.floor(i / 2)] ?? 0) + 1
    }

    const maxLog = this._log[n] ?? 0
    this._table = new Array(maxLog + 1)

    this._table[0] = [...this._values]

    for (let k = 1; k <= maxLog; k++) {
      this._table[k] = new Array(n)
      const prev = this._table[k - 1]
      if (prev === undefined) break
      const step = 1 << (k - 1)
      for (let i = 0; i + (1 << k) - 1 < n; i++) {
        const a = prev[i]
        const b = prev[i + step]
        if (a !== undefined && b !== undefined) {
          this._table[k]![i] = this._operation(a, b)
        }
      }
    }
  }

  query(start: number, end: number): T {
    if (start < 0 || end >= this._values.length || start > end) {
      throw new RangeError(`Invalid range [${start}, ${end}] for array of length ${this._values.length}`)
    }

    const len = end - start + 1

    if (this._isIdempotent) {
      const k = this._log[len] ?? 0
      const row = this._table[k]
      if (row === undefined) {
        return this._values[start]!
      }
      const a = row[start]
      const b = row[end - (1 << k) + 1]
      if (a === undefined || b === undefined) {
        return this._values[start]!
      }
      return this._operation(a, b)
    }

    let result: T | undefined
    let remaining = len
    let pos = start
    let currentK = this._log[remaining] ?? 0

    while (remaining > 0) {
      currentK = this._log[remaining] ?? 0
      const row = this._table[currentK]
      if (row === undefined) break
      const val = row[pos]
      if (val === undefined) break
      if (result === undefined) {
        result = val
      } else {
        result = this._operation(result, val)
      }
      pos += 1 << currentK
      remaining -= 1 << currentK
    }

    if (result === undefined) {
      return this._values[start]!
    }
    return result
  }

  queryRange(start: number, end: number): T {
    return this.query(start, end)
  }

  size(): number {
    return this._values.length
  }

  isEmpty(): boolean {
    return this._values.length === 0
  }

  toArray(): T[] {
    return [...this._values]
  }

  clone(): SparseTable<T> {
    return new SparseTable<T>({
      values: this._values,
      operation: this._operation,
      isIdempotent: this._isIdempotent,
    })
  }

  getOperation(): (a: T, b: T) => T {
    return this._operation
  }

  isIdempotent(): boolean {
    return this._isIdempotent
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._values.length; i++) {
      const val = this._values[i]
      if (val !== undefined) {
        callback(val, i)
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._values.length; i++) {
      const val = this._values[i]
      if (val !== undefined) {
        yield val
      }
    }
  }
}
