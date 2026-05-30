export class GaussianElimination {
  static solve(augmented: number[][]): number[] | null {
    const n = augmented.length
    const m = augmented[0]!.length
    const matrix = augmented.map(row => [...row])
    for (let col = 0; col < n; col++) {
      let maxRow = col
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(matrix[row]![col]!) > Math.abs(matrix[maxRow]![col]!)) {
          maxRow = row
        }
      }
      const temp = matrix[col]!
      matrix[col] = matrix[maxRow]!
      matrix[maxRow] = temp
      if (Math.abs(matrix[col]![col]!) < 1e-10) return null
      for (let row = col + 1; row < n; row++) {
        const factor = matrix[row]![col]! / matrix[col]![col]!
        for (let j = col; j < m; j++) {
          matrix[row]![j]! -= factor * matrix[col]![j]!
        }
      }
    }
    const solution = new Array<number>(n).fill(0)
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0
      for (let j = i + 1; j < n; j++) {
        sum += matrix[i]![j]! * solution[j]!
      }
      solution[i] = (matrix[i]![n]! - sum) / matrix[i]![i]!
    }
    return solution
  }

  static determinant(matrix: number[][]): number {
    const n = matrix.length
    const m = matrix.map(row => [...row])
    let det = 1
    let swaps = 0
    for (let col = 0; col < n; col++) {
      let maxRow = col
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(m[row]![col]!) > Math.abs(m[maxRow]![col]!)) maxRow = row
      }
      if (maxRow !== col) {
        const temp = m[col]!
        m[col] = m[maxRow]!
        m[maxRow] = temp
        swaps++
      }
      if (Math.abs(m[col]![col]!) < 1e-10) return 0
      det *= m[col]![col]!
      for (let row = col + 1; row < n; row++) {
        const factor = m[row]![col]! / m[col]![col]!
        for (let j = col; j < n; j++) {
          m[row]![j]! -= factor * m[col]![j]!
        }
      }
    }
    return swaps % 2 === 0 ? det : -det
  }

  static rank(matrix: number[][]): number {
    const rows = matrix.length
    const cols = matrix[0]!.length
    const m = matrix.map(row => [...row])
    let r = 0
    for (let col = 0; col < cols && r < rows; col++) {
      let pivot = -1
      for (let row = r; row < rows; row++) {
        if (Math.abs(m[row]![col]!) > 1e-10) { pivot = row; break }
      }
      if (pivot === -1) continue
      const temp = m[r]!
      m[r] = m[pivot]!
      m[pivot] = temp
      const scale = m[r]![col]!
      for (let j = col; j < cols; j++) m[r]![j]! /= scale
      for (let row = 0; row < rows; row++) {
        if (row === r) continue
        const factor = m[row]![col]!
        for (let j = col; j < cols; j++) m[row]![j]! -= factor * m[r]![j]!
      }
      r++
    }
    return r
  }
}
