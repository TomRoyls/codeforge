export class SparseTable<T = number> {
  private readonly data: T[]
  private readonly table: T[][]
  private readonly logs: Uint32Array
  private readonly combine: (a: T, b: T) => T
  private readonly isIdempotent: boolean

  constructor(
    data: T[],
    combine: (a: T, b: T) => T,
    options?: { idempotent?: boolean },
  ) {
    if (data.length === 0) {
      this.data = []
      this.table = []
      this.logs = new Uint32Array(0)
      this.combine = combine
      this.isIdempotent = options?.idempotent ?? false
      return
    }

    this.data = [...data]
    this.combine = combine
    this.isIdempotent = options?.idempotent ?? false

    const n = data.length
    this.logs = new Uint32Array(n + 1)
    this.logs[1] = 0
    for (let i = 2; i <= n; i++) {
      this.logs[i] = this.logs[Math.floor(i / 2)]! + 1
    }

    const k = this.logs[n]! + 1
    this.table = new Array<T[]>(k)

    this.table[0] = [...data]
    for (let j = 1; j < k; j++) {
      this.table[j] = new Array<T>(n)
      const step = 1 << (j - 1)
      for (let i = 0; i + (1 << j) <= n; i++) {
        this.table[j]![i] = this.combine(
          this.table[j - 1]![i]!,
          this.table[j - 1]![i + step]!,
        )
      }
    }
  }

  query(start: number, end: number): T | undefined {
    if (start < 0 || end > this.data.length || start >= end) return undefined
    if (end - start === 1) return this.data[start]

    const j = this.logs[end - start]!
    const len = 1 << j

    if (this.isIdempotent) {
      return this.combine(
        this.table[j]![start]!,
        this.table[j]![end - len]!,
      )
    }

    return this.combine(
      this.table[j]![start]!,
      this.table[j]![end - len]!,
    )
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.data.length) return undefined
    return this.data[index]
  }

  get length(): number {
    return this.data.length
  }

  isEmpty(): boolean {
    return this.data.length === 0
  }

  toArray(): T[] {
    return [...this.data]
  }

  static min(data: number[]): SparseTable<number> {
    return new SparseTable(data, Math.min, { idempotent: true })
  }

  static max(data: number[]): SparseTable<number> {
    return new SparseTable(data, Math.max, { idempotent: true })
  }

  static gcd(data: number[]): SparseTable<number> {
    const gcd = (a: number, b: number): number => {
      while (b !== 0) {
        const t = b
        b = a % b
        a = t
      }
      return a
    }
    return new SparseTable(data, gcd, { idempotent: true })
  }

  static sum(data: number[]): SparseTable<number> {
    return new SparseTable(data, (a, b) => a + b, { idempotent: false })
  }

  static fromArray<T>(
    data: T[],
    combine: (a: T, b: T) => T,
    options?: { idempotent?: boolean },
  ): SparseTable<T> {
    return new SparseTable(data, combine, options)
  }
}
