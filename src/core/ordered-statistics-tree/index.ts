import type { CompareFunction, OSTNode } from './types.js'

export class OrderedStatisticsTree<T> {
  private root: OSTNode<T> | null = null
  private compare: CompareFunction<T>

  constructor(comparator?: CompareFunction<T>) {
    this.compare = comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private nodeSize(node: OSTNode<T> | null): number {
    return node === null ? 0 : node.size
  }

  private nodeHeight(node: OSTNode<T> | null): number {
    return node === null ? 0 : node.height
  }

  private updateNode(node: OSTNode<T>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
    node.height = 1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
  }

  private balanceFactor(node: OSTNode<T>): number {
    return this.nodeHeight(node.left) - this.nodeHeight(node.right)
  }

  private rotateRight(y: OSTNode<T>): OSTNode<T> {
    const x = y.left!
    y.left = x.right
    x.right = y
    this.updateNode(y)
    this.updateNode(x)
    return x
  }

  private rotateLeft(x: OSTNode<T>): OSTNode<T> {
    const y = x.right!
    x.right = y.left
    y.left = x
    this.updateNode(x)
    this.updateNode(y)
    return y
  }

  private balance(node: OSTNode<T>): OSTNode<T> {
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

  private insertNode(node: OSTNode<T> | null, key: T): OSTNode<T> {
    if (node === null) {
      return { key, left: null, right: null, height: 1, size: 1 }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key)
    } else {
      return node
    }
    return this.balance(node)
  }

  insert(key: T): void {
    this.root = this.insertNode(this.root, key)
  }

  private findMin(node: OSTNode<T>): OSTNode<T> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private deleteNode(node: OSTNode<T> | null, key: T): OSTNode<T> | null {
    if (node === null) {
      return null
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
    } else {
      if (node.left === null) {
        return node.right
      }
      if (node.right === null) {
        return node.left
      }
      const successor = this.findMin(node.right)
      node.key = successor.key
      node.right = this.deleteNode(node.right, successor.key)
    }
    return this.balance(node)
  }

  delete(key: T): boolean {
    if (!this.has(key)) {
      return false
    }
    this.root = this.deleteNode(this.root, key)
    return true
  }

  private findNode(key: T): boolean {
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp === 0) {
        return true
      }
      node = cmp < 0 ? node.left : node.right
    }
    return false
  }

  has(key: T): boolean {
    return this.findNode(key)
  }

  rank(key: T): number {
    let r = 0
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        r += 1 + this.nodeSize(node.left)
        node = node.right
      } else {
        r += this.nodeSize(node.left)
        return r
      }
    }
    return -1
  }

  select(i: number): T | undefined {
    if (i < 0 || i >= this.size()) {
      return undefined
    }
    let node = this.root
    while (node !== null) {
      const leftSize = this.nodeSize(node.left)
      if (i < leftSize) {
        node = node.left
      } else if (i === leftSize) {
        return node.key
      } else {
        i -= leftSize + 1
        node = node.right
      }
    }
    return undefined
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

  min(): T | undefined {
    if (this.root === null) {
      return undefined
    }
    return this.findMin(this.root).key
  }

  max(): T | undefined {
    if (this.root === null) {
      return undefined
    }
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.key
  }

  floor(key: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp === 0) {
        return node.key
      }
      if (cmp > 0) {
        result = node.key
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  ceiling(key: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp === 0) {
        return node.key
      }
      if (cmp < 0) {
        result = node.key
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  lower(key: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp > 0) {
        result = node.key
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  higher(key: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        result = node.key
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  range(lo: T, hi: T): T[] {
    const result: T[] = []
    this.rangeCollect(this.root, lo, hi, result)
    return result
  }

  private rangeCollect(node: OSTNode<T> | null, lo: T, hi: T, result: T[]): void {
    if (node === null) {
      return
    }
    const cmpLo = this.compare(node.key, lo)
    const cmpHi = this.compare(node.key, hi)
    if (cmpLo > 0) {
      this.rangeCollect(node.left, lo, hi, result)
    }
    if (cmpLo >= 0 && cmpHi <= 0) {
      result.push(node.key)
    }
    if (cmpHi < 0) {
      this.rangeCollect(node.right, lo, hi, result)
    }
  }

  count(lo: T, hi: T): number {
    return this.range(lo, hi).length
  }

  toArray(): T[] {
    const result: T[] = []
    this.inorderCollect(this.root, result)
    return result
  }

  private inorderCollect(node: OSTNode<T> | null, result: T[]): void {
    if (node === null) {
      return
    }
    this.inorderCollect(node.left, result)
    result.push(node.key)
    this.inorderCollect(node.right, result)
  }

  forEach(callback: (key: T, index: number) => void): void {
    let idx = 0
    const visit = (node: OSTNode<T> | null): void => {
      if (node === null) return
      visit(node.left)
      callback(node.key, idx++)
      visit(node.right)
    }
    visit(this.root)
  }

  private forEachNode(node: OSTNode<T> | null, callback: (key: T, index: number) => void, idx: { value: () => number }): void {
    if (node === null) {
      return
    }
    this.forEachNode(node.left, callback, idx)
    callback(node.key, idx.value())
    this.forEachNode(node.right, callback, idx)
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: OSTNode<T>[] = []
    let node = this.root
    while (stack.length > 0 || node !== null) {
      while (node !== null) {
        stack.push(node)
        node = node.left
      }
      node = stack.pop()!
      yield node.key
      node = node.right
    }
  }

  iterator(): Iterator<T> {
    const stack: OSTNode<T>[] = []
    let node: OSTNode<T> | null = this.root
    return {
      next: (): IteratorResult<T> => {
        while (node !== null) {
          stack.push(node)
          node = node.left
        }
        if (stack.length === 0) {
          return { value: undefined as unknown as T, done: true }
        }
        node = stack.pop()!
        const result = node.key
        node = node.right
        return { value: result, done: false }
      },
    }
  }
}
