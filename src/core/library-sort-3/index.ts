export class LibrarySort3<T> {
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
    const result = this.librarySort([...this.array])
    return result
  }

  sortInPlace(arr: T[]): T[] {
    if (arr.length <= 1) {
      return arr
    }
    const sorted = this.librarySort([...arr])
    for (let i = 0; i < sorted.length; i++) {
      arr[i] = sorted[i]!
    }
    return arr
  }

  private librarySort(input: T[]): T[] {
    const n = input.length
    const epsilon = 1
    const m = (1 + epsilon) * n + 1
    const gapped: (T | undefined)[] = new Array(m).fill(undefined)

    gapped[0] = input[0]!

    for (let i = 1; i < n; i++) {
      this.rebalance(gapped, m)
      const value = input[i]!
      const insertPos = this.findInsertPosition(gapped, m, value)
      if (insertPos < m) {
        gapped[insertPos] = value
      }
    }

    const result: T[] = []
    for (let i = 0; i < m && result.length < n; i++) {
      if (gapped[i] !== undefined) {
        result.push(gapped[i]!)
      }
    }
    return result
  }

  private rebalance(gapped: (T | undefined)[], m: number): void {
    const items: T[] = []
    for (let i = 0; i < m; i++) {
      if (gapped[i] !== undefined) {
        items.push(gapped[i]!)
      }
    }
    gapped.fill(undefined)
    const spacing = m / (items.length + 1)
    for (let i = 0; i < items.length; i++) {
      const pos = Math.floor((i + 1) * spacing)
      gapped[Math.min(pos, m - 1)] = items[i]!
    }
  }

  private findInsertPosition(gapped: (T | undefined)[], m: number, value: T): number {
    let left = 0
    let right = m - 1
    let lastNonEmpty = -1
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const nearest = this.findNearestNonEmpty(gapped, mid, m)
      if (nearest === -1) {
        left = mid + 1
        continue
      }
      const cmp = this.compareFn(gapped[nearest]!, value)
      if (cmp < 0) {
        lastNonEmpty = nearest
        left = mid + 1
      } else if (cmp > 0) {
        right = mid - 1
      } else {
        return this.findEmptySlot(gapped, nearest, m)
      }
    }
    if (lastNonEmpty === -1) {
      return this.findEmptySlot(gapped, 0, m)
    }
    return this.findEmptySlot(gapped, lastNonEmpty + 1, m)
  }

  private findNearestNonEmpty(gapped: (T | undefined)[], start: number, m: number): number {
    for (let d = 0; d < m; d++) {
      if (start + d < m && gapped[start + d] !== undefined) return start + d
      if (start - d >= 0 && gapped[start - d] !== undefined) return start - d
    }
    return -1
  }

  private findEmptySlot(gapped: (T | undefined)[], start: number, m: number): number {
    for (let i = start; i < m; i++) {
      if (gapped[i] === undefined) return i
    }
    for (let i = start - 1; i >= 0; i--) {
      if (gapped[i] === undefined) return i
    }
    return m
  }

  toString(): string {
    return `LibrarySort3()`
  }

  get [Symbol.toStringTag](): string {
    return 'LibrarySort3'
  }

  static from<T>(items: T[]): LibrarySort3<T> {
    return new LibrarySort3(items)
  }
}
