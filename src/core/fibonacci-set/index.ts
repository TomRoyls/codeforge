import type { FibNode, Comparator, FibonacciSetOptions } from './types.js'

export class FibonacciSet<T> {
  private map: Map<T, FibNode<T>>
  private minRoot: FibNode<T> | null
  private _size: number
  private compare: Comparator<T>

  constructor(options?: FibonacciSetOptions<T>) {
    this.map = new Map()
    this.minRoot = null
    this._size = 0
    this.compare =
      options?.compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private makeNode(value: T): FibNode<T> {
    const node: FibNode<T> = {
      value,
      degree: 0,
      mark: false,
      parent: null,
      child: null,
      left: null!,
      right: null!,
    }
    node.left = node
    node.right = node
    return node
  }

  private linkIntoRootList(node: FibNode<T>): void {
    node.parent = null
    if (this.minRoot === null) {
      this.minRoot = node
    } else {
      const right = this.minRoot.right
      this.minRoot.right = node
      node.left = this.minRoot
      node.right = right
      right.left = node
      if (this.compare(node.value, this.minRoot.value) < 0) {
        this.minRoot = node
      }
    }
  }

  private spliceAfter(anchor: FibNode<T>, list: FibNode<T>): void {
    const listEnd = list.left
    const anchorNext = anchor.right
    anchor.right = list
    list.left = anchor
    listEnd.right = anchorNext
    anchorNext.left = listEnd
  }

  private heapLink(child: FibNode<T>, parent: FibNode<T>): void {
    child.left.right = child.right
    child.right.left = child.left
    child.parent = parent
    if (parent.child === null) {
      parent.child = child
      child.left = child
      child.right = child
    } else {
      const sibling = parent.child
      child.left = sibling
      child.right = sibling.right
      sibling.right.left = child
      sibling.right = child
    }
    parent.degree++
    child.mark = false
  }

  private consolidate(): void {
    if (this.minRoot === null) return
    const maxDeg = Math.max(1, Math.floor(Math.log2(this._size + 1)) + 2)
    const table: (FibNode<T> | null)[] = new Array(maxDeg + 1).fill(null)

    const roots: FibNode<T>[] = []
    let curr = this.minRoot
    do {
      roots.push(curr)
      curr = curr.right
    } while (curr !== this.minRoot)

    for (const w of roots) {
      let x = w
      let d = x.degree
      while (d < table.length && table[d] !== null) {
        let y = table[d]!
        if (this.compare(x.value, y.value) > 0) {
          const tmp = x
          x = y
          y = tmp
        }
        this.heapLink(y, x)
        table[d] = null
        d++
      }
      if (d >= table.length) {
        while (table.length <= d) table.push(null)
      }
      table[d] = x
    }

    this.minRoot = null
    for (const node of table) {
      if (node !== null) {
        node.left = node
        node.right = node
        node.parent = null
        if (this.minRoot === null) {
          this.minRoot = node
        } else {
          const right = this.minRoot.right
          this.minRoot.right = node
          node.left = this.minRoot
          node.right = right
          right.left = node
          if (this.compare(node.value, this.minRoot.value) < 0) {
            this.minRoot = node
          }
        }
      }
    }
  }

  private cascadingCut(node: FibNode<T>): void {
    const parent = node.parent
    if (parent !== null) {
      if (!node.mark) {
        node.mark = true
      } else {
        this.cutNode(node, parent)
        this.cascadingCut(parent)
      }
    }
  }

  private cutNode(node: FibNode<T>, parent: FibNode<T>): void {
    if (node.left === node) {
      parent.child = null
    } else {
      if (parent.child === node) {
        parent.child = node.left
      }
      node.left.right = node.right
      node.right.left = node.left
    }
    parent.degree--
    node.left = node
    node.right = node
    this.linkIntoRootList(node)
    node.mark = false
  }

  add(value: T): this {
    if (this.map.has(value)) return this
    const node = this.makeNode(value)
    this.map.set(value, node)
    this._size++
    this.linkIntoRootList(node)
    return this
  }

  delete(value: T): boolean {
    const node = this.map.get(value)
    if (node === undefined) return false

    this.map.delete(value)
    this._size--

    const parent = node.parent
    const hasChildren = node.child !== null
    const isRoot = parent === null
    const isAlone = node.left === node

    if (hasChildren) {
      const childList = node.child!
      let c = childList
      do {
        c.parent = null
        c.mark = false
        c = c.right
      } while (c !== childList)

      if (isRoot && isAlone) {
        this.minRoot = childList
      } else if (!isRoot && this.minRoot !== null) {
        this.spliceAfter(this.minRoot, childList)
      } else if (isRoot && !isAlone) {
        this.spliceAfter(node.left, childList)
      }
      node.child = null
      node.degree = 0
    }

    if (isRoot) {
      if (isAlone) {
        if (!hasChildren) {
          this.minRoot = null
        }
      } else {
        node.left.right = node.right
        node.right.left = node.left
        if (this.minRoot === node) {
          this.minRoot = node.left
        }
      }
    } else {
      if (isAlone) {
        parent.child = null
      } else {
        if (parent.child === node) {
          parent.child = node.left
        }
        node.left.right = node.right
        node.right.left = node.left
      }
      parent.degree--
      this.cascadingCut(parent)
    }

    if (this._size === 0) {
      this.minRoot = null
    } else if (this.minRoot !== null) {
      this.consolidate()
    }

    return true
  }

  has(value: T): boolean {
    return this.map.has(value)
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.map.clear()
    this.minRoot = null
    this._size = 0
  }

  min(): T | undefined {
    if (this._size === 0) return undefined
    let min: T | undefined
    for (const v of this.map.keys()) {
      if (min === undefined || this.compare(v, min) < 0) min = v
    }
    return min
  }

  max(): T | undefined {
    if (this._size === 0) return undefined
    let max: T | undefined
    for (const v of this.map.keys()) {
      if (max === undefined || this.compare(v, max) > 0) max = v
    }
    return max
  }

  private sortedValues(): T[] {
    const values = Array.from(this.map.keys())
    values.sort(this.compare)
    return values
  }

  values(): T[] {
    return this.sortedValues()
  }

  forEach(callback: (value: T, index: number) => void): void {
    const arr = this.sortedValues()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i)
    }
  }

  toArray(): T[] {
    return this.sortedValues()
  }

  *[Symbol.iterator](): Iterator<T> {
    const arr = this.sortedValues()
    for (const v of arr) {
      yield v
    }
  }

  union(other: FibonacciSet<T>): FibonacciSet<T> {
    const result = this.clone()
    for (const value of other) {
      result.add(value)
    }
    return result
  }

  intersection(other: FibonacciSet<T>): FibonacciSet<T> {
    const result = new FibonacciSet<T>({ compare: this.compare })
    for (const value of this) {
      if (other.has(value)) result.add(value)
    }
    return result
  }

  difference(other: FibonacciSet<T>): FibonacciSet<T> {
    const result = new FibonacciSet<T>({ compare: this.compare })
    for (const value of this) {
      if (!other.has(value)) result.add(value)
    }
    return result
  }

  symmetricDifference(other: FibonacciSet<T>): FibonacciSet<T> {
    const result = new FibonacciSet<T>({ compare: this.compare })
    for (const value of this) {
      if (!other.has(value)) result.add(value)
    }
    for (const value of other) {
      if (!this.has(value)) result.add(value)
    }
    return result
  }

  isSubsetOf(other: FibonacciSet<T>): boolean {
    if (this._size > other.size) return false
    for (const value of this) {
      if (!other.has(value)) return false
    }
    return true
  }

  isSupersetOf(other: FibonacciSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: FibonacciSet<T>): boolean {
    if (this._size !== other.size) return false
    for (const value of this) {
      if (!other.has(value)) return false
    }
    return true
  }

  clone(): FibonacciSet<T> {
    const result = new FibonacciSet<T>({ compare: this.compare })
    for (const value of this) {
      result.add(value)
    }
    return result
  }

  static fromArray<T>(arr: T[], options?: FibonacciSetOptions<T>): FibonacciSet<T> {
    const result = new FibonacciSet<T>(options)
    for (const v of arr) {
      result.add(v)
    }
    return result
  }

  range(lo: T, hi: T): T[] {
    if (this.compare(lo, hi) > 0) return []
    const sorted = this.sortedValues()
    const result: T[] = []
    for (const v of sorted) {
      if (this.compare(v, lo) >= 0 && this.compare(v, hi) <= 0) {
        result.push(v)
      }
    }
    return result
  }

  count(): number {
    return this._size
  }

  floor(value: T): T | undefined {
    const sorted = this.sortedValues()
    let result: T | undefined
    for (const v of sorted) {
      if (this.compare(v, value) <= 0) {
        result = v
      } else {
        break
      }
    }
    return result
  }

  ceiling(value: T): T | undefined {
    const sorted = this.sortedValues()
    for (const v of sorted) {
      if (this.compare(v, value) >= 0) return v
    }
    return undefined
  }

  lower(value: T): T | undefined {
    const sorted = this.sortedValues()
    let result: T | undefined
    for (const v of sorted) {
      if (this.compare(v, value) < 0) {
        result = v
      } else {
        break
      }
    }
    return result
  }

  higher(value: T): T | undefined {
    const sorted = this.sortedValues()
    for (const v of sorted) {
      if (this.compare(v, value) > 0) return v
    }
    return undefined
  }

  toString(): string {
    return `${FibonacciSet}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'FibonacciSet', size: this.size, items: this.toArray() }
  }

  static empty<T>(): FibonacciSet<T> {
    return new FibonacciSet<T>()
  }

  get [Symbol.toStringTag](): string {
    return 'FibonacciSet'
  }

  filter(predicate: (item: T, index: number) => boolean): T[] {
    return this.toArray().filter(predicate)
  }

  reduce<R>(fn: (acc: R, item: T, index: number) => R, init: R): R {
    return this.toArray().reduce(fn, init)
  }

  every(predicate: (item: T, index: number) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T, index: number) => boolean): boolean {
    return this.toArray().some(predicate)
  }
}
