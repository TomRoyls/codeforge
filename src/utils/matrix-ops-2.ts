export class MatrixOps2 {
  static multiply(a: number[][], b: number[][]): number[][] {
    const rows = a.length, cols = b[0].length, inner = b.length
    const result: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0))
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++)
        for (let k = 0; k < inner; k++)
          result[i][j] += a[i][k] * b[k][j]
    return result
  }

  static transpose(m: number[][]): number[][] {
    const rows = m.length, cols = m[0]?.length ?? 0
    const result: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0))
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++)
        result[j][i] = m[i][j]
    return result
  }

  static add(a: number[][], b: number[][]): number[][] {
    return a.map((row, i) => row.map((v, j) => v + b[i][j]))
  }

  static scale(m: number[][], s: number): number[][] {
    return m.map(row => row.map(v => v * s))
  }

  static identity(n: number): number[][] {
    const result: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (let i = 0; i < n; i++) result[i][i] = 1
    return result
  }

  static trace(m: number[][]): number {
    let sum = 0
    for (let i = 0; i < Math.min(m.length, m[0]?.length ?? 0); i++) sum += m[i][i]
    return sum
  }

  static power(m: number[][], exp: number): number[][] {
    const n = m.length
    let result = MatrixOps2.identity(n)
    let base = m.map(r => [...r])
    while (exp > 0) {
      if (exp & 1) result = MatrixOps2.multiply(result, base)
      base = MatrixOps2.multiply(base, base)
      exp = Math.floor(exp / 2)
    }
    return result
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): MatrixOps2 { return new MatrixOps2() }
  equals(other: unknown): boolean { return other instanceof MatrixOps2 }
}
