export class SearchAlgorithms2 {
  static linearSearch(arr: number[], target: number): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) return i
    }
    return -1
  }

  static binarySearch(arr: number[], target: number): number {
    let lo = 0, hi = arr.length - 1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid] === target) return mid
      if (arr[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  }

  static binarySearchFirst(arr: number[], target: number): number {
    let lo = 0, hi = arr.length - 1, result = -1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid] === target) { result = mid; hi = mid - 1 }
      else if (arr[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    return result
  }

  static binarySearchLast(arr: number[], target: number): number {
    let lo = 0, hi = arr.length - 1, result = -1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid] === target) { result = mid; lo = mid + 1 }
      else if (arr[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    return result
  }

  static lowerBound(arr: number[], target: number): number {
    let lo = 0, hi = arr.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid] < target) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  static upperBound(arr: number[], target: number): number {
    let lo = 0, hi = arr.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid] <= target) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  static ternarySearch(arr: number[], target: number): number {
    let lo = 0, hi = arr.length - 1
    while (lo <= hi) {
      if (hi - lo < 3) {
        for (let i = lo; i <= hi; i++) if (arr[i] === target) return i
        return -1
      }
      const mid1 = lo + Math.floor((hi - lo) / 3)
      const mid2 = hi - Math.floor((hi - lo) / 3)
      if (arr[mid1] === target) return mid1
      if (arr[mid2] === target) return mid2
      if (target < arr[mid1]) hi = mid1 - 1
      else if (target > arr[mid2]) lo = mid2 + 1
      else { lo = mid1 + 1; hi = mid2 - 1 }
    }
    return -1
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): SearchAlgorithms2 { return new SearchAlgorithms2() }
  equals(other: unknown): boolean { return other instanceof SearchAlgorithms2 }
}
