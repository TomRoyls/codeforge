export class SelectionSort4<T> {
  private array: T[]
  private compare: (a: T, b: T) => number

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
    let left = 0
    let right = arr.length - 1

    while (left < right) {
      let minIdx = left
      let maxIdx = right

      for (let i = left; i <= right; i++) {
        if (this.compare(arr[i]!, arr[minIdx]!) < 0) {
          minIdx = i
        }
        if (this.compare(arr[i]!, arr[maxIdx]!) > 0) {
          maxIdx = i
        }
      }

      if (minIdx === right && maxIdx === left) {
        this.swap(arr, left, right)
      } else if (maxIdx === left) {
        this.swap(arr, maxIdx, right)
        this.swap(arr, minIdx, left)
      } else if (minIdx === right) {
        this.swap(arr, minIdx, left)
        this.swap(arr, maxIdx, right)
      } else {
        this.swap(arr, minIdx, left)
        this.swap(arr, maxIdx, right)
      }

      left++
      right--
    }

    return arr
  }

  sortDescending(): T[] {
    const sorted = this.sort()
    return sorted.reverse()
  }

  partialSort(k: number): T[] {
    if (k <= 0) {
      return []
    }
    if (k >= this.array.length) {
      return this.sort()
    }

    const arr = [...this.array]
    for (let i = 0; i < k; i++) {
      let minIdx = i
      for (let j = i + 1; j < arr.length; j++) {
        if (this.compare(arr[j]!, arr[minIdx]!) < 0) {
          minIdx = j
        }
      }
      this.swap(arr, i, minIdx)
    }

    return arr.slice(0, k)
  }

  stableSelectionSort(): T[] {
    const arr = [...this.array]
    const n = arr.length

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i
      for (let j = i + 1; j < n; j++) {
        if (this.compare(arr[j]!, arr[minIdx]!) < 0) {
          minIdx = j
        }
      }

      if (minIdx !== i) {
        const min = arr[minIdx]!
        for (let k = minIdx; k > i; k--) {
          arr[k] = arr[k - 1]!
        }
        arr[i] = min
      }
    }

    return arr
  }

  findKthSmallest(k: number): T | undefined {
    if (k < 1 || k > this.array.length) {
      return undefined
    }

    const arr = [...this.array]
    for (let i = 0; i < k; i++) {
      let minIdx = i
      for (let j = i + 1; j < arr.length; j++) {
        if (this.compare(arr[j]!, arr[minIdx]!) < 0) {
          minIdx = j
        }
      }
      this.swap(arr, i, minIdx)
    }

    return arr[k - 1]!
  }

  findKthLargest(k: number): T | undefined {
    if (k < 1 || k > this.array.length) {
      return undefined
    }

    const arr = [...this.array]
    for (let i = 0; i < k; i++) {
      let maxIdx = i
      for (let j = i + 1; j < arr.length; j++) {
        if (this.compare(arr[j]!, arr[maxIdx]!) > 0) {
          maxIdx = j
        }
      }
      this.swap(arr, i, maxIdx)
    }

    return arr[k - 1]!
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
    return 'O(n)'
  }

  private swap(arr: T[], i: number, j: number): void {
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
  }

  toString(): string {
    return `SelectionSort4()`
  }

  get [Symbol.toStringTag](): string {
    return 'SelectionSort4'
  }

  static from<T>(items: T[]): SelectionSort4<T> {
    return new SelectionSort4(items)
  }
}
