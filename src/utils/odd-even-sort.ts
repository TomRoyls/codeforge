export class OddEvenSort {
  static sort(arr: number[]): number[] {
    const result = [...arr]
    let sorted = false
    while (!sorted) {
      sorted = true
      for (let i = 1; i < result.length - 1; i += 2) {
        if (result[i]! > result[i + 1]!) {
          const temp = result[i]!
          result[i] = result[i + 1]!
          result[i + 1] = temp
          sorted = false
        }
      }
      for (let i = 0; i < result.length - 1; i += 2) {
        if (result[i]! > result[i + 1]!) {
          const temp = result[i]!
          result[i] = result[i + 1]!
          result[i + 1] = temp
          sorted = false
        }
      }
    }
    return result
  }

  static sortInPlace(arr: number[]): void {
    let sorted = false
    while (!sorted) {
      sorted = true
      for (let i = 1; i < arr.length - 1; i += 2) {
        if (arr[i]! > arr[i + 1]!) {
          const temp = arr[i]!
          arr[i] = arr[i + 1]!
          arr[i + 1] = temp
          sorted = false
        }
      }
      for (let i = 0; i < arr.length - 1; i += 2) {
        if (arr[i]! > arr[i + 1]!) {
          const temp = arr[i]!
          arr[i] = arr[i + 1]!
          arr[i + 1] = temp
          sorted = false
        }
      }
    }
  }

  static sortWithComparator<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    const result = [...arr]
    let sorted = false
    while (!sorted) {
      sorted = true
      for (let i = 1; i < result.length - 1; i += 2) {
        if (compare(result[i]!, result[i + 1]!) > 0) {
          const temp = result[i]!
          result[i] = result[i + 1]!
          result[i + 1] = temp
          sorted = false
        }
      }
      for (let i = 0; i < result.length - 1; i += 2) {
        if (compare(result[i]!, result[i + 1]!) > 0) {
          const temp = result[i]!
          result[i] = result[i + 1]!
          result[i + 1] = temp
          sorted = false
        }
      }
    }
    return result
  }
}
