export interface SplayNode<K, V> {
  key: K
  value: V
  left: SplayNode<K, V> | null
  right: SplayNode<K, V> | null
}

export class SplayTree<K, V> {
  private root: SplayNode<K, V> | null = null
  private _size = 0
  private compare: (a: K, b: K) => number

  constructor(comparator?: (a: K, b: K) => number) {
    this.compare = comparator ?? ((a: K, b: K) => (a as number) - (b as number))
  }

  insert(key: K, value: V): void {
    if (this.root === null) {
      this.root = { key, value, left: null, right: null }
      this._size++
      return
    }

    this.root = this._splay(this.root, key)
    const cmp = this.compare(key, this.root.key)

    if (cmp === 0) {
      this.root.value = value
      return
    }

    const newNode: SplayNode<K, V> = { key, value, left: null, right: null }

    if (cmp < 0) {
      newNode.left = this.root.left
      newNode.right = this.root
      this.root.left = null
    } else {
      newNode.right = this.root.right
      newNode.left = this.root
      this.root.right = null
    }

    this.root = newNode
    this._size++
  }

  delete(key: K): boolean {
    if (this.root === null) return false

    this.root = this._splay(this.root, key)

    if (this.compare(key, this.root.key) !== 0) return false

    const leftSubtree = this.root.left
    const rightSubtree = this.root.right

    if (leftSubtree === null) {
      this.root = rightSubtree
    } else {
      this.root = this._splay(leftSubtree, key)
      this.root.right = rightSubtree
    }

    this._size--
    return true
  }

  find(key: K): V | undefined {
    if (this.root === null) return undefined

    this.root = this._splay(this.root, key)

    if (this.compare(key, this.root.key) === 0) return this.root.value

    return undefined
  }

  contains(key: K): boolean {
    return this.find(key) !== undefined
  }

  get min(): K | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) node = node.left
    return node.key
  }

  get max(): K | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) node = node.right
    return node.key
  }

  get size(): number {
    return this._size
  }

  get height(): number {
    return this._height(this.root)
  }

  private _height(node: SplayNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this._height(node.left), this._height(node.right))
  }

  inOrder(): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    this._inOrder(this.root, result)
    return result
  }

  private _inOrder(
    node: SplayNode<K, V> | null,
    result: Array<{ key: K; value: V }>,
  ): void {
    if (node === null) return
    this._inOrder(node.left, result)
    result.push({ key: node.key, value: node.value })
    this._inOrder(node.right, result)
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  getRoot(): SplayNode<K, V> | null {
    return this.root
  }

  private _splay(node: SplayNode<K, V>, key: K): SplayNode<K, V> {
    const cmp = this.compare(key, node.key)
    if (cmp === 0) return node

    if (cmp < 0) {
      if (node.left === null) return node

      const cmp2 = this.compare(key, node.left.key)
      if (cmp2 < 0) {
        if (node.left.left !== null) {
          node.left.left = this._splay(node.left.left, key)
          node = this._rotateRight(node)
        }
      } else if (cmp2 > 0) {
        if (node.left.right !== null) {
          node.left.right = this._splay(node.left.right, key)
          node.left = this._rotateLeft(node.left)
        }
      }

      return node.left !== null ? this._rotateRight(node) : node
    } else {
      if (node.right === null) return node

      const cmp2 = this.compare(key, node.right.key)
      if (cmp2 > 0) {
        if (node.right.right !== null) {
          node.right.right = this._splay(node.right.right, key)
          node = this._rotateLeft(node)
        }
      } else if (cmp2 < 0) {
        if (node.right.left !== null) {
          node.right.left = this._splay(node.right.left, key)
          node.right = this._rotateRight(node.right)
        }
      }

      return node.right !== null ? this._rotateLeft(node) : node
    }
  }

  private _rotateLeft(node: SplayNode<K, V>): SplayNode<K, V> {
    const newRoot = node.right!
    node.right = newRoot.left
    newRoot.left = node
    return newRoot
  }

  private _rotateRight(node: SplayNode<K, V>): SplayNode<K, V> {
    const newRoot = node.left!
    node.left = newRoot.right
    newRoot.right = node
    return newRoot
  }
}
