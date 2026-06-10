import type { AVLSetOptions } from './types.js'
import { DEFAULT_AVL_SET_OPTIONS } from './types.js'

interface AVLNode<T> {
  value: T
  left: AVLNode<T> | null
  right: AVLNode<T> | null
  height: number
  size: number
}

export class AVLSet<T = number> {
  private root: AVLNode<T> | null = null
  private _comparator: (a: T, b: T) => number

  constructor(options?: AVLSetOptions<T>) {
    const opts = { ...DEFAULT_AVL_SET_OPTIONS, ...options }
    this._comparator = opts.comparator as (a: T, b: T) => number
  }

  private makeNode(value: T): AVLNode<T> {
    return { value, left: null, right: null, height: 1, size: 1 }
  }

  private nodeHeight(node: AVLNode<T> | null): number {
    return node === null ? 0 : node.height
  }

  private nodeSize(node: AVLNode<T> | null): number {
    return node === null ? 0 : node.size
  }

  private updateNode(node: AVLNode<T>): void {
    node.height = 1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private balanceFactor(node: AVLNode<T>): number {
    return this.nodeHeight(node.left) - this.nodeHeight(node.right)
  }

  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateNode(y)
    this.updateNode(x)
    return x
  }

  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateNode(x)
    this.updateNode(y)
    return y
  }

  private balance(node: AVLNode<T>): AVLNode<T> {
    this.updateNode(node)
    const bf = this.balanceFactor(node)
    if (bf > 1) {
      if (this.balanceFactor(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!)
      }
      return this.rotateRight(node)
    }
    if (bf < -1) {
      if (this.balanceFactor(node.right!) > 0) {
        node.right = this.rotateRight(node.right!)
      }
      return this.rotateLeft(node)
    }
    return node
  }

  private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
    if (node === null) return this.makeNode(value)
    const cmp = this._comparator(value, node.value)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value)
    } else {
      return node
    }
    return this.balance(node)
  }

  private findMin(node: AVLNode<T>): AVLNode<T> {
    while (node.left !== null) node = node.left
    return node
  }

  private findMax(node: AVLNode<T>): AVLNode<T> {
    while (node.right !== null) node = node.right
    return node
  }

  private deleteNode(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (node === null) return null
    const cmp = this._comparator(value, node.value)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, value)
    } else {
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      const successor = this.findMin(node.right)
      node.value = successor.value
      node.right = this.deleteNode(node.right, successor.value)
    }
    return this.balance(node)
  }

  private findNode(node: AVLNode<T> | null, value: T): boolean {
    let current = node
    while (current !== null) {
      const cmp = this._comparator(value, current.value)
      if (cmp === 0) return true
      current = cmp < 0 ? current.left : current.right
    }
    return false
  }

  get size(): number {
    return this.nodeSize(this.root)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  add(value: T): boolean {
    if (this.findNode(this.root, value)) return false
    this.root = this.insertNode(this.root, value)
    return true
  }

  delete(value: T): boolean {
    if (!this.findNode(this.root, value)) return false
    this.root = this.deleteNode(this.root, value)
    return true
  }

  has(value: T): boolean {
    return this.findNode(this.root, value)
  }

  clear(): void {
    this.root = null
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    return this.findMin(this.root).value
  }

  max(): T | undefined {
    if (this.root === null) return undefined
    return this.findMax(this.root).value
  }

  floor(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this._comparator(value, current.value)
      if (cmp === 0) return current.value
      if (cmp > 0) {
        result = current.value
        current = current.right
      } else {
        current = current.left
      }
    }
    return result
  }

  ceiling(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this._comparator(value, current.value)
      if (cmp === 0) return current.value
      if (cmp < 0) {
        result = current.value
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  lower(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this._comparator(value, current.value)
      if (cmp > 0) {
        result = current.value
        current = current.right
      } else {
        current = current.left
      }
    }
    return result
  }

  higher(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this._comparator(value, current.value)
      if (cmp < 0) {
        result = current.value
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  *range(lo: T, hi: T): Generator<T, void, unknown> {
    const stack: AVLNode<T>[] = []
    let current: AVLNode<T> | null = this.root
    while (stack.length > 0 || current !== null) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      const cmpLo = this._comparator(current.value, lo)
      const cmpHi = this._comparator(current.value, hi)
      if (cmpLo >= 0 && cmpHi <= 0) yield current.value
      if (cmpHi > 0) return
      current = current.right
    }
  }

  indexOf(value: T): number {
    let index = 0
    let current = this.root
    while (current !== null) {
      const leftSize = this.nodeSize(current.left)
      const cmp = this._comparator(value, current.value)
      if (cmp === 0) return index + leftSize
      if (cmp < 0) {
        current = current.left
      } else {
        index += leftSize + 1
        current = current.right
      }
    }
    return -1
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this.size || this.root === null) return undefined
    let current: AVLNode<T> | null = this.root
    let remaining = index
    while (current !== null) {
      const leftSize = this.nodeSize(current.left)
      if (remaining < leftSize) {
        current = current.left
      } else if (remaining === leftSize) {
        return current.value
      } else {
        remaining -= leftSize + 1
        current = current.right
      }
    }
    return undefined
  }

  toArray(): T[] {
    const result: T[] = []
    this.inorder(this.root, result)
    return result
  }

  private inorder(node: AVLNode<T> | null, result: T[]): void {
    if (node === null) return
    this.inorder(node.left, result)
    result.push(node.value)
    this.inorder(node.right, result)
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    const stack: AVLNode<T>[] = []
    let current: AVLNode<T> | null = this.root
    while (stack.length > 0 || current !== null) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      callback(current.value, idx++)
      current = current.right
    }
  }

  *[Symbol.iterator](): Generator<T, void, unknown> {
    const stack: AVLNode<T>[] = []
    let current: AVLNode<T> | null = this.root
    while (stack.length > 0 || current !== null) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield current.value
      current = current.right
    }
  }

  union(other: AVLSet<T>): AVLSet<T> {
    const result = new AVLSet<T>({ comparator: this._comparator })
    for (const v of this.toArray()) result.add(v)
    for (const v of other.toArray()) result.add(v)
    return result
  }

  intersection(other: AVLSet<T>): AVLSet<T> {
    const result = new AVLSet<T>({ comparator: this._comparator })
    for (const v of this.toArray()) {
      if (other.has(v)) result.add(v)
    }
    return result
  }

  difference(other: AVLSet<T>): AVLSet<T> {
    const result = new AVLSet<T>({ comparator: this._comparator })
    for (const v of this.toArray()) {
      if (!other.has(v)) result.add(v)
    }
    return result
  }

  isSubsetOf(other: AVLSet<T>): boolean {
    for (const v of this.toArray()) {
      if (!other.has(v)) return false
    }
    return true
  }

  isSupersetOf(other: AVLSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  private isBalanced(node: AVLNode<T> | null): boolean {
    if (node === null) return true
    const bf = this.balanceFactor(node)
    if (bf < -1 || bf > 1) return false
    return this.isBalanced(node.left) && this.isBalanced(node.right)
  }

  get isAVLBalanced(): boolean {
    return this.isBalanced(this.root)
  }

  toString(): string {
    return `${AVLSet}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'AVLSet', size: this.size, items: this.toArray() }
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

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  clone(): AVLSet<T> {
    const c = new AVLSet<T>()
    for (const item of this.toArray()) {
      c.add(item)
    }
    return c
  }

  tap(fn: (collection: AVLSet<T>) => void): AVLSet<T> {
    fn(this)
    return this
  }

  equals(other: AVLSet<T>): boolean {
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

  static empty<T>(): AVLSet<T> {
    return new AVLSet<T>()
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
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

  pluck<K extends keyof T>(key: K): T[K][] {
    return this.toArray().map(item => item[key])
  }

  nth(n: number): T | undefined {
    return this.at(n - 1)
  }

  head(): T | undefined {
    return this.first()
  }

  tail(): T[] {
    return this.skip(1)
  }

  reduceRight<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduceRight(fn, initial)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  static from<T>(items: T[]): AVLSet<T> {
    const instance = new AVLSet<T>()
    for (const item of items) {
      instance.add(item)
    }
    return instance
  }

  static of<T>(...items: T[]): AVLSet<T> {
    return AVLSet.from(items)
  }
}
