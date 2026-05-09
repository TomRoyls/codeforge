import type { XorFilterConfig } from './types.js'
import { DEFAULT_XOR_FILTER_CONFIG } from './types.js'

export class XorFilter {
  private fingerprints: Uint8Array
  private keyCount: number
  private blockSize: number
  private seed: number
  private config: XorFilterConfig

  constructor(keys: string[]) {
    this.config = { ...DEFAULT_XOR_FILTER_CONFIG }
    const uniqueKeys = Array.from(new Set(keys))
    this.keyCount = uniqueKeys.length

    if (uniqueKeys.length === 0) {
      this.blockSize = 1
      this.fingerprints = new Uint8Array(3)
      this.seed = 0
      return
    }

    const totalSize = Math.ceil(uniqueKeys.length * this.config.sizeMultiplier) + 32
    this.blockSize = Math.ceil(totalSize / this.config.blockCount)

    const buildResult = this.build(uniqueKeys)
    this.fingerprints = buildResult.fingerprints
    this.seed = buildResult.seed
  }

  has(key: string): boolean {
    if (this.keyCount === 0) return false
    const positions = this.getPositions(key, this.seed)
    const fp = this.computeFingerprint(key)
    let xor = 0
    for (const pos of positions) {
      xor ^= this.fingerprints[pos]!
    }
    return (xor & 0xFF) === fp
  }

  contains(key: string): boolean {
    return this.has(key)
  }

  getHashFunctions(): number {
    return this.config.hashFunctions
  }

  getSize(): number {
    return this.keyCount
  }

  getCapacity(): number {
    return this.fingerprints.length * 8
  }

  getFingerprints(): Uint8Array {
    return new Uint8Array(this.fingerprints)
  }

  clone(): XorFilter {
    const cloned = Object.create(XorFilter.prototype)
    cloned.fingerprints = new Uint8Array(this.fingerprints)
    cloned.keyCount = this.keyCount
    cloned.blockSize = this.blockSize
    cloned.seed = this.seed
    cloned.config = { ...this.config }
    return cloned
  }

  static fromArray(keys: string[]): XorFilter {
    return new XorFilter(keys)
  }

  static getExpectedSize(n: number): number {
    const totalSize = Math.ceil(n * 1.23) + 32
    return totalSize * 8
  }

  private build(keys: string[]): { fingerprints: Uint8Array; seed: number } {
    const maxAttempts = 100
    for (let seed = 0; seed < maxAttempts; seed++) {
      const result = this.tryBuild(keys, seed)
      if (result !== null) {
        return { fingerprints: result, seed }
      }
    }
    return { fingerprints: new Uint8Array(this.blockSize * 3), seed: 0 }
  }

  private tryBuild(keys: string[], seed: number): Uint8Array | null {
    const totalSize = this.blockSize * 3
    const n = keys.length

    const allPositions: [number, number, number][] = []
    const allFps: number[] = []
    const counts = new Uint32Array(totalSize)
    const reverseIndex: number[][] = []
    for (let i = 0; i < totalSize; i++) {
      reverseIndex.push([])
    }

    for (let i = 0; i < n; i++) {
      const key = keys[i]!
      const positions = this.getPositions(key, seed)
      const fp = this.computeFingerprint(key)
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

    for (let i = 0; i < totalSize; i++) {
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

    const fingerprints = new Uint8Array(totalSize)
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
    const h0 = this.hash(key, seed)
    const h1 = this.hash(key, seed + 0x9e3779b9)
    const h2 = this.hash(key, seed + 0x517cc1b7)
    const p0 = (h0 >>> 0) % this.blockSize
    const p1 = this.blockSize + ((h1 >>> 0) % this.blockSize)
    const p2 = 2 * this.blockSize + ((h2 >>> 0) % this.blockSize)
    return [p0, p1, p2]
  }

  private computeFingerprint(key: string): number {
    return this.hash(key, 0xdeadbeef) & 0xFF
  }

  private hash(str: string, seed: number): number {
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

export { DEFAULT_XOR_FILTER_CONFIG } from './types.js'
export type { XorFilterConfig } from './types.js'
