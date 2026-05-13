export class CycleSort3<T> {
  private array: T[]
  private compare: (a: T, b: T) => number
  private writeCount: number = 0

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
    const n = arr.length
    this.writeCount = 0

    for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
      let item = arr[cycleStart]!

      let pos = cycleStart
      for (let i = cycleStart + 1; i < n; i++) {
        if (this.compare(arr[i]!, item) < 0) {
          pos++
        }
      }

      if (pos === cycleStart) {
        continue
      }

      while (this.compare(item, arr[pos]!) === 0) {
        pos++
      }

      if (pos !== cycleStart) {
        const temp = item
        item = arr[pos]!
        arr[pos] = temp
        this.writeCount++
      }

      while (pos !== cycleStart) {
        pos = cycleStart

        for (let i = cycleStart + 1; i < n; i++) {
          if (this.compare(arr[i]!, item) < 0) {
            pos++
          }
        }

        while (this.compare(item, arr[pos]!) === 0) {
          pos++
        }

        if (item !== arr[pos]) {
          const temp = item
          item = arr[pos]!
          arr[pos] = temp
          this.writeCount++
        }
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

  countWrites(arr: T[]): number {
    const sorter = new CycleSort3(arr, this.compare)
    sorter.sort()
    return sorter.getWriteCount()
  }

  getWriteCount(): number {
    return this.writeCount
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
}
