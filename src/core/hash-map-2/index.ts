import type { HashMap2Options, ForEachCallback } from './types.js'

const EMPTY = 0
const OCCUPIED = 1
const DELETED = 2

type Entry<K, V> = { key: K; value: V }

function defaultHash(key: unknown): number {
  const str = String(key)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) - hash + ch) | 0
  }
  return hash
}

export class HashMap2<K, V> {
  private table: (Entry<K, V> | undefined)[]
  private states: Uint8Array
  private _capacity: number
  private _size: number
  private _maxLoadFactor: number
  private _hash: (key: K) => number

  constructor(options?: HashMap2Options<K>) {
    this._capacity = options?.initialCapacity ?? 16
    this._maxLoadFactor = options?.loadFactor ?? 0.75
    this._hash = options?.hash ?? defaultHash
    this._size = 0
    this.table = new Array(this._capacity)
    this.states = new Uint8Array(this._capacity)
  }

  private probeIndex(key: K): number {
    const h = this._hash(key)
    return ((h % this._capacity) + this._capacity) % this._capacity
  }

  private findSlot(key: K): number {
    let idx = this.probeIndex(key)
    let firstDeleted = -1
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[idx] === EMPTY) {
        return firstDeleted !== -1 ? firstDeleted : idx
      }
      if (this.states[idx] === DELETED && firstDeleted === -1) {
        firstDeleted = idx
      }
      if (this.states[idx] === OCCUPIED) {
        const entry = this.table[idx]!
        if (this.keysEqual(entry.key, key)) {
          return idx
        }
      }
      idx = (idx + 1) % this._capacity
    }
    return firstDeleted !== -1 ? firstDeleted : -1
  }

  private findOccupied(key: K): number {
    let idx = this.probeIndex(key)
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[idx] === EMPTY) {
        return -1
      }
      if (this.states[idx] === OCCUPIED && this.keysEqual(this.table[idx]!.key, key)) {
        return idx
      }
      idx = (idx + 1) % this._capacity
    }
    return -1
  }

  private keysEqual(a: K, b: K): boolean {
    if (a === b) return true
    if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) return true
    return false
  }

  private ensureCapacity(): void {
    if (this._size + 1 >= Math.floor(this._capacity * this._maxLoadFactor)) {
      const newCap = this._capacity * 2
      this.rehashTo(newCap)
    }
  }

  private rehashTo(newCapacity: number): void {
    const oldTable = this.table
    const oldStates = this.states
    const oldCapacity = this._capacity

    this._capacity = newCapacity
    this.table = new Array(newCapacity)
    this.states = new Uint8Array(newCapacity)
    this._size = 0

    for (let i = 0; i < oldCapacity; i++) {
      if (oldStates[i] === OCCUPIED) {
        const entry = oldTable[i]!
        this.set(entry.key, entry.value)
      }
    }
  }

  set(key: K, value: V): this {
    this.ensureCapacity()
    const idx = this.findSlot(key)
    if (idx === -1) {
      this.rehashTo(this._capacity * 2)
      return this.set(key, value)
    }
    if (this.states[idx] === OCCUPIED && this.keysEqual(this.table[idx]!.key, key)) {
      this.table[idx]!.value = value
    } else {
      this.table[idx] = { key, value }
      this.states[idx] = OCCUPIED
      this._size++
    }
    return this
  }

  put(key: K, value: V): this {
    return this.set(key, value)
  }

  get(key: K): V | undefined {
    const idx = this.findOccupied(key)
    if (idx === -1) return undefined
    return this.table[idx]!.value
  }

  delete(key: K): boolean {
    const idx = this.findOccupied(key)
    if (idx === -1) return false
    this.states[idx] = DELETED
    this.table[idx] = undefined
    this._size--
    return true
  }

  has(key: K): boolean {
    return this.findOccupied(key) !== -1
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.table = new Array(this._capacity)
    this.states = new Uint8Array(this._capacity)
    this._size = 0
  }

  toArray(): [K, V][] {
    const result: [K, V][] = []
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        const entry = this.table[i]!
        result.push([entry.key, entry.value])
      }
    }
    return result
  }

  clone(): HashMap2<K, V> {
    const copy = new HashMap2<K, V>({
      initialCapacity: this._capacity,
      loadFactor: this._maxLoadFactor,
      hash: this._hash,
    })
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        const entry = this.table[i]!
        copy.table[i] = { key: entry.key, value: entry.value }
        copy.states[i] = OCCUPIED
      }
    }
    copy._size = this._size
    return copy
  }

  static fromArray<K, V>(entries: [K, V][], options?: HashMap2Options<K>): HashMap2<K, V> {
    const capacity = options?.initialCapacity ?? Math.max(16, entries.length * 2)
    const map = new HashMap2<K, V>({ ...options, initialCapacity: capacity })
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  forEach(callback: ForEachCallback<K, V>): void {
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        const entry = this.table[i]!
        callback(entry.value, entry.key)
      }
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        const entry = this.table[i]!
        yield [entry.key, entry.value]
      }
    }
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        result.push(this.table[i]!.key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        result.push(this.table[i]!.value)
      }
    }
    return result
  }

  entries(): [K, V][] {
    return this.toArray()
  }

  get capacity(): number {
    return this._capacity
  }

  get loadFactor(): number {
    if (this._capacity === 0) return 0
    return this._size / this._capacity
  }

  containsValue(value: V): boolean {
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED && this.table[i]!.value === value) {
        return true
      }
    }
    return false
  }

  keySet(): K[] {
    const result: K[] = []
    const seen = new Set<K>()
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        const key = this.table[i]!.key
        if (!seen.has(key)) {
          seen.add(key)
          result.push(key)
        }
      }
    }
    return result
  }

  valueSet(): V[] {
    const result: V[] = []
    const seen = new Set<V>()
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        const value = this.table[i]!.value
        if (!seen.has(value)) {
          seen.add(value)
          result.push(value)
        }
      }
    }
    return result
  }

  merge(other: HashMap2<K, V>): this {
    for (const [key, value] of other) {
      this.set(key, value)
    }
    return this
  }

  filter(predicate: (value: V, key: K) => boolean): HashMap2<K, V> {
    const result = new HashMap2<K, V>({
      initialCapacity: this._capacity,
      loadFactor: this._maxLoadFactor,
      hash: this._hash,
    })
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        const entry = this.table[i]!
        if (predicate(entry.value, entry.key)) {
          result.set(entry.key, entry.value)
        }
      }
    }
    return result
  }

  mapValues<U>(fn: (value: V, key: K) => U): HashMap2<K, U> {
    const result = new HashMap2<K, U>({
      initialCapacity: this._capacity,
      loadFactor: this._maxLoadFactor,
    })
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        const entry = this.table[i]!
        result.set(entry.key, fn(entry.value, entry.key))
      }
    }
    return result
  }

  equals(other: HashMap2<K, V>): boolean {
    if (this._size !== other._size) return false
    for (let i = 0; i < this._capacity; i++) {
      if (this.states[i] === OCCUPIED) {
        const entry = this.table[i]!
        const otherValue = other.get(entry.key)
        if (otherValue === undefined) return false
        if (otherValue !== entry.value) return false
      }
    }
    return true
  }

  resize(newCapacity: number): void {
    if (newCapacity < this._size) {
      newCapacity = this._size * 2
    }
    this.rehashTo(newCapacity)
  }

  rehash(): void {
    this.rehashTo(this._capacity)
  }

  toString(): string {
    return `${HashMap2}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'HashMap2', size: this.size, items: this.toArray() }
  }

  static empty<K, V>(): HashMap2<K, V> {
    return new HashMap2<K, V>()
  }

  get [Symbol.toStringTag](): string {
    return 'HashMap2'
  }

  nonEmpty(): boolean {
    return !this.isEmpty
  }
}
