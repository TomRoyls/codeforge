export class Bisect {
  static bisectLeft(arr: number[], x: number): number {
    let lo = 0
    let hi = arr.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (arr[mid]! < x) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  static bisectRight(arr: number[], x: number): number {
    let lo = 0
    let hi = arr.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (arr[mid]! <= x) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  static insortLeft(arr: number[], x: number): void {
    const idx = Bisect.bisectLeft(arr, x)
    arr.splice(idx, 0, x)
  }

  static insortRight(arr: number[], x: number): void {
    const idx = Bisect.bisectRight(arr, x)
    arr.splice(idx, 0, x)
  }

  static bisectLeftBy<T>(arr: T[], x: T, compare: (a: T, b: T) => number): number {
    let lo = 0
    let hi = arr.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (compare(arr[mid]!, x) < 0) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  static findRange(arr: number[], lo: number, hi: number): [number, number] {
    return [Bisect.bisectLeft(arr, lo), Bisect.bisectRight(arr, hi)]
  }
}
