import type { MinHashOptions, MinHashJSON } from './types.js'
import { DEFAULT_MINHASH_OPTIONS } from './types.js'

const LARGE_PRIME = 2147483647

function mulmod(a: number, b: number, m: number): number {
  let result = 0
  let aa = a % m
  let bb = b % m
  while (bb > 0) {
    if (bb & 1) {
      result = (result + aa) % m
    }
    aa = (aa << 1) % m
    bb = bb >>> 1
  }
  return result
}

function murmurHash3(data: string, seed: number): number {
  let h1 = seed >>> 0
  const len = data.length
  const nblocks = len >> 2
  const c1 = 0xcc9e2d51
  const c2 = 0x1b873593

  for (let i = 0; i < nblocks; i++) {
    let k1 =
      (data.charCodeAt(i * 4) & 0xff) |
      ((data.charCodeAt(i * 4 + 1) & 0xff) << 8) |
      ((data.charCodeAt(i * 4 + 2) & 0xff) << 16) |
      ((data.charCodeAt(i * 4 + 3) & 0xff) << 24)

    k1 = Math.imul(k1, c1)
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = Math.imul(k1, c2)

    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    h1 = Math.imul(h1, 5) + 0xe6546b64
  }

  let k1 = 0
  const tailStart = nblocks * 4
  const tailLen = len & 3

  if (tailLen >= 3) k1 ^= (data.charCodeAt(tailStart + 2) & 0xff) << 16
  if (tailLen >= 2) k1 ^= (data.charCodeAt(tailStart + 1) & 0xff) << 8
  if (tailLen >= 1) {
    k1 ^= data.charCodeAt(tailStart) & 0xff
    k1 = Math.imul(k1, c1)
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = Math.imul(k1, c2)
    h1 ^= k1
  }

  h1 ^= len
  h1 ^= h1 >>> 16
  h1 = Math.imul(h1, 0x85ebca6b)
  h1 ^= h1 >>> 13
  h1 = Math.imul(h1, 0xc2b2ae35)
  h1 ^= h1 >>> 16

  return h1 >>> 0
}

function generateHashParams(numHashes: number, seed: number): { a: number[]; b: number[] } {
  const a: number[] = []
  const b: number[] = []
  let s = seed
  for (let i = 0; i < numHashes; i++) {
    s = murmurHash3(`a_${i}`, s) >>> 0
    a.push((s % (LARGE_PRIME - 1)) + 1)
    s = murmurHash3(`b_${i}`, s) >>> 0
    b.push(s % LARGE_PRIME)
  }
  return { a, b }
}

export class MinHash {
  private _numHashes: number
  private _seed: number
  private _signature: number[]
  private _size: number
  private _hashA: number[]
  private _hashB: number[]
  private _items: Set<string>

  constructor(numHashes?: number, seed?: number)
  constructor(options?: Partial<MinHashOptions>)
  constructor(numHashesOrOptions?: number | Partial<MinHashOptions>, seed?: number) {
    let opts: MinHashOptions
    if (typeof numHashesOrOptions === 'object' && numHashesOrOptions !== null) {
      opts = { ...DEFAULT_MINHASH_OPTIONS, ...numHashesOrOptions }
    } else {
      opts = {
        ...DEFAULT_MINHASH_OPTIONS,
        ...(numHashesOrOptions !== undefined ? { numHashes: numHashesOrOptions } : {}),
        ...(seed !== undefined ? { seed } : {}),
      }
    }
    if (opts.numHashes < 1) {
      throw new RangeError(`numHashes must be at least 1, got ${opts.numHashes}`)
    }
    this._numHashes = opts.numHashes
    this._seed = opts.seed
    this._signature = new Array(this._numHashes).fill(LARGE_PRIME)
    this._size = 0
    this._items = new Set<string>()
    const params = generateHashParams(this._numHashes, this._seed)
    this._hashA = params.a
    this._hashB = params.b
  }

  add(item: string): void {
    if (this._items.has(item)) return
    this._items.add(item)
    const baseHash = murmurHash3(item, this._seed) >>> 0
    for (let i = 0; i < this._numHashes; i++) {
      const h = (mulmod(this._hashA[i]!, baseHash, LARGE_PRIME) + this._hashB[i]!) % LARGE_PRIME
      if (h < this._signature[i]!) {
        this._signature[i] = h
      }
    }
    this._size++
  }

  addSet(items: string[]): void {
    for (const item of items) {
      this.add(item)
    }
  }

  signature(): number[] {
    return Array.from(this._signature)
  }

  similarity(other: MinHash): number {
    if (this._numHashes !== other._numHashes) {
      throw new Error('Cannot compare MinHash signatures with different numHashes')
    }
    if (this._size === 0 && other._size === 0) return 0
    if (this._size === 0 || other._size === 0) return 0
    let matches = 0
    for (let i = 0; i < this._numHashes; i++) {
      if (this._signature[i] === other._signature[i]) {
        matches++
      }
    }
    return matches / this._numHashes
  }

  static jaccard(setA: string[], setB: string[]): number {
    if (setA.length === 0 && setB.length === 0) return 1
    const a = new Set(setA)
    const b = new Set(setB)
    let intersection = 0
    for (const item of a) {
      if (b.has(item)) intersection++
    }
    const union = a.size + b.size - intersection
    if (union === 0) return 1
    return intersection / union
  }

  clear(): void {
    this._signature = new Array(this._numHashes).fill(LARGE_PRIME)
    this._size = 0
    this._items.clear()
  }

  get size(): number {
    return this._size
  }

  get numHashes(): number {
    return this._numHashes
  }

  merge(other: MinHash): void {
    if (this._numHashes !== other._numHashes) {
      throw new Error('Cannot merge MinHash structures with different numHashes')
    }
    if (this._seed !== other._seed) {
      throw new Error('Cannot merge MinHash structures with different seeds')
    }
    for (let i = 0; i < this._numHashes; i++) {
      if (other._signature[i]! < this._signature[i]!) {
        this._signature[i] = other._signature[i]!
      }
    }
    for (const item of other._items) {
      if (!this._items.has(item)) {
        this._items.add(item)
        this._size++
      }
    }
  }

  clone(): MinHash {
    const cloned = new MinHash(this._numHashes, this._seed)
    cloned._signature = Array.from(this._signature)
    cloned._size = this._size
    cloned._items = new Set(this._items)
    cloned._hashA = this._hashA
    cloned._hashB = this._hashB
    return cloned
  }

  get batchSize(): number {
    return Math.max(1, Math.ceil(4 / (1 / Math.sqrt(this._numHashes))))
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toJSON(): MinHashJSON {
    return {
      numHashes: this._numHashes,
      seed: this._seed,
      signature: Array.from(this._signature),
      size: this._size,
      hashA: Array.from(this._hashA),
      hashB: Array.from(this._hashB),
    }
  }

  static fromJSON(json: MinHashJSON): MinHash {
    const mh = new MinHash(json.numHashes, json.seed)
    mh._signature = Array.from(json.signature)
    mh._size = json.size
    mh._hashA = Array.from(json.hashA)
    mh._hashB = Array.from(json.hashB)
    return mh
  }
}

export { DEFAULT_MINHASH_OPTIONS } from './types.js'
export type { MinHashOptions, MinHashJSON } from './types.js'
