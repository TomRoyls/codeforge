/** Scapegoat Tree - a self-balancing BST using scapegoat nodes for rebalancing */

export interface ScapegoatNode<K, V> {
  key: K
  value: V
  left: ScapegoatNode<K, V> | null
  right: ScapegoatNode<K, V> | null
  size: number
}

export class ScapegoatTree<K, V> {
  private root: ScapegoatNode<K, V> | null = null
  private _size = 0
  private _maxSize = 0
  private readonly alpha: number
  private compare: (a: K, b: K) => number

  constructor(
    alpha: number = 0.6,
    comparator?: (a: K, b: K) => number,
  ) {
    if (alpha <= 0.5 || alpha >= 1) {
      throw new RangeError('alpha must be in the range (0.5, 1)')
    }
    this.alpha = alpha
    this.compare =
      comparator ?? ((a: K, b: K) => (a as number) - (b as number))
  }

  insert(key: K, value: V): void {
    const path: Array<ScapegoatNode<K, V>> = []
    let node = this.root
    let inserted = false

    if (node === null) {
      this.root = { key, value, left: null, right: null, size: 1 }
      this._size++
      this._maxSize++
      return
    }

    while (node !== null) {
      path.push(node)
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        if (node.left === null) {
          node.left = { key, value, left: null, right: null, size: 1 }
          inserted = true
          break
        }
        node = node.left
      } else if (cmp > 0) {
        if (node.right === null) {
          node.right = { key, value, left: null, right: null, size: 1 }
          inserted = true
          break
        }
        node = node.right
      } else {
        node.value = value
        return
      }
    }

    if (!inserted) return

    this._size++
    this._maxSize++

    for (let i = path.length - 1; i >= 0; i--) {
      path[i]!.size++
    }

    const scapegoatIdx = this.findScapegoat(path)
    if (scapegoatIdx !== -1) {
      const scapegoat = path[scapegoatIdx]!
      const parent = scapegoatIdx > 0 ? path[scapegoatIdx - 1]! : null
      const rebuilt = this.rebuild(scapegoat)

      if (parent === null) {
        this.root = rebuilt
      } else if (parent.left === scapegoat) {
        parent.left = rebuilt
      } else {
        parent.right = rebuilt
      }
    }
  }

  delete(key: K): boolean {
    const prevSize = this._size
    this.root = this.deleteNode(this.root, key)
    if (this._size < prevSize) {
      if (this._size < this.alpha * this._maxSize) {
        this.root = this.rebuild(this.root)
        this._maxSize = this._size
      }
      return true
    }
    return false
  }

  private deleteNode(
    node: ScapegoatNode<K, V> | null,
    key: K,
  ): ScapegoatNode<K, V> | null {
    if (node === null) return null

    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
    } else {
      if (node.left === null) {
        this._size--
        return node.right
      }
      if (node.right === null) {
        this._size--
        return node.left
      }

      const successor = this.findMinNode(node.right)
      node.key = successor.key
      node.value = successor.value
      node.right = this.deleteMinNode(node.right)
      this._size--
    }

    if (node !== null) {
      node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
    }
    return node
  }

  get(key: K): V | undefined {
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) node = node.left
      else if (cmp > 0) node = node.right
      else return node.value
    }
    return undefined
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  min(): K | undefined {
    if (this.root === null) return undefined
    return this.findMinNode(this.root).key
  }

  max(): K | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) node = node.right
    return node.key
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
    this._maxSize = 0
  }

  inOrderTraversal(): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    this.inOrderWalk(this.root, result)
    return result
  }

  keys(): K[] {
    return this.inOrderTraversal().map((e) => e.key)
  }

  values(): V[] {
    return this.inOrderTraversal().map((e) => e.value)
  }

  height(): number {
    return this.computeHeight(this.root)
  }

  private computeHeight(node: ScapegoatNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  private nodeSize(node: ScapegoatNode<K, V> | null): number {
    return node === null ? 0 : node.size
  }

  private isAlphaWeightBalanced(node: ScapegoatNode<K, V>): boolean {
    const leftSize = this.nodeSize(node.left)
    const rightSize = this.nodeSize(node.right)
    const total = leftSize + rightSize + 1
    return leftSize <= this.alpha * total && rightSize <= this.alpha * total
  }

  private findScapegoat(path: Array<ScapegoatNode<K, V>>): number {
    for (let i = path.length - 1; i >= 0; i--) {
      if (!this.isAlphaWeightBalanced(path[i]!)) {
        return i
      }
    }
    return -1
  }

  private rebuild(
    node: ScapegoatNode<K, V> | null,
  ): ScapegoatNode<K, V> | null {
    if (node === null) return null
    const nodes = this.flatten(node)
    return this.buildBalanced(nodes, 0, nodes.length - 1)
  }

  private flatten(node: ScapegoatNode<K, V>): Array<ScapegoatNode<K, V>> {
    const result: Array<ScapegoatNode<K, V>> = []
    this.flattenInOrder(node, result)
    return result
  }

  private flattenInOrder(
    node: ScapegoatNode<K, V> | null,
    result: Array<ScapegoatNode<K, V>>,
  ): void {
    if (node === null) return
    this.flattenInOrder(node.left, result)
    result.push(node)
    this.flattenInOrder(node.right, result)
  }

  private buildBalanced(
    nodes: Array<ScapegoatNode<K, V>>,
    start: number,
    end: number,
  ): ScapegoatNode<K, V> | null {
    if (start > end) return null
    const mid = (start + end) >>> 1
    const node = nodes[mid]!
    node.left = this.buildBalanced(nodes, start, mid - 1)
    node.right = this.buildBalanced(nodes, mid + 1, end)
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
    return node
  }

  private deleteMinNode(node: ScapegoatNode<K, V>): ScapegoatNode<K, V> | null {
    if (node.left === null) return node.right
    node.left = this.deleteMinNode(node.left)
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
    return node
  }

  private findMinNode(node: ScapegoatNode<K, V>): ScapegoatNode<K, V> {
    while (node.left !== null) node = node.left
    return node
  }

  private inOrderWalk(
    node: ScapegoatNode<K, V> | null,
    result: Array<{ key: K; value: V }>,
  ): void {
    if (node === null) return
    this.inOrderWalk(node.left, result)
    result.push({ key: node.key, value: node.value })
    this.inOrderWalk(node.right, result)
  }
}
