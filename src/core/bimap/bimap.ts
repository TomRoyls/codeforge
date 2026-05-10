import type { BimapOptions, BimapJSON, BimapStatistics } from './types.js'
import { DEFAULT_BIMAP_OPTIONS } from './types.js'

export class Bimap<K, V> {
  private forward: Map<K, V> = new Map()
  private _reverse: Map<V, K> = new Map()
  private _stats: BimapStatistics = {
    sets: 0,
    gets: 0,
    deletes: 0,
    reverseLookups: 0,
    overwrites: 0,
  }
  private _options: Required<BimapOptions>

  constructor(entries?: ReadonlyArray<readonly [K, V]>, options?: BimapOptions) {
    this._options = { ...DEFAULT_BIMAP_OPTIONS, ...options }
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value)
      }
    }
  }

  set(key: K, value: V): void {
    const existingValue = this.forward.get(key)
    const existingKey = this._reverse.get(value)

    if (existingValue !== undefined) {
      if (existingValue === value) {
        return
      }
      this._reverse.delete(existingValue)
      this._stats.overwrites++
    }

    if (existingKey !== undefined && existingKey !== key) {
      if (!this._options.allowOverwrite) {
        throw new Error(`Value ${String(value)} is already mapped to key ${String(existingKey)}`)
      }
      this.forward.delete(existingKey)
      this._stats.overwrites++
    }

    this.forward.set(key, value)
    this._reverse.set(value, key)
    this._stats.sets++
  }

  get(key: K): V | undefined {
    this._stats.gets++
    return this.forward.get(key)
  }

  getKey(value: V): K | undefined {
    this._stats.reverseLookups++
    return this._reverse.get(value)
  }

  delete(key: K): boolean {
    const value = this.forward.get(key)
    if (value === undefined) {
      return false
    }
    this.forward.delete(key)
    this._reverse.delete(value)
    this._stats.deletes++
    return true
  }

  deleteValue(value: V): boolean {
    const key = this._reverse.get(value)
    if (key === undefined) {
      return false
    }
    this._reverse.delete(value)
    this.forward.delete(key)
    this._stats.deletes++
    return true
  }

  has(key: K): boolean {
    return this.forward.has(key)
  }

  hasValue(value: V): boolean {
    return this._reverse.has(value)
  }

  get size(): number {
    return this.forward.size
  }

  get isEmpty(): boolean {
    return this.forward.size === 0
  }

  clear(): void {
    this.forward.clear()
    this._reverse.clear()
    this._stats = {
      sets: 0,
      gets: 0,
      deletes: 0,
      reverseLookups: 0,
      overwrites: 0,
    }
  }

  keys(): K[] {
    return Array.from(this.forward.keys())
  }

  values(): V[] {
    return Array.from(this.forward.values())
  }

  entries(): Array<[K, V]> {
    return Array.from(this.forward.entries())
  }

  forEach(callback: (key: K, value: V, bimap: Bimap<K, V>) => void): void {
    this.forward.forEach((value, key) => {
      callback(key, value, this)
    })
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    for (const entry of this.forward) {
      yield entry
    }
  }

  update(key: K, value: V): boolean {
    if (!this.forward.has(key)) {
      return false
    }
    this.set(key, value)
    return true
  }

  reverse(): Bimap<V, K> {
    const result = new Bimap<V, K>()
    for (const [key, value] of this.forward) {
      result.set(value, key)
    }
    return result
  }

  getStatistics(): BimapStatistics {
    return { ...this._stats }
  }

  toJSON(): BimapJSON<K, V> {
    return {
      entries: this.entries(),
      statistics: { ...this._stats },
    }
  }

  static fromJSON<K, V>(data: BimapJSON<K, V>, options?: BimapOptions): Bimap<K, V> {
    const bimap = new Bimap<K, V>(data.entries, options)
    return bimap
  }
}

export { DEFAULT_BIMAP_OPTIONS } from './types.js'
export type { BimapOptions, BimapJSON, BimapStatistics } from './types.js'
