export class RadixSort {
  private static readonly RADIX = 256
  private static readonly MASK = 0xFF

  static sort(arr: number[], options?: { ascending?: boolean }): number[] {
    if (arr.length <= 1) return [...arr]
    const ascending = options?.ascending ?? true
    const result = new Int32Array(arr.length)
    result.set(arr)
    RadixSort.sortInt32(result)
    const out = Array.from(result)
    return ascending ? out : out.reverse()
  }

  static sortUnsigned(arr: number[]): number[] {
    if (arr.length <= 1) return [...arr]
    const result = new Uint32Array(arr.length)
    result.set(arr)
    RadixSort.sortUint32(result)
    return Array.from(result)
  }

  static sortBy<T>(
    arr: T[],
    keyFn: (item: T) => number,
    options?: { ascending?: boolean },
  ): T[] {
    if (arr.length <= 1) return [...arr]
    const ascending = options?.ascending ?? true
    const indices = new Uint32Array(arr.length)
    const keys = new Int32Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
      indices[i] = i
      keys[i] = keyFn(arr[i]!) | 0
    }
    RadixSort.sortByKeys(indices, keys)
    const result: T[] = new Array(arr.length)
    if (ascending) {
      for (let i = 0; i < indices.length; i++) {
        result[i] = arr[indices[i]!]!
      }
    } else {
      for (let i = 0; i < indices.length; i++) {
        result[i] = arr[indices[indices.length - 1 - i]!]!
      }
    }
    return result
  }

  static sortInPlace(arr: number[], options?: { ascending?: boolean }): number[] {
    if (arr.length <= 1) return arr
    const buf = new Int32Array(arr.length)
    buf.set(arr)
    RadixSort.sortInt32(buf)
    for (let i = 0; i < arr.length; i++) {
      arr[i] = buf[i]!
    }
    if (options?.ascending === false) arr.reverse()
    return arr
  }

  private static sortInt32(arr: Int32Array): void {
    const n = arr.length
    const buf = new Int32Array(n)
    for (let shift = 0; shift < 32; shift += 8) {
      const flip = shift === 24 ? 0x80 : 0
      const count = new Uint32Array(RadixSort.RADIX)
      for (let i = 0; i < n; i++) {
        const idx = ((arr[i]! >>> shift) & RadixSort.MASK) ^ flip
        count[idx] = count[idx]! + 1
      }
      let total = 0
      for (let i = 0; i < RadixSort.RADIX; i++) {
        const c = count[i]!
        count[i] = total
        total += c
      }
      for (let i = 0; i < n; i++) {
        const bucket = ((arr[i]! >>> shift) & RadixSort.MASK) ^ flip
        buf[count[bucket]!] = arr[i]!
        count[bucket] = count[bucket]! + 1
      }
      arr.set(buf)
    }
  }

  private static sortUint32(arr: Uint32Array): void {
    const n = arr.length
    const buf = new Uint32Array(n)
    for (let shift = 0; shift < 32; shift += 8) {
      const count = new Uint32Array(RadixSort.RADIX)
      for (let i = 0; i < n; i++) {
        const idx = (arr[i]! >>> shift) & RadixSort.MASK
        count[idx] = count[idx]! + 1
      }
      let total = 0
      for (let i = 0; i < RadixSort.RADIX; i++) {
        const c = count[i]!
        count[i] = total
        total += c
      }
      for (let i = 0; i < n; i++) {
        const bucket = (arr[i]! >>> shift) & RadixSort.MASK
        buf[count[bucket]!] = arr[i]!
        count[bucket] = count[bucket]! + 1
      }
      arr.set(buf)
    }
  }

  private static sortByKeys(indices: Uint32Array, keys: Int32Array): void {
    const n = indices.length
    const bufIndices = new Uint32Array(n)
    for (let shift = 0; shift < 32; shift += 8) {
      const flip = shift === 24 ? 0x80 : 0
      const count = new Uint32Array(RadixSort.RADIX)
      for (let i = 0; i < n; i++) {
        const idx = ((keys[indices[i]!]! >>> shift) & RadixSort.MASK) ^ flip
        count[idx] = count[idx]! + 1
      }
      let total = 0
      for (let i = 0; i < RadixSort.RADIX; i++) {
        const c = count[i]!
        count[i] = total
        total += c
      }
      for (let i = 0; i < n; i++) {
        const bucket = ((keys[indices[i]!]! >>> shift) & RadixSort.MASK) ^ flip
        bufIndices[count[bucket]!] = indices[i]!
        count[bucket] = count[bucket]! + 1
      }
      indices.set(bufIndices)
    }
  }
}
