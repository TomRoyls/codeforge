import type { StaticSparseTableOptions, StaticSparseTableStats } from "./types.js"
import { DEFAULT_COMPARATOR } from "./types.js"

export class StaticSparseTable<T> {
  private readonly _data: T[]
  private readonly _comparator: (a: T, b: T) => number
  private readonly _logTable: number[]
  private readonly _minTable: T[][]
  private readonly _maxTable: T[][]
  private readonly _gcdTable: number[][]
  private readonly _sumTable: number[][]
  private readonly _isNumeric: boolean

  constructor(options: StaticSparseTableOptions<T>) {
    this._data = [...options.data]
    this._comparator = options.comparator ?? DEFAULT_COMPARATOR

    const n = this._data.length
    this._isNumeric = n > 0 && typeof this._data[0] === "number"

    if (n === 0) {
      this._logTable = []
      this._minTable = []
      this._maxTable = []
      this._gcdTable = []
      this._sumTable = []
      return
    }

    this._logTable = new Array<number>(n + 1)
    this._logTable[0] = 0
    if (n >= 1) this._logTable[1] = 0
    for (let i = 2; i <= n; i++) {
      this._logTable[i] = (this._logTable[Math.floor(i / 2)] ?? 0) + 1
    }

    const maxLog = this._logTable[n] ?? 0

    this._minTable = new Array<T[]>(maxLog + 1)
    this._maxTable = new Array<T[]>(maxLog + 1)
    this._gcdTable = this._isNumeric ? new Array<number[]>(maxLog + 1) : []
    this._sumTable = this._isNumeric ? new Array<number[]>(maxLog + 1) : []

    this._minTable[0] = [...this._data]
    this._maxTable[0] = [...this._data]

    if (this._isNumeric) {
      const numData = this._data as unknown as number[]
      this._gcdTable[0] = [...numData]
      this._sumTable[0] = [...numData]
    }

    for (let k = 1; k <= maxLog; k++) {
      const step = 1 << (k - 1)
      const span = 1 << k

      this._minTable[k] = new Array<T>(n)
      this._maxTable[k] = new Array<T>(n)

      const prevMin = this._minTable[k - 1]!
      const prevMax = this._maxTable[k - 1]!

      for (let i = 0; i + span - 1 < n; i++) {
        const a = prevMin[i]!
        const b = prevMin[i + step]!
        this._minTable[k]![i] = this._comparator(a, b) <= 0 ? a : b

        const c = prevMax[i]!
        const d = prevMax[i + step]!
        this._maxTable[k]![i] = this._comparator(c, d) >= 0 ? c : d
      }

      if (this._isNumeric) {
        this._gcdTable[k] = new Array<number>(n)
        this._sumTable[k] = new Array<number>(n)

        const prevGcd = this._gcdTable[k - 1]!
        const prevSum = this._sumTable[k - 1]!

        for (let i = 0; i + span - 1 < n; i++) {
          this._gcdTable[k]![i] = computeGcd(prevGcd[i]!, prevGcd[i + step]!)
          this._sumTable[k]![i] = prevSum[i]! + prevSum[i + step]!
        }
      }
    }
  }

  query(start: number, end: number, mode: "min" | "max"): T
  query(start: number, end: number, mode: "gcd"): number
  query(start: number, end: number, mode: "sum"): number
  query(start: number, end: number, mode: "min" | "max" | "gcd" | "sum"): T | number {
    switch (mode) {
      case "min":
        return this.queryMin(start, end)
      case "max":
        return this.queryMax(start, end)
      case "gcd":
        return this.queryGcd(start, end)
      case "sum":
        return this.querySum(start, end)
    }
  }

  queryMin(start: number, end: number): T {
    this._validateRange(start, end)
    const k = this._logTable[end - start + 1] ?? 0
    const row = this._minTable[k]!
    const a = row[start]!
    const b = row[end - (1 << k) + 1]!
    return this._comparator(a, b) <= 0 ? a : b
  }

  queryMax(start: number, end: number): T {
    this._validateRange(start, end)
    const k = this._logTable[end - start + 1] ?? 0
    const row = this._maxTable[k]!
    const a = row[start]!
    const b = row[end - (1 << k) + 1]!
    return this._comparator(a, b) >= 0 ? a : b
  }

  queryGcd(start: number, end: number): number {
    if (!this._isNumeric) {
      throw new TypeError("queryGcd requires numeric data")
    }
    this._validateRange(start, end)
    const k = this._logTable[end - start + 1] ?? 0
    const row = this._gcdTable[k]!
    const a = row[start]!
    const b = row[end - (1 << k) + 1]!
    return computeGcd(a, b)
  }

  querySum(start: number, end: number): number {
    if (!this._isNumeric) {
      throw new TypeError("querySum requires numeric data")
    }
    this._validateRange(start, end)
    const len = end - start + 1
    let result = 0
    let remaining = len
    let pos = start
    while (remaining > 0) {
      const k = this._logTable[remaining] ?? 0
      const row = this._sumTable[k]!
      result += row[pos]!
      pos += 1 << k
      remaining -= 1 << k
    }
    return result
  }

  queryAll(start: number, end: number): { min: T; max: T; gcd: number; sum: number } {
    return {
      min: this.queryMin(start, end),
      max: this.queryMax(start, end),
      gcd: this.queryGcd(start, end),
      sum: this.querySum(start, end),
    }
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._data.length; i++) {
      if (this._comparator(this._data[i]!, value) === 0) return i
    }
    return -1
  }

  lastIndexOf(value: T): number {
    for (let i = this._data.length - 1; i >= 0; i--) {
      if (this._comparator(this._data[i]!, value) === 0) return i
    }
    return -1
  }

  get size(): number {
    return this._data.length
  }

  toArray(): T[] {
    return [...this._data]
  }

  clone(): StaticSparseTable<T> {
    return new StaticSparseTable<T>({
      data: this._data,
      comparator: this._comparator,
    })
  }

  static from<T>(data: T[], options?: Omit<StaticSparseTableOptions<T>, "data">): StaticSparseTable<T> {
    return new StaticSparseTable<T>({ data, ...options })
  }

  stats(): StaticSparseTableStats {
    const n = this._data.length
    const maxLog = n === 0 ? 0 : (this._logTable[n] ?? 0)
    let tableEntries = 0
    for (let k = 0; k <= maxLog; k++) {
      const span = 1 << k
      for (let i = 0; i + span - 1 < n; i++) {
        tableEntries++
      }
    }
    const tablesCount = this._isNumeric ? 4 : 2
    const memoryBytes = tableEntries * tablesCount * 8 + this._logTable.length * 4
    return {
      size: n,
      memoryBytes,
      tableLevels: n === 0 ? 0 : maxLog + 1,
      queryMode: this._isNumeric ? "min,max,gcd,sum" : "min,max",
    }
  }

  private _validateRange(start: number, end: number): void {
    if (start < 0 || end >= this._data.length || start > end) {
      throw new RangeError(
        `Invalid range [${start}, ${end}] for array of length ${this._data.length}`,
      )
    }
  }
}

function computeGcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

export type { StaticSparseTableOptions, StaticSparseTableStats, QueryMode } from "./types.js"
export { DEFAULT_COMPARATOR } from "./types.js"
