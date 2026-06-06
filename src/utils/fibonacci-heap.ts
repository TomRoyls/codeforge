export interface FibonacciHeapNode<K, V> {
  key: K
  value: V
  degree: number
  marked: boolean
  parent: FibonacciHeapNode<K, V> | null
  child: FibonacciHeapNode<K, V> | null
  left: FibonacciHeapNode<K, V>
  right: FibonacciHeapNode<K, V>
}

export class FibonacciHeap<K = number, V = K> {
  private _min: FibonacciHeapNode<K, V> | null = null
  private _size = 0

  constructor(private comparator: (a: K, b: K) => number = defaultComparator as (a: K, b: K) => number) {}

  get min(): FibonacciHeapNode<K, V> | undefined {
    return this._min ?? undefined
  }

  get size(): number {
    return this._size
  }

  insert(key: K, value?: V): FibonacciHeapNode<K, V> {
    const node = this.createNode(key, value as V)
    this.insertIntoRootList(node)
    if (this._min === null || this.comparator(node.key, this._min.key) < 0) {
      this._min = node
    }
    this._size++
    return node
  }

  extractMin(): K | undefined {
    const z = this._min
    if (z === null) return undefined

    if (z.child !== null) {
      let child = z.child
      const firstChild = child
      do {
        const next = child.right
        child.parent = null
        this.spliceIntoRootList(child)
        child = next
      } while (child !== firstChild)
      z.child = null
    }

    this.removeFromRootList(z)

    if (z === z.right) {
      this._min = null
    } else {
      this._min = z.right
      this.consolidate()
    }

    this._size--
    return z.key
  }

  peek(): K | undefined {
    return this._min?.key
  }

  toArray(): K[] {
    if (this._min === null) return []
    const result: K[] = []
    const temp = new FibonacciHeap<K, V>(this.comparator)
    let current = this._min
    const nodes: FibonacciHeapNode<K, V>[] = []
    const visited = new Set<FibonacciHeapNode<K, V>>()
    const stack: FibonacciHeapNode<K, V>[] = [current]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (visited.has(node)) continue
      visited.add(node)
      nodes.push(node)
      stack.push(node.right)
      if (node.child !== null) stack.push(node.child)
    }
    for (const node of nodes) {
      temp.insert(node.key, node.value)
    }
    while (!temp.isEmpty()) {
      result.push(temp.extractMin()!)
    }
    return result
  }

  decreaseKey(node: FibonacciHeapNode<K, V>, newKey: K): void {
    if (!node || typeof node !== 'object' || !('key' in node)) {
      throw new Error(`Invalid handle: ${String(node)}`)
    }
    if (this.comparator(newKey, node.key) > 0) {
      throw new Error('New value must be less than or equal to current value')
    }
    node.key = newKey
    const parent = node.parent
    if (parent !== null && this.comparator(node.key, parent.key) < 0) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    if (this._min !== null && this.comparator(node.key, this._min.key) < 0) {
      this._min = node
    }
  }

  // Generic-key safe deletion: cut to root, force min, then extract.
  delete(node: FibonacciHeapNode<K, V>): void {
    if (!node || typeof node !== 'object' || !('key' in node)) {
      throw new Error(`Invalid handle: ${String(node)}`)
    }
    const parent = node.parent
    if (parent !== null) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    this._min = node
    this.extractMin()
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._min = null
    this._size = 0
  }

  merge(other: FibonacciHeap<K, V>): void {
    if (other._min === null) return
    if (this._min === null) {
      this._min = other._min
    } else {
      this.concatRootLists(this._min, other._min)
      if (this.comparator(other._min.key, this._min.key) < 0) {
        this._min = other._min
      }
    }
    this._size += other._size
    other._min = null
    other._size = 0
  }

  private createNode(key: K, value: V): FibonacciHeapNode<K, V> {
    const node: FibonacciHeapNode<K, V> = {
      key,
      value,
      degree: 0,
      marked: false,
      parent: null,
      child: null,
      left: null as unknown as FibonacciHeapNode<K, V>,
      right: null as unknown as FibonacciHeapNode<K, V>,
    }
    node.left = node
    node.right = node
    return node
  }

  private insertIntoRootList(node: FibonacciHeapNode<K, V>): void {
    if (this._min === null) {
      node.left = node
      node.right = node
      this._min = node
      return
    }
    this.spliceBetween(node, this._min, this._min.right)
  }

  // Detaches `node` from any prior sibling list before splicing it into root.
  private spliceIntoRootList(node: FibonacciHeapNode<K, V>): void {
    if (this._min === null) {
      node.left = node
      node.right = node
      this._min = node
      return
    }
    const prev = node.left
    const next = node.right
    prev.right = next
    next.left = prev
    this.spliceBetween(node, this._min, this._min.right)
  }

  private spliceBetween(node: FibonacciHeapNode<K, V>, a: FibonacciHeapNode<K, V>, b: FibonacciHeapNode<K, V>): void {
    node.left = a
    node.right = b
    a.right = node
    b.left = node
  }

  private removeFromRootList(node: FibonacciHeapNode<K, V>): void {
    const l = node.left
    const r = node.right
    l.right = r
    r.left = l
    if (node === this._min) {
      this._min = r === node ? null : r
    }
  }

  private concatRootLists(a: FibonacciHeapNode<K, V>, b: FibonacciHeapNode<K, V>): void {
    const aRight = a.right
    const bLeft = b.left
    a.right = b
    b.left = a
    bLeft.right = aRight
    aRight.left = bLeft
  }

  private link(y: FibonacciHeapNode<K, V>, x: FibonacciHeapNode<K, V>): void {
    y.left.right = y.right
    y.right.left = y.left
    y.parent = x
    if (x.child === null) {
      x.child = y
      y.left = y
      y.right = y
    } else {
      const xc = x.child
      y.left = xc
      y.right = xc.right
      xc.right.left = y
      xc.right = y
    }
    x.degree++
    y.marked = false
  }

  private consolidate(): void {
    const maxDegree = Math.max(1, Math.floor(Math.log2(Math.max(1, this._size))) + 2)
    const degreeBuckets: (FibonacciHeapNode<K, V> | null)[] = new Array(maxDegree + 1).fill(null)

    const roots: FibonacciHeapNode<K, V>[] = []
    if (this._min !== null) {
      let current = this._min
      do {
        roots.push(current)
        current = current.right
      } while (current !== this._min)
    }

    for (const w of roots) {
      let x = w
      let d = x.degree
      while (d < degreeBuckets.length && degreeBuckets[d] !== null) {
        let y = degreeBuckets[d]!
        if (this.comparator(x.key, y.key) > 0) {
          const tmp = x
          x = y
          y = tmp
        }
        this.link(y, x)
        degreeBuckets[d] = null
        d++
      }
      if (d >= degreeBuckets.length) {
        degreeBuckets.length = d + 1
      }
      degreeBuckets[d] = x
    }

    this._min = null
    for (const node of degreeBuckets) {
      if (node === null) continue
      node.left = node
      node.right = node
      if (this._min === null) {
        this._min = node
      } else {
        node.left = this._min
        node.right = this._min.right
        this._min.right.left = node
        this._min.right = node
        if (this.comparator(node.key, this._min.key) < 0) {
          this._min = node
        }
      }
    }
  }

  private cut(x: FibonacciHeapNode<K, V>, y: FibonacciHeapNode<K, V>): void {
    if (x.right === x) {
      y.child = null
    } else {
      x.right.left = x.left
      x.left.right = x.right
      if (y.child === x) {
        y.child = x.right
      }
    }
    y.degree--
    x.parent = null
    x.marked = false
    x.left = this._min!
    x.right = this._min!.right
    this._min!.right.left = x
    this._min!.right = x
  }

  private cascadingCut(y: FibonacciHeapNode<K, V>): void {
    const z = y.parent
    if (z !== null) {
      if (!y.marked) {
        y.marked = true
      } else {
        this.cut(y, z)
        this.cascadingCut(z)
      }
    }
  }
}

function defaultComparator(a: unknown, b: unknown): number {
  if (a === b) return 0
  return (a as number) < (b as number) ? -1 : 1
}
