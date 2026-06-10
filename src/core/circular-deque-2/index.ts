/** Default initial capacity for the ring buffer */
const DEFAULT_CAPACITY = 8

/**
 * A high-performance circular deque implemented using a growable ring buffer.
 *
 * Supports O(1) amortized push/pop at both ends, random access by index,
 * and full iterator protocol compliance. The buffer doubles in capacity
 * when full, starting from a default of 8 elements.
 *
 * @typeParam T - The type of elements stored in the deque
 */
export class CircularDeque2<T = unknown> {
  private buffer: (T | undefined)[]
  private head = 0
  private tail = 0
  private _size = 0
  private _capacity: number

  /**
   * Create a new CircularDeque2.
   *
   * @param initialCapacity - Optional starting capacity (minimum 1, default 8).
   *                          The buffer will grow automatically when full.
   */
  constructor(initialCapacity?: number) {
    this._capacity = Math.max(1, initialCapacity ?? DEFAULT_CAPACITY)
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  /**
   * Double the internal buffer capacity and relocate existing elements
   * so they occupy positions [0, _size) in the new buffer.
   */
  private grow(): void {
    const newCapacity = this._capacity * 2
    const newBuffer = new Array<T | undefined>(newCapacity)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this._capacity]
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = this._size
    this._capacity = newCapacity
  }

  /**
   * Add a value to the front of the deque. O(1) amortized.
   *
   * @param value - The value to add
   */
  pushFront(value: T): void {
    if (this._size === this._capacity) {
      this.grow()
    }
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.buffer[this.head] = value
    this._size++
  }

  /**
   * Add a value to the back of the deque. O(1) amortized.
   *
   * @param value - The value to add
   */
  pushBack(value: T): void {
    if (this._size === this._capacity) {
      this.grow()
    }
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++
  }

  /**
   * Remove and return the value at the front of the deque. O(1).
   *
   * @returns The removed value, or `undefined` if the deque is empty
   */
  popFront(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    const value = this.buffer[this.head]!
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return value
  }

  /**
   * Remove and return the value at the back of the deque. O(1).
   *
   * @returns The removed value, or `undefined` if the deque is empty
   */
  popBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const value = this.buffer[this.tail]!
    this.buffer[this.tail] = undefined
    this._size--
    return value
  }

  /**
   * View the value at the front of the deque without removing it.
   *
   * @returns The front value, or `undefined` if the deque is empty
   */
  peekFront(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[this.head]!
  }

  /**
   * View the value at the back of the deque without removing it.
   *
   * @returns The back value, or `undefined` if the deque is empty
   */
  peekBack(): T | undefined {
    if (this._size === 0) {
      return undefined
    }
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]!
  }

  /**
   * Return the current number of elements in the deque.
   *
   * @returns The number of elements
   */
  size(): number {
    return this._size
  }

  /**
   * Check whether the deque is empty.
   *
   * @returns `true` if the deque contains no elements
   */
  isEmpty(): boolean {
    return this._size === 0
  }

  /**
   * Access an element by its logical index (0 = front).
   *
   * @param index - Zero-based index from the front of the deque
   * @returns The element at the given index, or `undefined` if out of bounds
   */
  at(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    return this.buffer[(this.head + index) % this._capacity]!
  }

  /**
   * Check whether the deque contains a specific value using strict equality (===).
   *
   * @param value - The value to search for
   * @returns `true` if the value is found
   */
  contains(value: T): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === value) {
        return true
      }
    }
    return false
  }

  /**
   * Convert the deque to a plain array (front to back order).
   *
   * @returns A new array containing all elements
   */
  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this._capacity]!)
    }
    return result
  }

  /**
   * Remove all elements from the deque. Does not shrink the buffer.
   */
  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[(this.head + i) % this._capacity] = undefined
    }
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  /**
   * Create a new CircularDeque2 from an array of items.
   *
   * @param items - The items to populate the deque with (front-to-back order)
   * @returns A new CircularDeque2 containing the given items
   */
  static fromArray<T>(items: T[]): CircularDeque2<T> {
    const deque = new CircularDeque2<T>(items.length > 0 ? items.length : undefined)
    for (const item of items) {
      deque.pushBack(item)
    }
    return deque
  }

  /**
   * Iterate over all elements from front to back.
   * Enables `for...of`, spread, and destructuring.
   */
  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.buffer[(this.head + i) % this._capacity]!
    }
  }

  /**
   * Invoke a callback for each element from front to back.
   *
   * @param callback - Function called with (value, index) for each element
   */
  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[(this.head + i) % this._capacity]!, i)
    }
  }

  toString(): string {
    return `${CircularDeque2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }


  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'CircularDeque2', items: this.toArray() }
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

  reverse(): T[] {
    return this.toArray().reverse()
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

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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


  tap(fn: (collection: CircularDeque2<T>) => void): CircularDeque2<T> {
    fn(this)
    return this
  }

  equals(other: CircularDeque2<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  zip<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: [T, U][] = []
    for (let i = 0; i < len; i++) {
      result.push([a[i]!, b[i]!])
    }
    return result
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  static empty<T>(): CircularDeque2<T> {
    return new CircularDeque2<T>()
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: Iterable<T>): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }


  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  filterMap<U>(fn: (item: T) => U | undefined): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      const mapped = fn(item)
      if (mapped !== undefined) {
        result.push(mapped)
      }
    }
    return result
  }

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
  }

  distinctBy<K>(keyFn: (item: T) => K): T[] {
    const seen = new Set<K>()
    const result: T[] = []
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(item)
      }
    }
    return result
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
  }

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }
}
