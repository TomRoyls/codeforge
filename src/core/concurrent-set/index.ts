import type { ConcurrentSetOptions, HashFunction, Comparator, LockState } from './types.js'

type PendingOp = () => void

export class ConcurrentSet<T> {
  private data: Map<string, T> = new Map()
  private _size = 0
  private hash: HashFunction<T>
  private compare: Comparator<T>
  private lockState: LockState = 'unlocked'
  private pendingOps: PendingOp[] = []
  private operationQueue: PendingOp[] = []
  private queueProcessing = false
  private _opHead = 0

  constructor(options?: ConcurrentSetOptions<T>, initialValues?: Iterable<T>) {
    this.hash = options?.hash ?? ((v: T) => String(v))
    this.compare =
      options?.compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
    if (initialValues) {
      for (const v of initialValues) {
        this.addInternal(v)
      }
    }
  }

  private addInternal(value: T): boolean {
    const key = this.hash(value)
    if (this.data.has(key)) {
      return false
    }
    this.data.set(key, value)
    this._size++
    return true
  }

  private deleteInternal(value: T): boolean {
    const key = this.hash(value)
    if (!this.data.has(key)) {
      return false
    }
    this.data.delete(key)
    this._size--
    return true
  }

  private enqueue(op: PendingOp): void {
    this.operationQueue.push(op)
    if (!this.queueProcessing) {
      this.drainQueue()
    }
  }

  private drainQueue(): void {
    this.queueProcessing = true
    while (this.operationQueue.length - this._opHead > 0) {
      const op = this.operationQueue[this._opHead++]!
      op()
    }
    this._compactOps()
    this.queueProcessing = false
  }

  private _compactOps(): void {
    if (this._opHead > this.operationQueue.length / 2) {
      this.operationQueue = this.operationQueue.slice(this._opHead)
      this._opHead = 0
    }
  }

  private checkIsLocked(): boolean {
    return this.lockState === 'locked'
  }

  add(value: T): boolean {
    if (this.checkIsLocked()) {
      let result = false
      this.enqueue(() => {
        result = this.addInternal(value)
      })
      return result
    }
    return this.addInternal(value)
  }

  delete(value: T): boolean {
    if (this.checkIsLocked()) {
      let result = false
      this.enqueue(() => {
        result = this.deleteInternal(value)
      })
      return result
    }
    return this.deleteInternal(value)
  }

  has(value: T): boolean {
    const key = this.hash(value)
    return this.data.has(key)
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    if (this.checkIsLocked()) {
      this.enqueue(() => {
        this.data.clear()
        this._size = 0
      })
      return
    }
    this.data.clear()
    this._size = 0
  }

  values(): T[] {
    return Array.from(this.data.values())
  }

  toArray(): T[] {
    return this.values()
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (const value of this.data.values()) {
      callback(value, idx)
      idx++
    }
  }

  [Symbol.iterator](): Iterator<T> {
    const arr = this.values()
    let idx = 0
    return {
      next: () => {
        if (idx < arr.length) {
          const value = arr[idx]!
          idx++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<T>
      },
    }
  }

  union(other: ConcurrentSet<T>): ConcurrentSet<T> {
    const result = new ConcurrentSet<T>(
      { hash: this.hash, compare: this.compare },
      this.values(),
    )
    for (const v of other) {
      result.add(v)
    }
    return result
  }

  intersection(other: ConcurrentSet<T>): ConcurrentSet<T> {
    const result = new ConcurrentSet<T>({
      hash: this.hash,
      compare: this.compare,
    })
    for (const v of this) {
      if (other.has(v)) {
        result.add(v)
      }
    }
    return result
  }

  difference(other: ConcurrentSet<T>): ConcurrentSet<T> {
    const result = new ConcurrentSet<T>({
      hash: this.hash,
      compare: this.compare,
    })
    for (const v of this) {
      if (!other.has(v)) {
        result.add(v)
      }
    }
    return result
  }

  symmetricDifference(other: ConcurrentSet<T>): ConcurrentSet<T> {
    const result = new ConcurrentSet<T>({
      hash: this.hash,
      compare: this.compare,
    })
    for (const v of this) {
      if (!other.has(v)) {
        result.add(v)
      }
    }
    for (const v of other) {
      if (!this.has(v)) {
        result.add(v)
      }
    }
    return result
  }

  isSubsetOf(other: ConcurrentSet<T>): boolean {
    if (this._size > other.size) return false
    for (const v of this) {
      if (!other.has(v)) return false
    }
    return true
  }

  isSupersetOf(other: ConcurrentSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: ConcurrentSet<T>): boolean {
    if (this._size !== other.size) return false
    for (const v of this) {
      if (!other.has(v)) return false
    }
    return true
  }

  clone(): ConcurrentSet<T> {
    return new ConcurrentSet<T>(
      { hash: this.hash, compare: this.compare },
      this.values(),
    )
  }

  static fromArray<T>(
    items: T[],
    options?: ConcurrentSetOptions<T>,
  ): ConcurrentSet<T> {
    return new ConcurrentSet<T>(options, items)
  }

  snapshot(): T[] {
    return Array.from(this.data.values())
  }

  lock(): void {
    this.lockState = 'locked'
  }

  unlock(): void {
    this.lockState = 'unlocked'
    this.pendingOps.forEach((op) => op())
    this.pendingOps = []
  }

  tryLock(): boolean {
    if (this.lockState === 'locked') return false
    this.lockState = 'locked'
    return true
  }

  withLock<R>(callback: () => R): R {
    this.lock()
    try {
      return callback()
    } finally {
      this.unlock()
    }
  }

  transaction<R>(callback: (set: ConcurrentSet<T>) => R): R {
    const backup = new Map(this.data)
    const backupSize = this._size
    try {
      this.lock()
      const result = callback(this)
      this.unlock()
      return result
    } catch (e) {
      this.data = backup
      this._size = backupSize
      this.lockState = 'unlocked'
      this.pendingOps = []
      throw e
    }
  }

  toString(): string {
    return `${ConcurrentSet}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'ConcurrentSet', size: this.size, items: this.toArray() }
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

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
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

  tap(fn: (collection: ConcurrentSet<T>) => void): ConcurrentSet<T> {
    fn(this)
    return this
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

  static empty<T>(): ConcurrentSet<T> {
    return new ConcurrentSet<T>()
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }
}
