type CompareFn<T> = (a: T, b: T) => number

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function combSortInternal<T>(
  arr: T[],
  compare: CompareFn<T>,
  shrinkFactor: number,
  swapCountRef: { value: number },
): void {
  let gap = arr.length
  let swapped = true

  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / shrinkFactor))
    swapped = false

    for (let i = 0; i < arr.length - gap; i++) {
      const j = i + gap
      if (compare(arr[i]!, arr[j]!) > 0) {
        const temp = arr[i]!
        arr[i] = arr[j]!
        arr[j] = temp
        swapped = true
        swapCountRef.value++
      }
    }
  }
}

export class CombSort3<T> {
  private compare: CompareFn<T>
  private swapCount: number

  constructor(compare?: CompareFn<T>) {
    this.compare = compare ?? defaultCompare<T>
    this.swapCount = 0
  }

  sort(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    const swapCountRef = { value: 0 }
    combSortInternal(copy, this.compare, 1.3, swapCountRef)
    this.swapCount = swapCountRef.value
    return copy
  }

  sortDescending(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    const swapCountRef = { value: 0 }
    const reverseCompare: CompareFn<T> = (a, b) => this.compare(b, a)
    combSortInternal(copy, reverseCompare, 1.3, swapCountRef)
    this.swapCount = swapCountRef.value
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

  sortWithShrinkFactor(arr: T[], factor: number): T[] {
    if (arr.length <= 1) return [...arr]
    if (factor <= 1) throw new Error('Shrink factor must be greater than 1')
    const copy = [...arr]
    const swapCountRef = { value: 0 }
    combSortInternal(copy, this.compare, factor, swapCountRef)
    this.swapCount = swapCountRef.value
    return copy
  }

  getGapSequence(): number[] {
    const n = 1000000
    const gaps: number[] = []
    let gap = n
    while (gap > 1) {
      gap = Math.max(1, Math.floor(gap / 1.3))
      gaps.push(gap)
    }
    return gaps
  }

  getSwapCount(): number {
    return this.swapCount
  }

  getTimeComplexity(): string {
    return 'O(n log n) average, O(n^2) worst case'
  }

  getSpaceComplexity(): string {
    return 'O(1)'
  }

  toString(): string {
    return `CombSort3()`
  }

  static empty<T>(): CombSort3<T> {
    return new CombSort3<T>()
  }
}
