import type { ImplicitTreapNode, ImplicitTreapOptions } from './types.js'

export class ImplicitTreap<T> {
  private root: ImplicitTreapNode<T> | null = null

  constructor(opts?: ImplicitTreapOptions<T>) {
    if (opts?.initialValues) {
      for (const v of opts.initialValues) {
        this.pushBack(v)
      }
    }
  }

  private nodeSize(node: ImplicitTreapNode<T> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: ImplicitTreapNode<T>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private pushDown(node: ImplicitTreapNode<T>): void {
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
    node: ImplicitTreapNode<T> | null,
    pos: number,
  ): [ImplicitTreapNode<T> | null, ImplicitTreapNode<T> | null] {
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

  private merge(
    left: ImplicitTreapNode<T> | null,
    right: ImplicitTreapNode<T> | null,
  ): ImplicitTreapNode<T> | null {
    if (left === null) return right
    if (right === null) return left
    this.pushDown(left)
    this.pushDown(right)
    if (left.priority > right.priority) {
      left.right = this.merge(left.right, right)
      this.updateSize(left)
      return left
    }
    right.left = this.merge(left, right.left)
    this.updateSize(right)
    return right
  }

  private createNode(value: T): ImplicitTreapNode<T> {
    return { value, priority: Math.random(), left: null, right: null, size: 1, reversed: false }
  }

  pushBack(v: T): void {
    const node = this.createNode(v)
    this.root = this.merge(this.root, node)
  }

  pushFront(v: T): void {
    const node = this.createNode(v)
    this.root = this.merge(node, this.root)
  }

  popBack(): T | undefined {
    if (this.root === null) return undefined
    const [left, right] = this.split(this.root, this.root.size - 1)
    this.root = left
    this.pushDown(right!)
    return right!.value
  }

  popFront(): T | undefined {
    if (this.root === null) return undefined
    const [left, right] = this.split(this.root, 1)
    this.root = right
    this.pushDown(left!)
    return left!.value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.size()) return undefined
    const [left, midRight] = this.split(this.root, index)
    const [mid, right] = this.split(midRight, 1)
    this.pushDown(mid!)
    const val = mid!.value
    this.root = this.merge(left, this.merge(mid, right))
    return val
  }

  set(index: number, v: T): void {
    if (index < 0 || index >= this.size()) return
    const [left, midRight] = this.split(this.root, index)
    const [mid, right] = this.split(midRight, 1)
    this.pushDown(mid!)
    mid!.value = v
    this.root = this.merge(left, this.merge(mid, right))
  }

  insertAt(index: number, v: T): void {
    const n = this.size()
    if (index < 0) index = 0
    if (index > n) index = n
    const [left, right] = this.split(this.root, index)
    const node = this.createNode(v)
    this.root = this.merge(this.merge(left, node), right)
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.size()) return undefined
    const [left, midRight] = this.split(this.root, index)
    const [mid, right] = this.split(midRight, 1)
    this.root = this.merge(left, right)
    this.pushDown(mid!)
    return mid!.value
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
    const result: T[] = []
    const stack: ImplicitTreapNode<T>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        this.pushDown(current)
        stack.push(current)
        current = current.left
      }
      const node = stack.pop()!
      result.push(node.value)
      current = node.right
    }
    return result
  }

  reverse(start?: number, end?: number): void {
    const n = this.size()
    const s = start ?? 0
    const e = end ?? n
    if (s < 0 || s >= e || e > n) return
    const len = e - s
    if (len <= 1) return
    const [left, midRight] = this.split(this.root, s)
    const [mid, right] = this.split(midRight, len)
    if (mid !== null) {
      mid.reversed = !mid.reversed
    }
    this.root = this.merge(left, this.merge(mid, right))
  }

  rotateLeft(k: number): void {
    const n = this.size()
    if (n === 0) return
    k = ((k % n) + n) % n
    if (k === 0) return
    const [left, right] = this.split(this.root, k)
    this.root = this.merge(right, left)
  }

  slice(start: number, end?: number): ImplicitTreap<T> {
    const n = this.size()
    const s = start < 0 ? Math.max(0, n + start) : Math.min(start, n)
    const e = end === undefined ? n : (end < 0 ? Math.max(0, n + end) : Math.min(end, n))
    if (s >= e) return new ImplicitTreap<T>()
    const [left, midRight] = this.split(this.root, s)
    const [mid, right] = this.split(midRight, e - s)
    const result = new ImplicitTreap<T>()
    result.root = this.cloneNode(mid)
    this.root = this.merge(left, this.merge(mid, right))
    return result
  }

  private cloneNode(node: ImplicitTreapNode<T> | null): ImplicitTreapNode<T> | null {
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

  concat(other: ImplicitTreap<T>): ImplicitTreap<T> {
    const result = new ImplicitTreap<T>()
    result.root = this.merge(this.cloneNode(this.root), this.cloneNode(other.root))
    return result
  }

  indexOf(v: T, fromIndex?: number): number {
    const n = this.size()
    const start = fromIndex ?? 0
    for (let i = start; i < n; i++) {
      if (this.get(i) === v) return i
    }
    return -1
  }

  contains(v: T): boolean {
    return this.indexOf(v) !== -1
  }

  clone(): ImplicitTreap<T> {
    const result = new ImplicitTreap<T>()
    result.root = this.cloneNode(this.root)
    return result
  }

  forEach(cb: (value: T, index: number) => void): void {
    let idx = 0
    for (const v of this) {
      cb(v, idx++)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: ImplicitTreapNode<T>[] = []
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
}

export type { ImplicitTreapNode, ImplicitTreapOptions } from './types.js'
