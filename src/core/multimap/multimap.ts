import type { MultimapOptions, MultimapStats } from './types.js'
import { DEFAULT_MULTIMAP_OPTIONS } from './types.js'

export class Multimap<K, V> {
  private map: Map<K, V[]> = new Map()
  private _valueCount: number = 0
  private options: MultimapOptions

  constructor(options?: Partial<MultimapOptions>) {
    this.options = { ...DEFAULT_MULTIMAP_OPTIONS, ...options }
  }

  set(key: K, value: V): void {
    let values = this.map.get(key)
    if (values === undefined) {
      values = []
      this.map.set(key, values)
    }
    if (this.options.allowDuplicates || !values.includes(value)) {
      values.push(value)
      this._valueCount++
    }
  }

  get(key: K): V[] {
    const values = this.map.get(key)
    if (values === undefined) {
      return []
    }
    return [...values]
  }

  delete(key: K, value?: V): boolean {
    if (value === undefined) {
      const values = this.map.get(key)
      if (values === undefined) {
        return false
      }
      this._valueCount -= values.length
      this.map.delete(key)
      return true
    }
    const values = this.map.get(key)
    if (values === undefined) {
      return false
    }
    const index = values.indexOf(value)
    if (index === -1) {
      return false
    }
    values.splice(index, 1)
    this._valueCount--
    if (values.length === 0) {
      this.map.delete(key)
    }
    return true
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  hasEntry(key: K, value: V): boolean {
    const values = this.map.get(key)
    if (values === undefined) {
      return false
    }
    return values.includes(value)
  }

  get keyCount(): number {
    return this.map.size
  }

  get valueCount(): number {
    return this._valueCount
  }

  get size(): number {
    return this._valueCount
  }

  keys(): K[] {
    return [...this.map.keys()]
  }

  values(): V[] {
    const result: V[] = []
    for (const vals of this.map.values()) {
      for (let i = 0; i < vals.length; i++) {
        result.push(vals[i]!)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (const [key, vals] of this.map) {
      for (let i = 0; i < vals.length; i++) {
        result.push([key, vals[i]!])
      }
    }
    return result
  }

  forEach(callback: (key: K, value: V) => void): void {
    for (const [key, vals] of this.map) {
      for (let i = 0; i < vals.length; i++) {
        callback(key, vals[i]!)
      }
    }
  }

  isEmpty(): boolean {
    return this._valueCount === 0
  }

  clear(): void {
    this.map.clear()
    this._valueCount = 0
  }

  clone(): Multimap<K, V> {
    const result = new Multimap<K, V>(this.options)
    for (const [key, vals] of this.map) {
      const copied: V[] = [...vals]
      result.map.set(key, copied)
    }
    result._valueCount = this._valueCount
    return result
  }

  static from<K, V>(entries: Array<[K, V]>, options?: Partial<MultimapOptions>): Multimap<K, V> {
    const mm = new Multimap<K, V>(options)
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!
      mm.set(entry[0], entry[1])
    }
    return mm
  }

  asMap(): Map<K, V[]> {
    const result = new Map<K, V[]>()
    for (const [key, vals] of this.map) {
      result.set(key, [...vals])
    }
    return result
  }

  stats(): MultimapStats {
    let maxVals = 0
    let minVals = Infinity
    for (const vals of this.map.values()) {
      if (vals.length > maxVals) {
        maxVals = vals.length
      }
      if (vals.length < minVals) {
        minVals = vals.length
      }
    }
    if (this.map.size === 0) {
      minVals = 0
    }
    return {
      keyCount: this.map.size,
      valueCount: this._valueCount,
      isEmpty: this._valueCount === 0,
      avgValuesPerKey: this.map.size === 0 ? 0 : this._valueCount / this.map.size,
      maxValuesPerKey: maxVals,
      minValuesPerKey: minVals,
    }
  }
}

export { DEFAULT_MULTIMAP_OPTIONS } from './types.js'
export type { MultimapOptions, MultimapStats } from './types.js'
