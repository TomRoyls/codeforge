import type { PlayTreeNode, CompareFunction, PlayTreeOptions } from './types.js'

export class PlayTree<T> {
  private root: PlayTreeNode<T> | null = null
  private _size: number = 0
  private compare: CompareFunction<T>

  constructor(options?: PlayTreeOptions<T>) {
    this.compare =
      options?.comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private splay(value: T): void {
    if (this.root === null) return

    const header: PlayTreeNode<T> = {
      value,
      left: null,
      right: null,
    }
    let leftMax = header
    let rightMin = header
    let node: PlayTreeNode<T> = this.root!

    while (true) {
      const cmp = this.compare(value, node!.value)
      if (cmp < 0) {
        if (node!.left === null) break
        if (this.compare(value, node!.left!.value) < 0) {
          const temp = node!.left!
          node!.left = temp.right
          temp.right = node
          node = temp
          if (node!.left === null) break
        }
        rightMin.left = node
        rightMin = node
        node = node!.left!
      } else if (cmp > 0) {
        if (node!.right === null) break
        if (this.compare(value, node!.right!.value) > 0) {
          const temp = node!.right!
          node!.right = temp.left
          temp.left = node
          node = temp
          if (node!.right === null) break
        }
        leftMax.right = node
        leftMax = node
        node = node!.right!
      } else {
        break
      }
    }

    leftMax.right = node!.left
    rightMin.left = node!.right
    node!.left = header.right
    node!.right = header.left
    this.root = node
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = { value, left: null, right: null }
      this._size++
      return
    }

    this.splay(value)

    const cmp = this.compare(value, this.root!.value)
    if (cmp === 0) return

    const newNode: PlayTreeNode<T> = { value, left: null, right: null }
    if (cmp < 0) {
      newNode.right = this.root
      newNode.left = this.root!.left
      this.root!.left = null
    } else {
      newNode.left = this.root
      newNode.right = this.root!.right
      this.root!.right = null
    }
    this.root = newNode
    this._size++
  }

  delete(value: T): boolean {
    if (this.root === null) return false

    this.splay(value)
    if (this.compare(value, this.root!.value) !== 0) return false

    if (this.root!.left === null) {
      this.root = this.root!.right
    } else {
      const rightSubtree = this.root!.right
      this.root = this.root!.left
      this.splay(value)
      this.root!.right = rightSubtree
    }

    this._size--
    return true
  }

  has(value: T): boolean {
    if (this.root === null) return false
    this.splay(value)
    return this.compare(value, this.root!.value) === 0
  }

  contains(value: T): boolean {
    return this.has(value)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  private inOrderTraversal(node: PlayTreeNode<T> | null, result: T[]): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push(node.value)
    this.inOrderTraversal(node.right, result)
  }

  toArray(): T[] {
    const result: T[] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  toArraySorted(): T[] {
    return this.toArray()
  }

  clone(): PlayTree<T> {
    const result = new PlayTree<T>({ comparator: this.compare })
    const all = this.toArray()
    for (const value of all) {
      result.insert(value)
    }
    return result
  }

  static fromArray<T>(arr: T[], options?: PlayTreeOptions<T>): PlayTree<T> {
    const tree = new PlayTree<T>(options)
    for (const value of arr) {
      tree.insert(value)
    }
    return tree
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return node.value
  }

  max(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.value
  }

  forEach(callback: (value: T, tree: PlayTree<T>) => void): void {
    const all = this.toArray()
    for (const value of all) {
      callback(value, this)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: PlayTreeNode<T>[] = []
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

  lowerBound(value: T): T | undefined {
    let result: PlayTreeNode<T> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp <= 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? result.value : undefined
  }

  upperBound(value: T): T | undefined {
    let result: PlayTreeNode<T> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? result.value : undefined
  }

  predecessor(value: T): T | undefined {
    let result: PlayTreeNode<T> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp > 0) {
        result = node
        node = node.right
      } else {
        node = node.left
      }
    }
    return result ? result.value : undefined
  }

  successor(value: T): T | undefined {
    let result: PlayTreeNode<T> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? result.value : undefined
  }

  rank(value: T): number {
    const all = this.toArray()
    let count = 0
    for (const v of all) {
      if (this.compare(v, value) < 0) {
        count++
      } else {
        break
      }
    }
    return count
  }

  select(k: number): T | undefined {
    if (k < 0 || k >= this._size) return undefined
    const all = this.toArray()
    return all[k]
  }

  split(value: T): [PlayTree<T>, PlayTree<T>] {
    const left = new PlayTree<T>({ comparator: this.compare })
    const right = new PlayTree<T>({ comparator: this.compare })
    for (const v of this) {
      if (this.compare(v, value) <= 0) {
        left.insert(v)
      } else {
        right.insert(v)
      }
    }
    return [left, right]
  }

  merge(other: PlayTree<T>): void {
    for (const v of other) {
      this.insert(v)
    }
  }

  rangeQuery(lo: T, hi: T): T[] {
    const result: T[] = []
    for (const v of this) {
      const cmpLo = this.compare(v, lo)
      if (cmpLo >= 0) {
        const cmpHi = this.compare(v, hi)
        if (cmpHi <= 0) {
          result.push(v)
        } else {
          break
        }
      }
    }
    return result
  }

  first(): T | undefined {
    return this.min()
  }

  last(): T | undefined {
    return this.max()
  }

  count(): number {
    return this._size
  }

  private computeDepth(node: PlayTreeNode<T> | null): number {
    if (node === null) return 0
    const leftDepth = this.computeDepth(node.left)
    const rightDepth = this.computeDepth(node.right)
    return 1 + Math.max(leftDepth, rightDepth)
  }

  depth(): number {
    return this.computeDepth(this.root)
  }

  toString(): string {
    return `PlayTree({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'PlayTree', size: this.size, items: this.toArray() }
  }
}

export type { PlayTreeNode, CompareFunction, PlayTreeOptions } from './types.js'
