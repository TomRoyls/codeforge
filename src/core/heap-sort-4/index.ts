type CompareFn<T> = (a: T, b: T) => number

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function siftDown<T>(
  arr: T[],
  start: number,
  end: number,
  compare: CompareFn<T>,
): void {
  let root = start
  const n = end

  while (true) {
    const child = 2 * root + 1
    if (child >= n) break
    let swap = root

    if (compare(arr[swap]!, arr[child]!) < 0) {
      swap = child
    }

    if (child + 1 < n && compare(arr[swap]!, arr[child + 1]!) < 0) {
      swap = child + 1
    }

    if (swap === root) break

    const tmp = arr[root]!
    arr[root] = arr[swap]!
    arr[swap] = tmp
    root = swap
  }
}

function buildMaxHeap<T>(arr: T[], compare: CompareFn<T>): void {
  const n = arr.length
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i, n, compare)
  }
}

function heapSortInternal<T>(
  arr: T[],
  compare: CompareFn<T>,
): void {
  buildMaxHeap(arr, compare)
  const n = arr.length
  for (let i = n - 1; i > 0; i--) {
    const tmp = arr[0]!
    arr[0] = arr[i]!
    arr[i] = tmp
    siftDown(arr, 0, i, compare)
  }
}

export function heapify<T>(arr: T[]): T[] {
  const copy = [...arr]
  buildMaxHeap(copy, defaultCompare<T>)
  return copy
}

export class HeapSort4<T> {
  private compare: CompareFn<T>

  constructor(compare?: CompareFn<T>) {
    this.compare = compare ?? defaultCompare<T>
  }

  sort(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    heapSortInternal(copy, this.compare)
    return copy
  }

  sortDescending(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    const reverseCompare: CompareFn<T> = (a, b) => this.compare(b, a)
    heapSortInternal(copy, reverseCompare)
    return copy
  }

  isSorted(arr: T[]): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i - 1]!, arr[i]!) > 0) {
        return false
      }
    }
    return true
  }

  partialSort(arr: T[], k: number): T[] {
    if (arr.length <= k) {
      return this.sort(arr)
    }
    const copy = [...arr]
    heapSortInternal(copy, this.compare)
    return copy.slice(0, k)
  }

  kthSmallest(arr: T[], k: number): T {
    if (k < 1 || k > arr.length) {
      throw new Error('k must be between 1 and array length')
    }

    const copy = [...arr]
    return this.quickselect(copy, 0, copy.length - 1, k - 1)
  }

  kthLargest(arr: T[], k: number): T {
    if (k < 1 || k > arr.length) {
      throw new Error('k must be between 1 and array length')
    }

    const copy = [...arr]
    return this.quickselect(copy, 0, copy.length - 1, copy.length - k)
  }

  private quickselect(arr: T[], left: number, right: number, k: number): T {
    while (true) {
      if (left === right) return arr[left]!
      const pivotIndex = this.partition(arr, left, right)
      if (k === pivotIndex) return arr[k]!
      else if (k < pivotIndex) right = pivotIndex - 1
      else left = pivotIndex + 1
    }
  }

  private partition(arr: T[], left: number, right: number): number {
    const mid = (left + right) >>> 1
    const pivot = arr[mid]!
    let i = left - 1
    let j = right + 1
    while (true) {
      do { i++ } while (this.compare(arr[i]!, pivot) < 0)
      do { j-- } while (this.compare(arr[j]!, pivot) > 0)
      if (i >= j) return j
      const tmp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = tmp
    }
  }

  isMaxHeap(arr: T[]): boolean {
    const n = arr.length
    if (n <= 1) return true

    for (let i = 0; i < Math.floor(n / 2); i++) {
      const left = 2 * i + 1
      const right = 2 * i + 2

      if (left < n && this.compare(arr[i]!, arr[left]!) < 0) {
        return false
      }
      if (right < n && this.compare(arr[i]!, arr[right]!) < 0) {
        return false
      }
    }
    return true
  }

  isMinHeap(arr: T[]): boolean {
    const n = arr.length
    if (n <= 1) return true

    for (let i = 0; i < Math.floor(n / 2); i++) {
      const left = 2 * i + 1
      const right = 2 * i + 2

      if (left < n && this.compare(arr[i]!, arr[left]!) > 0) {
        return false
      }
      if (right < n && this.compare(arr[i]!, arr[right]!) > 0) {
        return false
      }
    }
    return true
  }

  heapify(arr: T[]): T[] {
    const copy = [...arr]
    buildMaxHeap(copy, this.compare)
    return copy
  }

  getTimeComplexity(): string {
    return 'O(n log n)'
  }

  getSpaceComplexity(): string {
    return 'O(1)'
  }
}
