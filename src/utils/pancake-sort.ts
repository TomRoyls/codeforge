export class PancakeSort {
  static sort(arr: number[]): number[] {
    const result = [...arr]
    const n = result.length
    for (let size = n; size > 1; size--) {
      let maxIdx = 0
      for (let i = 1; i < size; i++) {
        if (result[i]! > result[maxIdx]!) maxIdx = i
      }
      if (maxIdx !== size - 1) {
        PancakeSort.flip(result, maxIdx + 1)
        PancakeSort.flip(result, size)
      }
    }
    return result
  }

  static flip(arr: number[], k: number): void {
    let left = 0
    let right = k - 1
    while (left < right) {
      const temp = arr[left]!
      arr[left] = arr[right]!
      arr[right] = temp
      left++
      right--
    }
  }

  static sortWithFlips(arr: number[]): { sorted: number[]; flips: number } {
    const result = [...arr]
    let flips = 0
    const n = result.length
    for (let size = n; size > 1; size--) {
      let maxIdx = 0
      for (let i = 1; i < size; i++) {
        if (result[i]! > result[maxIdx]!) maxIdx = i
      }
      if (maxIdx !== size - 1) {
        if (maxIdx > 0) {
          PancakeSort.flip(result, maxIdx + 1)
          flips++
        }
        PancakeSort.flip(result, size)
        flips++
      }
    }
    return { sorted: result, flips }
  }

  static isSorted(arr: number[]): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i]! < arr[i - 1]!) return false
    }
    return true
  }

  static minFlips(arr: number[]): number {
    return PancakeSort.sortWithFlips(arr).flips
  }
}
