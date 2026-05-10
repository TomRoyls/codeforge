import type { IndexedSetNode, IndexedSetComparator, IndexedSetOptions, IndexedSetStats } from './types.js'
import { DEFAULT_INDEXED_SET_COMPARATOR } from './types.js'

export class IndexedSet<T = string | number> {
  private root: IndexedSetNode<T> | null = null
  private _size: number = 0
  private compare: IndexedSetComparator<T>

  constructor(options?: IndexedSetOptions<T>) {
    this.compare = options?.comparator ?? (DEFAULT_INDEXED_SET_COMPARATOR as IndexedSetComparator<T>)
  }

  private nodeSize(node: IndexedSetNode<T> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: IndexedSetNode<T>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private rotateRight(y: IndexedSetNode<T>): IndexedSetNode<T> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateSize(y)
    this.updateSize(x)
    return x
  }

  private rotateLeft(x: IndexedSetNode<T>): IndexedSetNode<T> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateSize(x)
    this.updateSize(y)
    return y
  }

  add(value: T): boolean {
    const prev = this._size
    this.root = this.insertNode(this.root, value)
    return this._size > prev
  }

  private insertNode(node: IndexedSetNode<T> | null, value: T): IndexedSetNode<T> {
    if (node === null) {
      this._size++
      return { value, priority: Math.random(), left: null, right: null, size: 1 }
    }
    const cmp = this.compare(value, node.value)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value)
      if (node.left!.priority > node.priority) {
        node = this.rotateRight(node)
      } else {
        this.updateSize(node)
      }
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value)
      if (node.right!.priority > node.priority) {
        node = this.rotateLeft(node)
      } else {
        this.updateSize(node)
      }
    }
    return node
  }

  delete(value: T): boolean {
    if (!this.has(value)) return false
    this.root = this.deleteNode(this.root, value)
    return true
  }

  private deleteNode(node: IndexedSetNode<T> | null, value: T): IndexedSetNode<T> | null {
    if (node === null) return null
    const cmp = this.compare(value, node.value)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value)
      this.updateSize(node)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, value)
      this.updateSize(node)
      return node
    }
    if (node.left === null && node.right === null) {
      this._size--
      return null
    }
    if (node.left === null) {
      this._size--
      return node.right
    }
    if (node.right === null) {
      this._size--
      return node.left
    }
    if (node.left.priority > node.right.priority) {
      node = this.rotateRight(node)
      node.right = this.deleteNode(node.right, value)
    } else {
      node = this.rotateLeft(node)
      node.left = this.deleteNode(node.left, value)
    }
    this.updateSize(node)
    return node
  }

  has(value: T): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp === 0) return true
      current = cmp < 0 ? current.left : current.right
    }
    return false
  }

  atIndex(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    let node = this.root
    while (node !== null) {
      const leftSize = this.nodeSize(node.left)
      if (index < leftSize) {
        node = node.left
      } else if (index === leftSize) {
        return node.value
      } else {
        index -= leftSize + 1
        node = node.right
      }
    }
    return undefined
  }

  indexOf(value: T): number {
    let result = 0
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        result += this.nodeSize(node.left) + 1
        node = node.right
      } else {
        result += this.nodeSize(node.left)
        return result
      }
    }
    return -1
  }

  rank(value: T): number {
    let result = 0
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        result += this.nodeSize(node.left) + 1
        node = node.right
      } else {
        result += this.nodeSize(node.left)
        return result
      }
    }
    return result
  }

  get min(): T | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.left !== null) {
      current = current.left
    }
    return current.value
  }

  get max(): T | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) {
      current = current.right
    }
    return current.value
  }

  lowerBound(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.value, value)
      if (cmp >= 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  upperBound(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.value, value)
      if (cmp > 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  range(lower: T, upper: T): T[] {
    if (this.root === null) return []
    if (this.compare(lower, upper) > 0) return []
    const result: T[] = []
    this.rangeCollect(this.root, lower, upper, result)
    return result
  }

  private rangeCollect(node: IndexedSetNode<T> | null, lower: T, upper: T, result: T[]): void {
    if (node === null) return
    const cmpLower = this.compare(node.value, lower)
    const cmpUpper = this.compare(node.value, upper)
    if (cmpLower > 0) {
      this.rangeCollect(node.left, lower, upper, result)
    }
    if (cmpLower >= 0 && cmpUpper <= 0) {
      result.push(node.value)
    }
    if (cmpUpper < 0) {
      this.rangeCollect(node.right, lower, upper, result)
    }
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    const traverse = (node: IndexedSetNode<T> | null): void => {
      if (node === null) return
      traverse(node.left)
      callback(node.value, idx++)
      traverse(node.right)
    }
    traverse(this.root)
  }

  toArray(): T[] {
    const result: T[] = []
    const stack: IndexedSetNode<T>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      result.push(current.value)
      current = current.right
    }
    return result
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  clone(): IndexedSet<T> {
    const result = new IndexedSet<T>({ comparator: this.compare })
    for (const value of this) {
      result.add(value)
    }
    return result
  }

  static from<U>(items: Iterable<U>, options?: IndexedSetOptions<U>): IndexedSet<U> {
    const set = new IndexedSet<U>(options)
    for (const item of items) {
      set.add(item)
    }
    return set
  }

  union(other: IndexedSet<T>): IndexedSet<T> {
    const result = new IndexedSet<T>({ comparator: this.compare })
    for (const value of this.toArray()) {
      result.add(value)
    }
    for (const value of other.toArray()) {
      result.add(value)
    }
    return result
  }

  intersection(other: IndexedSet<T>): IndexedSet<T> {
    const result = new IndexedSet<T>({ comparator: this.compare })
    for (const value of this.toArray()) {
      if (other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  difference(other: IndexedSet<T>): IndexedSet<T> {
    const result = new IndexedSet<T>({ comparator: this.compare })
    for (const value of this.toArray()) {
      if (!other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  stats(): IndexedSetStats {
    return {
      size: this._size,
      height: this.computeHeight(this.root),
      minValue: this.min ?? undefined,
      maxValue: this.max ?? undefined,
    }
  }

  private computeHeight(node: IndexedSetNode<T> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: IndexedSetNode<T>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield current.value
      current = current.right
    }
  }
}

export type { IndexedSetNode, IndexedSetComparator, IndexedSetOptions, IndexedSetStats } from './types.js'
export { DEFAULT_INDEXED_SET_COMPARATOR } from './types.js'
