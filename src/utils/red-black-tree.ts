type Color = 'red' | 'black'

export interface RBNode<K, V> {
  key: K
  value: V
  left: RBNode<K, V> | null
  right: RBNode<K, V> | null
  color: Color
}

function isRed<K, V>(node: RBNode<K, V> | null): boolean {
  return node !== null && node.color === 'red'
}

function rotateLeft<K, V>(h: RBNode<K, V>): RBNode<K, V> {
  const x = h.right!
  h.right = x.left
  x.left = h
  x.color = h.color
  h.color = 'red'
  return x
}

function rotateRight<K, V>(h: RBNode<K, V>): RBNode<K, V> {
  const x = h.left!
  h.left = x.right
  x.right = h
  x.color = h.color
  h.color = 'red'
  return x
}

function flipColors<K, V>(h: RBNode<K, V>): void {
  h.color = h.color === 'red' ? 'black' : 'red'
  if (h.left) h.left.color = h.left.color === 'red' ? 'black' : 'red'
  if (h.right) h.right.color = h.right.color === 'red' ? 'black' : 'red'
}

export class RedBlackTree<K, V> {
  private root: RBNode<K, V> | null = null
  private _size = 0
  private compare: (a: K, b: K) => number

  constructor(comparator?: (a: K, b: K) => number) {
    this.compare = comparator ?? ((a: K, b: K) => (a as number) - (b as number))
  }

  insert(key: K, value: V): void {
    this.root = this.insertNode(this.root, key, value)
    this.root.color = 'black'
  }

  private insertNode(node: RBNode<K, V> | null, key: K, value: V): RBNode<K, V> {
    if (node === null) {
      this._size++
      return { key, value, left: null, right: null, color: 'red' }
    }

    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
    } else {
      node.value = value
      return node
    }

    if (isRed(node.right) && !isRed(node.left)) {
      node = rotateLeft(node)
    }
    if (isRed(node.left) && node.left !== null && isRed(node.left.left)) {
      node = rotateRight(node)
    }
    if (isRed(node.left) && isRed(node.right)) {
      flipColors(node)
    }

    return node
  }

  delete(key: K): boolean {
    if (!this.contains(key)) return false
    this.root = this.deleteNode(this.root!, key)
    if (this.root !== null) {
      this.root.color = 'black'
    }
    this._size--
    return true
  }

  private deleteNode(node: RBNode<K, V>, key: K): RBNode<K, V> | null {
    if (this.compare(key, node.key) < 0) {
      if (!isRed(node.left) && node.left !== null && !isRed(node.left.left)) {
        node = this.moveRedLeft(node)
      }
      node.left = this.deleteNode(node.left!, key)
    } else {
      if (isRed(node.left)) {
        node = rotateRight(node)
      }
      if (this.compare(key, node.key) === 0 && node.right === null) {
        return null
      }
      if (!isRed(node.right) && node.right !== null && !isRed(node.right.left)) {
        node = this.moveRedRight(node)
      }
      if (this.compare(key, node.key) === 0) {
        const minNode = this.minNode(node.right!)
        node.key = minNode.key
        node.value = minNode.value
        node.right = this.deleteMin(node.right!)
      } else {
        node.right = this.deleteNode(node.right!, key)
      }
    }
    return this.fixUp(node)
  }

  private moveRedLeft<K2 extends K, V2 extends V>(h: RBNode<K2, V2>): RBNode<K2, V2> {
    flipColors(h)
    if (h.right !== null && isRed(h.right.left)) {
      h.right = rotateRight(h.right)
      h = rotateLeft(h)
      flipColors(h)
    }
    return h
  }

  private moveRedRight<K2 extends K, V2 extends V>(h: RBNode<K2, V2>): RBNode<K2, V2> {
    flipColors(h)
    if (h.left !== null && isRed(h.left.left)) {
      h = rotateRight(h)
      flipColors(h)
    }
    return h
  }

  private deleteMin(node: RBNode<K, V>): RBNode<K, V> | null {
    if (node.left === null) return null
    if (!isRed(node.left) && node.left !== null && !isRed(node.left.left)) {
      node = this.moveRedLeft(node)
    }
    node.left = this.deleteMin(node.left!)
    return this.fixUp(node)
  }

  private fixUp(node: RBNode<K, V>): RBNode<K, V> {
    if (isRed(node.right)) {
      node = rotateLeft(node)
    }
    if (isRed(node.left) && node.left !== null && isRed(node.left.left)) {
      node = rotateRight(node)
    }
    if (isRed(node.left) && isRed(node.right)) {
      flipColors(node)
    }
    return node
  }

  private minNode(node: RBNode<K, V>): RBNode<K, V> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  find(key: K): V | undefined {
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
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

  contains(key: K): boolean {
    return this.find(key) !== undefined
  }

  get min(): K | undefined {
    if (this.root === null) return undefined
    return this.minNode(this.root).key
  }

  get max(): K | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.key
  }

  get size(): number {
    return this._size
  }

  get height(): number {
    return this.nodeHeight(this.root)
  }

  private nodeHeight(node: RBNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
  }

  inOrder(): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    this.inOrderWalk(this.root, result)
    return result
  }

  private inOrderWalk(node: RBNode<K, V> | null, result: Array<{ key: K; value: V }>): void {
    if (node === null) return
    this.inOrderWalk(node.left, result)
    result.push({ key: node.key, value: node.value })
    this.inOrderWalk(node.right, result)
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  getRoot(): RBNode<K, V> | null {
    return this.root
  }

  toString(): string {
    const entries = this.inOrder()
    return '[' + entries.map((e) => `${String(e.key)}=${String(e.value)}`).join(', ') + ']'
  }

  toJSON(): unknown {
    const result: Record<string, V> = {}
    for (const e of this.inOrder()) {
      result[String(e.key)] = e.value
    }
    return result
  }

  private cloneNode(node: RBNode<K, V> | null): RBNode<K, V> | null {
    if (node === null) return null
    return {
      key: node.key,
      value: node.value,
      color: node.color,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
    }
  }

  clone(): this {
    const tree = new RedBlackTree<K, V>(this.compare)
    tree.root = this.cloneNode(this.root)
    tree._size = this._size
    return tree as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RedBlackTree)) return false
    const a = this.inOrder()
    const b = other.inOrder()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      const ae = a[i]!
      const be = b[i]!
      if (ae.key !== be.key) return false
      if (ae.value !== be.value) return false
    }
    return true
  }
}
