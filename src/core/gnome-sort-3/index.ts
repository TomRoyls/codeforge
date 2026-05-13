export class GnomeSort3<T> {
  private array: T[]
  private compareFn: (a: T, b: T) => number
  private swapCount: number
  private comparisonCount: number

  constructor(array: T[], comparator?: (a: T, b: T) => number) {
    this.array = [...array]
    this.compareFn = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
    this.swapCount = 0
    this.comparisonCount = 0
  }

  sort(): T[] {
    if (this.array.length <= 1) {
      return [...this.array]
    }
    this.swapCount = 0
    this.comparisonCount = 0
    let index = 1
    while (index < this.array.length) {
      this.comparisonCount++
      if (this.compare(this.array[index]!, this.array[index - 1]!) >= 0) {
        index++
      } else {
        this.swap(index, index - 1)
        this.swapCount++
        if (index > 1) {
          index--
        }
      }
    }
    return [...this.array]
  }

  sortDescending(): T[] {
    if (this.array.length <= 1) {
      return [...this.array]
    }
    const descendingComparator = (a: T, b: T) => this.compareFn(b, a)
    this.swapCount = 0
    this.comparisonCount = 0
    let index = 1
    while (index < this.array.length) {
      this.comparisonCount++
      if (descendingComparator(this.array[index]!, this.array[index - 1]!) >= 0) {
        index++
      } else {
        this.swap(index, index - 1)
        this.swapCount++
        if (index > 1) {
          index--
        }
      }
    }
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

  getSwapCount(): number {
    return this.swapCount
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
    return 'O(1)'
  }

  private compare(a: T, b: T): number {
    return this.compareFn(a, b)
  }

  private swap(i: number, j: number): void {
    const temp = this.array[i]!
    this.array[i] = this.array[j]!
    this.array[j] = temp
  }
}
