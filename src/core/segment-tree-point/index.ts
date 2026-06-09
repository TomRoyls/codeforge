import type { SegmentTreePointOptions, ForEachCallback } from './types.js'

const defaultOperation = (a: number, b: number): number => a + b
const defaultIdentity = 0

export class SegmentTreePoint<T> {
  private tree: T[]
  private _data: T[]
  private _n: number
  private operation: (a: T, b: T) => T
  private identity: T

  constructor(values: T[], options?: SegmentTreePointOptions<T>) {
    this._data = values.slice()
    this._n = values.length
    this.operation = options?.operation ?? (defaultOperation as unknown as (a: T, b: T) => T)
    this.identity = options?.identity ?? (defaultIdentity as unknown as T)
    const size = this._n === 0 ? 1 : 4 * this._n
    this.tree = new Array<T>(size)
    for (let i = 0; i < size; i++) {
      this.tree[i] = this.identity
    }
    if (this._n > 0) {
      this.build(1, 0, this._n - 1)
    }
  }

  private build(node: number, lo: number, hi: number): void {
    if (lo === hi) {
      this.tree[node] = this._data[lo]!
      return
    }
    const mid = Math.floor((lo + hi) / 2)
    this.build(node * 2, lo, mid)
    this.build(node * 2 + 1, mid + 1, hi)
    this.tree[node] = this.operation(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private updateNode(node: number, lo: number, hi: number, index: number, value: T): void {
    if (lo === hi) {
      this.tree[node] = value
      this._data[index] = value
      return
    }
    const mid = Math.floor((lo + hi) / 2)
    if (index <= mid) {
      this.updateNode(node * 2, lo, mid, index, value)
    } else {
      this.updateNode(node * 2 + 1, mid + 1, hi, index, value)
    }
    this.tree[node] = this.operation(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private queryNode(node: number, lo: number, hi: number, qLo: number, qHi: number): T {
    if (qLo > hi || qHi < lo) {
      return this.identity
    }
    if (qLo <= lo && hi <= qHi) {
      return this.tree[node]!
    }
    const mid = Math.floor((lo + hi) / 2)
    const left = this.queryNode(node * 2, lo, mid, qLo, qHi)
    const right = this.queryNode(node * 2 + 1, mid + 1, hi, qLo, qHi)
    return this.operation(left, right)
  }

  private getPoint(node: number, lo: number, hi: number, index: number): T {
    if (lo === hi) {
      return this.tree[node]!
    }
    const mid = Math.floor((lo + hi) / 2)
    if (index <= mid) {
      return this.getPoint(node * 2, lo, mid, index)
    }
    return this.getPoint(node * 2 + 1, mid + 1, hi, index)
  }

  update(index: number, value: T): void {
    if (index < 0 || index >= this._n) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._n})`)
    }
    this.updateNode(1, 0, this._n - 1, index, value)
  }

  query(lo: number, hi: number): T {
    if (this._n === 0) {
      throw new RangeError('Cannot query empty tree')
    }
    if (lo < 0 || hi >= this._n || lo > hi) {
      throw new RangeError(`Invalid range [${lo}, ${hi}] for size ${this._n}`)
    }
    return this.queryNode(1, 0, this._n - 1, lo, hi)
  }

  queryAll(): T {
    if (this._n === 0) {
      return this.identity
    }
    return this.queryNode(1, 0, this._n - 1, 0, this._n - 1)
  }

  pointQuery(index: number): T {
    if (index < 0 || index >= this._n) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._n})`)
    }
    return this.getPoint(1, 0, this._n - 1, index)
  }

  get size(): number {
    return this._n
  }

  get isEmpty(): boolean {
    return this._n === 0
  }

  toArray(): T[] {
    return this._data.slice()
  }

  forEach(callback: ForEachCallback<T>): void {
    for (let i = 0; i < this._n; i++) {
      callback(this._data[i]!, i)
    }
  }

  clone(): SegmentTreePoint<T> {
    const copy = new SegmentTreePoint<T>([], {
      operation: this.operation,
      identity: this.identity,
    })
    copy._data = this._data.slice()
    copy._n = this._n
    copy.tree = this.tree.slice()
    return copy
  }

  clear(): void {
    this._data = []
    this._n = 0
    this.tree = [this.identity]
  }

  static sum(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => a + b,
      identity: 0,
    })
  }

  static min(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => Math.min(a, b),
      identity: Infinity,
    })
  }

  static max(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => Math.max(a, b),
      identity: -Infinity,
    })
  }

  static gcd(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => {
        let x = Math.abs(a)
        let y = Math.abs(b)
        while (y !== 0) {
          const t = y
          y = x % y
          x = t
        }
        return x
      },
      identity: 0,
    })
  }

  static xor(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => (a ^ b) >>> 0,
      identity: 0,
    })
  }

  static product(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => a * b,
      identity: 1,
    })
  }

  static bitwiseOr(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => a | b,
      identity: 0,
    })
  }

  static bitwiseAnd(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => a & b,
      identity: ~0 >>> 0,
    })
  }

  static fromArray<U>(values: U[], options?: SegmentTreePointOptions<U>): SegmentTreePoint<U> {
    return new SegmentTreePoint<U>(values, options)
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

  static from<T>(items: T[]): SegmentTreePoint<T> {
    return new SegmentTreePoint<T>(items)
  }
}
