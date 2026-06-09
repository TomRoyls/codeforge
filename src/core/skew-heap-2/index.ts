type Comparator<T> = (a: T, b: T) => number

class SkewHeapNode<T> {
  constructor(public value: T, public left: SkewHeapNode<T> | null = null, public right: SkewHeapNode<T> | null = null) {}
}

export class SkewHeap2<T> {
  private root: SkewHeapNode<T> | null
  private _size: number
  private comparator: Comparator<T>
  private nodeMap: Map<T, Set<SkewHeapNode<T>>>

  constructor(comparator?: Comparator<T>) {
    this.root = null
    this._size = 0
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
    this.nodeMap = new Map()
  }

  private mergeNodes(h1: SkewHeapNode<T> | null, h2: SkewHeapNode<T> | null): SkewHeapNode<T> | null {
    if (h1 === null) return h2
    if (h2 === null) return h1

    if (this.comparator(h1.value, h2.value) <= 0) {
      const temp = h1.left
      h1.left = this.mergeNodes(h1.right, h2)
      h1.right = temp
      return h1
    } else {
      const temp = h2.left
      h2.left = this.mergeNodes(h2.right, h1)
      h2.right = temp
      return h2
    }
  }

  insert(value: T): SkewHeap2<T> {
    const newNode = new SkewHeapNode(value)
    this.root = this.mergeNodes(this.root, newNode)
    this._size++

    if (!this.nodeMap.has(value)) {
      this.nodeMap.set(value, new Set())
    }
    this.nodeMap.get(value)!.add(newNode)

    return this
  }

  merge(other: SkewHeap2<T>): SkewHeap2<T> {
    this.root = this.mergeNodes(this.root, other.root)
    this._size += other._size

    const entries = Array.from(other.nodeMap.entries())
    for (const [value, nodes] of entries) {
      if (!this.nodeMap.has(value)) {
        this.nodeMap.set(value, new Set())
      }
      const targetSet = this.nodeMap.get(value)!
      const nodeArray = Array.from(nodes)
      for (const node of nodeArray) {
        targetSet.add(node)
      }
    }

    other.root = null
    other._size = 0
    other.nodeMap.clear()

    return this
  }

  peek(): T | null {
    return this.root ? this.root.value : null
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
    this.nodeMap.clear()
  }

  extractMin(): T | null {
    if (!this.root) return null

    while (this.root && (this.root.value as unknown) === undefined) {
      this.root = this.mergeNodes(this.root.left, this.root.right)
    }

    if (!this.root) return null

    const minValue = this.root.value

    const nodes = this.nodeMap.get(minValue)
    if (nodes) {
      nodes.delete(this.root)
      if (nodes.size === 0) {
        this.nodeMap.delete(minValue)
      }
    }

    this.root = this.mergeNodes(this.root.left, this.root.right)
    this._size--

    return minValue
  }

  toArray(): T[] {
    const result: T[] = []
    const temp = new SkewHeap2<T>(this.comparator)

    const values = this._extractAllValues(this.root)
    for (const v of values) {
      temp.insert(v)
    }

    while (!temp.isEmpty()) {
      const value = temp.extractMin()
      if (value !== undefined && value !== null) {
        result.push(value)
      }
    }

    return result
  }

  private _extractAllValues(node: SkewHeapNode<T> | null): T[] {
    if (!node) return []

    const leftValues = this._extractAllValues(node.left)
    const rightValues = this._extractAllValues(node.right)

    if ((node.value as unknown) === undefined) {
      return [...leftValues, ...rightValues]
    }

    return [
      node.value,
      ...leftValues,
      ...rightValues
    ]
  }

  decreaseKey(oldValue: T, newValue: T): boolean {
    if (this.comparator(newValue, oldValue) > 0) {
      return false
    }

    const nodes = this.nodeMap.get(oldValue)
    if (!nodes || nodes.size === 0) {
      return false
    }

    const nodeArray = Array.from(nodes)
    const node = nodeArray[0]
    if (!node) {
      return false
    }
    nodes.delete(node)

    if (nodes.size === 0) {
      this.nodeMap.delete(oldValue)
    }

    if (!this.nodeMap.has(newValue)) {
      this.nodeMap.set(newValue, new Set())
    }
    this.nodeMap.get(newValue)!.add(node)

    node.value = newValue

    this._rebuildHeap()
    return true
  }

  delete(value: T): boolean {
    const nodes = this.nodeMap.get(value)
    if (!nodes || nodes.size === 0) {
      return false
    }

    const nodeArray = Array.from(nodes)
    if (nodeArray.length > 0) {
      nodeArray[0]!.value = undefined as T
    }

    nodes.clear()
    this.nodeMap.delete(value)
    this._size--

    this._rebuildHeap()
    return true
  }

  private _rebuildHeap(): void {
    const values = this.toArray()
    this.clear()
    for (const v of values) {
      this.insert(v)
    }
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }



  toString(): string {
    return `SkewHeap2({ size: ${this._size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }
}
