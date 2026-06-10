export class InsertionSort4<T> {
  private array: T[]
  private compareFn: (a: T, b: T) => number

  constructor(array: T[], comparator?: (a: T, b: T) => number) {
    this.array = [...array]
    this.compareFn = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  sort(): T[] {
    if (this.array.length <= 1) {
      return [...this.array]
    }
    this.binaryInsertionSort(this.array, 0, this.array.length - 1, this.compareFn)
    return [...this.array]
  }

  sortDescending(): T[] {
    if (this.array.length <= 1) {
      return [...this.array]
    }
    const descendingComparator = (a: T, b: T) => this.compareFn(b, a)
    this.shellInsertionSortInternal(descendingComparator)
    return [...this.array]
  }

  isSorted(): boolean {
    for (let i = 0; i < this.array.length - 1; i++) {
      if (this.compare(this.array[i]!, this.array[i + 1]!) > 0) {
        return false
      }
    }
    return true
  }

  getTimeComplexity(): string {
    if (this.array.length <= 1) {
      return 'O(1)'
    }
    return 'O(n²)'
  }

  getSpaceComplexity(): string {
    return 'O(1)'
  }

  private compare(a: T, b: T): number {
    return this.compareFn(a, b)
  }

  private binaryInsertionSort(arr: T[], left: number, right: number, comparator: (a: T, b: T) => number): void {
    for (let i = left + 1; i <= right; i++) {
      const key = arr[i]!
      const insertPos = this.binarySearch(arr, left, i - 1, key, comparator)
      const j = i - 1
      for (let k = j; k >= insertPos; k--) {
        arr[k + 1] = arr[k]!
      }
      arr[insertPos] = key
    }
  }

  private binarySearch(arr: T[], left: number, right: number, target: T, comparator: (a: T, b: T) => number): number {
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (comparator(arr[mid]!, target) < 0) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    return left
  }

  shellInsertionSort(): void {
    this.shellInsertionSortInternal(this.compareFn)
  }

  private shellInsertionSortInternal(comparator: (a: T, b: T) => number): void {
    const n = this.array.length
    let gap = Math.floor(n / 2)

    while (gap > 0) {
      for (let i = gap; i < n; i++) {
        const temp = this.array[i]!
        let j = i
        while (j >= gap && comparator(this.array[j - gap]!, temp) > 0) {
          this.array[j] = this.array[j - gap]!
          j -= gap
        }
        this.array[j] = temp
      }
      gap = Math.floor(gap / 2)
    }
  }

  insertionSortRange(arr: T[], left: number, right: number): T[] {
    const result = [...arr]
    for (let i = left + 1; i <= right; i++) {
      const key = result[i]!
      let j = i - 1
      while (j >= left && this.compare(result[j]!, key) > 0) {
        result[j + 1] = result[j]!
        j--
      }
      result[j + 1] = key
    }
    return result
  }

  stableInsertionSort(arr: T[]): T[] {
    const result = [...arr]
    for (let i = 1; i < result.length; i++) {
      const key = result[i]!
      let j = i - 1
      while (j >= 0 && this.compare(result[j]!, key) > 0) {
        result[j + 1] = result[j]!
        j--
      }
      result[j + 1] = key
    }
    return result
  }

  toString(): string {
    return `InsertionSort4()`
  }

  get [Symbol.toStringTag](): string {
    return 'InsertionSort4'
  }

  static from<T>(items: T[]): InsertionSort4<T> {
    return new InsertionSort4(items)
  }
}
