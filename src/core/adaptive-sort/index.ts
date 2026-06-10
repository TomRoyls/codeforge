export class AdaptiveSort<T> {
  private array: T[]
  private compareFn: (a: T, b: T) => number
  private threshold = 16

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

    const sortedness = this.measureSortedness()
    const reverseSortedness = this.measureReverseSortedness()
    const nearlySorted = this.measureNearlySorted()

    if (sortedness > 0.8 || reverseSortedness > 0.8 || nearlySorted) {
      this.insertionSort(0, this.array.length - 1)
      return [...this.array]
    }

    this.mergeSort(0, this.array.length - 1)
    return [...this.array]
  }

  private compare(a: T, b: T): number {
    return this.compareFn(a, b)
  }

  private measureSortedness(): number {
    if (this.array.length <= 1) {
      return 1.0
    }

    let sortedPairs = 0
    for (let i = 0; i < this.array.length - 1; i++) {
      if (this.compare(this.array[i]!, this.array[i + 1]!) <= 0) {
        sortedPairs++
      }
    }

    return sortedPairs / (this.array.length - 1)
  }

  private measureReverseSortedness(): number {
    if (this.array.length <= 1) {
      return 1.0
    }

    let reverseSortedPairs = 0
    for (let i = 0; i < this.array.length - 1; i++) {
      if (this.compare(this.array[i]!, this.array[i + 1]!) >= 0) {
        reverseSortedPairs++
      }
    }

    return reverseSortedPairs / (this.array.length - 1)
  }

  private measureNearlySorted(): boolean {
    if (this.array.length < 3) {
      return false
    }

    let consecutiveSorted = 0
    let consecutiveUnsorted = 0
    let maxConsecutiveSorted = 0
    let maxConsecutiveUnsorted = 0

    for (let i = 0; i < this.array.length - 1; i++) {
      if (this.compare(this.array[i]!, this.array[i + 1]!) <= 0) {
        consecutiveSorted++
        consecutiveUnsorted = 0
        if (consecutiveSorted > maxConsecutiveSorted) {
          maxConsecutiveSorted = consecutiveSorted
        }
      } else {
        consecutiveUnsorted++
        consecutiveSorted = 0
        if (consecutiveUnsorted > maxConsecutiveUnsorted) {
          maxConsecutiveUnsorted = consecutiveUnsorted
        }
      }
    }

    const avgConsecutive = (maxConsecutiveSorted + maxConsecutiveUnsorted) / 2
    return avgConsecutive > 1 && maxConsecutiveSorted > 1
  }

  private insertionSort(left: number, right: number): void {
    for (let i = left + 1; i <= right; i++) {
      const key = this.array[i]!
      let j = i - 1
      while (j >= left && this.compare(this.array[j]!, key) > 0) {
        this.array[j + 1] = this.array[j]!
        j--
      }
      this.array[j + 1] = key
    }
  }

  private mergeSort(left: number, right: number): void {
    if (right - left + 1 <= this.threshold) {
      this.insertionSort(left, right)
      return
    }

    if (left >= right) {
      return
    }

    const mid = Math.floor((left + right) / 2)
    this.mergeSort(left, mid)
    this.mergeSort(mid + 1, right)
    this.merge(left, mid, right)
  }

  private merge(left: number, mid: number, right: number): void {
    const leftArr = this.array.slice(left, mid + 1)
    const rightArr = this.array.slice(mid + 1, right + 1)
    let i = 0
    let j = 0
    let k = left
    while (i < leftArr.length && j < rightArr.length) {
      if (this.compare(leftArr[i]!, rightArr[j]!) <= 0) {
        this.array[k] = leftArr[i]!
        i++
      } else {
        this.array[k] = rightArr[j]!
        j++
      }
      k++
    }
    while (i < leftArr.length) {
      this.array[k] = leftArr[i]!
      i++
      k++
    }
    while (j < rightArr.length) {
      this.array[k] = rightArr[j]!
      j++
      k++
    }
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
      return 'O(n)'
    }

    const sortedness = this.measureSortedness()
    const reverseSortedness = this.measureReverseSortedness()
    const nearlySorted = this.measureNearlySorted()

    if (sortedness >= 0.95 || reverseSortedness >= 0.95) {
      return 'O(n)'
    }

    if (nearlySorted) {
      return 'O(n log n) (adaptive)'
    }

    const adaptiveThreshold = this.array.length > 100 ? 0.48 : 0.5
    if (sortedness > adaptiveThreshold || reverseSortedness > adaptiveThreshold) {
      return 'O(n log n) (adaptive)'
    }

    return 'O(n log n)'
  }

  toString(): string {
    return `AdaptiveSort()`
  }

  get [Symbol.toStringTag](): string {
    return 'AdaptiveSort'
  }
}
