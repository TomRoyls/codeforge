import type { XorFilterBloomOptions, XorFilterBloomData } from './types.js'
import { DEFAULT_XOR_FILTER_BLOOM_OPTIONS } from './types.js'

export class XorFilterBloom {
  private fingerprints: Uint8Array
  private arrayLength: number
  private seed: number
  private itemCount: number
  private fpBits: number

  private constructor(
    fingerprints: Uint8Array,
    arrayLength: number,
    seed: number,
    itemCount: number,
    fpBits: number,
  ) {
    this.fingerprints = fingerprints
    this.arrayLength = arrayLength
    this.seed = seed
    this.itemCount = itemCount
    this.fpBits = fpBits
  }

  static from(items: string[], fingerprintBits?: number): XorFilterBloom {
    const opts: XorFilterBloomOptions = {
      ...DEFAULT_XOR_FILTER_BLOOM_OPTIONS,
      ...(fingerprintBits !== undefined ? { fingerprintBits } : {}),
    }

    const unique = [...new Set(items)]
    const n = unique.length

    if (n === 0) {
      const arrLen = 3
      return new XorFilterBloom(new Uint8Array(arrLen), arrLen, 0, 0, opts.fingerprintBits)
    }

    const capacity = Math.ceil(n * 1.23) + 32

    const buildResult = XorFilterBloom.buildFilter(unique, capacity, opts.fingerprintBits)
    return new XorFilterBloom(
      buildResult.fingerprints,
      capacity,
      buildResult.seed,
      n,
      opts.fingerprintBits,
    )
  }

  contains(item: string): boolean {
    if (this.itemCount === 0) return false
    const positions = this.getPositions(item, this.seed)
    const fp = this.computeFingerprint(item)
    let xor = 0
    for (const pos of positions) {
      xor ^= this.fingerprints[pos]!
    }
    const mask = this.fpBits >= 8 ? 0xff : (1 << this.fpBits) - 1
    return (xor & mask) === fp
  }

  get size(): number {
    return this.itemCount
  }

  get falsePositiveRate(): number {
    if (this.itemCount === 0) return 0
    const bits = this.fpBits
    return 1 / (1 << bits)
  }

  get fingerprintSize(): number {
    return this.fpBits
  }

  get capacity(): number {
    return this.arrayLength
  }

  toJSON(): XorFilterBloomData {
    return {
      fingerprints: Array.from(this.fingerprints),
      arrayLength: this.arrayLength,
      seed: this.seed,
      itemCount: this.itemCount,
      fingerprintBits: this.fpBits,
    }
  }

  static fromJSON(data: XorFilterBloomData): XorFilterBloom {
    return new XorFilterBloom(
      new Uint8Array(data.fingerprints),
      data.arrayLength,
      data.seed,
      data.itemCount,
      data.fingerprintBits,
    )
  }

  private static buildFilter(
    keys: string[],
    capacity: number,
    fpBits: number,
  ): { fingerprints: Uint8Array; seed: number } {
    const maxAttempts = 100
    for (let seed = 0; seed < maxAttempts; seed++) {
      const result = XorFilterBloom.tryBuild(keys, capacity, seed, fpBits)
      if (result !== null) {
        return { fingerprints: result, seed }
      }
    }
    return { fingerprints: new Uint8Array(capacity), seed: 0 }
  }

  private static tryBuild(
    keys: string[],
    capacity: number,
    seed: number,
    fpBits: number,
  ): Uint8Array | null {
    const n = keys.length

    const allPositions: [number, number, number][] = []
    const allFps: number[] = []
    const counts = new Uint32Array(capacity)
    const reverseIndex: number[][] = []
    for (let i = 0; i < capacity; i++) {
      reverseIndex.push([])
    }

    for (let i = 0; i < n; i++) {
      const key = keys[i]!
      const positions = XorFilterBloom.getPositionsStatic(key, seed, capacity)
      const fp = XorFilterBloom.computeFingerprintStatic(key, fpBits)
      allPositions.push(positions)
      allFps.push(fp)
      for (let k = 0; k < 3; k++) {
        const p = positions[k]!
        counts[p] = counts[p]! + 1
        reverseIndex[p]!.push(i)
      }
    }

    const stack: { keyIdx: number; lonelyPos: number }[] = []
    const queue: number[] = []
    const removed = new Uint8Array(n)

    for (let i = 0; i < capacity; i++) {
      if (counts[i] === 1) {
        queue.push(i)
      }
    }

    while (queue.length > 0) {
      const pos = queue.pop()!
      if (counts[pos] !== 1) continue

      let keyIdx = -1
      const posKeys = reverseIndex[pos]!
      for (let j = 0; j < posKeys.length; j++) {
        const idx = posKeys[j]!
        if (!removed[idx]) {
          keyIdx = idx
          break
        }
      }

      if (keyIdx === -1) continue

      removed[keyIdx] = 1
      stack.push({ keyIdx, lonelyPos: pos })

      const keyPositions = allPositions[keyIdx]!
      for (let j = 0; j < 3; j++) {
        const p = keyPositions[j]!
        counts[p] = counts[p]! - 1
        if (counts[p]! === 1) {
          queue.push(p)
        }
      }
    }

    if (stack.length !== n) {
      return null
    }

    const fingerprints = new Uint8Array(capacity)
    for (let i = stack.length - 1; i >= 0; i--) {
      const entry = stack[i]!
      const keyIdx = entry.keyIdx
      const lonelyPos = entry.lonelyPos
      const positions = allPositions[keyIdx]!
      const p0 = positions[0]!
      const p1 = positions[1]!
      const p2 = positions[2]!
      let otherA = p0
      let otherB = p1
      if (lonelyPos === p0) {
        otherA = p1
        otherB = p2
      } else if (lonelyPos === p1) {
        otherA = p0
        otherB = p2
      } else {
        otherA = p0
        otherB = p1
      }
      fingerprints[lonelyPos] = allFps[keyIdx]! ^ fingerprints[otherA]! ^ fingerprints[otherB]!
    }

    return fingerprints
  }

  private getPositions(key: string, seed: number): [number, number, number] {
    return XorFilterBloom.getPositionsStatic(key, seed, this.arrayLength)
  }

  private static getPositionsStatic(
    key: string,
    seed: number,
    capacity: number,
  ): [number, number, number] {
    const h0 = XorFilterBloom.hash(key, seed)
    const h1 = XorFilterBloom.hash(key, seed + 0x9e3779b9)
    const h2 = XorFilterBloom.hash(key, seed + 0x517cc1b7)
    const segmentSize = Math.ceil(capacity / 3)
    const p0 = (h0 >>> 0) % segmentSize
    const p1 = segmentSize + ((h1 >>> 0) % segmentSize)
    const p2 = 2 * segmentSize + ((h2 >>> 0) % segmentSize)
    return [
      Math.min(p0, capacity - 1),
      Math.min(p1, capacity - 1),
      Math.min(p2, capacity - 1),
    ]
  }

  private computeFingerprint(key: string): number {
    return XorFilterBloom.computeFingerprintStatic(key, this.fpBits)
  }

  private static computeFingerprintStatic(key: string, fpBits: number): number {
    const h = XorFilterBloom.hash(key, 0xdeadbeef)
    const mask = fpBits >= 8 ? 0xff : (1 << fpBits) - 1
    return h & mask
  }

  private static hash(str: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }
}

export { DEFAULT_XOR_FILTER_BLOOM_OPTIONS } from './types.js'
export type { XorFilterBloomOptions, XorFilterBloomData } from './types.js'
