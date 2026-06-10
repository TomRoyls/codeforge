export class BogoSort2<T> {
  private array: T[]
  private compare: (a: T, b: T) => number
  private shuffleCount: number = 0
  private maxIterations: number

  constructor(array: T[], maxIterations: number = 1000, comparator?: (a: T, b: T) => number) {
    this.array = [...array]
    this.maxIterations = maxIterations
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
    this.shuffleCount = 0
    let iterations = 0

    while (!this.isSorted(arr) && iterations < this.maxIterations) {
      this.shuffle(arr)
      this.shuffleCount++
      iterations++
    }

    return arr
  }

  sortDescending(): T[] {
    const sorted = this.sort()
    return sorted.reverse()
  }

  isSorted(arr: T[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (this.compare(arr[i]!, arr[i + 1]!) > 0) {
        return false
      }
    }
    return true
  }

  shuffle(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = temp
    }
  }

  getShuffleCount(): number {
    return this.shuffleCount
  }

  getMaxIterations(): number {
    return this.maxIterations
  }

  getTimeComplexity(): string {
    if (this.array.length <= 1) {
      return 'O(1)'
    }
    return 'O(n!)'
  }

  getSpaceComplexity(): string {
    return 'O(n)'
  }

  toString(): string {
    return `BogoSort2()`
  }

  get [Symbol.toStringTag](): string {
    return 'BogoSort2'
  }
}
