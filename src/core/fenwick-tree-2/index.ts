import type { BinaryOperation, ForEachCallback } from './types.js'

const defaultOp: BinaryOperation<number> = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  identity: 0,
}

export class FenwickTree2<T = number> {
  private tree: T[]
  private vals: T[]
  private _size: number
  private op: BinaryOperation<T>

  constructor(items?: T[], op?: BinaryOperation<T>) {
    this.op = (op ?? defaultOp) as BinaryOperation<T>
    this._size = 0
    this.vals = []
    this.tree = [this.op.identity]
    if (items !== undefined && items.length > 0) {
      this._size = items.length
      this.vals = items.slice()
      this.tree = new Array(this._size + 1).fill(undefined) as T[]
      this.tree[0] = this.op.identity
      for (let i = 1; i <= this._size; i++) {
        this.tree[i] = this.op.identity
      }
      for (let i = 0; i < this._size; i++) {
        let j = i + 1
        while (j <= this._size) {
          this.tree[j] = this.op.add(this.tree[j]!, items[i]!)
          j += j & -j
        }
      }
    }
  }

  private computePrefix(index: number): T {
    if (index < 0) return this.op.identity
    let result = this.op.identity
    let i = index + 1
    while (i > 0) {
      result = this.op.add(result, this.tree[i]!)
      i -= i & -i
    }
    return result
  }

  update(index: number, delta: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const oldVal = this.vals[index]!
    this.vals[index] = this.op.add(oldVal, delta)
    let i = index + 1
    while (i <= this._size) {
      this.tree[i] = this.op.add(this.tree[i]!, delta)
      i += i & -i
    }
  }

  query(index: number): T {
    if (index < 0) {
      throw new RangeError(`Index ${index} must be non-negative`)
    }
    if (index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.computePrefix(index)
  }

  rangeQuery(from: number, to: number): T {
    if (from < 0 || to < 0 || from >= this._size || to >= this._size) {
      throw new RangeError(`Range [${from}, ${to}] out of bounds [0, ${this._size})`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    if (from === 0) {
      return this.computePrefix(to)
    }
    return this.op.subtract(this.computePrefix(to), this.computePrefix(from - 1))
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const delta = this.op.subtract(value, this.vals[index]!)
    this.vals[index] = value
    let i = index + 1
    while (i <= this._size) {
      this.tree[i] = this.op.add(this.tree[i]!, delta)
      i += i & -i
    }
  }

  get(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.vals[index]!
  }

  push(item: T): void {
    this.vals.push(item)
    this._size++
    this.tree.push(this.op.identity)
    const n = this._size
    const lsb = n & -n
    const rangeStart0 = n - lsb
    let prevSum = this.op.identity
    if (n > 1) {
      const prefixEnd = this.computePrefix(n - 2)
      const prefixBefore = rangeStart0 > 0 ? this.computePrefix(rangeStart0 - 1) : this.op.identity
      prevSum = this.op.subtract(prefixEnd, prefixBefore)
    }
    this.tree[n] = this.op.add(prevSum, item)
  }

  pop(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot pop from empty tree')
    }
    const value = this.vals[this._size - 1]!
    this.tree.pop()
    this.vals.pop()
    this._size--
    return value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.tree = [this.op.identity]
    this.vals = []
    this._size = 0
  }

  toArray(): T[] {
    return this.vals.slice()
  }

  clone(): FenwickTree2<T> {
    return new FenwickTree2<T>(this.vals, this.op)
  }

  static fromArray<U>(items: U[], op?: BinaryOperation<U>): FenwickTree2<U> {
    return new FenwickTree2<U>(items, op)
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.vals[i]!
    }
  }

  forEach(callback: ForEachCallback<T>): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.vals[i]!, i)
    }
  }

  toString(): string {
    return `${FenwickTree2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'FenwickTree2', size: this.size, items: this.toArray() }
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
}
