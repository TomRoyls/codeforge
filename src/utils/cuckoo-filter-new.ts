export class CuckooFilter {
  private buckets: number[][]
  private numBuckets: number
  private bucketSize: number
  private maxKicks: number

  constructor(numBuckets = 1024, bucketSize = 4, maxKicks = 500) {
    this.numBuckets = numBuckets
    this.bucketSize = bucketSize
    this.maxKicks = maxKicks
    this.buckets = Array.from({ length: numBuckets }, () => [])
  }

  add(item: string): boolean {
    const fp = this.fingerprint(item)
    const i1 = this.hash(item) % this.numBuckets
    const i2 = (i1 ^ this.hash(fp)) % this.numBuckets
    const b1 = this.buckets[i1]!
    const b2 = this.buckets[i2]!
    if (b1.length < this.bucketSize) { b1.push(fp); return true }
    if (b2.length < this.bucketSize) { b2.push(fp); return true }
    let idx = Math.random() < 0.5 ? i1 : i2
    let currentFp = fp
    for (let n = 0; n < this.maxKicks; n++) {
      const bucket = this.buckets[idx]!
      const randPos = Math.floor(Math.random() * bucket.length)
      const temp = bucket[randPos]!
      bucket[randPos] = currentFp
      currentFp = temp
      idx = (idx ^ this.hash(String(currentFp))) % this.numBuckets
      const targetBucket = this.buckets[idx]!
      if (targetBucket.length < this.bucketSize) {
        targetBucket.push(currentFp)
        return true
      }
    }
    return false
  }

  contains(item: string): boolean {
    const fp = this.fingerprint(item)
    const i1 = this.hash(item) % this.numBuckets
    const i2 = (i1 ^ this.hash(fp)) % this.numBuckets
    return this.buckets[i1]!.includes(fp) || this.buckets[i2]!.includes(fp)
  }

  remove(item: string): boolean {
    const fp = this.fingerprint(item)
    const i1 = this.hash(item) % this.numBuckets
    const i2 = (i1 ^ this.hash(fp)) % this.numBuckets
    const idx1 = this.buckets[i1]!.indexOf(fp)
    if (idx1 !== -1) { this.buckets[i1]!.splice(idx1, 1); return true }
    const idx2 = this.buckets[i2]!.indexOf(fp)
    if (idx2 !== -1) { this.buckets[i2]!.splice(idx2, 1); return true }
    return false
  }

  get size(): number {
    return this.buckets.reduce((sum, b) => sum + b.length, 0)
  }

  get capacity(): number {
    return this.numBuckets * this.bucketSize
  }

  get fillRatio(): number {
    return this.size / this.capacity
  }

  clear(): void {
    for (const bucket of this.buckets) bucket.length = 0
  }

  toString(): string {
    return JSON.stringify({ size: this.size, capacity: this.capacity })
  }

  toJSON(): Record<string, number> {
    return { size: this.size, capacity: this.capacity, fillRatio: this.fillRatio }
  }

  clone(): CuckooFilter {
    const copy = new CuckooFilter(this.numBuckets, this.bucketSize, this.maxKicks)
    copy.buckets = this.buckets.map((b) => [...b])
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CuckooFilter)) return false
    return this.size === other.size && this.capacity === other.capacity
  }

  private fingerprint(item: string): number {
    let hash = 0
    for (let i = 0; i < item.length; i++) {
      hash = ((hash << 5) - hash + item.charCodeAt(i)) | 0
    }
    return (hash & 0xFF) || 1
  }

  private hash(item: string | number): number {
    const str = String(item)
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
  }
}
