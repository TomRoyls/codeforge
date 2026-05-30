export class ShellSort {
  private static readonly GAPS = [701, 301, 132, 57, 23, 10, 4, 1]

  static sort(arr: number[]): number[] {
    const result = [...arr]
    for (const gap of ShellSort.GAPS) {
      if (gap >= result.length) continue
      for (let i = gap; i < result.length; i++) {
        const temp = result[i]!
        let j = i
        while (j >= gap && result[j - gap]! > temp) {
          result[j] = result[j - gap]!
          j -= gap
        }
        result[j] = temp
      }
    }
    return result
  }

  static sortInPlace(arr: number[]): void {
    for (const gap of ShellSort.GAPS) {
      if (gap >= arr.length) continue
      for (let i = gap; i < arr.length; i++) {
        const temp = arr[i]!
        let j = i
        while (j >= gap && arr[j - gap]! > temp) {
          arr[j] = arr[j - gap]!
          j -= gap
        }
        arr[j] = temp
      }
    }
  }

  static sortWithComparator<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    const result = [...arr]
    for (const gap of ShellSort.GAPS) {
      if (gap >= result.length) continue
      for (let i = gap; i < result.length; i++) {
        const temp = result[i]!
        let j = i
        while (j >= gap && compare(result[j - gap]!, temp) > 0) {
          result[j] = result[j - gap]!
          j -= gap
        }
        result[j] = temp
      }
    }
    return result
  }
}
