import type { ElementComparator, StackNode } from './types.js'

export class PersistentStack<T> {
  readonly version: number

  private readonly head: StackNode<T> | null
  private readonly _size: number
  private readonly _previous: PersistentStack<T> | null

  private constructor(
    head: StackNode<T> | null,
    stackSize: number,
    version: number,
    previous: PersistentStack<T> | null,
  ) {
    this.head = head
    this._size = stackSize
    this.version = version
    this._previous = previous
  }

  static empty<T>(): PersistentStack<T> {
    return new PersistentStack<T>(null, 0, 0, null)
  }

  push(value: T): PersistentStack<T> {
    const newNode: StackNode<T> = { value, next: this.head }
    return new PersistentStack<T>(newNode, this._size + 1, this.version + 1, this)
  }

  pop(): { stack: PersistentStack<T>; value: T | undefined } {
    if (this.head === null) {
      return { stack: this, value: undefined }
    }
    const poppedValue = this.head.value
    const newHead = this.head.next
    return {
      stack: new PersistentStack<T>(newHead, this._size - 1, this.version + 1, this),
      value: poppedValue,
    }
  }

  peek(): T | undefined {
    if (this.head === null) return undefined
    return this.head.value
  }

  bottom(): T | undefined {
    if (this.head === null) return undefined
    let current: StackNode<T> = this.head
    while (current.next !== null) {
      current = current.next
    }
    return current.value
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): T[] {
    const result: T[] = []
    let current: StackNode<T> | null = this.head
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  toString(): string {
    return `PersistentStack([${this.toArray().join(', ')}])`
  }

  map<U>(fn: (v: T) => U): PersistentStack<U> {
    const arr = this.toArray()
    let result = PersistentStack.empty<U>()
    for (let i = arr.length - 1; i >= 0; i--) {
      result = result.push(fn(arr[i]!))
    }
    return result
  }

  filter(fn: (v: T) => boolean): PersistentStack<T> {
    const arr = this.toArray()
    const filtered: T[] = []
    for (const item of arr) {
      if (fn(item)) {
        filtered.push(item)
      }
    }
    let result = PersistentStack.empty<T>()
    for (let i = filtered.length - 1; i >= 0; i--) {
      result = result.push(filtered[i]!)
    }
    return result
  }

  forEach(fn: (v: T) => void): void {
    let current: StackNode<T> | null = this.head
    while (current !== null) {
      fn(current.value)
      current = current.next
    }
  }

  reduce<U>(fn: (acc: U, v: T) => U, init: U): U {
    let acc = init
    let current: StackNode<T> | null = this.head
    while (current !== null) {
      acc = fn(acc, current.value)
      current = current.next
    }
    return acc
  }

  find(fn: (v: T) => boolean): T | undefined {
    let current: StackNode<T> | null = this.head
    while (current !== null) {
      if (fn(current.value)) return current.value
      current = current.next
    }
    return undefined
  }

  some(fn: (v: T) => boolean): boolean {
    let current: StackNode<T> | null = this.head
    while (current !== null) {
      if (fn(current.value)) return true
      current = current.next
    }
    return false
  }

  every(fn: (v: T) => boolean): boolean {
    let current: StackNode<T> | null = this.head
    while (current !== null) {
      if (!fn(current.value)) return false
      current = current.next
    }
    return true
  }

  includes(value: T, cmp?: (a: T, b: T) => boolean): boolean {
    const comparator: ElementComparator<T> = cmp ?? ((a: T, b: T) => a === b)
    let current: StackNode<T> | null = this.head
    while (current !== null) {
      if (comparator(current.value, value)) return true
      current = current.next
    }
    return false
  }

  equals(other: PersistentStack<T>, cmp?: (a: T, b: T) => boolean): boolean {
    if (this === other) return true
    if (this._size !== other._size) return false

    const comparator: ElementComparator<T> = cmp ?? ((a: T, b: T) => a === b)
    let a: StackNode<T> | null = this.head
    let b: StackNode<T> | null = other.head
    while (a !== null && b !== null) {
      if (!comparator(a.value, b.value)) return false
      a = a.next
      b = b.next
    }
    return true
  }

  reverse(): PersistentStack<T> {
    const arr = this.toArray()
    let result = PersistentStack.empty<T>()
    for (const item of arr) {
      result = result.push(item)
    }
    return result
  }

  concat(other: PersistentStack<T>): PersistentStack<T> {
    if (this._size === 0) return other
    if (other._size === 0) return this

    const thisArr = this.toArray()
    const otherArr = other.toArray()
    const combined = [...thisArr, ...otherArr]
    let result = PersistentStack.empty<T>()
    for (let i = combined.length - 1; i >= 0; i--) {
      result = result.push(combined[i]!)
    }
    return result
  }

  slice(start?: number, end?: number): PersistentStack<T> {
    const arr = this.toArray()
    const s = start ?? 0
    const e = end ?? arr.length
    const sliced = arr.slice(s, e)
    let result = PersistentStack.empty<T>()
    for (let i = sliced.length - 1; i >= 0; i--) {
      result = result.push(sliced[i]!)
    }
    return result
  }

  previous(): PersistentStack<T> | null {
    return this._previous
  }

  atVersion(v: number): PersistentStack<T> {
    if (v === this.version) return this
    if (v > this.version || v < 0) {
      return PersistentStack.empty<T>()
    }
    let current: PersistentStack<T> | null = this
    while (current !== null && current.version !== v) {
      current = current._previous
    }
    return current ?? PersistentStack.empty<T>()
  }

  history(): PersistentStack<T>[] {
    const result: PersistentStack<T>[] = []
    let current: PersistentStack<T> | null = this
    while (current !== null) {
      result.unshift(current)
      current = current._previous
    }
    return result
  }
}
