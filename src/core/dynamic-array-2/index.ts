import type { DynamicArrayOptions, GrowthStrategy, EqualityComparator } from './types.js'

export class DynamicArray<T> {
  private buffer: (T | undefined)[]
  private _size = 0
  private _capacity: number
  private _growthFactor: number
  private _growthStrategy: GrowthStrategy
  private _fibA = 1
  private _fibB = 1
  private _equals: EqualityComparator<T>

  constructor(options?: DynamicArrayOptions<T>) {
    this._capacity = Math.max(0, options?.initialCapacity ?? 8)
    this._growthFactor = options?.growthFactor ?? 2
    this._growthStrategy = options?.growthStrategy ?? 'geometric'
    this._equals = options?.equals ?? ((a: T, b: T) => a === b)
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  private computeNewCapacity(): number {
    switch (this._growthStrategy) {
      case 'geometric':
        return Math.max(1, Math.ceil(this._capacity * this._growthFactor))
      case 'fixed': {
        const inc = Math.max(1, Math.floor(this._growthFactor))
        return this._capacity + inc
      }
      case 'linear': {
        const inc2 = Math.max(1, Math.floor(this._growthFactor))
        return this._capacity + inc2
      }
      case 'fibonacci': {
        const next = this._fibA + this._fibB
        this._fibA = this._fibB
        this._fibB = next
        return this._capacity + Math.max(1, next)
      }
    }
  }

  private grow(): void {
    const newCap = this.computeNewCapacity()
    this._capacity = newCap
    const newBuffer = new Array<T | undefined>(this._capacity)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[i]
    }
    this.buffer = newBuffer
  }

  push(value: T): void {
    if (this._size >= this._capacity) {
      this.grow()
    }
    this.buffer[this._size] = value
    this._size++
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this._size--
    const val = this.buffer[this._size]
    this.buffer[this._size] = undefined
    return val
  }

  shift(): T | undefined {
    if (this._size === 0) return undefined
    const val = this.buffer[0]
    for (let i = 0; i < this._size - 1; i++) {
      this.buffer[i] = this.buffer[i + 1]
    }
    this._size--
    this.buffer[this._size] = undefined
    return val
  }

  unshift(value: T): void {
    if (this._size >= this._capacity) {
      this.grow()
    }
    for (let i = this._size; i > 0; i--) {
      this.buffer[i] = this.buffer[i - 1]
    }
    this.buffer[0] = value
    this._size++
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.buffer[index]!
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) return
    this.buffer[index] = value
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._size) return
    if (this._size >= this._capacity) {
      this.grow()
    }
    for (let i = this._size; i > index; i--) {
      this.buffer[i] = this.buffer[i - 1]
    }
    this.buffer[index] = value
    this._size++
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const val = this.buffer[index]!
    for (let i = index; i < this._size - 1; i++) {
      this.buffer[i] = this.buffer[i + 1]
    }
    this._size--
    this.buffer[this._size] = undefined
    return val
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this._capacity
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[i] = undefined
    }
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[i]!)
    }
    return result
  }

  fromArray(arr: T[]): void {
    this.clear()
    for (const item of arr) {
      this.push(item)
    }
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[i]!, i)
    }
  }

  map<U>(callback: (value: T, index: number) => U): DynamicArray<U> {
    const result = new DynamicArray<U>({ initialCapacity: this._size })
    for (let i = 0; i < this._size; i++) {
      result.push(callback(this.buffer[i]!, i))
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): DynamicArray<T> {
    const result = new DynamicArray<T>()
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[i]!, i)) {
        result.push(this.buffer[i]!)
      }
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this._size; i++) {
      acc = callback(acc, this.buffer[i]!, i)
    }
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[i]!, i)) {
        return this.buffer[i]!
      }
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[i]!, i)) {
        return i
      }
    }
    return -1
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this._equals(this.buffer[i]!, value)) {
        return i
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  slice(start?: number, end?: number): DynamicArray<T> {
    const s = start ?? 0
    const e = end ?? this._size
    const lo = Math.max(0, s < 0 ? this._size + s : s)
    const hi = Math.min(this._size, e < 0 ? this._size + e : e)
    const result = new DynamicArray<T>({ initialCapacity: Math.max(0, hi - lo) })
    for (let i = lo; i < hi; i++) {
      result.push(this.buffer[i]!)
    }
    return result
  }

  concat(other: DynamicArray<T>): DynamicArray<T> {
    const totalSize = this._size + other.size
    const result = new DynamicArray<T>({ initialCapacity: totalSize })
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[i]!)
    }
    for (let i = 0; i < other.size; i++) {
      const val = other.get(i)
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  splice(start: number, deleteCount?: number, ...items: T[]): DynamicArray<T> {
    const s = start < 0 ? Math.max(0, this._size + start) : Math.min(start, this._size)
    const dc = deleteCount ?? this._size - s
    const actualDelete = Math.min(dc, this._size - s)

    const removed = new DynamicArray<T>({ initialCapacity: actualDelete })
    for (let i = 0; i < actualDelete; i++) {
      removed.push(this.buffer[s + i]!)
    }

    const tail: T[] = []
    for (let i = s + actualDelete; i < this._size; i++) {
      tail.push(this.buffer[i]!)
    }

    this._size = s
    for (const item of items) {
      this.push(item)
    }
    for (const t of tail) {
      this.push(t)
    }

    return removed
  }

  join(separator?: string): string {
    if (this._size === 0) return ''
    const sep = separator ?? ','
    let result = String(this.buffer[0])
    for (let i = 1; i < this._size; i++) {
      result += sep + String(this.buffer[i])
    }
    return result
  }

  toString(): string {
    return this.join(',')
  }

  reverse(): void {
    let lo = 0
    let hi = this._size - 1
    while (lo < hi) {
      const tmp = this.buffer[lo]
      this.buffer[lo] = this.buffer[hi]
      this.buffer[hi] = tmp
      lo++
      hi--
    }
  }

  sort(compare?: (a: T, b: T) => number): void {
    if (this._size <= 1) return
    const arr = this.toArray()
    if (compare) {
      arr.sort(compare)
    } else {
      arr.sort()
    }
    for (let i = 0; i < arr.length; i++) {
      this.buffer[i] = arr[i]!
    }
  }

  clone(): DynamicArray<T> {
    const result = new DynamicArray<T>({
      initialCapacity: this._capacity,
      growthFactor: this._growthFactor,
      growthStrategy: this._growthStrategy,
      equals: this._equals,
    })
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[i]!)
    }
    return result
  }

  equals(other: DynamicArray<T>): boolean {
    if (this._size !== other.size) return false
    for (let i = 0; i < this._size; i++) {
      if (!this._equals(this.buffer[i]!, other.get(i)!)) {
        return false
      }
    }
    return true
  }

  contains(value: T): boolean {
    return this.includes(value)
  }

  get first(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[0]!
  }

  get last(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this._size - 1]!
  }

  resize(capacity: number): void {
    if (capacity < 0) return
    if (capacity < this._size) {
      for (let i = capacity; i < this._size; i++) {
        this.buffer[i] = undefined
      }
      this._size = capacity
    }
    this._capacity = capacity
    const newBuffer = new Array<T | undefined>(this._capacity)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[i]
    }
    this.buffer = newBuffer
  }

  trimToSize(): void {
    this.resize(this._size)
  }

  ensureCapacity(minCapacity: number): void {
    if (this._capacity >= minCapacity) return
    this.resize(minCapacity)
  }

  compact(): void {
    this.trimToSize()
  }

  get growthFactor(): number {
    return this._growthFactor
  }

  [Symbol.iterator](): Iterator<T> {
    let idx = 0
    return {
      next: () => {
        if (idx < this._size) {
          const value = this.buffer[idx]!
          idx++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<T>
      },
    }
  }

  static from<T>(items: Iterable<T>, options?: DynamicArrayOptions<T>): DynamicArray<T> {
    const arr = new DynamicArray<T>(options)
    for (const item of items) {
      arr.push(item)
    }
    return arr
  }

  static of<T>(...items: T[]): DynamicArray<T> {
    return DynamicArray.from(items)
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'DynamicArray', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }
}
