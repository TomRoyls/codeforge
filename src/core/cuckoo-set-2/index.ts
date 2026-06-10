const EMPTY = Symbol('EMPTY')

type Slot<T> = T | typeof EMPTY

const DEFAULT_CAPACITY = 16
const MIN_CAPACITY = 8
const MAX_EVICTION_STEPS = 100

function hash1<T>(value: T, capacity: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const x = (value >>> 0)
    const h = (x * 2654435761 + capacity) & 0x7fffffff
    return ((h % capacity) + capacity) % capacity
  }
  const str = String(value)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return (h >>> 0) % capacity
}

function hash2<T>(value: T, capacity: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const x = (value >>> 0)
    const h = (x * 907633485 + 2 * capacity) & 0x7fffffff
    return ((h % capacity) + capacity) % capacity
  }
  const str = String(value)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i) * 31) | 0
  }
  return (h >>> 0) % capacity
}

export class CuckooSet2<T> {
  private table1: Slot<T>[]
  private table2: Slot<T>[]
  private _capacity: number
  private _size: number

  constructor(capacity?: number) {
    this._capacity = Math.max(MIN_CAPACITY, capacity ?? DEFAULT_CAPACITY)
    this.table1 = new Array<Slot<T>>(this._capacity).fill(EMPTY)
    this.table2 = new Array<Slot<T>>(this._capacity).fill(EMPTY)
    this._size = 0
  }

  private findPosition(value: T): number {
    const pos1 = hash1(value, this._capacity)
    const pos2 = hash2(value, this._capacity)

    if (this.table1[pos1] !== EMPTY && this.table1[pos1] === value) {
      return pos1
    }
    if (this.table2[pos2] !== EMPTY && this.table2[pos2] === value) {
      return pos2 + this._capacity
    }
    return -1
  }

  private insertWithEviction(value: T, steps: number): boolean {
    if (steps > MAX_EVICTION_STEPS) {
      return false
    }

    const pos1 = hash1(value, this._capacity)
    const slot1 = this.table1[pos1]
    if (slot1 === EMPTY) {
      this.table1[pos1] = value
      return true
    }

    const pos2 = hash2(value, this._capacity)
    const slot2 = this.table2[pos2]
    if (slot2 === EMPTY) {
      this.table2[pos2] = value
      return true
    }

    const evicted = slot1 as T
    this.table1[pos1] = value

    const evictedPos2 = hash2(evicted, this._capacity)
    const evictedSlot2 = this.table2[evictedPos2]
    if (evictedSlot2 === EMPTY) {
      this.table2[evictedPos2] = evicted
      return true
    }

    const evictedFromTable2 = evictedSlot2 as T
    this.table2[evictedPos2] = evicted

    return this.insertWithEviction(evictedFromTable2, steps + 1)
  }

  add(value: T): boolean {
    if (this.findPosition(value) >= 0) {
      return false
    }

    const loadFactor = this._size / (2 * this._capacity)
    if (loadFactor >= 0.6) {
      this.resize()
    }

    if (this.insertWithEviction(value, 0)) {
      this._size++
      return true
    }

    this.resize()
    if (this.insertWithEviction(value, 0)) {
      this._size++
      return true
    }
    return false
  }

  has(value: T): boolean {
    return this.findPosition(value) >= 0
  }

  delete(value: T): boolean {
    const pos = this.findPosition(value)
    if (pos < 0) {
      return false
    }

    if (pos < this._capacity) {
      this.table1[pos] = EMPTY
    } else {
      this.table2[pos - this._capacity] = EMPTY
    }

    this._size--

    if (this._size < this._capacity / 2 && this._capacity > MIN_CAPACITY) {
      this.resizeInternal(Math.max(MIN_CAPACITY, this._capacity / 2))
    }

    return true
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.table1.fill(EMPTY)
    this.table2.fill(EMPTY)
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []

    for (let i = 0; i < this._capacity; i++) {
      const slot1 = this.table1[i]!
      if (slot1 !== EMPTY) {
        result.push(slot1 as T)
      }
    }

    for (let i = 0; i < this._capacity; i++) {
      const slot2 = this.table2[i]!
      if (slot2 !== EMPTY) {
        result.push(slot2 as T)
      }
    }

    return result
  }

  forEach(callback: (value: T) => void): void {
    for (let i = 0; i < this._capacity; i++) {
      const slot1 = this.table1[i]!
      if (slot1 !== EMPTY) {
        callback(slot1 as T)
      }
    }

    for (let i = 0; i < this._capacity; i++) {
      const slot2 = this.table2[i]!
      if (slot2 !== EMPTY) {
        callback(slot2 as T)
      }
    }
  }

  resize(newCapacity?: number): void {
    const cap = newCapacity ?? this._capacity * 2
    this.resizeInternal(cap)
  }

  private resizeInternal(newCapacity: number): void {
    const oldTable1 = this.table1
    const oldTable2 = this.table2
    const oldCapacity = this._capacity

    this._capacity = Math.max(MIN_CAPACITY, newCapacity)
    this.table1 = new Array<Slot<T>>(this._capacity).fill(EMPTY)
    this.table2 = new Array<Slot<T>>(this._capacity).fill(EMPTY)
    this._size = 0

    for (let i = 0; i < oldCapacity; i++) {
      const slot1 = oldTable1[i]!
      if (slot1 !== EMPTY) {
        if (this.insertWithEviction(slot1 as T, 0)) {
          this._size++
        }
      }
    }

    for (let i = 0; i < oldCapacity; i++) {
      const slot2 = oldTable2[i]!
      if (slot2 !== EMPTY) {
        if (this.insertWithEviction(slot2 as T, 0)) {
          this._size++
        }
      }
    }
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `${CuckooSet2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'CuckooSet2', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
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

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
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

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
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

  clone(): CuckooSet2<T> {
    const c = new CuckooSet2<T>()
    for (const item of this.toArray()) {
      c.add(item)
    }
    return c
  }

  tap(fn: (collection: CuckooSet2<T>) => void): CuckooSet2<T> {
    fn(this)
    return this
  }

  equals(other: CuckooSet2<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  static empty<T>(): CuckooSet2<T> {
    return new CuckooSet2<T>()
  }

  static from<T>(items: T[]): CuckooSet2<T> {
    const instance = new CuckooSet2<T>()
    for (const item of items) {
      instance.add(item)
    }
    return instance
  }

  static of<T>(...items: T[]): CuckooSet2<T> {
    return CuckooSet2.from(items)
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }
}
