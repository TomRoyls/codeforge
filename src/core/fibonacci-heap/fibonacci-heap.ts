import type { FibonacciHeapOptions, FibNode } from './types.js'

export class FibonacciHeap<T = unknown> {
  private min: FibNode<T> | null = null
  private count = 0

  constructor(_options?: Partial<FibonacciHeapOptions>) {}

  insert(key: number, value: T): void {
    const node = this.createNode(key, value)
    if (this.min === null) {
      this.min = node
    } else {
      this.insertIntoRootList(node)
      if (node.key < this.min.key) {
        this.min = node
      }
    }
    this.count++
  }

  extractMin(): { key: number; value: T } | undefined {
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
    this.count--
    return { key: z.key, value: z.value }
  }

  getMin(): { key: number; value: T } | undefined {
    if (this.min === null) {
      return undefined
    }
    return { key: this.min.key, value: this.min.value }
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.min = null
    this.count = 0
  }

  decreaseKey(node: { key: number; value: T }, newKey: number): boolean {
    if (newKey > node.key) {
      return false
    }
    const found = this.findNode(node.key, node.value)
    if (found === null) {
      return false
    }
    found.key = newKey
    const parent = found.parent
    if (parent !== null && found.key < parent.key) {
      this.cut(found, parent)
      this.cascadingCut(parent)
    }
    if (this.min !== null && found.key < this.min.key) {
      this.min = found
    }
    return true
  }

  delete(key: number): boolean {
    const found = this.findNodeByKey(key)
    if (found === null) {
      return false
    }
    const parent = found.parent
    if (parent !== null) {
      this.cut(found, parent)
      this.cascadingCut(parent)
    }
    this.min = found
    this.extractMin()
    return true
  }

  merge(other: FibonacciHeap<T>): void {
    if (other.min === null) {
      return
    }
    if (this.min === null) {
      this.min = other.min
    } else {
      this.concatenate(other.min)
      if (other.min.key < this.min.key) {
        this.min = other.min
      }
    }
    this.count += other.count
    other.clear()
  }

  toArray(): Array<{ key: number; value: T }> {
    const result: Array<{ key: number; value: T }> = []
    this.forEach((key, value) => {
      result.push({ key, value })
    })
    return result
  }

  forEach(callback: (key: number, value: T) => void): void {
    if (this.min === null) {
      return
    }
    let current = this.min
    do {
      this.traverseTree(current, callback)
      current = current.right
    } while (current !== this.min)
  }

  private createNode(key: number, value: T): FibNode<T> {
    const node: FibNode<T> = {
      key,
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
    return node
  }

  private insertIntoRootList(node: FibNode<T>): void {
    if (this.min === null) {
      this.min = node
      return
    }
    node.right = this.min.right
    node.left = this.min
    this.min.right.left = node
    this.min.right = node
  }

  private removeFromList(node: FibNode<T>): void {
    node.left.right = node.right
    node.right.left = node.left
  }

  private concatenate(other: FibNode<T>): void {
    const aRight = this.min!.right
    const bRight = other.right
    this.min!.right = bRight
    bRight.left = this.min!
    other.right = aRight
    aRight.left = other
  }

  private consolidate(): void {
    const maxDegree = Math.floor(Math.log2(this.count)) + 1
    const degreeTable: (FibNode<T> | null)[] = new Array(maxDegree + 1).fill(null)
    const roots: FibNode<T>[] = []
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
        if (x.key > y.key) {
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
          if (entry.key < this.min.key) {
            this.min = entry
          }
        }
      }
    }
  }

  private heapLink(y: FibNode<T>, x: FibNode<T>): void {
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

  private cut(node: FibNode<T>, parent: FibNode<T>): void {
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

  private cascadingCut(node: FibNode<T>): void {
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

  private findNode(key: number, value: T): FibNode<T> | null {
    if (this.min === null) return null
    let current = this.min
    do {
      const found = this.findInTree(current, key, value)
      if (found !== null) return found
      current = current.right
    } while (current !== this.min)
    return null
  }

  private findInTree(node: FibNode<T>, key: number, value: T): FibNode<T> | null {
    if (node.key === key && node.value === value) return node
    if (node.child !== null) {
      let child = node.child
      do {
        const found = this.findInTree(child, key, value)
        if (found !== null) return found
        child = child.right
      } while (child !== node.child)
    }
    return null
  }

  private findNodeByKey(key: number): FibNode<T> | null {
    if (this.min === null) return null
    let current = this.min
    do {
      const found = this.findInTreeByKey(current, key)
      if (found !== null) return found
      current = current.right
    } while (current !== this.min)
    return null
  }

  private findInTreeByKey(node: FibNode<T>, key: number): FibNode<T> | null {
    if (node.key === key) return node
    if (node.child !== null) {
      let child = node.child
      do {
        const found = this.findInTreeByKey(child, key)
        if (found !== null) return found
        child = child.right
      } while (child !== node.child)
    }
    return null
  }

  private traverseTree(node: FibNode<T>, callback: (key: number, value: T) => void): void {
    callback(node.key, node.value)
    if (node.child !== null) {
      let child = node.child
      do {
        this.traverseTree(child, callback)
        child = child.right
      } while (child !== node.child)
    }
  }
}

export { DEFAULT_FIBONACCIHEAP_OPTIONS } from './types.js'
export type { FibonacciHeapOptions, FibNode } from './types.js'
