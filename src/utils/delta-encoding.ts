export class DeltaEncoding {
  static encode(arr: number[]): { first: number; deltas: number[] } {
    if (arr.length === 0) return { first: 0, deltas: [] }
    const first = arr[0]!
    const deltas: number[] = []
    for (let i = 1; i < arr.length; i++) {
      deltas.push(arr[i]! - arr[i - 1]!)
    }
    return { first, deltas }
  }

  static decode(first: number, deltas: number[]): number[] {
    if (deltas.length === 0) return first !== 0 || deltas.length > 0 ? [first] : []
    const result: number[] = [first]
    let current = first
    for (const d of deltas) {
      current += d
      result.push(current)
    }
    return result
  }

  static encodeZigzag(arr: number[]): { first: number; deltas: number[] } {
    if (arr.length === 0) return { first: 0, deltas: [] }
    const first = arr[0]!
    const deltas: number[] = []
    for (let i = 1; i < arr.length; i++) {
      const diff = arr[i]! - arr[i - 1]!
      deltas.push((diff << 1) ^ (diff >> 31))
    }
    return { first, deltas }
  }

  static decodeZigzag(first: number, deltas: number[]): number[] {
    if (deltas.length === 0) return first !== 0 ? [first] : []
    const result: number[] = [first]
    let current = first
    for (const z of deltas) {
      const diff = (z >>> 1) ^ -(z & 1)
      current += diff
      result.push(current)
    }
    return result
  }

  static compressSize(first: number, deltas: number[]): number {
    let size = 0
    const vbyteSize = (n: number): number => {
      const abs = Math.abs(n)
      if (abs < 128) return 1
      if (abs < 16384) return 2
      if (abs < 2097152) return 3
      return 4
    }
    size += vbyteSize(first)
    for (const d of deltas) size += vbyteSize(d)
    return size
  }
}
