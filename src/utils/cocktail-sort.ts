export class CocktailSort {
  static sort(arr: number[]): number[] {
    const result = [...arr]
    let start = 0
    let end = result.length - 1
    let swapped = true
    while (swapped) {
      swapped = false
      for (let i = start; i < end; i++) {
        if (result[i]! > result[i + 1]!) {
          const temp = result[i]!
          result[i] = result[i + 1]!
          result[i + 1] = temp
          swapped = true
        }
      }
      if (!swapped) break
      end--
      swapped = false
      for (let i = end; i > start; i--) {
        if (result[i]! < result[i - 1]!) {
          const temp = result[i]!
          result[i] = result[i - 1]!
          result[i - 1] = temp
          swapped = true
        }
      }
      start++
    }
    return result
  }

  static sortInPlace(arr: number[]): void {
    let start = 0
    let end = arr.length - 1
    let swapped = true
    while (swapped) {
      swapped = false
      for (let i = start; i < end; i++) {
        if (arr[i]! > arr[i + 1]!) {
          const temp = arr[i]!
          arr[i] = arr[i + 1]!
          arr[i + 1] = temp
          swapped = true
        }
      }
      if (!swapped) break
      end--
      swapped = false
      for (let i = end; i > start; i--) {
        if (arr[i]! < arr[i - 1]!) {
          const temp = arr[i]!
          arr[i] = arr[i - 1]!
          arr[i - 1] = temp
          swapped = true
        }
      }
      start++
    }
  }

  static sortWithComparator<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    const result = [...arr]
    let start = 0
    let end = result.length - 1
    let swapped = true
    while (swapped) {
      swapped = false
      for (let i = start; i < end; i++) {
        if (compare(result[i]!, result[i + 1]!) > 0) {
          const temp = result[i]!
          result[i] = result[i + 1]!
          result[i + 1] = temp
          swapped = true
        }
      }
      if (!swapped) break
      end--
      swapped = false
      for (let i = end; i > start; i--) {
        if (compare(result[i]!, result[i - 1]!) < 0) {
          const temp = result[i]!
          result[i] = result[i - 1]!
          result[i - 1] = temp
          swapped = true
        }
      }
      start++
    }
    return result
  }
}
