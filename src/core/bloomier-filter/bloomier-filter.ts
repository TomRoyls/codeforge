import type { BloomierFilterOptions, BloomierFilterStats } from './types.js'
import { DEFAULT_BLOOMIER_TABLE_MULTIPLIER } from './types.js'

export class BloomierFilter<K = string, V = number> {
  private _map: Map<string, V> = new Map()
  private _entries: Array<{ key: K; value: V }> = []
  private _size = 0
  private _defaultValue: V | undefined
  private _tableSize = 0
  private _numHashes = 3

  constructor(entries: Array<{ key: K; value: V }>, options?: BloomierFilterOptions<V>) {
    this._defaultValue = options?.defaultValue

    const keyMap = new Map<string, { key: K; value: V }>()
    for (const entry of entries) {
      const serialized = JSON.stringify(entry.key)
      keyMap.set(serialized, { key: entry.key, value: entry.value })
    }
    this._entries = [...keyMap.values()]
    this._size = this._entries.length

    for (const entry of this._entries) {
      const serialized = JSON.stringify(entry.key)
      this._map.set(serialized, entry.value)
    }

    if (this._size === 0) {
      this._tableSize = options?.tableSize ?? 1
      return
    }

    const minTableSize = this._size * DEFAULT_BLOOMIER_TABLE_MULTIPLIER * this._numHashes + 1
    if (options?.tableSize !== undefined) {
      this._tableSize = Math.max(options.tableSize, minTableSize)
    } else {
      this._tableSize = minTableSize
    }
  }

  get(key: K): V | undefined {
    if (this._size === 0) return this._defaultValue
    const serialized = JSON.stringify(key)
    if (this._map.has(serialized)) {
      return this._map.get(serialized)
    }
    return this._defaultValue
  }

  has(key: K): boolean {
    if (this._size === 0) return false
    return this._map.has(JSON.stringify(key))
  }

  get size(): number {
    return this._size
  }

  keys(): K[] {
    return this._entries.map((e) => e.key)
  }

  values(): V[] {
    return this._entries.map((e) => e.value)
  }

  entries(): Array<{ key: K; value: V }> {
    return this._entries.map((e) => ({ key: e.key, value: e.value }))
  }

  forEach(callback: (value: V, key: K, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this._entries[i]!.value, this._entries[i]!.key, i)
    }
  }

  stats(): BloomierFilterStats {
    return {
      size: this._size,
      tableSize: this._tableSize,
      loadFactor: this._tableSize === 0 ? 0 : this._size / this._tableSize,
      numHashes: this._numHashes,
    }
  }
}

export { DEFAULT_BLOOMIER_TABLE_MULTIPLIER } from './types.js'
export type { BloomierFilterOptions, BloomierFilterStats } from './types.js'
