/** Pairing Heap - a simple self-adjusting heap with excellent amortized performance */

export interface PairingHeapNode<T> {
  value: T
}

interface InternalNode<T> extends PairingHeapNode<T> {
  child: InternalNode<T> | null
  sibling: InternalNode<T> | null
  prev: InternalNode<T> | null
}

export interface PairingHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

function createNode<T>(value: T): InternalNode<T> {
  return { value, child: null, sibling: null, prev: null }
}

export class PairingHeap<T> {
  private root: InternalNode<T> | null = null
  private _size = 0
  private readonly compare: (a: T, b: T) => number

  constructor(options?: PairingHeapOptions<T>) {
    this.compare =
      options?.comparator ?? ((a: T, b: T) => (a as number) - (b as number))
  }

  insert(value: T): PairingHeapNode<T> {
    const node = createNode(value)
    this.root = this.mergeNodes(this.root, node)
    this._size++
    return node
  }

  merge(other: PairingHeap<T>): void {
    if (other.root === null) return
    this.root = this.mergeNodes(this.root, other.root)
    this._size += other._size
    other.root = null
    other._size = 0
  }

  peek(): T | undefined {
    return this.root?.value
  }

  findMin(): T | undefined {
    return this.root?.value
  }

  extractMin(): T | undefined {
    if (this.root === null) return undefined
    const minNode = this.root
    this.root = this.twoPassPair(minNode.child)
    if (this.root !== null) {
      this.root.prev = null
    }
    this._size--
    return minNode.value
  }

  decreaseKey(node: PairingHeapNode<T>, newValue: T): void {
    const internal = node as InternalNode<T>
    if (this.compare(newValue, internal.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    internal.value = newValue
    if (internal === this.root) return

    this.removeChild(internal)
    internal.sibling = null
    internal.prev = null
    this.root = this.mergeNodes(this.root, internal)
  }

  delete(node: PairingHeapNode<T>): void {
    const internal = node as InternalNode<T>
    if (internal === this.root) {
      this.extractMin()
      return
    }

    this.removeChild(internal)
    const subtree = this.twoPassPair(internal.child)
    if (subtree !== null) {
      subtree.prev = null
    }
    this.root = this.mergeNodes(this.root, subtree)
    this._size--
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

  private mergeNodes(
    a: InternalNode<T> | null,
    b: InternalNode<T> | null,
  ): InternalNode<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this.compare(a.value, b.value) <= 0) {
      b.sibling = a.child
      if (a.child !== null) {
        a.child.prev = b
      }
      b.prev = null
      a.child = b
      a.sibling = null
      a.prev = null
      return a
    } else {
      a.sibling = b.child
      if (b.child !== null) {
        b.child.prev = a
      }
      a.prev = null
      b.child = a
      b.sibling = null
      b.prev = null
      return b
    }
  }

  private twoPassPair(first: InternalNode<T> | null): InternalNode<T> | null {
    if (first === null || first.sibling === null) return first

    const pairs: InternalNode<T>[] = []
    let current: InternalNode<T> | null = first

    while (current !== null && current.sibling !== null) {
      const nextPair = current.sibling.sibling
      const a = current
      const b = current.sibling
      a.sibling = null
      a.prev = null
      b.sibling = null
      b.prev = null
      pairs.push(this.mergeNodes(a, b)!)
      current = nextPair
    }

    if (current !== null) {
      current.sibling = null
      current.prev = null
      pairs.push(current)
    }

    let result: InternalNode<T> | null = null
    for (let i = pairs.length - 1; i >= 0; i--) {
      result = this.mergeNodes(result, pairs[i])
    }

    return result
  }

  private removeChild(node: InternalNode<T>): void {
    if (node.prev === null) return

    const prev = node.prev
    if (prev.child === node) {
      prev.child = node.sibling
    } else {
      prev.sibling = node.sibling
    }

    if (node.sibling !== null) {
      node.sibling.prev = prev
    }

    node.prev = null
    node.sibling = null
  }
}
