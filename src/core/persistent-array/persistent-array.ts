import type { ElementComparator, TreeNode } from './types.js'

export class PersistentArray<T> {
  readonly version: number

  private readonly root: TreeNode<T> | null
  private readonly _size: number
  private readonly _previous: PersistentArray<T> | null

  private constructor(
    root: TreeNode<T> | null,
    nodeCount: number,
    version: number,
    previous: PersistentArray<T> | null,
  ) {
    this.root = root
    this._size = nodeCount
    this.version = version
    this._previous = previous
  }

  private static mkNode<T>(value: T, left: TreeNode<T> | null, right: TreeNode<T> | null): TreeNode<T> {
    const lh = left?.height ?? 0
    const rh = right?.height ?? 0
    const ls = left?.size ?? 0
    const rs = right?.size ?? 0
    return { value, left, right, height: Math.max(lh, rh) + 1, size: ls + rs + 1 }
  }

  private static bf<T>(n: TreeNode<T>): number {
    return (n.right?.height ?? 0) - (n.left?.height ?? 0)
  }

  private static rotL<T>(n: TreeNode<T>): TreeNode<T> {
    const r = n.right!
    return PersistentArray.mkNode(
      r.value,
      PersistentArray.mkNode(n.value, n.left, r.left),
      r.right,
    )
  }

  private static rotR<T>(n: TreeNode<T>): TreeNode<T> {
    const l = n.left!
    return PersistentArray.mkNode(
      l.value,
      l.left,
      PersistentArray.mkNode(n.value, l.right, n.right),
    )
  }

  private static bal<T>(n: TreeNode<T>): TreeNode<T> {
    const factor = PersistentArray.bf(n)
    if (factor > 1) {
      if (PersistentArray.bf(n.right!) < 0) {
        return PersistentArray.rotL(
          PersistentArray.mkNode(n.value, n.left, PersistentArray.rotR(n.right!)),
        )
      }
      return PersistentArray.rotL(n)
    }
    if (factor < -1) {
      if (PersistentArray.bf(n.left!) > 0) {
        return PersistentArray.rotR(
          PersistentArray.mkNode(n.value, PersistentArray.rotL(n.left!), n.right),
        )
      }
      return PersistentArray.rotR(n)
    }
    return n
  }

  private static getAt<T>(n: TreeNode<T>, i: number): T {
    const ls = n.left?.size ?? 0
    if (i < ls) return PersistentArray.getAt(n.left!, i)
    if (i === ls) return n.value
    return PersistentArray.getAt(n.right!, i - ls - 1)
  }

  private static setAt<T>(n: TreeNode<T>, i: number, v: T): TreeNode<T> {
    const ls = n.left?.size ?? 0
    if (i < ls) {
      return PersistentArray.mkNode(n.value, PersistentArray.setAt(n.left!, i, v), n.right)
    }
    if (i === ls) {
      return PersistentArray.mkNode(v, n.left, n.right)
    }
    return PersistentArray.mkNode(n.value, n.left, PersistentArray.setAt(n.right!, i - ls - 1, v))
  }

  private static insertAt<T>(n: TreeNode<T> | null, i: number, v: T): TreeNode<T> {
    if (n === null) return PersistentArray.mkNode(v, null, null)
    const ls = n.left?.size ?? 0
    if (i <= ls) {
      return PersistentArray.bal(
        PersistentArray.mkNode(n.value, PersistentArray.insertAt(n.left, i, v), n.right),
      )
    }
    return PersistentArray.bal(
      PersistentArray.mkNode(n.value, n.left, PersistentArray.insertAt(n.right, i - ls - 1, v)),
    )
  }

  private static removeLast<T>(n: TreeNode<T>): { root: TreeNode<T> | null; value: T } {
    if (n.right === null) {
      return { root: n.left, value: n.value }
    }
    const result = PersistentArray.removeLast(n.right)
    return {
      root: PersistentArray.bal(PersistentArray.mkNode(n.value, n.left, result.root)),
      value: result.value,
    }
  }

  private static inOrder<T>(n: TreeNode<T> | null, result: T[]): void {
    if (n === null) return
    PersistentArray.inOrder(n.left, result)
    result.push(n.value)
    PersistentArray.inOrder(n.right, result)
  }

  private static buildTree<T>(values: T[], start: number, end: number): TreeNode<T> | null {
    if (start >= end) return null
    const mid = (start + end) >> 1
    return PersistentArray.mkNode(
      values[mid]!,
      PersistentArray.buildTree(values, start, mid),
      PersistentArray.buildTree(values, mid + 1, end),
    )
  }

  private newVersion(root: TreeNode<T> | null, size: number): PersistentArray<T> {
    return new PersistentArray<T>(root, size, this.version + 1, this)
  }

  static from<T>(values: T[]): PersistentArray<T> {
    const root = PersistentArray.buildTree(values, 0, values.length)
    return new PersistentArray<T>(root, values.length, 0, null)
  }

  static ofSize<T>(size: number, fill: T): PersistentArray<T> {
    const values: T[] = []
    for (let i = 0; i < size; i++) values.push(fill)
    return PersistentArray.from(values)
  }

  get(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return PersistentArray.getAt(this.root!, index)
  }

  set(index: number, value: T): PersistentArray<T> {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.newVersion(PersistentArray.setAt(this.root!, index, value), this._size)
  }

  push(value: T): PersistentArray<T> {
    const newRoot = PersistentArray.insertAt(this.root, this._size, value)
    return this.newVersion(newRoot, this._size + 1)
  }

  pop(): { array: PersistentArray<T>; value: T | undefined } {
    if (this._size === 0) return { array: this, value: undefined }
    const result = PersistentArray.removeLast(this.root!)
    return { array: this.newVersion(result.root, this._size - 1), value: result.value }
  }

  slice(start?: number, end?: number): PersistentArray<T> {
    return PersistentArray.from(this.toArray().slice(start, end))
  }

  map<U>(fn: (value: T, index: number) => U): PersistentArray<U> {
    const arr = this.toArray()
    const mapped: U[] = []
    for (let i = 0; i < arr.length; i++) {
      mapped.push(fn(arr[i]!, i))
    }
    return PersistentArray.from(mapped)
  }

  filter(fn: (value: T, index: number) => boolean): PersistentArray<T> {
    const arr = this.toArray()
    const filtered: T[] = []
    for (let i = 0; i < arr.length; i++) {
      if (fn(arr[i]!, i)) filtered.push(arr[i]!)
    }
    return PersistentArray.from(filtered)
  }

  forEach(fn: (value: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      fn(arr[i]!, i)
    }
  }

  reduce<U>(fn: (acc: U, value: T) => U, initial: U): U {
    let acc = initial
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      acc = fn(acc, arr[i]!)
    }
    return acc
  }

  find(fn: (value: T) => boolean): T | undefined {
    const arr = this.toArray()
    for (const v of arr) {
      if (fn(v)) return v
    }
    return undefined
  }

  indexOf(value: T, comparator?: (a: T, b: T) => boolean): number {
    const cmp: ElementComparator<T> = comparator ?? ((a: T, b: T) => a === b)
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      if (cmp(arr[i]!, value)) return i
    }
    return -1
  }

  includes(value: T, comparator?: (a: T, b: T) => boolean): boolean {
    return this.indexOf(value, comparator) !== -1
  }

  equals(other: PersistentArray<T>, comparator?: (a: T, b: T) => boolean): boolean {
    if (this === other) return true
    if (this._size !== other._size) return false
    const cmp: ElementComparator<T> = comparator ?? ((a: T, b: T) => a === b)
    const a = this.toArray()
    const b = other.toArray()
    for (let i = 0; i < a.length; i++) {
      if (!cmp(a[i]!, b[i]!)) return false
    }
    return true
  }

  toArray(): T[] {
    const result: T[] = []
    PersistentArray.inOrder(this.root, result)
    return result
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  toString(): string {
    return `PersistentArray([${this.toArray().join(', ')}])`
  }

  previous(): PersistentArray<T> | null {
    return this._previous
  }

  atVersion(v: number): PersistentArray<T> {
    if (v === this.version) return this
    if (v < 0 || v > this.version) return PersistentArray.from<T>([])
    let current: PersistentArray<T> | null = this
    while (current !== null && current.version !== v) {
      current = current._previous
    }
    return current ?? PersistentArray.from<T>([])
  }

  history(): PersistentArray<T>[] {
    const result: PersistentArray<T>[] = []
    let current: PersistentArray<T> | null = this
    while (current !== null) {
      result.unshift(current)
      current = current._previous
    }
    return result
  }

  concat(other: PersistentArray<T>): PersistentArray<T> {
    return PersistentArray.from([...this.toArray(), ...other.toArray()])
  }

  reverse(): PersistentArray<T> {
    return PersistentArray.from(this.toArray().reverse())
  }

  sort(comparator?: (a: T, b: T) => number): PersistentArray<T> {
    return PersistentArray.from([...this.toArray()].sort(comparator))
  }
}
