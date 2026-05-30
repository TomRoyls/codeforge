export class StoogeSort {
  static sort(arr: number[]): number[] {
    const result = [...arr]
    if (result.length > 1) {
      StoogeSort.sortRange(result, 0, result.length - 1)
    }
    return result
  }

  private static sortRange(arr: number[], l: number, r: number): void {
    if (l >= r) return
    if (arr[l]! > arr[r]!) {
      const temp = arr[l]!
      arr[l] = arr[r]!
      arr[r] = temp
    }
    if (r - l + 1 > 2) {
      const t = Math.floor((r - l + 1) / 3)
      StoogeSort.sortRange(arr, l, r - t)
      StoogeSort.sortRange(arr, l + t, r)
      StoogeSort.sortRange(arr, l, r - t)
    }
  }

  static sortWithComparator<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    const result = [...arr]
    if (result.length > 1) {
      StoogeSort.sortRangeWithComparator(result, compare, 0, result.length - 1)
    }
    return result
  }

  private static sortRangeWithComparator<T>(arr: T[], compare: (a: T, b: T) => number, l: number, r: number): void {
    if (l >= r) return
    if (compare(arr[l]!, arr[r]!) > 0) {
      const temp = arr[l]!
      arr[l] = arr[r]!
      arr[r] = temp
    }
    if (r - l + 1 > 2) {
      const t = Math.floor((r - l + 1) / 3)
      StoogeSort.sortRangeWithComparator(arr, compare, l, r - t)
      StoogeSort.sortRangeWithComparator(arr, compare, l + t, r)
      StoogeSort.sortRangeWithComparator(arr, compare, l, r - t)
    }
  }
}
