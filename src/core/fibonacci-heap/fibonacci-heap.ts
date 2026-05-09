import type { CompareFunction, FibonacciNode } from './types.js'
import { DEFAULT_COMPARE } from './types.js'

export class FibonacciHeap<T = number> {
  private min: FibonacciNode<T> | null = null
  private _size = 0
  private compare: CompareFunction<T>

  constructor(compare?: CompareFunction<T>) {
    this.compare = (compare ?? DEFAULT_COMPARE) as CompareFunction<T>
  }

  insert(value: T): FibonacciNode<T> {
    const node: FibonacciNode<T> = {
      value,
      degree: 0,
      marked: false,
      parent: null,
      child: null,
      left: null!,
      right: null!,
    }
    node.left = node
    node.right = node
    if (this.min === null) {
      this.min = node
    } else {
      this.insertIntoRootList(node)
      if (this.compare(node.value, this.min.value) < 0) {
        this.min = node
      }
    }
    this._size++
    return node
  }

  extractMin(): T | undefined {
    if (this.min === null) {
      return undefined
    }
    const z = this.min
    if (z.child !== null) {
      let child = z.child
      do {
        const next = child.right
        this.insertIntoRootList(child)
        child.parent = null
        child = next
      } while (child !== z.child)
    }
    this.removeFromList(z)
    if (z.right === z) {
      this.min = null
    } else {
      this.min = z.right
      this.consolidate()
    }
    this._size--
    return z.value
  }

  peek(): T | undefined {
    if (this.min === null) {
      return undefined
    }
    return this.min.value
  }

  decreaseKey(node: FibonacciNode<T>, newValue: T): void {
    if (this.compare(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
    const parent = node.parent
    if (parent !== null && this.compare(node.value, parent.value) < 0) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    if (this.min !== null && this.compare(node.value, this.min.value) < 0) {
      this.min = node
    }
  }

  delete(node: FibonacciNode<T>): void {
    const parent = node.parent
    if (parent !== null) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    this.min = node
    this.extractMin()
  }

  merge(other: FibonacciHeap<T>): void {
    if (other.min === null) {
      return
    }
    if (this.min === null) {
      this.min = other.min
    } else {
      this.concatenate(other.min)
      if (this.compare(other.min.value, this.min.value) < 0) {
        this.min = other.min
      }
    }
    this._size += other._size
    other.min = null
    other._size = 0
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.min = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    if (this.min === null) {
      return result
    }
    const temp = this.clone()
    while (!temp.isEmpty()) {
      const val = temp.extractMin()!
      result.push(val)
    }
    return result
  }

  clone(): FibonacciHeap<T> {
    const cloned = new FibonacciHeap<T>(this.compare)
    if (this.min === null) {
      return cloned
    }
    const nodeMap = new Map<FibonacciNode<T>, FibonacciNode<T>>()
    let current = this.min
    do {
      const clonedNode = this.cloneSubtree(current, nodeMap)
      if (cloned.min === null) {
        cloned.min = clonedNode
        clonedNode.left = clonedNode
        clonedNode.right = clonedNode
      } else {
        cloned.insertIntoRootList(clonedNode)
      }
      current = current.right
    } while (current !== this.min)
    cloned._size = this._size
    return cloned
  }

  [Symbol.iterator](): Iterator<T> {
    const items = this.toArray()
    let index = 0
    return {
      next: () => {
        if (index >= items.length) {
          return { value: undefined, done: true } as IteratorResult<T>
        }
        return { value: items[index++]!, done: false }
      },
    }
  }

  static fromArray<T>(items: T[], compare?: CompareFunction<T>): FibonacciHeap<T> {
    const heap = new FibonacciHeap<T>(compare)
    for (let i = 0; i < items.length; i++) {
      heap.insert(items[i]!)
    }
    return heap
  }

  private cloneSubtree(
    node: FibonacciNode<T>,
    nodeMap: Map<FibonacciNode<T>, FibonacciNode<T>>
  ): FibonacciNode<T> {
    const clonedNode: FibonacciNode<T> = {
      value: node.value,
      degree: node.degree,
      marked: node.marked,
      parent: null,
      child: null,
      left: null!,
      right: null!,
    }
    clonedNode.left = clonedNode
    clonedNode.right = clonedNode
    nodeMap.set(node, clonedNode)

    if (node.child !== null) {
      let child = node.child
      let firstChild: FibonacciNode<T> | null = null
      let prevChild: FibonacciNode<T> | null = null
      do {
        const clonedChild = this.cloneSubtree(child, nodeMap)
        clonedChild.parent = clonedNode
        if (firstChild === null) {
          firstChild = clonedChild
          clonedNode.child = clonedChild
          clonedChild.left = clonedChild
          clonedChild.right = clonedChild
        } else {
          clonedChild.left = prevChild!
          clonedChild.right = firstChild
          firstChild.left = clonedChild
          prevChild!.right = clonedChild
        }
        prevChild = clonedChild
        child = child.right
      } while (child !== node.child)
    }
    return clonedNode
  }

  private insertIntoRootList(node: FibonacciNode<T>): void {
    if (this.min === null) {
      this.min = node
      node.left = node
      node.right = node
      return
    }
    node.right = this.min.right
    node.left = this.min
    this.min.right.left = node
    this.min.right = node
  }

  private removeFromList(node: FibonacciNode<T>): void {
    node.left.right = node.right
    node.right.left = node.left
  }

  private concatenate(other: FibonacciNode<T>): void {
    const aRight = this.min!.right
    const bRight = other.right
    this.min!.right = bRight
    bRight.left = this.min!
    other.right = aRight
    aRight.left = other
  }

  private consolidate(): void {
    const maxDegree = Math.floor(Math.log2(this._size)) + 1
    const degreeTable: (FibonacciNode<T> | null)[] = new Array(maxDegree + 2).fill(null)
    const roots: FibonacciNode<T>[] = []
    let current = this.min!
    do {
      roots.push(current)
      current = current.right
    } while (current !== this.min)

    for (const w of roots) {
      let x = w
      let d = x.degree
      while (d < degreeTable.length && degreeTable[d] !== null) {
        const y = degreeTable[d]!
        if (this.compare(x.value, y.value) > 0) {
          const temp = x
          x = y
          y = temp
        }
        this.heapLink(y, x)
        degreeTable[d] = null
        d++
      }
      while (d >= degreeTable.length) {
        degreeTable.push(null)
      }
      degreeTable[d] = x
    }

    this.min = null
    for (const entry of degreeTable) {
      if (entry !== null) {
        if (this.min === null) {
          entry.left = entry
          entry.right = entry
          this.min = entry
        } else {
          this.insertIntoRootList(entry)
          if (this.compare(entry.value, this.min.value) < 0) {
            this.min = entry
          }
        }
      }
    }
  }

  private heapLink(y: FibonacciNode<T>, x: FibonacciNode<T>): void {
    this.removeFromList(y)
    y.parent = x
    if (x.child === null) {
      x.child = y
      y.left = y
      y.right = y
    } else {
      const child = x.child
      y.right = child.right
      y.left = child
      child.right.left = y
      child.right = y
    }
    x.degree++
    y.marked = false
  }

  private cut(node: FibonacciNode<T>, parent: FibonacciNode<T>): void {
    if (node.right === node) {
      parent.child = null
    } else {
      if (parent.child === node) {
        parent.child = node.right
      }
      this.removeFromList(node)
    }
    parent.degree--
    this.insertIntoRootList(node)
    node.parent = null
    node.marked = false
  }

  private cascadingCut(node: FibonacciNode<T>): void {
    const parent = node.parent
    if (parent !== null) {
      if (!node.marked) {
        node.marked = true
      } else {
        this.cut(node, parent)
        this.cascadingCut(parent)
      }
    }
  }
}

export { DEFAULT_COMPARE } from './types.js'
export type { CompareFunction, FibonacciNode } from './types.js'
