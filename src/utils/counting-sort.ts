export class CountingSort {
  static sort(
    arr: number[],
    options?: { min?: number; max?: number; stable?: boolean },
  ): number[] {
    if (arr.length <= 1) return [...arr]
    const min = options?.min ?? Math.min(...arr)
    const max = options?.max ?? Math.max(...arr)
    const range = max - min + 1
    if (range > 1_000_000) {
      return [...arr].sort((a, b) => a - b)
    }
    const count = new Uint32Array(range)
    for (let i = 0; i < arr.length; i++) {
      const idx = arr[i]! - min
      count[idx] = count[idx]! + 1
    }
    const result: number[] = new Array(arr.length)
    let idx = 0
    for (let i = 0; i < range; i++) {
      for (let j = 0; j < count[i]!; j++) {
        result[idx++] = i + min
      }
    }
    return result
  }

  static sortBy<T>(
    arr: T[],
    keyFn: (item: T) => number,
    options?: { min?: number; max?: number },
  ): T[] {
    if (arr.length <= 1) return [...arr]
    const keys = arr.map(keyFn)
    const min = options?.min ?? Math.min(...keys)
    const max = options?.max ?? Math.max(...keys)
    const range = max - min + 1
    if (range > 1_000_000) {
      return [...arr].sort((a, b) => keyFn(a) - keyFn(b))
    }
    const count = new Uint32Array(range)
    for (let i = 0; i < keys.length; i++) {
      const idx = keys[i]! - min
      count[idx] = count[idx]! + 1
    }
    const positions = new Uint32Array(range)
    for (let i = 1; i < range; i++) {
      positions[i] = positions[i - 1]! + count[i - 1]!
    }
    const result: T[] = new Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
      const key = keys[i]! - min
      result[positions[key]!] = arr[i]!
      positions[key] = positions[key]! + 1
    }
    return result
  }

  static sortInPlace(
    arr: number[],
    options?: { min?: number; max?: number },
  ): number[] {
    if (arr.length <= 1) return arr
    const min = options?.min ?? Math.min(...arr)
    const max = options?.max ?? Math.max(...arr)
    const range = max - min + 1
    if (range > 1_000_000) {
      arr.sort((a, b) => a - b)
      return arr
    }
    const count = new Uint32Array(range)
    for (let i = 0; i < arr.length; i++) {
      const idx = arr[i]! - min
      count[idx] = count[idx]! + 1
    }
    let idx = 0
    for (let i = 0; i < range; i++) {
      for (let j = 0; j < count[i]!; j++) {
        arr[idx++] = i + min
      }
    }
    return arr
  }

  static countFrequencies(
    arr: number[],
    options?: { min?: number; max?: number },
  ): Map<number, number> {
    const result = new Map<number, number>()
    if (arr.length === 0) return result
    const min = options?.min ?? Math.min(...arr)
    const max = options?.max ?? Math.max(...arr)
    const range = max - min + 1
    const count = new Uint32Array(range)
    for (let i = 0; i < arr.length; i++) {
      const idx = arr[i]! - min
      count[idx] = count[idx]! + 1
    }
    for (let i = 0; i < range; i++) {
      if (count[i]! > 0) {
        result.set(i + min, count[i]!)
      }
    }
    return result
  }
}
