import type { Comparator, PathCopyingTreeOptions, TreeEntry, TreeNode } from './types.js'

function defaultComparator<K>(a: K, b: K): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class PathCopyingTree<K, V> {
  private root: TreeNode<K, V> | null = null
  private cmp: Comparator<K>
  private _size: number = 0
  private history: PathCopyingTree<K, V>[] = []

  constructor(options?: PathCopyingTreeOptions<K, V>) {
    this.cmp = options?.comparator ?? defaultComparator
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  get(key: K): V | undefined {
    const node = this.findNode(this.root, key)
    if (node === null) return undefined
    return node.value
  }

  has(key: K): boolean {
    return this.findNode(this.root, key) !== null
  }

  insert(key: K, value: V): PathCopyingTree<K, V> {
    const newTree = this.copyMetadata()
    newTree.root = this.insertNode(this.root, key, value)
    newTree._size = this._size + (this.has(key) ? 0 : 1)
    return newTree
  }

  delete(key: K): PathCopyingTree<K, V> {
    if (!this.has(key)) return this
    const newTree = this.copyMetadata()
    newTree.root = this.deleteNode(this.root, key)
    newTree._size = this._size - 1
    return newTree
  }

  toArray(): TreeEntry<K, V>[] {
    const result: TreeEntry<K, V>[] = []
    this.inOrderCollect(this.root, result)
    return result
  }

  forEach(callback: (entry: TreeEntry<K, V>, index: number) => void): void {
    let index = 0
    this.inOrderForEach(this.root, callback, () => index++)
  }

  *entries(): Generator<TreeEntry<K, V>> {
    const stack: TreeNode<K, V>[] = []
    let current: TreeNode<K, V> | null = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield { key: current.key, value: current.value }
      current = current.right
    }
  }

  *keys(): Generator<K> {
    const stack: TreeNode<K, V>[] = []
    let current: TreeNode<K, V> | null = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield current.key
      current = current.right
    }
  }

  *values(): Generator<V> {
    const stack: TreeNode<K, V>[] = []
    let current: TreeNode<K, V> | null = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield current.value
      current = current.right
    }
  }

  previousVersion(): PathCopyingTree<K, V> | undefined {
    if (this.history.length === 0) return undefined
    return this.history[this.history.length - 1]!
  }

  getVersion(version: number): PathCopyingTree<K, V> | undefined {
    if (version < 0 || version > this.history.length) return undefined
    if (version === this.history.length) return this
    return this.history[version]!
  }

  get versionCount(): number {
    return this.history.length + 1
  }

  private copyMetadata(): PathCopyingTree<K, V> {
    const tree = new PathCopyingTree<K, V>({ comparator: this.cmp })
    tree.history = [...this.history, this]
    return tree
  }

  private findNode(node: TreeNode<K, V> | null, key: K): TreeNode<K, V> | null {
    if (node === null) return null
    const cmp = this.cmp(key, node.key)
    if (cmp === 0) return node
    if (cmp < 0) return this.findNode(node.left, key)
    return this.findNode(node.right, key)
  }

  private insertNode(node: TreeNode<K, V> | null, key: K, value: V): TreeNode<K, V> {
    if (node === null) {
      return { key, value, left: null, right: null }
    }
    const cmp = this.cmp(key, node.key)
    if (cmp === 0) {
      return { key, value, left: node.left, right: node.right }
    }
    if (cmp < 0) {
      return { key: node.key, value: node.value, left: this.insertNode(node.left, key, value), right: node.right }
    }
    return { key: node.key, value: node.value, left: node.left, right: this.insertNode(node.right, key, value) }
  }

  private deleteNode(node: TreeNode<K, V> | null, key: K): TreeNode<K, V> | null {
    if (node === null) return null
    const cmp = this.cmp(key, node.key)
    if (cmp < 0) {
      return { key: node.key, value: node.value, left: this.deleteNode(node.left, key), right: node.right }
    }
    if (cmp > 0) {
      return { key: node.key, value: node.value, left: node.left, right: this.deleteNode(node.right, key) }
    }
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    const successor = this.findMin(node.right)
    const newRight = this.deleteMin(node.right)
    return { key: successor.key, value: successor.value, left: node.left, right: newRight }
  }

  private findMin(node: TreeNode<K, V>): TreeNode<K, V> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private deleteMin(node: TreeNode<K, V>): TreeNode<K, V> | null {
    if (node.left === null) return node.right
    return { key: node.key, value: node.value, left: this.deleteMin(node.left), right: node.right }
  }

  private inOrderCollect(node: TreeNode<K, V> | null, result: TreeEntry<K, V>[]): void {
    if (node === null) return
    this.inOrderCollect(node.left, result)
    result.push({ key: node.key, value: node.value })
    this.inOrderCollect(node.right, result)
  }

  private inOrderForEach(
    node: TreeNode<K, V> | null,
    callback: (entry: TreeEntry<K, V>, index: number) => void,
    getIndex: () => number,
  ): void {
    if (node === null) return
    this.inOrderForEach(node.left, callback, getIndex)
    callback({ key: node.key, value: node.value }, getIndex())
    this.inOrderForEach(node.right, callback, getIndex)
  }

  *[Symbol.iterator](): Generator<TreeEntry<K, V>> {
    const stack: TreeNode<K, V>[] = []
    let current: TreeNode<K, V> | null = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield { key: current.key, value: current.value }
      current = current.right
    }
  }

  clear(): void {
    this._size = 0;
    this.root = null;
  }

  toString(): string {
    return `PathCopyingTree({ size: ${this.size} })`
  }
}
