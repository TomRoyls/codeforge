export class CombSort {
  private static readonly SHRINK = 1.3

  static sort(arr: number[]): number[] {
    const result = [...arr]
    let gap = result.length
    let sorted = false
    while (!sorted) {
      gap = Math.max(1, Math.floor(gap / CombSort.SHRINK))
      if (gap <= 1) {
        gap = 1
        sorted = true
      }
      for (let i = 0; i + gap < result.length; i++) {
        if (result[i]! > result[i + gap]!) {
          const temp = result[i]!
          result[i] = result[i + gap]!
          result[i + gap] = temp
          sorted = false
        }
      }
    }
    return result
  }

  static sortWithComparator<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    const result = [...arr]
    let gap = result.length
    let sorted = false
    while (!sorted) {
      gap = Math.max(1, Math.floor(gap / CombSort.SHRINK))
      if (gap <= 1) {
        gap = 1
        sorted = true
      }
      for (let i = 0; i + gap < result.length; i++) {
        if (compare(result[i]!, result[i + gap]!) > 0) {
          const temp = result[i]!
          result[i] = result[i + gap]!
          result[i + gap] = temp
          sorted = false
        }
      }
    }
    return result
  }

  static sortInPlace(arr: number[]): void {
    let gap = arr.length
    let sorted = false
    while (!sorted) {
      gap = Math.max(1, Math.floor(gap / CombSort.SHRINK))
      if (gap <= 1) {
        gap = 1
        sorted = true
      }
      for (let i = 0; i + gap < arr.length; i++) {
        if (arr[i]! > arr[i + gap]!) {
          const temp = arr[i]!
          arr[i] = arr[i + gap]!
          arr[i + gap] = temp
          sorted = false
        }
      }
    }
  }
}
