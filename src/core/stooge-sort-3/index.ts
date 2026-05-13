export class StoogeSort3<T> {
  private array: T[]
  private compare: (a: T, b: T) => number
  private comparisonCount: number = 0
  private recursionCount: number = 0

  constructor(array: T[], comparator?: (a: T, b: T) => number) {
    this.array = [...array]
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  sort(): T[] {
    if (this.array.length <= 1) {
      return [...this.array]
    }
    const arr = [...this.array]
    this.comparisonCount = 0
    this.recursionCount = 0
    this.stoogeSort(arr, 0, arr.length - 1)
    return arr
  }

  private stoogeSort(arr: T[], i: number, j: number): void {
    this.recursionCount++
    this.comparisonCount++

    if (this.compare(arr[i]!, arr[j]!) > 0) {
      const temp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = temp
    }

    if (j - i + 1 >= 3) {
      const t = Math.floor((j - i + 1) / 3)
      this.stoogeSort(arr, i, j - t)
      this.stoogeSort(arr, i + t, j)
      this.stoogeSort(arr, i, j - t)
    }
  }

  sortDescending(): T[] {
    const sorted = this.sort()
    return sorted.reverse()
  }

  isSorted(): boolean {
    for (let i = 0; i < this.array.length - 1; i++) {
      if (this.compare(this.array[i]!, this.array[i + 1]!) > 0) {
        return false
      }
    }
    return true
  }

  getComparisonCount(): number {
    return this.comparisonCount
  }

  getRecursionCount(): number {
    return this.recursionCount
  }

  getTimeComplexity(): string {
    if (this.array.length <= 1) {
      return 'O(1)'
    }
    return 'O(n^2.7)'
  }

  getSpaceComplexity(): string {
    return 'O(n)'
  }
}
