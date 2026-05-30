export class PowerSet {
  static generate<T>(arr: T[]): T[][] {
    const result: T[][] = []
    const n = arr.length
    const total = 1 << n
    for (let mask = 0; mask < total; mask++) {
      const subset: T[] = []
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          subset.push(arr[i]!)
        }
      }
      result.push(subset)
    }
    return result
  }

  static *lazy<T>(arr: T[]): Generator<T[]> {
    const n = arr.length
    const total = 1 << n
    for (let mask = 0; mask < total; mask++) {
      const subset: T[] = []
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          subset.push(arr[i]!)
        }
      }
      yield subset
    }
  }

  static count(n: number): number {
    return 1 << n
  }

  static bySize<T>(arr: T[]): Map<number, T[][]> {
    const result = new Map<number, T[][]>()
    const n = arr.length
    const total = 1 << n
    for (let mask = 0; mask < total; mask++) {
      const subset: T[] = []
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          subset.push(arr[i]!)
        }
      }
      const size = subset.length
      if (!result.has(size)) result.set(size, [])
      result.get(size)!.push(subset)
    }
    return result
  }
}
