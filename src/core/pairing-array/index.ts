import type { PairingArrayEntry } from './types.js'

export class PairingArray<K, V> {
  private _entries: PairingArrayEntry<K, V>[] = []
  private _index: Map<K, number> = new Map()

  constructor(initialEntries?: Array<[K, V]>) {
    if (initialEntries) {
      for (const [key, value] of initialEntries) {
        this.set(key, value)
      }
    }
  }

  set(key: K, value: V): void {
    const existingIndex = this._index.get(key)
    if (existingIndex !== undefined) {
      this._entries[existingIndex] = [key, value]
    } else {
      this._entries.push([key, value])
      this._index.set(key, this._entries.length - 1)
    }
  }

  get(key: K): V | undefined {
    const idx = this._index.get(key)
    if (idx === undefined) {
      return undefined
    }
    return this._entries[idx]![1]
  }

  getAt(index: number): V {
    const entry = this._entries[index]
    if (entry === undefined) {
      throw new RangeError(`Index ${index} out of bounds`)
    }
    return entry[1]
  }

  getKeyAt(index: number): K {
    const entry = this._entries[index]
    if (entry === undefined) {
      throw new RangeError(`Index ${index} out of bounds`)
    }
    return entry[0]
  }

  has(key: K): boolean {
    return this._index.has(key)
  }

  delete(key: K): boolean {
    const idx = this._index.get(key)
    if (idx === undefined) {
      return false
    }
    this._entries.splice(idx, 1)
    this._index.delete(key)
    this._rebuildIndex()
    return true
  }

  deleteAt(index: number): boolean {
    const entry = this._entries[index]
    if (entry === undefined) {
      return false
    }
    this._entries.splice(index, 1)
    this._index.delete(entry[0])
    this._rebuildIndex()
    return true
  }

  indexOf(key: K): number {
    const idx = this._index.get(key)
    return idx !== undefined ? idx : -1
  }

  size(): number {
    return this._entries.length
  }

  isEmpty(): boolean {
    return this._entries.length === 0
  }

  clear(): void {
    this._entries = []
    this._index.clear()
  }

  keys(): K[] {
    return this._entries.map((e) => e[0])
  }

  values(): V[] {
    return this._entries.map((e) => e[1])
  }

  entries(): Array<[K, V]> {
    return this._entries.map((e) => [e[0], e[1]] as [K, V])
  }

  forEach(callback: (value: V, key: K, index: number) => void): void {
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      callback(entry[1], entry[0], i)
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    for (const entry of this._entries) {
      yield [entry[0], entry[1]] as [K, V]
    }
  }

  toArray(): V[] {
    return this._entries.map((e) => e[1])
  }

  map<U>(fn: (value: V, key: K, index: number) => U): PairingArray<K, U> {
    const result = new PairingArray<K, U>()
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      result.set(entry[0], fn(entry[1], entry[0], i))
    }
    return result
  }

  filter(fn: (value: V, key: K, index: number) => boolean): PairingArray<K, V> {
    const result = new PairingArray<K, V>()
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      if (fn(entry[1], entry[0], i)) {
        result.set(entry[0], entry[1])
      }
    }
    return result
  }

  find(fn: (value: V, key: K, index: number) => boolean): V | undefined {
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      if (fn(entry[1], entry[0], i)) {
        return entry[1]
      }
    }
    return undefined
  }

  findKey(fn: (value: V, key: K, index: number) => boolean): K | undefined {
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      if (fn(entry[1], entry[0], i)) {
        return entry[0]
      }
    }
    return undefined
  }

  every(fn: (value: V, key: K, index: number) => boolean): boolean {
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      if (!fn(entry[1], entry[0], i)) {
        return false
      }
    }
    return true
  }

  some(fn: (value: V, key: K, index: number) => boolean): boolean {
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      if (fn(entry[1], entry[0], i)) {
        return true
      }
    }
    return false
  }

  reduce<U>(fn: (acc: U, value: V, key: K, index: number) => U, initial: U): U {
    let acc = initial
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      acc = fn(acc, entry[1], entry[0], i)
    }
    return acc
  }

  clone(): PairingArray<K, V> {
    const result = new PairingArray<K, V>()
    for (const entry of this._entries) {
      result.set(entry[0], entry[1])
    }
    return result
  }

  static fromArray<K, V>(entries: Array<[K, V]>): PairingArray<K, V> {
    return new PairingArray<K, V>(entries)
  }

  private _rebuildIndex(): void {
    this._index.clear()
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      this._index.set(entry[0], i)
    }
  }

  toString(): string {
    return `PairingArray({ size: ${this._entries.length} })`
  }

  toJSON() {
    return { type: 'PairingArray', items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'PairingArray'
  }
}

export type { PairingArrayEntry } from './types.js'
