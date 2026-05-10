import type { SparseTable2DStats } from './types.js'

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

export class SparseTable2D {
  private readonly _data: number[][]
  private readonly _rows: number
  private readonly _cols: number
  private readonly _log: number[]
  private readonly _minSt: number[][][][]
  private readonly _maxSt: number[][][][]
  private readonly _gcdSt: number[][][][]
  private readonly _prefixSum: number[][]

  constructor(matrix: number[][]) {
    this._rows = matrix.length
    this._cols = this._rows > 0 ? (matrix[0]?.length ?? 0) : 0
    this._data = matrix.map(row => [...row])

    const maxDim = Math.max(this._rows, this._cols, 1)
    this._log = new Array(maxDim + 1)
    this._log[0] = 0
    this._log[1] = 0
    for (let i = 2; i <= maxDim; i++) {
      this._log[i] = (this._log[i >> 1] ?? 0) + 1
    }

    this._minSt = this.buildTable(Math.min)
    this._maxSt = this.buildTable(Math.max)
    this._gcdSt = this.buildTable(gcd)
    this._prefixSum = this.buildPrefixSum()
  }

  private buildTable(op: (a: number, b: number) => number): number[][][][] {
    const n = this._rows
    const m = this._cols
    if (n === 0 || m === 0) return []

    const maxLogR = this._log[n]!
    const maxLogC = this._log[m]!

    const st: number[][][][] = new Array(maxLogR + 1)
    for (let k1 = 0; k1 <= maxLogR; k1++) {
      st[k1] = new Array(maxLogC + 1)
    }

    st[0]![0] = this._data.map(row => [...row])

    for (let k2 = 1; k2 <= maxLogC; k2++) {
      st[0]![k2] = new Array(n)
      const step = 1 << (k2 - 1)
      for (let i = 0; i < n; i++) {
        st[0]![k2]![i] = new Array(m)
        for (let j = 0; j + (1 << k2) <= m; j++) {
          const a = st[0]![k2 - 1]![i]![j]!
          const b = st[0]![k2 - 1]![i]![j + step]!
          st[0]![k2]![i]![j] = op(a, b)
        }
      }
    }

    for (let k1 = 1; k1 <= maxLogR; k1++) {
      const step = 1 << (k1 - 1)
      for (let k2 = 0; k2 <= maxLogC; k2++) {
        st[k1]![k2] = new Array(n)
        for (let i = 0; i + (1 << k1) <= n; i++) {
          st[k1]![k2]![i] = new Array(m)
          for (let j = 0; j + (1 << k2) <= m; j++) {
            const a = st[k1 - 1]![k2]![i]![j]!
            const b = st[k1 - 1]![k2]![i + step]![j]!
            st[k1]![k2]![i]![j] = op(a, b)
          }
        }
      }
    }

    return st
  }

  private buildPrefixSum(): number[][] {
    const n = this._rows
    const m = this._cols
    if (n === 0 || m === 0) return []

    const ps: number[][] = new Array(n + 1)
    for (let i = 0; i <= n; i++) {
      ps[i] = new Array(m + 1).fill(0)
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        ps[i + 1]![j + 1] = this._data[i]![j]! + ps[i]![j + 1]! + ps[i + 1]![j]! - ps[i]![j]!
      }
    }
    return ps
  }

  private querySparse(st: number[][][][], r1: number, c1: number, r2: number, c2: number, op: (a: number, b: number) => number): number {
    const k1 = this._log[r2 - r1 + 1]!
    const k2 = this._log[c2 - c1 + 1]!

    const a = st[k1]![k2]![r1]![c1]!
    const b = st[k1]![k2]![r1]![c2 - (1 << k2) + 1]!
    const c = st[k1]![k2]![r2 - (1 << k1) + 1]![c1]!
    const d = st[k1]![k2]![r2 - (1 << k1) + 1]![c2 - (1 << k2) + 1]!

    return op(op(a, b), op(c, d))
  }

  private validateBounds(r1: number, c1: number, r2: number, c2: number): void {
    if (this._rows === 0 || this._cols === 0) {
      throw new RangeError('Cannot query empty table')
    }
    if (r1 < 0 || r2 >= this._rows || r1 > r2) {
      throw new RangeError(`Invalid row range [${r1}, ${r2}] for matrix with ${this._rows} rows`)
    }
    if (c1 < 0 || c2 >= this._cols || c1 > c2) {
      throw new RangeError(`Invalid column range [${c1}, ${c2}] for matrix with ${this._cols} cols`)
    }
  }

  queryMin(r1: number, c1: number, r2: number, c2: number): number {
    this.validateBounds(r1, c1, r2, c2)
    return this.querySparse(this._minSt, r1, c1, r2, c2, Math.min)
  }

  queryMax(r1: number, c1: number, r2: number, c2: number): number {
    this.validateBounds(r1, c1, r2, c2)
    return this.querySparse(this._maxSt, r1, c1, r2, c2, Math.max)
  }

  queryGcd(r1: number, c1: number, r2: number, c2: number): number {
    this.validateBounds(r1, c1, r2, c2)
    return this.querySparse(this._gcdSt, r1, c1, r2, c2, gcd)
  }

  querySum(r1: number, c1: number, r2: number, c2: number): number {
    this.validateBounds(r1, c1, r2, c2)
    const ps = this._prefixSum
    return ps[r2 + 1]![c2 + 1]! - ps[r1]![c2 + 1]! - ps[r2 + 1]![c1]! + ps[r1]![c1]!
  }

  get(row: number, col: number): number {
    if (this._rows === 0 || this._cols === 0) {
      throw new RangeError('Cannot get from empty table')
    }
    if (row < 0 || row >= this._rows) {
      throw new RangeError(`Row ${row} out of bounds [0, ${this._rows - 1}]`)
    }
    if (col < 0 || col >= this._cols) {
      throw new RangeError(`Column ${col} out of bounds [0, ${this._cols - 1}]`)
    }
    return this._data[row]![col]!
  }

  get rows(): number {
    return this._rows
  }

  get cols(): number {
    return this._cols
  }

  toArray(): number[][] {
    return this._data.map(row => [...row])
  }

  clone(): SparseTable2D {
    return new SparseTable2D(this.toArray())
  }

  static from(matrix: number[][]): SparseTable2D {
    return new SparseTable2D(matrix)
  }

  stats(): SparseTable2DStats {
    return {
      rows: this._rows,
      cols: this._cols,
      totalElements: this._rows * this._cols,
    }
  }
}

export type { SparseTable2DOptions, SparseTable2DStats } from './types.js'
