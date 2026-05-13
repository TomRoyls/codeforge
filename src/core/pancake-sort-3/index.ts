export class PancakeSort3<T> {
  private array: T[]
  private compare: (a: T, b: T) => number
  private flipCount: number

  constructor(array: T[], comparator?: (a: T, b: T) => number) {
    this.array = [...array]
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
    this.flipCount = 0
  }

  sort(): T[] {
    if (this.array.length <= 1) {
      return [...this.array]
    }

    const arr = [...this.array]
    this.flipCount = 0
    const n = arr.length

    for (let currSize = n; currSize > 1; currSize--) {
      let maxIdx = this.findIndexMax(arr, currSize)

      if (maxIdx !== currSize - 1) {
        if (maxIdx !== 0) {
          this.flip(arr, maxIdx + 1)
        }
        this.flip(arr, currSize)
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

  flip(arr: T[], k: number): T[] {
    let left = 0
    let right = k - 1

    while (left < right) {
      const temp = arr[left]!
      arr[left] = arr[right]!
      arr[right] = temp
      left++
      right--
    }

    this.flipCount++
    return arr
  }

  getFlipCount(): number {
    return this.flipCount
  }

  getMinFlips(arr: T[]): number {
    if (arr.length <= 1) {
      return 0
    }

    const workingArr = [...arr]
    let count = 0
    const n = workingArr.length

    for (let currSize = n; currSize > 1; currSize--) {
      let maxIdx = 0
      for (let i = 0; i < currSize; i++) {
        if (this.compare(workingArr[i]!, workingArr[maxIdx]!) > 0) {
          maxIdx = i
        }
      }

      if (maxIdx !== currSize - 1) {
        if (maxIdx !== 0) {
          this.flipInternal(workingArr, maxIdx + 1)
          count++
        }
        this.flipInternal(workingArr, currSize)
        count++
      }
    }

    return count
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

  private findIndexMax(arr: T[], size: number): number {
    let maxIdx = 0
    for (let i = 1; i < size; i++) {
      if (this.compare(arr[i]!, arr[maxIdx]!) > 0) {
        maxIdx = i
      }
    }
    return maxIdx
  }

  private flipInternal(arr: T[], k: number): void {
    let left = 0
    let right = k - 1

    while (left < right) {
      const temp = arr[left]!
      arr[left] = arr[right]!
      arr[right] = temp
      left++
      right--
    }
  }
}
