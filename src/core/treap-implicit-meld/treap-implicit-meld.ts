import type { TreapImplicitMeldNode } from './types.js'

export class TreapImplicitMeld<T> {
  private root: TreapImplicitMeldNode<T> | null = null

  private nodeSize(node: TreapImplicitMeldNode<T> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: TreapImplicitMeldNode<T>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private pushDown(node: TreapImplicitMeldNode<T>): void {
    if (!node.reversed) return
    node.reversed = false
    const tmp = node.left
    node.left = node.right
    node.right = tmp
    if (node.left !== null) {
      node.left.reversed = !node.left.reversed
    }
    if (node.right !== null) {
      node.right.reversed = !node.right.reversed
    }
  }

  private split(
    node: TreapImplicitMeldNode<T> | null,
    pos: number,
  ): [TreapImplicitMeldNode<T> | null, TreapImplicitMeldNode<T> | null] {
    if (node === null) return [null, null]
    this.pushDown(node)
    const leftSize = this.nodeSize(node.left)
    if (pos <= leftSize) {
      const [l, r] = this.split(node.left, pos)
      node.left = r
      this.updateSize(node)
      return [l, node]
    }
    const [l, r] = this.split(node.right, pos - leftSize - 1)
    node.right = l
    this.updateSize(node)
    return [node, r]
  }

  private meld(
    left: TreapImplicitMeldNode<T> | null,
    right: TreapImplicitMeldNode<T> | null,
  ): TreapImplicitMeldNode<T> | null {
    if (left === null) return right
    if (right === null) return left
    this.pushDown(left)
    this.pushDown(right)
    if (left.priority > right.priority) {
      left.right = this.meld(left.right, right)
      this.updateSize(left)
      return left
    }
    right.left = this.meld(left, right.left)
    this.updateSize(right)
    return right
  }

  private createNode(value: T): TreapImplicitMeldNode<T> {
    return { value, priority: Math.random(), left: null, right: null, size: 1, reversed: false }
  }

  push(item: T): void {
    const node = this.createNode(item)
    this.root = this.meld(this.root, node)
  }

  pop(): T | undefined {
    if (this.root === null) return undefined
    const [left, right] = this.split(this.root, this.root.size - 1)
    this.root = left
    this.pushDown(right!)
    return right!.value
  }

  shift(): T | undefined {
    if (this.root === null) return undefined
    const [left, right] = this.split(this.root, 1)
    this.root = right
    this.pushDown(left!)
    return left!.value
  }

  unshift(item: T): void {
    const node = this.createNode(item)
    this.root = this.meld(node, this.root)
  }

  insert(index: number, item: T): void {
    const n = this.size()
    if (index < 0) index = 0
    if (index > n) index = n
    const [left, right] = this.split(this.root, index)
    const node = this.createNode(item)
    this.root = this.meld(this.meld(left, node), right)
  }

  remove(index: number): T | undefined {
    if (index < 0 || index >= this.size()) return undefined
    const [left, midRight] = this.split(this.root, index)
    const [mid, right] = this.split(midRight, 1)
    this.root = this.meld(left, right)
    this.pushDown(mid!)
    return mid!.value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.size()) return undefined
    const [left, midRight] = this.split(this.root, index)
    const [mid, right] = this.split(midRight, 1)
    this.pushDown(mid!)
    const val = mid!.value
    this.root = this.meld(left, this.meld(mid, right))
    return val
  }

  set(index: number, item: T): void {
    if (index < 0 || index >= this.size()) return
    const [left, midRight] = this.split(this.root, index)
    const [mid, right] = this.split(midRight, 1)
    this.pushDown(mid!)
    mid!.value = item
    this.root = this.meld(left, this.meld(mid, right))
  }

  slice(start?: number, end?: number): T[] {
    const n = this.size()
    const s = start === undefined ? 0 : (start < 0 ? Math.max(0, n + start) : Math.min(start, n))
    const e = end === undefined ? n : (end < 0 ? Math.max(0, n + end) : Math.min(end, n))
    if (s >= e) return []
    const [left, midRight] = this.split(this.root, s)
    const [mid, right] = this.split(midRight, e - s)
    const result = this.nodeToArray(mid)
    this.root = this.meld(left, this.meld(mid, right))
    return result
  }

  concat(other: TreapImplicitMeld<T>): TreapImplicitMeld<T> {
    const result = new TreapImplicitMeld<T>()
    result.root = this.meld(this.cloneNode(this.root), this.cloneNode(other.root))
    return result
  }

  reverse(): void {
    if (this.root === null) return
    this.root.reversed = !this.root.reversed
  }

  reverseRange(start: number, end: number): void {
    const n = this.size()
    if (start < 0 || start >= end || end > n) return
    if (end - start <= 1) return
    const [left, midRight] = this.split(this.root, start)
    const [mid, right] = this.split(midRight, end - start)
    if (mid !== null) {
      mid.reversed = !mid.reversed
    }
    this.root = this.meld(left, this.meld(mid, right))
  }

  indexOf(item: T, fromIndex?: number): number {
    const n = this.size()
    const start = fromIndex ?? 0
    for (let i = start; i < n; i++) {
      if (this.get(i) === item) return i
    }
    return -1
  }

  includes(item: T): boolean {
    return this.indexOf(item) !== -1
  }

  size(): number {
    return this.nodeSize(this.root)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
  }

  toArray(): T[] {
    return this.nodeToArray(this.root)
  }

  private nodeToArray(node: TreapImplicitMeldNode<T> | null): T[] {
    const result: T[] = []
    const stack: TreapImplicitMeldNode<T>[] = []
    let current = node
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        this.pushDown(current)
        stack.push(current)
        current = current.left
      }
      const n = stack.pop()!
      result.push(n.value)
      current = n.right
    }
    return result
  }

  forEach(callback: (item: T, index: number) => void): void {
    let idx = 0
    for (const v of this) {
      callback(v, idx++)
    }
  }

  map<U>(callback: (item: T, index: number) => U): TreapImplicitMeld<U> {
    const result = new TreapImplicitMeld<U>()
    let idx = 0
    for (const v of this) {
      result.push(callback(v, idx++))
    }
    return result
  }

  filter(predicate: (item: T, index: number) => boolean): TreapImplicitMeld<T> {
    const result = new TreapImplicitMeld<T>()
    let idx = 0
    for (const v of this) {
      if (predicate(v, idx++)) {
        result.push(v)
      }
    }
    return result
  }

  clone(): TreapImplicitMeld<T> {
    const result = new TreapImplicitMeld<T>()
    result.root = this.cloneNode(this.root)
    return result
  }

  private cloneNode(node: TreapImplicitMeldNode<T> | null): TreapImplicitMeldNode<T> | null {
    if (node === null) return null
    return {
      value: node.value,
      priority: node.priority,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
      size: node.size,
      reversed: node.reversed,
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: TreapImplicitMeldNode<T>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        this.pushDown(current)
        stack.push(current)
        current = current.left
      }
      const node = stack.pop()!
      yield node.value
      current = node.right
    }
  }

  static fromArray<U>(items: U[]): TreapImplicitMeld<U> {
    const result = new TreapImplicitMeld<U>()
    for (const item of items) {
      result.push(item)
    }
    return result
  }
}

export type { TreapImplicitMeldNode } from './types.js'
