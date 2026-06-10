import type { BlockQueueOptions } from './types.js'

export class BlockQueue<T> {
  private queue: T[] = []
  private blockSize: number
  private capacity: number | undefined

  constructor(blockSize: number, options?: BlockQueueOptions) {
    if (blockSize < 1) {
      throw new RangeError('blockSize must be at least 1')
    }
    if (options?.capacity !== undefined && options.capacity < 1) {
      throw new RangeError('capacity must be at least 1')
    }
    this.blockSize = blockSize
    this.capacity = options?.capacity
  }

  get size(): number {
    return this.queue.length
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }

  isFull(): boolean {
    if (this.capacity === undefined) return false
    return this.queue.length >= this.capacity
  }

  enqueue(element: T): void {
    if (this.capacity !== undefined && this.queue.length >= this.capacity) {
      throw new RangeError('queue is full')
    }
    this.queue.push(element)
  }

  dequeueBlock(): T[] {
    if (this.queue.length === 0) return []
    const count = Math.min(this.blockSize, this.queue.length)
    return this.queue.splice(0, count)
  }

  peek(): T | undefined {
    if (this.queue.length === 0) return undefined
    return this.queue[0]
  }

  peekBlock(): T[] {
    const count = Math.min(this.blockSize, this.queue.length)
    return this.queue.slice(0, count)
  }

  clear(): void {
    this.queue.length = 0
  }

  toArray(): T[] {
    return [...this.queue]
  }

  blockCount(): number {
    if (this.queue.length === 0) return 0
    return Math.ceil(this.queue.length / this.blockSize)
  }

  currentBlockSize(): number {
    if (this.queue.length === 0) return 0
    const fullBlocks = Math.floor(this.queue.length / this.blockSize)
    const remainder = this.queue.length % this.blockSize
    if (remainder === 0 && fullBlocks > 0) {
      return this.blockSize
    }
    return remainder
  }

  remainingCapacity(): number {
    if (this.capacity === undefined) return Infinity
    return Math.max(0, this.capacity - this.queue.length)
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.queue.length; i++) {
      yield this.queue[i]!
    }
  }

  static from<T>(arr: T[], blockSize: number, options?: BlockQueueOptions): BlockQueue<T> {
    const q = new BlockQueue<T>(blockSize, options)
    for (const item of arr) {
      q.enqueue(item)
    }
    return q
  }

  toString(): string {
    return `${BlockQueue}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }


  toJSON() {
    return { type: 'BlockQueue', size: this.size, items: this.toArray() }
  }

  map<R>(fn: (item: T) => R): R[] {
    return this.toArray().map(fn)
  }

  filter(fn: (item: T) => boolean): T[] {
    return this.toArray().filter(fn)
  }

  reduce<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduce(fn, initial)
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.queue.every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.queue.some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.queue.find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.queue.findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.queue.includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.queue
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.queue.join(separator)
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
    const arr = this.queue
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.queue
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.queue.slice(0, n)
  }

  skip(n: number): T[] {
    return this.queue.slice(n)
  }


  tap(fn: (collection: BlockQueue<T>) => void): BlockQueue<T> {
    fn(this)
    return this
  }

  equals(other: BlockQueue<T>): boolean {
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



  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.queue.lastIndexOf(item)
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

  difference(other: Iterable<T>): T[] {
    const exclude = new Set(other)
    return this.toArray().filter(item => !exclude.has(item))
  }

  union(other: Iterable<T>): T[] {
    const set = new Set<T>([...this.toArray(), ...other])
    return [...set]
  }

  pluck<K extends keyof T>(key: K): T[K][] {
    return this.toArray().map(item => item[key])
  }

  nth(n: number): T | undefined {
    return this.at(n - 1)
  }
}
