import type { CuckooFilterOptions } from './types.js'

const DEFAULT_CAPACITY = 1024
const DEFAULT_BUCKET_SIZE = 4
const DEFAULT_MAX_KICKS = 500
const FINGERPRINT_BITS = 8
const FINGERPRINT_MASK = (1 << FINGERPRINT_BITS) - 1

function nextPowerOf2(n: number): number {
  if (n <= 0) return 1
  let v = n - 1
  v |= v >> 1
  v |= v >> 2
  v |= v >> 4
  v |= v >> 8
  v |= v >> 16
  return v + 1
}

function fnv1a(data: string): number {
  let hash = 2166136261
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function toKey(item: unknown): string {
  if (typeof item === 'string') return '\x00' + item
  if (typeof item === 'number') return '\x01' + item.toString()
  if (typeof item === 'boolean') return '\x02' + item.toString()
  if (item === null) return '\x03null'
  if (item === undefined) return '\x04undefined'
  return '\x05' + JSON.stringify(item)
}

export class CuckooFilter {
  private buckets: number[][]
  private _capacity: number
  private _bucketSize: number
  private _maxKicks: number
  private _size: number = 0

  constructor(options?: CuckooFilterOptions) {
    const requestedCapacity = options?.capacity ?? DEFAULT_CAPACITY
    this._capacity = nextPowerOf2(requestedCapacity)
    this._bucketSize = options?.bucketSize ?? DEFAULT_BUCKET_SIZE
    this._maxKicks = options?.maxKicks ?? DEFAULT_MAX_KICKS
    this.buckets = new Array(this._capacity)
    for (let i = 0; i < this._capacity; i++) {
      this.buckets[i] = []
    }
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  private computeFingerprint(hash: number): number {
    let fp = (hash >>> (32 - FINGERPRINT_BITS)) & FINGERPRINT_MASK
    if (fp === 0) fp = 1
    return fp
  }

  private getIndices(hash: number, fp: number): [number, number] {
    const mask = this._capacity - 1
    const i1 = hash & mask
    const fpHash = fnv1a(String(fp))
    const i2 = (i1 ^ fpHash) & mask
    return [i1, i2]
  }

  insert(item: unknown): boolean {
    const key = toKey(item)
    const hash = fnv1a(key)
    const fp = this.computeFingerprint(hash)
    const [i1, i2] = this.getIndices(hash, fp)

    if (this.buckets[i1]!.length < this._bucketSize) {
      this.buckets[i1]!.push(fp)
      this._size++
      return true
    }

    if (this.buckets[i2]!.length < this._bucketSize) {
      this.buckets[i2]!.push(fp)
      this._size++
      return true
    }

    let currentIndex = Math.random() < 0.5 ? i1 : i2
    let currentFp = fp
    const mask = this._capacity - 1

    for (let kick = 0; kick < this._maxKicks; kick++) {
      const bucket = this.buckets[currentIndex]!
      const victimPos = Math.floor(Math.random() * bucket.length)
      const victimFp = bucket[victimPos]!
      bucket[victimPos] = currentFp

      currentFp = victimFp
      currentIndex = (currentIndex ^ fnv1a(String(currentFp))) & mask

      if (this.buckets[currentIndex]!.length < this._bucketSize) {
        this.buckets[currentIndex]!.push(currentFp)
        this._size++
        return true
      }
    }

    return false
  }

  contains(item: unknown): boolean {
    const key = toKey(item)
    const hash = fnv1a(key)
    const fp = this.computeFingerprint(hash)
    const [i1, i2] = this.getIndices(hash, fp)

    const bucket1 = this.buckets[i1]!
    for (let i = 0; i < bucket1.length; i++) {
      if (bucket1[i] === fp) return true
    }
    const bucket2 = this.buckets[i2]!
    for (let i = 0; i < bucket2.length; i++) {
      if (bucket2[i] === fp) return true
    }
    return false
  }

  delete(item: unknown): boolean {
    const key = toKey(item)
    const hash = fnv1a(key)
    const fp = this.computeFingerprint(hash)
    const [i1, i2] = this.getIndices(hash, fp)

    const bucket1 = this.buckets[i1]!
    for (let i = 0; i < bucket1.length; i++) {
      if (bucket1[i] === fp) {
        bucket1[i] = bucket1[bucket1.length - 1]!
        bucket1.pop()
        this._size--
        return true
      }
    }
    const bucket2 = this.buckets[i2]!
    for (let i = 0; i < bucket2.length; i++) {
      if (bucket2[i] === fp) {
        bucket2[i] = bucket2[bucket2.length - 1]!
        bucket2.pop()
        this._size--
        return true
      }
    }
    return false
  }

  falsePositiveRate(): number {
    if (this._size === 0) return 0
    const avgLoad = this._size / this._capacity
    return 1 - Math.pow(1 - 1 / (1 << FINGERPRINT_BITS), 2 * avgLoad)
  }

  clear(): void {
    for (let i = 0; i < this._capacity; i++) {
      this.buckets[i]!.length = 0
    }
    this._size = 0
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._capacity; i++) {
      const bucket = this.buckets[i]!
      for (let j = 0; j < bucket.length; j++) {
        result.push(bucket[j]!)
      }
    }
    return result
  }
}
