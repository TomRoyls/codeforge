interface TreapMapNode<K, V> {
  key: K
  value: V
  priority: number
  left: TreapMapNode<K, V> | null
  right: TreapMapNode<K, V> | null
}

export class TreapMap3<K, V> {
  private root: TreapMapNode<K, V> | null = null
  private comparator: (a: K, b: K) => number

  constructor(comparator?: (a: K, b: K) => number) {
    this.comparator = comparator ?? ((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  }

  set(key: K, value: V): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private insertNode(node: TreapMapNode<K, V> | null, key: K, value: V): TreapMapNode<K, V> {
    if (node === null) {
      return { key, value, priority: Math.random(), left: null, right: null }
    }

    const cmp = this.comparator(key, node.key)

    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
      if (node.left !== null && node.left.priority > node.priority) {
        node = this.rotateRight(node)
      }
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
      if (node.right !== null && node.right.priority > node.priority) {
        node = this.rotateLeft(node)
      }
    } else {
      node.value = value
    }

    return node
  }

  private rotateRight(y: TreapMapNode<K, V>): TreapMapNode<K, V> {
    const x = y.left!
    y.left = x.right
    x.right = y
    return x
  }

  private rotateLeft(x: TreapMapNode<K, V>): TreapMapNode<K, V> {
    const y = x.right!
    x.right = y.left
    y.left = x
    return y
  }

  get(key: K): V | undefined {
    let node = this.root
    while (node !== null) {
      const cmp = this.comparator(key, node.key)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        node = node.right
      } else {
        return node.value
      }
    }
    return undefined
  }

  has(key: K): boolean {
    let node = this.root
    while (node !== null) {
      const cmp = this.comparator(key, node.key)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        node = node.right
      } else {
        return true
      }
    }
    return false
  }

  delete(key: K): boolean {
    const found = { value: false }
    this.root = this.deleteNode(this.root, key, found)
    return found.value
  }

  private deleteNode(node: TreapMapNode<K, V> | null, key: K, found: { value: boolean }): TreapMapNode<K, V> | null {
    if (node === null) return null

    const cmp = this.comparator(key, node.key)

    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key, found)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key, found)
    } else {
      found.value = true
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      if (node.left.priority > node.right.priority) {
        node = this.rotateRight(node)
        node.right = this.deleteNode(node.right, key, found)
        found.value = true
      } else {
        node = this.rotateLeft(node)
        node.left = this.deleteNode(node.left, key, found)
        found.value = true
      }
    }

    return node
  }

  get size(): number {
    return this.countNodes(this.root)
  }

  private countNodes(node: TreapMapNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + this.countNodes(node.left) + this.countNodes(node.right)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
  }

  min(): K | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return node.key
  }

  max(): K | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.key
  }

  forEach(callback: (key: K, value: V) => void): void {
    this.forEachHelper(this.root, callback)
  }

  private forEachHelper(node: TreapMapNode<K, V> | null, callback: (key: K, value: V) => void): void {
    if (node === null) return
    this.forEachHelper(node.left, callback)
    callback(node.key, node.value)
    this.forEachHelper(node.right, callback)
  }

  keys(): K[] {
    const result: K[] = []
    this.keysHelper(this.root, result)
    return result
  }

  private keysHelper(node: TreapMapNode<K, V> | null, result: K[]): void {
    if (node === null) return
    this.keysHelper(node.left, result)
    result.push(node.key)
    this.keysHelper(node.right, result)
  }

  values(): V[] {
    const result: V[] = []
    this.valuesHelper(this.root, result)
    return result
  }

  private valuesHelper(node: TreapMapNode<K, V> | null, result: V[]): void {
    if (node === null) return
    this.valuesHelper(node.left, result)
    result.push(node.value)
    this.valuesHelper(node.right, result)
  }

  toArray(): [K, V][] {
    const result: [K, V][] = []
    this.toArrayHelper(this.root, result)
    return result
  }

  private toArrayHelper(node: TreapMapNode<K, V> | null, result: [K, V][]): void {
    if (node === null) return
    this.toArrayHelper(node.left, result)
    result.push([node.key, node.value])
    this.toArrayHelper(node.right, result)
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const stack: Array<TreapMapNode<K, V>> = [];
    let current: TreapMapNode<K, V> | null = this.root;
    return {
      next(): IteratorResult<[K, V]> {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current);
            current = current.left;
          }
          current = stack.pop()!;
          const value: [K, V] = [current.key, current.value];
          current = current.right;
          return { value: value as [K, V], done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      }
    };
  }


  toJSON() {
    return { type: 'TreapMap3', size: this.size, items: this.toArray() }
  }
}
