import type { CTNode, CompareFn } from './types.js'
import { defaultCompare } from './types.js'

export class CartesianTree<T> {
  private root: CTNode<T> | null = null
  private readonly _values: readonly T[]
  private readonly cmp: CompareFn<T>

  constructor(values: T[], comparator?: CompareFn<T>) {
    this._values = Object.freeze([...values])
    this.cmp = comparator ?? defaultCompare
    this.root = this.build(0, this._values.length - 1)
  }

  private build(lo: number, hi: number): CTNode<T> | null {
    if (lo > hi) return null
    if (lo === hi) {
      return { value: this._values[lo]!, index: lo, left: null, right: null }
    }
    let bestIdx = lo
    for (let i = lo + 1; i <= hi; i++) {
      if (this.cmp(this._values[i]!, this._values[bestIdx]!) < 0) {
        bestIdx = i
      }
    }
    const left = this.build(lo, bestIdx - 1)
    const right = this.build(bestIdx + 1, hi)
    return { value: this._values[bestIdx]!, index: bestIdx, left, right }
  }

  findRoot(): CTNode<T> | null {
    return this.root
  }

  size(): number {
    return this._values.length
  }

  isEmpty(): boolean {
    return this._values.length === 0
  }


  inorder(): T[] {
    const result: T[] = []
    const stack: CTNode<T>[] = []
    let cur: CTNode<T> | null = this.root
    while (cur !== null || stack.length > 0) {
      while (cur !== null) {
        stack.push(cur)
        cur = cur.left
      }
      cur = stack.pop()!
      result.push(cur.value)
      cur = cur.right
    }
    return result
  }

  preorder(): T[] {
    const result: T[] = []
    if (this.root === null) return result
    const stack: CTNode<T>[] = [this.root]
    while (stack.length > 0) {
      const node = stack.pop()!
      result.push(node.value)
      if (node.right !== null) stack.push(node.right)
      if (node.left !== null) stack.push(node.left)
    }
    return result
  }

  postorder(): T[] {
    const result: T[] = []
    if (this.root === null) return result
    const stack: CTNode<T>[] = [this.root]
    const visited = new Set<CTNode<T>>()
    while (stack.length > 0) {
      const node = stack[stack.length - 1]!
      if (node.left !== null && !visited.has(node.left)) {
        stack.push(node.left)
        continue
      }
      if (node.right !== null && !visited.has(node.right)) {
        stack.push(node.right)
        continue
      }
      stack.pop()
      visited.add(node)
      result.push(node.value)
    }
    return result
  }

  toArray(): T[] {
    return [...this._values]
  }

  getRangeMin(start: number, end: number): T | undefined {
    if (start < 0 || end >= this._values.length || start > end) return undefined
    return this.queryExtreme(start, end, true)
  }

  getRangeMax(start: number, end: number): T | undefined {
    if (start < 0 || end >= this._values.length || start > end) return undefined
    return this.queryExtreme(start, end, false)
  }

  private queryExtreme(lo: number, hi: number, wantMin: boolean): T | undefined {
    let result: T | undefined
    const search = (node: CTNode<T> | null): void => {
      if (node === null) return
      if (node.index < lo) {
        search(node.right)
        return
      }
      if (node.index > hi) {
        search(node.left)
        return
      }
      if (result === undefined) {
        result = node.value
      } else if (wantMin) {
        if (this.cmp(node.value, result) < 0) result = node.value
      } else {
        if (this.cmp(node.value, result) > 0) result = node.value
      }
      search(node.left)
      search(node.right)
    }
    search(this.root)
    return result
  }

  find(value: T): CTNode<T> | null {
    const stack: CTNode<T>[] = []
    let cur: CTNode<T> | null = this.root
    while (cur !== null || stack.length > 0) {
      while (cur !== null) {
        stack.push(cur)
        if (this.cmp(cur.value, value) === 0) return cur
        cur = cur.left
      }
      cur = stack.pop()!.right
    }
    return null
  }

  getHeight(): number {
    if (this.root === null) return -1
    let height = -1
    const queue: Array<[CTNode<T>, number]> = [[this.root, 0]]
    let head = 0
    while (head < queue.length) {
      const [node, level] = queue[head++]!
      height = Math.max(height, level)
      if (node.left !== null) queue.push([node.left, level + 1])
      if (node.right !== null) queue.push([node.right, level + 1])
    }
    return height
  }

  isValid(): boolean {
    if (this.root === null) return this._values.length === 0
    const checkHeap = (node: CTNode<T> | null): boolean => {
      if (node === null) return true
      if (node.left !== null && this.cmp(node.left.value, node.value) < 0) return false
      if (node.right !== null && this.cmp(node.right.value, node.value) < 0) return false
      return checkHeap(node.left) && checkHeap(node.right)
    }
    if (!checkHeap(this.root)) return false
    const inOrder = this.inorder()
    if (inOrder.length !== this._values.length) return false
    for (let k = 0; k < inOrder.length; k++) {
      if (this.cmp(inOrder[k]!, this._values[k]!) !== 0) return false
    }
    return true
  }

  clone(): CartesianTree<T> {
    return new CartesianTree<T>([...this._values], this.cmp)
  }

  levelOrder(): T[] {
    if (this.root === null) return []
    const result: T[] = []
    const queue: CTNode<T>[] = [this.root]
    let head = 0
    while (head < queue.length) {
      const node = queue[head++]!
      result.push(node.value)
      if (node.left !== null) queue.push(node.left)
      if (node.right !== null) queue.push(node.right)
    }
    return result
  }

  rangeQuery(start: number, end: number): T[] {
    if (start < 0 || end >= this._values.length || start > end) return []
    const result: T[] = []
    for (let i = start; i <= end; i++) {
      result.push(this._values[i]!)
    }
    return result
  }

  getNodeCount(): number {
    let count = 0
    const stack: CTNode<T>[] = []
    let cur: CTNode<T> | null = this.root
    while (cur !== null || stack.length > 0) {
      while (cur !== null) {
        stack.push(cur)
        cur = cur.left
      }
      cur = stack.pop()!
      count++
      cur = cur.right
    }
    return count
  }

  contains(value: T): boolean {
    return this.find(value) !== null
  }

  getValues(): readonly T[] {
    return this._values
  }

  static fromArray<T>(values: T[], comparator?: CompareFn<T>): CartesianTree<T> {
    return new CartesianTree<T>(values, comparator)
  }

  static build<T>(values: T[], comparator?: CompareFn<T>): CartesianTree<T> {
    return new CartesianTree<T>(values, comparator)
  }


  *[Symbol.iterator](): IterableIterator<T> {
    const stack: Array<CTNode<T>> = [];
    let current: CTNode<T> | null = this.root;
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current);
        current = current.left;
      }
      current = stack.pop()!;
      yield current.value;
      current = current.right;
    }
  }

  static from<T>(items: T[]): CartesianTree<T> {
    return new CartesianTree<T>(items)
  }

  toString(): string {
    return `${CartesianTree}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'CartesianTree', items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
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

  tap(fn: (collection: CartesianTree<T>) => void): CartesianTree<T> {
    fn(this)
    return this
  }

  equals(other: CartesianTree<T>): boolean {
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
}
