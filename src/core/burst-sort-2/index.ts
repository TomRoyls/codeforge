import { CompareFn } from '../types.js'

type TrieNode<T> = {
  children: Map<string | number, TrieNode<T>>
  items: T[]
  depth: number
}

export class BurstSort2<T> {
  private array: T[]
  private compare: CompareFn<T>

  constructor(array: T[], comparator?: CompareFn<T>) {
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
    const copy = [...this.array]
    this.sortInPlace(copy)
    return copy
  }

  sortInPlace(arr: T[]): void {
    if (arr.length <= 1) {
      return
    }
    if (this.isStringArray(arr)) {
      this.sortStrings(arr)
    } else if (this.isNumberArray(arr)) {
      this.sortNumbers(arr)
    } else {
      this.sortWithComparator(arr)
    }
  }

  private sortStrings(arr: T[]): void {
    const buckets = new Map<string, T[]>()
    for (const item of arr) {
      const str = item as string
      const key = str.length > 0 ? str[0]! : ''
      if (!buckets.has(key)) {
        buckets.set(key, [])
      }
      buckets.get(key)!.push(item)
    }

    const sortedKeys = Array.from(buckets.keys()).sort()
    let pos = 0
    for (const key of sortedKeys) {
      const bucket = buckets.get(key)!
      if (bucket.length === 1 || this.isAllSame(bucket)) {
        for (const item of bucket) {
          arr[pos++] = item
        }
      } else {
        bucket.sort(this.compare)
        for (const item of bucket) {
          arr[pos++] = item
        }
      }
    }
  }

  private sortNumbers(arr: T[]): void {
    if (arr.length <= 1) {
      return
    }

    const negatives: number[] = []
    const positives: number[] = []
    for (const item of arr) {
      const num = item as number
      if (num < 0) {
        negatives.push(num)
      } else {
        positives.push(num)
      }
    }

    this.radixSortHelper(negatives as T[])
    this.radixSortHelper(positives as T[])

    let pos = 0
    for (const item of negatives) {
      arr[pos++] = item as T
    }
    for (const item of positives) {
      arr[pos++] = item as T
    }
  }

  private radixSortHelper(arr: T[]): void {
    if (arr.length <= 1) {
      return
    }

    const isNegative = arr.length > 0 && (arr[0] as number) < 0

    let maxVal = 0
    for (const item of arr) {
      const num = Math.abs(item as number)
      if (num > maxVal) {
        maxVal = num
      }
    }

    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
      const buckets = new Map<number, T[]>()
      for (const item of arr) {
        const num = item as number
        const digit = Math.floor(Math.abs(num) / exp) % 10
        if (!buckets.has(digit)) {
          buckets.set(digit, [])
        }
        buckets.get(digit)!.push(item)
      }

      let pos = 0
      const sortedKeys = Array.from(buckets.keys()).sort((a, b) => a - b)
      if (isNegative) {
        for (let i = sortedKeys.length - 1; i >= 0; i--) {
          const bucket = buckets.get(sortedKeys[i]!)!
          for (const item of bucket) {
            arr[pos++] = item
          }
        }
      } else {
        for (const key of sortedKeys) {
          const bucket = buckets.get(key)!
          for (const item of bucket) {
            arr[pos++] = item
          }
        }
      }
    }
  }

  private sortWithComparator(arr: T[]): void {
    arr.sort(this.compare)
  }

  private isStringArray(arr: T[]): boolean {
    return arr.length > 0 && typeof arr[0] === 'string'
  }

  private isNumberArray(arr: T[]): boolean {
    return arr.length > 0 && typeof arr[0] === 'number'
  }

  private isAllSame(arr: T[]): boolean {
    if (arr.length <= 1) {
      return true
    }
    const first = arr[0]!
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i]!, first) !== 0) {
        return false
      }
    }
    return true
  }
}
