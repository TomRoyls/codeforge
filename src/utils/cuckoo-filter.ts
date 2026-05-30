export interface CuckooFilterOptions {
  capacity: number
  bucketSize?: number
  maxKicks?: number
  fingerprintSize?: number
}

const DEFAULT_BUCKET_SIZE = 4
const DEFAULT_MAX_KICKS = 500
const DEFAULT_FINGERPRINT_SIZE = 1

const FNV_OFFSET = 2166136261
const FNV_PRIME = 16777619
// FNV_MASK32 = 0xffffffff (used implicitly via >>> 0)

export class CuckooFilter {
  private buckets: Uint8Array[]
  private readonly _bucketSize: number
  private readonly _maxKicks: number
  private readonly _fingerprintBytes: number
  private readonly _numBuckets: number
  private _size: number = 0

  constructor(options: CuckooFilterOptions) {
    if (options.capacity < 1) {
      throw new RangeError(`Capacity must be >= 1, got ${options.capacity}`)
    }
    this._bucketSize = options.bucketSize ?? DEFAULT_BUCKET_SIZE
    this._maxKicks = options.maxKicks ?? DEFAULT_MAX_KICKS
    this._fingerprintBytes = options.fingerprintSize ?? DEFAULT_FINGERPRINT_SIZE
    this._numBuckets = Math.max(1, Math.ceil(options.capacity / this._bucketSize))
    this.buckets = []
    for (let i = 0; i < this._numBuckets; i++) {
      this.buckets.push(new Uint8Array(this._bucketSize * this._fingerprintBytes))
    }
  }

  insert(item: string): boolean {
    const fp = this.fingerprint(item)
    const i1 = this.hashIndex(item)
    const i2 = this.altIndex(i1, fp)

    if (this.tryInsert(i1, fp)) return true
    if (this.tryInsert(i2, fp)) return true

    let idx = (Math.random() < 0.5 ? i1 : i2) % this._numBuckets
    let evicted = new Uint8Array(this._fingerprintBytes)

    for (let n = 0; n < this._maxKicks; n++) {
      const slot = Math.floor(Math.random() * this._bucketSize)
      const offset = slot * this._fingerprintBytes

      for (let b = 0; b < this._fingerprintBytes; b++) {
        evicted[b] = this.buckets[idx]![offset + b]!
        this.buckets[idx]![offset + b] = fp[b]!
      }

      idx = this.altIndex(idx, evicted) % this._numBuckets

      if (this.tryInsert(idx, evicted)) return true
    }

    return false
  }

  contains(item: string): boolean {
    const fp = this.fingerprint(item)
    const i1 = this.hashIndex(item)
    const i2 = this.altIndex(i1, fp)
    return this.hasFingerprint(i1, fp) || this.hasFingerprint(i2, fp)
  }

  remove(item: string): boolean {
    const fp = this.fingerprint(item)
    const i1 = this.hashIndex(item)
    const i2 = this.altIndex(i1, fp)

    if (this.removeFingerprint(i1, fp)) return true
    if (this.removeFingerprint(i2, fp)) return true
    return false
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._numBuckets * this._bucketSize
  }

  get loadFactor(): number {
    return this._size / this.capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this._numBuckets; i++) {
      this.buckets[i]!.fill(0)
    }
    this._size = 0
  }

  private fingerprint(item: string): Uint8Array {
    const h = this.fnv1a(item)
    const fp = new Uint8Array(this._fingerprintBytes)
    for (let i = 0; i < this._fingerprintBytes; i++) {
      fp[i] = ((h >> (i * 8)) & 0xff) | 1
    }
    return fp
  }

  private hashIndex(item: string): number {
    return this.fnv1a(item) % this._numBuckets
  }

  private altIndex(index: number, fp: Uint8Array): number {
    const h = this.fnv1aBytes(fp)
    return ((index ^ h) >>> 0) % this._numBuckets
  }

  private tryInsert(bucketIdx: number, fp: Uint8Array): boolean {
    const bucket = this.buckets[bucketIdx % this._numBuckets]!
    for (let s = 0; s < this._bucketSize; s++) {
      const offset = s * this._fingerprintBytes
      if (this.isSlotEmpty(bucket, offset)) {
        for (let b = 0; b < this._fingerprintBytes; b++) {
          bucket[offset + b] = fp[b]!
        }
        this._size++
        return true
      }
    }
    return false
  }

  private hasFingerprint(bucketIdx: number, fp: Uint8Array): boolean {
    const bucket = this.buckets[bucketIdx % this._numBuckets]!
    for (let s = 0; s < this._bucketSize; s++) {
      const offset = s * this._fingerprintBytes
      if (this.matchesSlot(bucket, offset, fp)) return true
    }
    return false
  }

  private removeFingerprint(bucketIdx: number, fp: Uint8Array): boolean {
    const bucket = this.buckets[bucketIdx % this._numBuckets]!
    for (let s = 0; s < this._bucketSize; s++) {
      const offset = s * this._fingerprintBytes
      if (this.matchesSlot(bucket, offset, fp)) {
        for (let b = 0; b < this._fingerprintBytes; b++) {
          bucket[offset + b] = 0
        }
        this._size--
        return true
      }
    }
    return false
  }

  private isSlotEmpty(bucket: Uint8Array, offset: number): boolean {
    for (let b = 0; b < this._fingerprintBytes; b++) {
      if (bucket[offset + b] !== 0) return false
    }
    return true
  }

  private matchesSlot(bucket: Uint8Array, offset: number, fp: Uint8Array): boolean {
    for (let b = 0; b < this._fingerprintBytes; b++) {
      if (bucket[offset + b] !== fp[b]) return false
    }
    return true
  }

  private fnv1a(data: string): number {
    let h = FNV_OFFSET >>> 0
    for (let i = 0; i < data.length; i++) {
      h ^= data.charCodeAt(i)
      h = Math.imul(h, FNV_PRIME) >>> 0
    }
    return h >>> 0
  }

  private fnv1aBytes(data: Uint8Array): number {
    let h = FNV_OFFSET >>> 0
    for (let i = 0; i < data.length; i++) {
      h ^= data[i]!
      h = Math.imul(h, FNV_PRIME) >>> 0
    }
    return h >>> 0
  }
}
