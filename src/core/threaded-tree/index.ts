import type { ThreadedTreeOptions } from './types.js'

export type { ThreadedTreeOptions } from './types.js'

class ThreadedNode<T> {
  value: T
  left: ThreadedNode<T> | null = null
  right: ThreadedNode<T> | null = null
  leftThread = true
  rightThread = true

  constructor(value: T) {
    this.value = value
  }
}

export class ThreadedTree<T> {
  private root: ThreadedNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: ThreadedTreeOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  private leftmost(node: ThreadedNode<T>): ThreadedNode<T> {
    let cur = node
    while (!cur.leftThread && cur.left !== null) {
      cur = cur.left
    }
    return cur
  }

  private rightmost(node: ThreadedNode<T>): ThreadedNode<T> {
    let cur = node
    while (!cur.rightThread && cur.right !== null) {
      cur = cur.right
    }
    return cur
  }

  private inOrderSuccessor(node: ThreadedNode<T>): ThreadedNode<T> | null {
    if (node.rightThread) return node.right
    if (node.right !== null) return this.leftmost(node.right)
    return null
  }

  private inOrderPredecessor(node: ThreadedNode<T>): ThreadedNode<T> | null {
    if (node.leftThread) return node.left
    if (node.left !== null) return this.rightmost(node.left)
    return null
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = new ThreadedNode(value)
      this._size++
      return
    }

    let current = this.root
    while (true) {
      const cmp = this.compare(value, current.value)
      if (cmp === 0) return

      if (cmp < 0) {
        if (current.leftThread || current.left === null) {
          const node = new ThreadedNode(value)
          node.left = current.left
          node.leftThread = current.leftThread
          node.right = current
          node.rightThread = true
          current.left = node
          current.leftThread = false
          this._size++
          return
        }
        current = current.left
      } else {
        if (current.rightThread || current.right === null) {
          const node = new ThreadedNode(value)
          node.right = current.right
          node.rightThread = current.rightThread
          node.left = current
          node.leftThread = true
          current.right = node
          current.rightThread = false
          this._size++
          return
        }
        current = current.right
      }
    }
  }

  remove(value: T): boolean {
    let parent: ThreadedNode<T> | null = null
    let current: ThreadedNode<T> | null = this.root
    let isLeftChild = false

    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp === 0) break
      parent = current
      if (cmp < 0) {
        if (current.leftThread) return false
        current = current.left
        isLeftChild = true
      } else {
        if (current.rightThread) return false
        current = current.right
        isLeftChild = false
      }
    }

    if (current === null) return false

    if (!current.leftThread && !current.rightThread && current.left !== null && current.right !== null) {
      const successor = this.leftmost(current.right)
      const successorValue = successor.value
      this.remove(successorValue)
      current.value = successorValue
      return true
    }

    if (!current.leftThread && current.left !== null) {
      const child = current.left
      const rm = this.rightmost(child)
      rm.right = current.right

      if (parent === null) {
        this.root = child
      } else if (isLeftChild) {
        parent.left = child
      } else {
        parent.right = child
      }
      this._size--
      return true
    }

    if (!current.rightThread && current.right !== null) {
      const child = current.right
      const lm = this.leftmost(child)
      lm.left = current.left

      if (parent === null) {
        this.root = child
      } else if (isLeftChild) {
        parent.left = child
      } else {
        parent.right = child
      }
      this._size--
      return true
    }

    if (parent === null) {
      this.root = null
    } else if (isLeftChild) {
      parent.left = current.left
      parent.leftThread = true
    } else {
      parent.right = current.right
      parent.rightThread = true
    }
    this._size--
    return true
  }

  contains(value: T): boolean {
    return this.findNode(value) !== null
  }

  private findNode(value: T): ThreadedNode<T> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp === 0) return current
      if (cmp < 0) {
        if (current.leftThread) return null
        current = current.left
      } else {
        if (current.rightThread) return null
        current = current.right
      }
    }
    return null
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    return this.leftmost(this.root).value
  }

  max(): T | undefined {
    if (this.root === null) return undefined
    return this.rightmost(this.root).value
  }

  predecessor(value: T): T | undefined {
    const node = this.findNode(value)
    if (node === null) return undefined
    const pred = this.inOrderPredecessor(node)
    return pred?.value
  }

  successor(value: T): T | undefined {
    const node = this.findNode(value)
    if (node === null) return undefined
    const succ = this.inOrderSuccessor(node)
    return succ?.value
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

  toArray(): T[] {
    return this.toArraySorted()
  }

  toArraySorted(): T[] {
    const result: T[] = []
    if (this.root === null) return result
    let current: ThreadedNode<T> | null = this.leftmost(this.root)
    while (current !== null) {
      result.push(current.value)
      current = this.inOrderSuccessor(current)
    }
    return result
  }

  forEach(callback: (value: T) => void): void {
    if (this.root === null) return
    let current: ThreadedNode<T> | null = this.leftmost(this.root)
    while (current !== null) {
      callback(current.value)
      current = this.inOrderSuccessor(current)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    if (this.root === null) return
    let current: ThreadedNode<T> | null = this.leftmost(this.root)
    while (current !== null) {
      yield current.value
      current = this.inOrderSuccessor(current)
    }
  }

  clone(): ThreadedTree<T> {
    const cloned = new ThreadedTree<T>({ comparator: this.compare })
    for (const v of this) {
      cloned.insert(v)
    }
    return cloned
  }

  static fromArray<U>(arr: U[], comparator?: (a: U, b: U) => number): ThreadedTree<U> {
    const tree = new ThreadedTree<U>(comparator ? { comparator } : undefined)
    for (const v of arr) {
      tree.insert(v)
    }
    return tree
  }

  first(): T | undefined {
    return this.min()
  }

  last(): T | undefined {
    return this.max()
  }

  lowerBound(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.value, value)
      if (cmp >= 0) {
        result = current.value
        if (current.leftThread) break
        current = current.left
      } else {
        if (current.rightThread) break
        current = current.right
      }
    }
    return result
  }

  upperBound(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.value, value)
      if (cmp > 0) {
        result = current.value
        if (current.leftThread) break
        current = current.left
      } else {
        if (current.rightThread) break
        current = current.right
      }
    }
    return result
  }

  count(lo: T, hi: T): number {
    let c = 0
    if (this.root === null) return 0
    let current: ThreadedNode<T> | null = this.leftmost(this.root)
    while (current !== null) {
      const cmpLo = this.compare(current.value, lo)
      const cmpHi = this.compare(current.value, hi)
      if (cmpLo >= 0 && cmpHi <= 0) c++
      if (cmpHi > 0) break
      current = this.inOrderSuccessor(current)
    }
    return c
  }

  inOrderTraversal(callback: (value: T) => void): void {
    this.forEach(callback)
  }

  reverseTraversal(callback: (value: T) => void): void {
    if (this.root === null) return
    let current: ThreadedNode<T> | null = this.rightmost(this.root)
    while (current !== null) {
      callback(current.value)
      current = this.inOrderPredecessor(current)
    }
  }
}
