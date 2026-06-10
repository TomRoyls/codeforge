import type { CountedQueueOptions } from './types.js'

export class CountedQueue<T> {
  private queue: T[]
  private frequencies: Map<T, number>
  private head: number
  private tail: number

  constructor(options?: CountedQueueOptions) {
    const capacity = options?.initialCapacity ?? 16
    if (capacity < 1) {
      throw new RangeError('capacity must be at least 1')
    }
    this.queue = new Array(capacity)
    this.frequencies = new Map()
    this.head = 0
    this.tail = 0
  }

  private get capacity(): number {
    return this.queue.length
  }

  get size(): number {
    if (this.tail >= this.head) {
      return this.tail - this.head
    }
    return this.capacity - this.head + this.tail
  }

  isEmpty(): boolean {
    return this.head === this.tail
  }

  enqueue(element: T): void {
    if (this.size === this.capacity - 1) {
      this.resize()
    }
    this.queue[this.tail] = element
    this.tail = (this.tail + 1) % this.capacity

    const currentFreq = this.frequencies.get(element) ?? 0
    this.frequencies.set(element, currentFreq + 1)
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined
    }

    const element = this.queue[this.head]
    this.queue[this.head] = undefined as T
    this.head = (this.head + 1) % this.capacity

    if (element !== undefined) {
      const freq = this.frequencies.get(element)!
      if (freq === 1) {
        this.frequencies.delete(element)
      } else {
        this.frequencies.set(element, freq - 1)
      }
    }

    return element
  }

  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined
    }
    return this.queue[this.head]
  }

  peekBack(): T | undefined {
    if (this.isEmpty()) {
      return undefined
    }
    const index = (this.tail - 1 + this.capacity) % this.capacity
    return this.queue[index]
  }

  clear(): void {
    this.head = 0
    this.tail = 0
    this.queue.fill(undefined as T)
    this.frequencies.clear()
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.size; i++) {
      const index = (this.head + i) % this.capacity
      const element = this.queue[index]
      if (element !== undefined) {
        result.push(element)
      }
    }
    return result
  }

  contains(element: T): boolean {
    return this.frequencies.has(element)
  }

  frequency(element: T): number {
    return this.frequencies.get(element) ?? 0
  }

  get uniqueCount(): number {
    return this.frequencies.size
  }

    mostFrequent(): T[] {
      if (this.isEmpty()) {
        return []
      }

      let maxFreq = 0
      for (const [, freq] of this.frequencies) {
        if (freq > maxFreq) {
          maxFreq = freq
        }
      }

      const result: T[] = []
      const entries = Array.from(this.frequencies)
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]!
        const element = entry[0]!
        const freq = entry[1]!
        if (freq === maxFreq) {
          result.push(element)
        }
      }

      return result.sort((a, b) => {
        const indexA = this.indexOf(a)
        const indexB = this.indexOf(b)
        return (indexA ?? 0) - (indexB ?? 0)
      })
    }

    leastFrequent(): T[] {
      if (this.isEmpty()) {
        return []
      }

      let minFreq = Infinity
      for (const [, freq] of this.frequencies) {
        if (freq < minFreq) {
          minFreq = freq
        }
      }

      const result: T[] = []
      const entries = Array.from(this.frequencies)
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]!
        const element = entry[0]!
        const freq = entry[1]!
        if (freq === minFreq) {
          result.push(element)
        }
      }

      return result.sort((a, b) => {
        const indexA = this.indexOf(a)
        const indexB = this.indexOf(b)
        return (indexA ?? 0) - (indexB ?? 0)
      })
    }

  private indexOf(element: T): number | undefined {
    for (let i = 0; i < this.size; i++) {
      const index = (this.head + i) % this.capacity
      if (this.queue[index] === element) {
        return i
      }
    }
    return undefined
  }

  private resize(): void {
    const oldSize = this.size
    const newCapacity = this.capacity * 2
    const newQueue: T[] = new Array(newCapacity)
    for (let i = 0; i < oldSize; i++) {
      const index = (this.head + i) % this.capacity
      newQueue[i] = this.queue[index]!
    }
    this.queue = newQueue
    this.head = 0
    this.tail = oldSize
  }

  static from<T>(arr: T[], options?: CountedQueueOptions): CountedQueue<T> {
    const q = new CountedQueue<T>(options)
    for (const item of arr) {
      q.enqueue(item)
    }
    return q
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
    return `${CountedQueue}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  clone(): CountedQueue<T> {
    return CountedQueue.from(this.toArray())
  }

  toJSON() {
    return { type: 'CountedQueue', size: this.size, items: this.toArray() }
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

  tap(fn: (collection: CountedQueue<T>) => void): CountedQueue<T> {
    fn(this)
    return this
  }

  equals(other: CountedQueue<T>): boolean {
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

  static empty<T>(): CountedQueue<T> {
    return new CountedQueue<T>()
  }

  static of<T>(...items: T[]): CountedQueue<T> {
    return CountedQueue.from(items)
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }
}
