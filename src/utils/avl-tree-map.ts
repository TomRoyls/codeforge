class Node<K, V> {
  key: K
  value: V
  left: Node<K, V> | null
  right: Node<K, V> | null
  height: number

  constructor(key: K, value: V) {
    this.key = key
    this.value = value
    this.left = null
    this.right = null
    this.height = 1
  }
}

export class AVLTreeMap<K, V> {
  private root: Node<K, V> | null = null
  private _size = 0
  private compare: (a: K, b: K) => number

  constructor(
    comparator?: (a: K, b: K) => number,
    entries?: [K, V][],
  ) {
    this.compare =
      comparator ?? ((a: K, b: K) => (a as number) - (b as number))
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value)
      }
    }
  }

  set(key: K, value: V): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private insertNode(node: Node<K, V> | null, key: K, value: V): Node<K, V> {
    if (node === null) {
      this._size++
      return new Node(key, value)
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

    this.updateHeight(node)
    return this.rebalance(node)
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

  delete(key: K): boolean {
    const prevSize = this._size
    this.root = this.deleteNode(this.root, key)
    return this._size < prevSize
  }

  private deleteNode(node: Node<K, V> | null, key: K): Node<K, V> | null {
    if (node === null) return null

    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
    } else {
      this._size--
      if (node.left === null) return node.right
      if (node.right === null) return node.left

      const successor = this.findMinNode(node.right)
      node.key = successor.key
      node.value = successor.value
      node.right = this.deleteMinNode(node.right)
    }

    this.updateHeight(node!)
    return this.rebalance(node!)
  }

  private deleteMinNode(node: Node<K, V>): Node<K, V> | null {
    if (node.left === null) return node.right
    node.left = this.deleteMinNode(node.left)
    this.updateHeight(node)
    return this.rebalance(node)
  }

  get size(): number {
    return this._size
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  keys(): K[] {
    const result: K[] = []
    this.inOrderKeys(this.root, result)
    return result
  }

  private inOrderKeys(node: Node<K, V> | null, result: K[]): void {
    if (node === null) return
    this.inOrderKeys(node.left, result)
    result.push(node.key)
    this.inOrderKeys(node.right, result)
  }

  values(): V[] {
    const result: V[] = []
    this.inOrderValues(this.root, result)
    return result
  }

  private inOrderValues(node: Node<K, V> | null, result: V[]): void {
    if (node === null) return
    this.inOrderValues(node.left, result)
    result.push(node.value)
    this.inOrderValues(node.right, result)
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    this.inOrderEntries(this.root, result)
    return result
  }

  private inOrderEntries(node: Node<K, V> | null, result: [K, V][]): void {
    if (node === null) return
    this.inOrderEntries(node.left, result)
    result.push([node.key, node.value])
    this.inOrderEntries(node.right, result)
  }

  forEach(callback: (value: V, key: K, map: AVLTreeMap<K, V>) => void): void {
    this.inOrderForEach(this.root, callback)
  }

  private inOrderForEach(
    node: Node<K, V> | null,
    callback: (value: V, key: K, map: AVLTreeMap<K, V>) => void,
  ): void {
    if (node === null) return
    this.inOrderForEach(node.left, callback)
    callback(node.value, node.key, this)
    this.inOrderForEach(node.right, callback)
  }

  first(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    return [node.key, node.value]
  }

  last(): [K, V] | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) node = node.right
    return [node.key, node.value]
  }

  lowerBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp >= 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  upperBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp > 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  range(min: K, max: K): [K, V][] {
    const result: [K, V][] = []
    this.rangeCollect(this.root, min, max, result)
    return result
  }

  private rangeCollect(
    node: Node<K, V> | null,
    min: K,
    max: K,
    result: [K, V][],
  ): void {
    if (node === null) return
    const cmpMin = this.compare(node.key, min)
    const cmpMax = this.compare(node.key, max)
    if (cmpMin > 0) this.rangeCollect(node.left, min, max, result)
    if (cmpMin >= 0 && cmpMax <= 0) result.push([node.key, node.value])
    if (cmpMax < 0) this.rangeCollect(node.right, min, max, result)
  }

  rank(key: K): number {
    return this.rankSearch(this.root, key)
  }

  private rankSearch(node: Node<K, V> | null, key: K): number {
    if (node === null) return -1
    const cmp = this.compare(key, node.key)
    if (cmp < 0) return this.rankSearch(node.left, key)
    if (cmp > 0) {
      const leftSize = this.subtreeSize(node.left)
      const rightRank = this.rankSearch(node.right, key)
      return rightRank === -1 ? -1 : leftSize + 1 + rightRank
    }
    return this.subtreeSize(node.left)
  }

  atRank(rank: number): [K, V] | undefined {
    if (rank < 0 || rank >= this._size) return undefined
    return this.atRankSearch(this.root, rank)
  }

  private atRankSearch(
    node: Node<K, V> | null,
    rank: number,
  ): [K, V] | undefined {
    if (node === null) return undefined
    const leftSize = this.subtreeSize(node.left)
    if (rank < leftSize) return this.atRankSearch(node.left, rank)
    if (rank === leftSize) return [node.key, node.value]
    return this.atRankSearch(node.right, rank - leftSize - 1)
  }

  private subtreeSize(node: Node<K, V> | null): number {
    if (node === null) return 0
    return 1 + this.subtreeSize(node.left) + this.subtreeSize(node.right)
  }

  private findMinNode(node: Node<K, V>): Node<K, V> {
    while (node.left !== null) node = node.left
    return node
  }

  private updateHeight(node: Node<K, V>): void {
    const leftH = node.left === null ? 0 : node.left.height
    const rightH = node.right === null ? 0 : node.right.height
    node.height = 1 + Math.max(leftH, rightH)
  }

  private getBalance(node: Node<K, V>): number {
    const leftH = node.left === null ? 0 : node.left.height
    const rightH = node.right === null ? 0 : node.right.height
    return leftH - rightH
  }

  private rotateLeft(z: Node<K, V>): Node<K, V> {
    const y = z.right!
    const t2 = y.left
    y.left = z
    z.right = t2
    this.updateHeight(z)
    this.updateHeight(y)
    return y
  }

  private rotateRight(z: Node<K, V>): Node<K, V> {
    const y = z.left!
    const t3 = y.right
    y.right = z
    z.left = t3
    this.updateHeight(z)
    this.updateHeight(y)
    return y
  }

  private rebalance(node: Node<K, V>): Node<K, V> {
    const balance = this.getBalance(node)

    if (balance > 1) {
      if (this.getBalance(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!)
      }
      return this.rotateRight(node)
    }

    if (balance < -1) {
      if (this.getBalance(node.right!) > 0) {
        node.right = this.rotateRight(node.right!)
      }
      return this.rotateLeft(node)
    }

    return node
  }
}
