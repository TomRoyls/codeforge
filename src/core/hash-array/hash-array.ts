import type { HashArrayOptions, HashArrayJSON, HashArrayStatistics } from './types.js'
import { DEFAULT_HASH_ARRAY_OPTIONS } from './types.js'

const EMPTY = Symbol('EMPTY')

type Slot<T> = T | typeof EMPTY

export class HashArray<T = unknown> {
  private slots: Slot<T>[]
  private _length: number = 0
  private _denseLength: number = 0
  private _capacity: number
  private _hashFn: (value: unknown) => string
  private _stats: HashArrayStatistics = {
    pushes: 0,
    pops: 0,
    sets: 0,
    removes: 0,
    compacts: 0,
    gaps: 0,
    maxDenseLength: 0,
  }

  constructor(options?: Partial<HashArrayOptions>) {
    const opts: Required<HashArrayOptions> = { ...DEFAULT_HASH_ARRAY_OPTIONS, ...options }
    this._capacity = opts.initialCapacity
    this._hashFn = opts.hashFn
    this.slots = new Array<Slot<T>>(this._capacity)
    for (let i = 0; i < this._capacity; i++) {
      this.slots[i] = EMPTY
    }
  }

  push(value: T): number {
    const index = this._length
    if (index >= this._capacity) {
      this.grow(this._capacity * 2)
    }
    this.slots[index] = value
    this._length++
    this._denseLength++
    this._stats.pushes++
    this.updateMaxDense()
    return index
  }

  pop(): T | undefined {
    if (this._length === 0) return undefined
    let lastFilled = this._length - 1
    while (lastFilled >= 0 && this.slots[lastFilled] === EMPTY) {
      lastFilled--
    }
    if (lastFilled < 0) {
      this._length = 0
      return undefined
    }
    const value = this.slots[lastFilled] as T
    this.slots[lastFilled] = EMPTY
    this._length = lastFilled
    this._denseLength--
    this._stats.pops++
    return value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    const slot = this.slots[index]
    return slot === EMPTY ? undefined : slot
  }

  set(index: number, value: T): void {
    if (index < 0) return
    if (index >= this._capacity) {
      const newCap = Math.max(this._capacity * 2, index + 1)
      this.grow(newCap)
    }
    const wasEmpty = this.slots[index] === EMPTY
    this.slots[index] = value
    if (index >= this._length) {
      this._length = index + 1
    }
    if (wasEmpty) {
      this._denseLength++
      this.updateMaxDense()
    }
    this._stats.sets++
  }

  indexOf(value: T): number {
    const hash = this._hashFn(value)
    for (let i = 0; i < this._length; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY && this._hashFn(slot) === hash) {
        return i
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    const slot = this.slots[index]
    if (slot === EMPTY) return undefined
    const value = slot as T
    this.slots[index] = EMPTY
    this._denseLength--
    this._stats.removes++
    this._stats.gaps++
    this.trimLength()
    return value
  }

  delete(index: number): boolean {
    const result = this.removeAt(index)
    return result !== undefined
  }

  get length(): number {
    return this._length
  }

  get denseLength(): number {
    return this._denseLength
  }

  get isEmpty(): boolean {
    return this._denseLength === 0
  }

  clear(): void {
    for (let i = 0; i < this._capacity; i++) {
      this.slots[i] = EMPTY
    }
    this._length = 0
    this._denseLength = 0
    this._stats = {
      pushes: 0,
      pops: 0,
      sets: 0,
      removes: 0,
      compacts: 0,
      gaps: 0,
      maxDenseLength: 0,
    }
  }

  compact(): void {
    const values: T[] = []
    for (let i = 0; i < this._length; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY) {
        values.push(slot as T)
      }
    }
    const newCap = Math.max(DEFAULT_HASH_ARRAY_OPTIONS.initialCapacity, values.length * 2)
    this.slots = new Array<Slot<T>>(newCap)
    for (let i = 0; i < newCap; i++) {
      this.slots[i] = EMPTY
    }
    for (let i = 0; i < values.length; i++) {
      this.slots[i] = values[i]!
    }
    this._length = values.length
    this._denseLength = values.length
    this._capacity = newCap
    this._stats.compacts++
    this._stats.gaps = 0
    this.updateMaxDense()
  }

  fill(value: T, start?: number, end?: number): void {
    const s = start ?? 0
    const e = end ?? this._length
    for (let i = s; i < e; i++) {
      this.set(i, value)
    }
  }

  slice(start?: number, end?: number): T[] {
    const s = start ?? 0
    const e = end ?? this._length
    const result: T[] = []
    for (let i = s; i < e; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY) {
        result.push(slot as T)
      }
    }
    return result
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    const len = this._length
    const actualStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len)
    const actualDeleteCount = deleteCount ?? (len - actualStart)
    const removed: T[] = []
    for (let i = actualStart; i < actualStart + actualDeleteCount && i < len; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY) {
        removed.push(slot as T)
        this._denseLength--
        this._stats.removes++
        this._stats.gaps++
      }
      this.slots[i] = EMPTY
    }
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const targetIndex = actualStart + i
        if (targetIndex >= this._capacity) {
          this.grow(targetIndex + 1)
        }
        const wasEmpty = this.slots[targetIndex] === EMPTY
        this.slots[targetIndex] = items[i]!
        if (wasEmpty) {
          this._denseLength++
        }
      }
      const newLength = actualStart + items.length
      if (newLength > this._length) {
        this._length = newLength
      }
      this.updateMaxDense()
    }
    this.trimLength()
    return removed
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._length; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY) {
        result.push(slot as T)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._length; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY) {
        callback(slot as T, i)
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._length; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY) {
        yield slot as T
      }
    }
  }

  map<U>(callback: (value: T, index: number) => U): U[] {
    const result: U[] = []
    for (let i = 0; i < this._length; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY) {
        result.push(callback(slot as T, i))
      }
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): T[] {
    const result: T[] = []
    for (let i = 0; i < this._length; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY && predicate(slot as T, i)) {
        result.push(slot as T)
      }
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initial: U): U {
    let acc = initial
    for (let i = 0; i < this._length; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY) {
        acc = callback(acc, slot as T, i)
      }
    }
    return acc
  }

  getStatistics(): HashArrayStatistics {
    return { ...this._stats }
  }

  toJSON(): HashArrayJSON<T> {
    const serializedSlots: Array<{ index: number; value: T }> = []
    for (let i = 0; i < this._length; i++) {
      const slot = this.slots[i]
      if (slot !== EMPTY) {
        serializedSlots.push({ index: i, value: slot as T })
      }
    }
    return {
      slots: serializedSlots,
      capacity: this._capacity,
      length: this._length,
      denseLength: this._denseLength,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<T>(data: HashArrayJSON<T>): HashArray<T> {
    const ha = new HashArray<T>({ initialCapacity: data.capacity })
    ha._length = data.length
    ha._denseLength = data.denseLength
    ha._stats = { ...data.statistics }
    for (let i = 0; i < ha._capacity; i++) {
      ha.slots[i] = EMPTY
    }
    for (const entry of data.slots) {
      if (entry.index < ha._capacity) {
        ha.slots[entry.index] = entry.value
      }
    }
    return ha
  }

  private grow(newCapacity: number): void {
    const oldSlots = this.slots
    this._capacity = newCapacity
    this.slots = new Array<Slot<T>>(newCapacity)
    for (let i = 0; i < newCapacity; i++) {
      this.slots[i] = EMPTY
    }
    for (let i = 0; i < oldSlots.length; i++) {
      this.slots[i] = oldSlots[i]!
    }
  }

  private trimLength(): void {
    while (this._length > 0 && this.slots[this._length - 1] === EMPTY) {
      this._length--
    }
  }

  private updateMaxDense(): void {
    if (this._denseLength > this._stats.maxDenseLength) {
      this._stats.maxDenseLength = this._denseLength
    }
  }
}

export { DEFAULT_HASH_ARRAY_OPTIONS } from './types.js'
export type { HashArrayOptions, HashArrayJSON, HashArrayStatistics } from './types.js'
