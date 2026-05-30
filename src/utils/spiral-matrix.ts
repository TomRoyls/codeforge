export class SpiralMatrix {
  static generate(n: number): number[][] {
    const matrix: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
    let value = 1
    let top = 0
    let bottom = n - 1
    let left = 0
    let right = n - 1
    while (value <= n * n) {
      for (let i = left; i <= right && value <= n * n; i++) {
        matrix[top]![i] = value++
      }
      top++
      for (let i = top; i <= bottom && value <= n * n; i++) {
        matrix[i]![right] = value++
      }
      right--
      for (let i = right; i >= left && value <= n * n; i--) {
        matrix[bottom]![i] = value++
      }
      bottom--
      for (let i = bottom; i >= top && value <= n * n; i--) {
        matrix[i]![left] = value++
      }
      left++
    }
    return matrix
  }

  static traverse(matrix: number[][]): number[] {
    if (matrix.length === 0) return []
    const result: number[] = []
    let top = 0
    let bottom = matrix.length - 1
    let left = 0
    let right = matrix[0]!.length - 1
    while (top <= bottom && left <= right) {
      for (let i = left; i <= right; i++) result.push(matrix[top]![i]!)
      top++
      for (let i = top; i <= bottom; i++) result.push(matrix[i]![right]!)
      right--
      if (top <= bottom) {
        for (let i = right; i >= left; i--) result.push(matrix[bottom]![i]!)
        bottom--
      }
      if (left <= right) {
        for (let i = bottom; i >= top; i--) result.push(matrix[i]![left]!)
        left++
      }
    }
    return result
  }

  static diagonalSum(matrix: number[][]): number {
    let sum = 0
    const n = matrix.length
    for (let i = 0; i < n; i++) {
      sum += matrix[i]![i]!
      if (i !== n - 1 - i) {
        sum += matrix[i]![n - 1 - i]!
      }
    }
    return sum
  }

  static rotate90(matrix: number[][]): number[][] {
    const n = matrix.length
    const result: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        result[j]![n - 1 - i] = matrix[i]![j]!
      }
    }
    return result
  }
}
