import type { CompareFunction, RedBlackSetOptions } from './types.js'

const RED = true
const BLACK = false

type Color = boolean

interface RBNode<T> {
  value: T
  color: Color
  left: RBNode<T> | null
  right: RBNode<T> | null
  size: number
}

export class RedBlackSet<T> implements Iterable<T> {
  private root: RBNode<T> | null = null
  private compare: CompareFunction<T>

  constructor(options?: RedBlackSetOptions<T>) {
    this.compare =
      options?.compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private isRed(node: RBNode<T> | null): boolean {
    return node !== null && node.color === RED
  }

  private nodeSize(node: RBNode<T> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: RBNode<T>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private rotateLeft(h: RBNode<T>): RBNode<T> {
    const x = h.right!
    h.right = x.left
    x.left = h
    x.color = h.color
    h.color = RED
    this.updateSize(h)
    this.updateSize(x)
    return x
  }

  private rotateRight(h: RBNode<T>): RBNode<T> {
    const x = h.left!
    h.left = x.right
    x.right = h
    x.color = h.color
    h.color = RED
    this.updateSize(h)
    this.updateSize(x)
    return x
  }

  private flipColors(h: RBNode<T>): void {
    h.color = !h.color
    if (h.left) h.left.color = !h.left.color
    if (h.right) h.right.color = !h.right.color
  }

  private moveRedLeft(h: RBNode<T>): RBNode<T> {
    this.flipColors(h)
    if (h.right && this.isRed(h.right.left)) {
      h.right = this.rotateRight(h.right)
      const rotated = this.rotateLeft(h)
      this.flipColors(rotated)
      return rotated
    }
    return h
  }

  private moveRedRight(h: RBNode<T>): RBNode<T> {
    this.flipColors(h)
    if (h.left && this.isRed(h.left.left)) {
      const rotated = this.rotateRight(h)
      this.flipColors(rotated)
      return rotated
    }
    return h
  }

  private balance(h: RBNode<T>): RBNode<T> {
    let node = h
    if (this.isRed(node.right) && !this.isRed(node.left)) {
      node = this.rotateLeft(node!)
    }
    if (this.isRed(node.left) && node.left && this.isRed(node.left.left)) {
      node = this.rotateRight(node!)
    }
    if (this.isRed(node.left) && this.isRed(node.right)) {
      this.flipColors(node)
    }
    this.updateSize(node)
    return node
  }

  add(value: T): boolean {
    const sizeBefore = this.nodeSize(this.root)
    this.root = this.insertNode(this.root, value)
    this.root.color = BLACK
    return this.nodeSize(this.root) > sizeBefore
  }

  private insertNode(node: RBNode<T> | null, value: T): RBNode<T> {
    if (node === null) {
      return { value, color: RED, left: null, right: null, size: 1 }
    }
    const cmp = this.compare(value, node.value)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value)
    }
    return this.balance(node)
  }

  delete(value: T): boolean {
    if (!this.has(value)) return false
    if (this.root) {
      this.root = this.deleteNode(this.root, value)
      if (this.root) this.root.color = BLACK
    }
    return true
  }

  private deleteNode(node: RBNode<T>, value: T): RBNode<T> | null {
    const cmp = this.compare(value, node.value)
    if (cmp < 0) {
      if (node.left) {
        if (!this.isRed(node.left) && !this.isRed(node.left.left)) {
          node = this.moveRedLeft(node)
        }
        node.left = this.deleteNode(node.left!, value)
      }
    } else {
      if (this.isRed(node.left)) {
        node = this.rotateRight(node!)
      }
      if (this.compare(value, node.value) === 0 && node.right === null) {
        return null
      }
      if (node.right) {
        if (!this.isRed(node.right) && !this.isRed(node.right.left)) {
          node = this.moveRedRight(node)
        }
        if (this.compare(value, node.value) === 0) {
          const succ = this.minNode(node.right!)
          node.value = succ.value
          node.right = this.deleteMinNode(node.right!)
        } else {
          node.right = this.deleteNode(node.right!, value)
        }
      }
    }
    return this.balance(node)
  }

  private deleteMinNode(node: RBNode<T>): RBNode<T> | null {
    if (node.left === null) return null
    if (!this.isRed(node.left) && !this.isRed(node.left.left)) {
      node = this.moveRedLeft(node)
    }
    node.left = this.deleteMinNode(node.left!)
    return this.balance(node)
  }

  has(value: T): boolean {
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) node = node.left
      else if (cmp > 0) node = node.right
      else return true
    }
    return false
  }

  get size(): number {
    return this.nodeSize(this.root)
  }

  get isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
  }

  private minNode(node: RBNode<T>): RBNode<T> {
    while (node.left !== null) node = node.left
    return node
  }

  private maxNode(node: RBNode<T>): RBNode<T> {
    while (node.right !== null) node = node.right
    return node
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    return this.minNode(this.root).value
  }

  max(): T | undefined {
    if (this.root === null) return undefined
    return this.maxNode(this.root).value
  }

  floor(value: T): T | undefined {
    let node = this.root
    let result: T | undefined
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp === 0) return node.value
      if (cmp < 0) {
        node = node.left
      } else {
        result = node.value
        node = node.right
      }
    }
    return result
  }

  ceiling(value: T): T | undefined {
    let node = this.root
    let result: T | undefined
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp === 0) return node.value
      if (cmp > 0) {
        node = node.right
      } else {
        result = node.value
        node = node.left
      }
    }
    return result
  }

  lower(value: T): T | undefined {
    let node = this.root
    let result: T | undefined
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp <= 0) {
        node = node.left
      } else {
        result = node.value
        node = node.right
      }
    }
    return result
  }

  higher(value: T): T | undefined {
    let node = this.root
    let result: T | undefined
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp >= 0) {
        node = node.right
      } else {
        result = node.value
        node = node.left
      }
    }
    return result
  }

  range(lo: T, hi: T): T[] {
    const result: T[] = []
    this.rangeCollect(this.root, lo, hi, result)
    return result
  }

  private rangeCollect(node: RBNode<T> | null, lo: T, hi: T, result: T[]): void {
    if (node === null) return
    const cmpLo = this.compare(node.value, lo)
    const cmpHi = this.compare(node.value, hi)
    if (cmpLo > 0) this.rangeCollect(node.left, lo, hi, result)
    if (cmpLo >= 0 && cmpHi <= 0) result.push(node.value)
    if (cmpHi < 0) this.rangeCollect(node.right, lo, hi, result)
  }

  indexOf(value: T): number {
    return this.rank(this.root, value)
  }

  private rank(node: RBNode<T> | null, value: T): number {
    if (node === null) return -1
    const cmp = this.compare(value, node.value)
    if (cmp < 0) return this.rank(node.left, value)
    if (cmp > 0) {
      const leftSize = this.nodeSize(node.left)
      const rightRank = this.rank(node.right, value)
      return rightRank === -1 ? -1 : leftSize + 1 + rightRank
    }
    return this.nodeSize(node.left)
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this.size) return undefined
    return this.selectNode(this.root, index)
  }

  private selectNode(node: RBNode<T> | null, index: number): T | undefined {
    if (node === null) return undefined
    const leftSize = this.nodeSize(node.left)
    if (index < leftSize) return this.selectNode(node.left, index)
    if (index > leftSize) return this.selectNode(node.right, index - leftSize - 1)
    return node.value
  }

  toArray(): T[] {
    const result: T[] = []
    this.inOrderCollect(this.root, result)
    return result
  }

  private inOrderCollect(node: RBNode<T> | null, result: T[]): void {
    if (node === null) return
    this.inOrderCollect(node.left, result)
    result.push(node.value)
    this.inOrderCollect(node.right, result)
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    this.forEachNode(this.root, callback, () => idx++)
  }

  private forEachNode(
    node: RBNode<T> | null,
    callback: (value: T, index: number) => void,
    nextIndex: () => number,
  ): void {
    if (node === null) return
    this.forEachNode(node.left, callback, nextIndex)
    callback(node.value, nextIndex())
    this.forEachNode(node.right, callback, nextIndex)
  }

  [Symbol.iterator](): Iterator<T> {
    const stack: RBNode<T>[] = []
    let current: RBNode<T> | null = this.root
    return {
      next: (): IteratorResult<T> => {
        while (current !== null) {
          stack.push(current)
          current = current.left
        }
        if (stack.length === 0) return { done: true, value: undefined }
        const node = stack.pop()!
        current = node.right
        return { done: false, value: node.value }
      },
    }
  }

  union(other: RedBlackSet<T>): RedBlackSet<T> {
    const result = new RedBlackSet<T>({ compare: this.compare })
    for (const v of this) result.add(v)
    for (const v of other) result.add(v)
    return result
  }

  intersection(other: RedBlackSet<T>): RedBlackSet<T> {
    const result = new RedBlackSet<T>({ compare: this.compare })
    for (const v of this) {
      if (other.has(v)) result.add(v)
    }
    return result
  }

  difference(other: RedBlackSet<T>): RedBlackSet<T> {
    const result = new RedBlackSet<T>({ compare: this.compare })
    for (const v of this) {
      if (!other.has(v)) result.add(v)
    }
    return result
  }

  symmetricDifference(other: RedBlackSet<T>): RedBlackSet<T> {
    const result = new RedBlackSet<T>({ compare: this.compare })
    for (const v of this) {
      if (!other.has(v)) result.add(v)
    }
    for (const v of other) {
      if (!this.has(v)) result.add(v)
    }
    return result
  }

  isSubsetOf(other: RedBlackSet<T>): boolean {
    for (const v of this) {
      if (!other.has(v)) return false
    }
    return true
  }

  isSupersetOf(other: RedBlackSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  toString(): string {
    return `RedBlackSet({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RedBlackSet', size: this.size, items: this.toArray() }
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
}
