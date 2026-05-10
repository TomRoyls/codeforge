import type { FibonacciQueueNode, FibonacciQueueOptions } from './types.js'

const DEFAULT_COMPARATOR = (a: number, b: number): number => a - b

export class FibonacciQueue<T = number> {
  private min: FibonacciQueueNode<T> | null = null
  private _size = 0
  private compare: (a: number, b: number) => number
  private nodeMap: Map<T, FibonacciQueueNode<T>[]>

  constructor(comparator?: (a: number, b: number) => number)
  constructor(options?: FibonacciQueueOptions<T>)
  constructor(arg?: ((a: number, b: number) => number) | FibonacciQueueOptions<T>) {
    if (typeof arg === 'function') {
      this.compare = arg
    } else if (arg && typeof arg.comparator === 'function') {
      this.compare = arg.comparator as (a: number, b: number) => number
    } else {
      this.compare = DEFAULT_COMPARATOR
    }
    this.nodeMap = new Map()
  }

  enqueue(value: T, priority?: number): FibonacciQueueNode<T> {
    const p = priority ?? (typeof value === 'number' ? value : 0)
    const node: FibonacciQueueNode<T> = {
      value,
      priority: p,
      degree: 0,
      mark: false,
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
      if (this.compare(node.priority, this.min.priority) < 0) {
        this.min = node
      }
    }
    this._size++
    this.addNodeRef(node)
    return node
  }

  dequeueMin(): T | undefined {
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
    this.removeNodeRef(z)
    return z.value
  }

  peek(): T | undefined {
    if (this.min === null) {
      return undefined
    }
    return this.min.value
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
    this.nodeMap.clear()
  }

  merge(other: FibonacciQueue<T>): FibonacciQueue<T> {
    const combined = new FibonacciQueue<T>(this.compare)
    const drainInto = (source: FibonacciQueue<T>): void => {
      if (source.min === null) return
      let current = source.min
      const nodes: FibonacciQueueNode<T>[] = []
      do {
        nodes.push(current)
        current = current.right
      } while (current !== source.min)
      for (const n of nodes) {
        const cloned: FibonacciQueueNode<T> = {
          value: n.value,
          priority: n.priority,
          degree: 0,
          mark: false,
          parent: null,
          child: null,
          left: null!,
          right: null!,
        }
        cloned.left = cloned
        cloned.right = cloned
        combined.enqueue(cloned.value, cloned.priority)
      }
    }
    drainInto(this)
    drainInto(other)
    return combined
  }

  decreaseKey(node: FibonacciQueueNode<T>, newPriority: number): void {
    if (this.compare(newPriority, node.priority) > 0) {
      throw new Error('New priority is greater than current priority')
    }
    node.priority = newPriority
    const parent = node.parent
    if (parent !== null && this.compare(node.priority, parent.priority) < 0) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    if (this.min !== null && this.compare(node.priority, this.min.priority) < 0) {
      this.min = node
    }
  }

  delete(node: FibonacciQueueNode<T>): void {
    const parent = node.parent
    if (parent !== null) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    this.min = node
    this.dequeueMin()
  }

  toArray(): T[] {
    const result: T[] = []
    if (this.min === null) {
      return result
    }
    const clone = this.cloneInternal()
    while (!clone.isEmpty()) {
      const val = clone.dequeueMin()!
      result.push(val)
    }
    return result
  }

  contains(value: T): boolean {
    return this.nodeMap.has(value)
  }

  update(value: T, newPriority: number): boolean {
    const nodes = this.nodeMap.get(value)
    if (!nodes || nodes.length === 0) {
      return false
    }
    const node = nodes[0]!
    if (this.compare(newPriority, node.priority) < 0) {
      this.decreaseKey(node, newPriority)
    } else if (this.compare(newPriority, node.priority) > 0) {
      this.delete(node)
      this.enqueue(value, newPriority)
    }
    return true
  }

  private addNodeRef(node: FibonacciQueueNode<T>): void {
    const arr = this.nodeMap.get(node.value)
    if (arr) {
      arr.push(node)
    } else {
      this.nodeMap.set(node.value, [node])
    }
  }

  private removeNodeRef(node: FibonacciQueueNode<T>): void {
    const arr = this.nodeMap.get(node.value)
    if (!arr) return
    const idx = arr.indexOf(node)
    if (idx !== -1) {
      arr.splice(idx, 1)
    }
    if (arr.length === 0) {
      this.nodeMap.delete(node.value)
    }
  }

  private cloneInternal(): FibonacciQueue<T> {
    const cloned = new FibonacciQueue<T>(this.compare)
    if (this.min === null) {
      return cloned
    }
    const nodeMap = new Map<FibonacciQueueNode<T>, FibonacciQueueNode<T>>()
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
      if (cloned.min !== null && this.compare(clonedNode.priority, cloned.min.priority) < 0) {
        cloned.min = clonedNode
      }
      current = current.right
    } while (current !== this.min)
    cloned._size = this._size
    return cloned
  }

  private cloneSubtree(
    node: FibonacciQueueNode<T>,
    nodeMap: Map<FibonacciQueueNode<T>, FibonacciQueueNode<T>>
  ): FibonacciQueueNode<T> {
    const clonedNode: FibonacciQueueNode<T> = {
      value: node.value,
      priority: node.priority,
      degree: node.degree,
      mark: node.mark,
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
      let firstChild: FibonacciQueueNode<T> | null = null
      let prevChild: FibonacciQueueNode<T> | null = null
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

  private insertIntoRootList(node: FibonacciQueueNode<T>): void {
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

  private removeFromList(node: FibonacciQueueNode<T>): void {
    node.left.right = node.right
    node.right.left = node.left
  }

  private consolidate(): void {
    const maxDegree = Math.floor(Math.log2(this._size)) + 1
    const degreeTable: (FibonacciQueueNode<T> | null)[] = new Array(maxDegree + 2).fill(null)
    const roots: FibonacciQueueNode<T>[] = []
    let current = this.min!
    do {
      roots.push(current)
      current = current.right
    } while (current !== this.min)

    for (const w of roots) {
      let x = w
      let d = x.degree
      while (d < degreeTable.length && degreeTable[d] !== null) {
        let y = degreeTable[d]!
        if (this.compare(x.priority, y.priority) > 0) {
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
          if (this.compare(entry.priority, this.min.priority) < 0) {
            this.min = entry
          }
        }
      }
    }
  }

  private heapLink(y: FibonacciQueueNode<T>, x: FibonacciQueueNode<T>): void {
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
    y.mark = false
  }

  private cut(node: FibonacciQueueNode<T>, parent: FibonacciQueueNode<T>): void {
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
    node.mark = false
  }

  private cascadingCut(node: FibonacciQueueNode<T>): void {
    const parent = node.parent
    if (parent !== null) {
      if (!node.mark) {
        node.mark = true
      } else {
        this.cut(node, parent)
        this.cascadingCut(parent)
      }
    }
  }
}
