import type { BinomialHeapOptions, BinomialNode } from './types.js'
import { DEFAULT_BINOMIAL_HEAP_OPTIONS } from './types.js'

export class BinomialHeap<T = unknown> {
  private head: BinomialNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: Partial<BinomialHeapOptions>) {
    const opts = { ...DEFAULT_BINOMIAL_HEAP_OPTIONS, ...options }
    if (opts.comparator) {
      const cmp = opts.comparator
      this.compare = (a: T, b: T) => cmp(a, b)
    } else {
      this.compare = (a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      }
    }
  }

  insert(value: T): void {
    const node: BinomialNode<T> = {
      value,
      degree: 0,
      parent: null,
      child: null,
      sibling: null,
    }
    this.head = this.unionRoots(this.head, node)
    this._size++
  }

  peek(): T | undefined {
    if (this.head === null) return undefined
    const minNode = this.findMinNode()
    return minNode.value
  }

  extractMin(): T | undefined {
    if (this.head === null) return undefined

    const { prev: minPrev, node: minNode } = this.findMinNodeWithPrev()

    if (minPrev !== null) {
      minPrev.sibling = minNode.sibling
    } else {
      this.head = minNode.sibling
    }

    const childList = this.reverseChildList(minNode.child)
    if (childList !== null) {
      this.head = this.unionRoots(this.head, childList)
    }
    this._size--

    return minNode.value
  }

  merge(other: BinomialHeap<T>): void {
    if (other.head === null) return

    this.head = this.unionRoots(this.head, other.head)
    this._size += other._size
    other.clear()
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.head = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    this.collectValues(this.head, result)
    return result
  }

  contains(value: T): boolean {
    return this.findNodeByValue(this.head, value) !== null
  }

  clone(): BinomialHeap<T> {
    const cloned = new BinomialHeap<T>()
    if (this.head === null) return cloned
    cloned.head = this.cloneTree(this.head)
    cloned._size = this._size
    return cloned
  }

  isValid(): boolean {
    if (this.head === null) return true
    let current: BinomialNode<T> | null = this.head
    const degrees = new Set<number>()
    while (current !== null) {
      if (!this.isValidBinomialTree(current)) return false
      if (degrees.has(current.degree)) return false
      degrees.add(current.degree)
      if (current.sibling !== null && current.degree >= current.sibling.degree) {
        return false
      }
      current = current.sibling
    }
    return true
  }

  decreaseKey(oldValue: T, newValue: T): boolean {
    if (this.compare(newValue, oldValue) > 0) return false
    const node = this.findNodeByValue(this.head, oldValue)
    if (node === null) return false
    node.value = newValue
    this.bubbleUp(node)
    return true
  }

  private findMinNode(): BinomialNode<T> {
    let min: BinomialNode<T> = this.head!
    let current: BinomialNode<T> | null = this.head!.sibling
    while (current !== null) {
      if (this.compare(current.value, min.value) < 0) {
        min = current
      }
      current = current.sibling
    }
    return min
  }

  private findMinNodeWithPrev(): { prev: BinomialNode<T> | null; node: BinomialNode<T> } {
    let minPrev: BinomialNode<T> | null = null
    let minNode: BinomialNode<T> = this.head!
    let prev: BinomialNode<T> | null = null
    let current: BinomialNode<T> | null = this.head!
    while (current !== null) {
      if (this.compare(current.value, minNode.value) < 0) {
        minNode = current
        minPrev = prev
      }
      prev = current
      current = current.sibling
    }
    return { prev: minPrev, node: minNode }
  }

  private unionRoots(h1: BinomialNode<T> | null, h2: BinomialNode<T> | null): BinomialNode<T> | null {
    if (h1 === null) return h2
    if (h2 === null) return h1

    let head: BinomialNode<T>
    let tail: BinomialNode<T>
    let a: BinomialNode<T> | null = h1
    let b: BinomialNode<T> | null = h2

    if (a.degree <= b.degree) {
      head = a
      a = a.sibling
    } else {
      head = b
      b = b.sibling
    }
    tail = head

    while (a !== null && b !== null) {
      if (a.degree <= b.degree) {
        tail.sibling = a
        a = a.sibling
      } else {
        tail.sibling = b
        b = b.sibling
      }
      tail = tail.sibling!
    }

    tail.sibling = a !== null ? a : b

    return this.consolidate(head)
  }

  private consolidate(head: BinomialNode<T>): BinomialNode<T> {
    if (head.sibling === null) return head

    let prev: BinomialNode<T> | null = null
    let current: BinomialNode<T> = head
    let next: BinomialNode<T> | null = current.sibling

    while (next !== null) {
      const mergeNext = next.sibling !== null && next.sibling.degree === current.degree
      if (current.degree !== next.degree) {
        prev = current
        current = next
        next = current.sibling
      } else if (mergeNext) {
        prev = current
        current = next
        next = current.sibling
      } else {
        if (this.compare(current.value, next.value) <= 0) {
          current.sibling = next.sibling
          this.linkTrees(current, next)
        } else {
          if (prev === null) {
            head = next
          } else {
            prev.sibling = next
          }
          this.linkTrees(next, current)
          current = next
        }
        next = current.sibling
      }
    }

    return head
  }

  private linkTrees(parent: BinomialNode<T>, child: BinomialNode<T>): void {
    child.parent = parent
    child.sibling = parent.child
    parent.child = child
    parent.degree++
  }

  private reverseChildList(node: BinomialNode<T> | null): BinomialNode<T> | null {
    if (node === null) return null
    let prev: BinomialNode<T> | null = null
    let current: BinomialNode<T> | null = node
    while (current !== null) {
      const next: BinomialNode<T> | null = current.sibling
      current.sibling = prev
      current.parent = null
      prev = current
      current = next
    }
    return prev
  }

  private bubbleUp(node: BinomialNode<T>): void {
    let current = node
    while (current.parent !== null) {
      if (this.compare(current.value, current.parent.value) < 0) {
        const temp = current.value
        current.value = current.parent.value
        current.parent.value = temp
        current = current.parent
      } else {
        break
      }
    }
  }

  private collectValues(root: BinomialNode<T> | null, result: T[]): void {
    let current = root
    while (current !== null) {
      result.push(current.value)
      this.collectValues(current.child, result)
      current = current.sibling
    }
  }

  private findNodeByValue(root: BinomialNode<T> | null, value: T): BinomialNode<T> | null {
    let current = root
    while (current !== null) {
      if (current.value === value) return current
      const childResult = this.findNodeByValue(current.child, value)
      if (childResult !== null) return childResult
      current = current.sibling
    }
    return null
  }

  private cloneTree(root: BinomialNode<T> | null): BinomialNode<T> | null {
    if (root === null) return null
    const node: BinomialNode<T> = {
      value: root.value,
      degree: root.degree,
      parent: null,
      child: this.cloneTree(root.child),
      sibling: this.cloneTree(root.sibling),
    }
    if (node.child !== null) {
      this.setParent(node.child, node)
    }
    return node
  }

  private setParent(child: BinomialNode<T>, parent: BinomialNode<T>): void {
    let current: BinomialNode<T> | null = child
    while (current !== null) {
      current.parent = parent
      current = current.sibling
    }
  }

  private isValidBinomialTree(node: BinomialNode<T>): boolean {
    let child: BinomialNode<T> | null = node.child
    let expectedDegree = node.degree - 1
    while (child !== null) {
      if (child.degree !== expectedDegree) return false
      if (this.compare(child.value, node.value) < 0) return false
      if (!this.isValidBinomialTree(child)) return false
      expectedDegree--
      child = child.sibling
    }
    return true
  }
}

export { DEFAULT_BINOMIAL_HEAP_OPTIONS } from './types.js'
export type { BinomialHeapOptions, BinomialNode } from './types.js'
