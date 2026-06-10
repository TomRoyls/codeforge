import type { MinMaxDequeOptions } from './types.js'

interface StackEntry<T> {
  value: T
  stackMin: T
  stackMax: T
}

export class MinMaxDeque<T> {
  private frontStack: StackEntry<T>[] = []
  private backStack: StackEntry<T>[] = []
  private _size = 0
  private cmp: (a: T, b: T) => number

  constructor(options?: MinMaxDequeOptions<T>) {
    this.cmp =
      options?.comparator ??
      ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private lesser(a: T, b: T): T {
    return this.cmp(a, b) <= 0 ? a : b
  }

  private greater(a: T, b: T): T {
    return this.cmp(a, b) >= 0 ? a : b
  }

  pushFront(item: T): void {
    const top = this.frontStack[this.frontStack.length - 1]
    this.frontStack.push({
      value: item,
      stackMin: top ? this.lesser(item, top.stackMin) : item,
      stackMax: top ? this.greater(item, top.stackMax) : item,
    })
    this._size++
  }

  pushBack(item: T): void {
    const top = this.backStack[this.backStack.length - 1]
    this.backStack.push({
      value: item,
      stackMin: top ? this.lesser(item, top.stackMin) : item,
      stackMax: top ? this.greater(item, top.stackMax) : item,
    })
    this._size++
  }

  private transferBackToFront(): void {
    while (this.backStack.length > 0) {
      const item = this.backStack.pop()!.value
      const top = this.frontStack[this.frontStack.length - 1]
      this.frontStack.push({
        value: item,
        stackMin: top ? this.lesser(item, top.stackMin) : item,
        stackMax: top ? this.greater(item, top.stackMax) : item,
      })
    }
  }

  private transferFrontToBack(): void {
    while (this.frontStack.length > 0) {
      const item = this.frontStack.pop()!.value
      const top = this.backStack[this.backStack.length - 1]
      this.backStack.push({
        value: item,
        stackMin: top ? this.lesser(item, top.stackMin) : item,
        stackMax: top ? this.greater(item, top.stackMax) : item,
      })
    }
  }

  popFront(): T {
    if (this._size === 0) {
      throw new Error('MinMaxDeque is empty')
    }
    if (this.frontStack.length === 0) {
      this.transferBackToFront()
    }
    this._size--
    return this.frontStack.pop()!.value
  }

  popBack(): T {
    if (this._size === 0) {
      throw new Error('MinMaxDeque is empty')
    }
    if (this.backStack.length === 0) {
      this.transferFrontToBack()
    }
    this._size--
    return this.backStack.pop()!.value
  }

  peekFront(): T {
    if (this._size === 0) {
      throw new Error('MinMaxDeque is empty')
    }
    if (this.frontStack.length > 0) {
      return this.frontStack[this.frontStack.length - 1]!.value
    }
    return this.backStack[0]!.value
  }

  peekBack(): T {
    if (this._size === 0) {
      throw new Error('MinMaxDeque is empty')
    }
    if (this.backStack.length > 0) {
      return this.backStack[this.backStack.length - 1]!.value
    }
    return this.frontStack[0]!.value
  }

  min(): T {
    if (this._size === 0) {
      throw new Error('MinMaxDeque is empty')
    }
    const frontMin =
      this.frontStack.length > 0
        ? this.frontStack[this.frontStack.length - 1]!.stackMin
        : undefined
    const backMin =
      this.backStack.length > 0
        ? this.backStack[this.backStack.length - 1]!.stackMin
        : undefined
    if (frontMin !== undefined && backMin !== undefined) {
      return this.lesser(frontMin, backMin)
    }
    return (frontMin ?? backMin)!
  }

  max(): T {
    if (this._size === 0) {
      throw new Error('MinMaxDeque is empty')
    }
    const frontMax =
      this.frontStack.length > 0
        ? this.frontStack[this.frontStack.length - 1]!.stackMax
        : undefined
    const backMax =
      this.backStack.length > 0
        ? this.backStack[this.backStack.length - 1]!.stackMax
        : undefined
    if (frontMax !== undefined && backMax !== undefined) {
      return this.greater(frontMax, backMax)
    }
    return (frontMax ?? backMax)!
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.frontStack = []
    this.backStack = []
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = this.frontStack.length - 1; i >= 0; i--) {
      result.push(this.frontStack[i]!.value)
    }
    for (let i = 0; i < this.backStack.length; i++) {
      result.push(this.backStack[i]!.value)
    }
    return result
  }

  clone(): MinMaxDeque<T> {
    const result = new MinMaxDeque<T>({ comparator: this.cmp })
    result.frontStack = this.frontStack.map((e) => ({ ...e }))
    result.backStack = this.backStack.map((e) => ({ ...e }))
    result._size = this._size
    return result
  }

  forEach(callback: (item: T, index: number) => void): void {
    let idx = 0
    for (let i = this.frontStack.length - 1; i >= 0; i--) {
      callback(this.frontStack[i]!.value, idx++)
    }
    for (let i = 0; i < this.backStack.length; i++) {
      callback(this.backStack[i]!.value, idx++)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = this.frontStack.length - 1; i >= 0; i--) {
      yield this.frontStack[i]!.value
    }
    for (let i = 0; i < this.backStack.length; i++) {
      yield this.backStack[i]!.value
    }
  }

  static fromArray<U>(
    items: U[],
    options?: { comparator?: (a: U, b: U) => number },
  ): MinMaxDeque<U> {
    const deque = new MinMaxDeque<U>(options)
    for (const item of items) {
      deque.pushBack(item)
    }
    return deque
  }

  toString(): string {
    return `MinMaxDeque({ size: ${this._size} })`
  }

  toJSON() {
    return { type: 'MinMaxDeque', items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
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

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  equals(other: T[]): boolean {
    const a = this.toArray()
    if (a.length !== other.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== other[i]) return false
    }
    return true
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

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
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
}

export type { MinMaxDequeOptions } from './types.js'
