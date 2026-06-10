export class BingoSort2<T> {
  private array: T[]
  private compare: (a: T, b: T) => number
  private passCount: number
  private comparisonCount: number

  constructor(array: T[], comparator?: (a: T, b: T) => number) {
    this.array = [...array]
    this.passCount = 0
    this.comparisonCount = 0
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
    this.passCount = 0
    this.comparisonCount = 0
    let start = 0

    while (start < arr.length) {
      this.passCount++
      let minIdx = start

      for (let i = start; i < arr.length; i++) {
        this.comparisonCount++
        if (this.compare(arr[i]!, arr[minIdx]!) < 0) {
          minIdx = i
        }
      }

      const min = arr[minIdx]!
      const allMinIndices: number[] = []

      for (let i = start; i < arr.length; i++) {
        this.comparisonCount++
        if (this.compare(arr[i]!, min) === 0) {
          allMinIndices.push(i)
        }
      }

      for (const idx of allMinIndices) {
        if (idx > start) {
          this.swap(arr, idx, start)
        }
        start++
      }
    }

    return arr
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

  getPassCount(): number {
    return this.passCount
  }

  getComparisonCount(): number {
    return this.comparisonCount
  }

  getTimeComplexity(): string {
    if (this.array.length <= 1) {
      return 'O(1)'
    }
    return 'O(n²)'
  }

  getSpaceComplexity(): string {
    return 'O(n)'
  }

  private swap(arr: T[], i: number, j: number): void {
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
  }

  toString(): string {
    return `BingoSort2()`
  }

  get [Symbol.toStringTag](): string {
    return 'BingoSort2'
  }
}
