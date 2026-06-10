import type { Snapshot } from './types.js'

export class SnapArray<T> {
  private readonly data: readonly T[]

  constructor(arr?: T[]) {
    this.data = arr ? [...arr] : []
  }

  get(index: number): T {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    return this.data[index]!
  }

  set(index: number, value: T): SnapArray<T> {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const newData = [...this.data]
    newData[index] = value
    return new SnapArray(newData)
  }

  push(value: T): SnapArray<T> {
    return new SnapArray([...this.data, value])
  }

  pop(): [SnapArray<T>, T] {
    if (this.data.length === 0) {
      throw new RangeError('Cannot pop from empty array')
    }
    const popped = this.data[this.data.length - 1]!
    const newData = this.data.slice(0, -1)
    return [new SnapArray(newData), popped]
  }

  insert(index: number, value: T): SnapArray<T> {
    if (index < 0 || index > this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length}]`)
    }
    const newData = [...this.data.slice(0, index), value, ...this.data.slice(index)]
    return new SnapArray(newData)
  }

  remove(index: number): SnapArray<T> {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const newData = [...this.data.slice(0, index), ...this.data.slice(index + 1)]
    return new SnapArray(newData)
  }

  get length(): number {
    return this.data.length
  }

  get isEmpty(): boolean {
    return this.data.length === 0
  }

  toArray(): T[] {
    return [...this.data]
  }

  clone(): SnapArray<T> {
    return new SnapArray([...this.data])
  }

  snapshot(): Snapshot<T> {
    return { data: this.data }
  }

  restore(snap: Snapshot<T>): SnapArray<T> {
    return new SnapArray([...snap.data])
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.data.length; i++) {
      callback(this.data[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.data.length; i++) {
      yield this.data[i]!
    }
  }

  map<U>(fn: (value: T, index: number) => U): SnapArray<U> {
    const result: U[] = []
    for (let i = 0; i < this.data.length; i++) {
      result.push(fn(this.data[i]!, i))
    }
    return new SnapArray(result)
  }

  filter(predicate: (value: T, index: number) => boolean): SnapArray<T> {
    const result: T[] = []
    for (let i = 0; i < this.data.length; i++) {
      if (predicate(this.data[i]!, i)) {
        result.push(this.data[i]!)
      }
    }
    return new SnapArray(result)
  }

  reduce<U>(fn: (accumulator: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this.data.length; i++) {
      acc = fn(acc, this.data[i]!, i)
    }
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this.data.length; i++) {
      if (predicate(this.data[i]!, i)) {
        return this.data[i]
      }
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    for (let i = 0; i < this.data.length; i++) {
      if (predicate(this.data[i]!, i)) {
        return i
      }
    }
    return -1
  }

  every(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this.data.length; i++) {
      if (!predicate(this.data[i]!, i)) {
        return false
      }
    }
    return true
  }

  some(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this.data.length; i++) {
      if (predicate(this.data[i]!, i)) {
        return true
      }
    }
    return false
  }

  indexOf(value: T): number {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] === value) {
        return i
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  slice(start?: number, end?: number): SnapArray<T> {
    return new SnapArray(this.data.slice(start, end))
  }

  concat(other: SnapArray<T> | T[]): SnapArray<T> {
    const otherData = other instanceof SnapArray ? other.data : other
    return new SnapArray([...this.data, ...otherData])
  }

  reverse(): SnapArray<T> {
    return new SnapArray([...this.data].reverse())
  }

  sort(comparator?: (a: T, b: T) => number): SnapArray<T> {
    return new SnapArray([...this.data].sort(comparator))
  }

  join(separator?: string): string {
    return this.data.join(separator)
  }

  first(): T {
    if (this.data.length === 0) {
      throw new RangeError('Cannot get first element of empty array')
    }
    return this.data[0]!
  }

  last(): T {
    if (this.data.length === 0) {
      throw new RangeError('Cannot get last element of empty array')
    }
    return this.data[this.data.length - 1]!
  }

  static fromArray<U>(arr: U[]): SnapArray<U> {
    return new SnapArray(arr)
  }

  toString(): string {
    return `SnapArray({ size: ${this.data.length} })`
  }

  toJSON() {
    return { type: 'SnapArray', items: this.toArray() }
  }


}
