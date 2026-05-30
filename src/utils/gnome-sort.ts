export class GnomeSort {
  static sort(arr: number[]): number[] {
    const result = [...arr]
    let i = 0
    while (i < result.length) {
      if (i === 0 || result[i]! >= result[i - 1]!) {
        i++
      } else {
        const temp = result[i]!
        result[i] = result[i - 1]!
        result[i - 1] = temp
        i--
      }
    }
    return result
  }

  static sortInPlace(arr: number[]): void {
    let i = 0
    while (i < arr.length) {
      if (i === 0 || arr[i]! >= arr[i - 1]!) {
        i++
      } else {
        const temp = arr[i]!
        arr[i] = arr[i - 1]!
        arr[i - 1] = temp
        i--
      }
    }
  }

  static sortWithComparator<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    const result = [...arr]
    let i = 0
    while (i < result.length) {
      if (i === 0 || compare(result[i]!, result[i - 1]!) >= 0) {
        i++
      } else {
        const temp = result[i]!
        result[i] = result[i - 1]!
        result[i - 1] = temp
        i--
      }
    }
    return result
  }
}
