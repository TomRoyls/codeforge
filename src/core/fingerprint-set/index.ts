import type { FingerprintSetOptions } from './types.js'

export type { FingerprintSetOptions } from './types.js'

const DEFAULT_HASH_BITS = 64
const IRREDUCIBLE_POLY_64 = 0x000000000000001bn

class RabinFingerprint {
  private readonly mask: bigint
  private readonly poly: bigint
  private readonly hashBits: number

  constructor(hashBits: number) {
    this.hashBits = hashBits
    this.mask = (1n << BigInt(hashBits)) - 1n
    this.poly = this.findIrreduciblePoly(hashBits)
  }

  private findIrreduciblePoly(bits: number): bigint {
    if (bits === 64) return IRREDUCIBLE_POLY_64 | (1n << 64n) | 1n
    const candidates: Record<number, bigint> = {
      8: 0x17n,
      16: 0x1002bn,
      32: 0xa0400007n,
      48: 0x000001000000010fn,
    }
    return (candidates[bits] ?? (1n << BigInt(bits)) | 3n) | (1n << BigInt(bits))
  }

  compute(data: string): bigint {
    let fp = 0n
    for (let i = 0; i < data.length; i++) {
      const byte = BigInt(data.charCodeAt(i))
      fp ^= byte
      fp = this.fpStep(fp)
    }
    return fp & this.mask
  }

  private fpStep(fp: bigint): bigint {
    const topBit = (fp >> BigInt(this.hashBits - 1)) & 1n
    fp = (fp << 1n) & this.mask
    if (topBit) {
      fp ^= this.poly & this.mask
    }
    return fp
  }
}

export class FingerprintSet<T> implements Iterable<T> {
  private readonly buckets: Map<bigint, T[]>
  private readonly fingerprinter: RabinFingerprint
  private readonly serializer: (value: T) => string
  private readonly hashBits: number
  private _size: number = 0
  private _capacity: number

  constructor(options?: FingerprintSetOptions<T>) {
    this.hashBits = options?.hashBits ?? DEFAULT_HASH_BITS
    this.serializer = options?.serialize ?? ((v: T) => String(v))
    this.fingerprinter = new RabinFingerprint(this.hashBits)
    this._capacity = 1 << Math.min(this.hashBits, 16)
    this.buckets = new Map()
  }

  fingerprint(value: T): bigint {
    return this.fingerprinter.compute(this.serializer(value))
  }

  add(value: T): boolean {
    const fp = this.fingerprint(value)
    let bucket = this.buckets.get(fp)
    if (bucket === undefined) {
      bucket = []
      this.buckets.set(fp, bucket)
    }
    for (const existing of bucket) {
      if (this.valuesEqual(existing, value)) {
        return false
      }
    }
    bucket.push(value)
    this._size++
    return true
  }

  delete(value: T): boolean {
    const fp = this.fingerprint(value)
    const bucket = this.buckets.get(fp)
    if (bucket === undefined) {
      return false
    }
    for (let i = 0; i < bucket.length; i++) {
      if (this.valuesEqual(bucket[i]!, value)) {
        bucket.splice(i, 1)
        if (bucket.length === 0) {
          this.buckets.delete(fp)
        }
        this._size--
        return true
      }
    }
    return false
  }

  has(value: T): boolean {
    const fp = this.fingerprint(value)
    const bucket = this.buckets.get(fp)
    if (bucket === undefined) {
      return false
    }
    for (const existing of bucket) {
      if (this.valuesEqual(existing, value)) {
        return true
      }
    }
    return false
  }

  contains(value: T): boolean {
    return this.has(value)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get capacity(): number {
    return this._capacity
  }

  count(): number {
    return this._size
  }

  clear(): void {
    this.buckets.clear()
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (const bucket of this.buckets.values()) {
      for (const value of bucket) {
        result.push(value)
      }
    }
    return result
  }

  clone(): FingerprintSet<T> {
    const newSet = new FingerprintSet<T>({
      hashBits: this.hashBits,
      serialize: this.serializer,
    })
    for (const value of this) {
      newSet.add(value)
    }
    return newSet
  }

  static fromArray<T>(arr: T[], options?: FingerprintSetOptions<T>): FingerprintSet<T> {
    const set = new FingerprintSet<T>(options)
    for (const value of arr) {
      set.add(value)
    }
    return set
  }

  forEach(callback: (value: T, index: number) => void): void {
    let index = 0
    for (const value of this) {
      callback(value, index++)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const bucket of this.buckets.values()) {
      for (const value of bucket) {
        yield value
      }
    }
  }

  union(other: FingerprintSet<T>): FingerprintSet<T> {
    const result = this.clone()
    for (const value of other) {
      result.add(value)
    }
    return result
  }

  intersection(other: FingerprintSet<T>): FingerprintSet<T> {
    const result = new FingerprintSet<T>({
      hashBits: this.hashBits,
      serialize: this.serializer,
    })
    for (const value of this) {
      if (other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  difference(other: FingerprintSet<T>): FingerprintSet<T> {
    const result = new FingerprintSet<T>({
      hashBits: this.hashBits,
      serialize: this.serializer,
    })
    for (const value of this) {
      if (!other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  isSubsetOf(other: FingerprintSet<T>): boolean {
    for (const value of this) {
      if (!other.has(value)) {
        return false
      }
    }
    return true
  }

  isSupersetOf(other: FingerprintSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: FingerprintSet<T>): boolean {
    if (this._size !== other._size) {
      return false
    }
    for (const value of this) {
      if (!other.has(value)) {
        return false
      }
    }
    return true
  }

  filter(predicate: (value: T) => boolean): FingerprintSet<T> {
    const result = new FingerprintSet<T>({
      hashBits: this.hashBits,
      serialize: this.serializer,
    })
    for (const value of this) {
      if (predicate(value)) {
        result.add(value)
      }
    }
    return result
  }

  every(predicate: (value: T) => boolean): boolean {
    for (const value of this) {
      if (!predicate(value)) {
        return false
      }
    }
    return true
  }

  some(predicate: (value: T) => boolean): boolean {
    for (const value of this) {
      if (predicate(value)) {
        return true
      }
    }
    return false
  }

  reduce<U>(fn: (accumulator: U, value: T) => U, initial: U): U {
    let acc = initial
    for (const value of this) {
      acc = fn(acc, value)
    }
    return acc
  }

  join(separator?: string): string {
    const sep = separator ?? ','
    const parts: string[] = []
    for (const value of this) {
      parts.push(this.serializer(value))
    }
    return parts.join(sep)
  }

  first(): T | undefined {
    for (const value of this) {
      return value
    }
    return undefined
  }

  last(): T | undefined {
    let result: T | undefined
    for (const value of this) {
      result = value
    }
    return result
  }

  hasCollision(value1: T, value2: T): boolean {
    return this.fingerprint(value1) === this.fingerprint(value2)
  }

  loadFactor(): number {
    if (this._capacity === 0) return 0
    return this._size / this._capacity
  }

  private valuesEqual(a: T, b: T): boolean {
    return this.serializer(a) === this.serializer(b)
  }

  toString(): string {
    return `${FingerprintSet}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'FingerprintSet', size: this.size, items: this.toArray() }
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }


  unique(): T[] {
    return [...new Set(this.toArray())]
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }
}
