import type {
  BloomFilterTreeOptions,
  BloomFilterTreeJSON,
  BloomFilterTreeStatistics,
  BloomFilterJSON,
  TreeNodeJSON,
} from './types.js'
import { DEFAULT_BLOOM_FILTER_TREE_OPTIONS } from './types.js'

class BloomFilter {
  private bits: Uint8Array
  private _bitCount: number
  private _hashCount: number
  private _size: number = 0

  constructor(expectedItems: number, falsePositiveRate: number) {
    this._bitCount = this.calculateBitCount(expectedItems, falsePositiveRate)
    this._hashCount = this.calculateHashCount(this._bitCount, expectedItems)
    this.bits = new Uint8Array(this._bitCount)
  }

  add(key: string): void {
    const positions = this.getPositions(key)
    for (const pos of positions) {
      this.bits[pos] = 1
    }
    this._size++
  }

  remove(key: string): void {
    const positions = this.getPositions(key)
    for (const pos of positions) {
      this.bits[pos] = 0
    }
    if (this._size > 0) this._size--
  }

  has(key: string): boolean {
    const positions = this.getPositions(key)
    for (const pos of positions) {
      if (this.bits[pos] === 0) return false
    }
    return true
  }

  unionInto(target: BloomFilter): void {
    for (let i = 0; i < this._bitCount; i++) {
      if (this.bits[i] === 1) {
        target.bits[i] = 1
      }
    }
  }

  clear(): void {
    this.bits.fill(0)
    this._size = 0
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get bitCount(): number {
    return this._bitCount
  }

  get hashCount(): number {
    return this._hashCount
  }

  toJSON(): BloomFilterJSON {
    return {
      bits: Array.from(this.bits),
      bitCount: this._bitCount,
      hashCount: this._hashCount,
      size: this._size,
    }
  }

  static fromJSON(data: BloomFilterJSON): BloomFilter {
    const bf = Object.create(BloomFilter.prototype) as BloomFilter
    bf._bitCount = data.bitCount
    bf._hashCount = data.hashCount
    bf._size = data.size
    bf.bits = new Uint8Array(data.bits)
    return bf
  }

  getPositions(key: string): number[] {
    const positions: number[] = []
    const hash1 = this.hash(key, 0)
    const hash2 = this.hash(key, hash1)
    for (let i = 0; i < this._hashCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % this._bitCount)
    }
    return positions
  }

  private calculateBitCount(expectedItems: number, fpr: number): number {
    return Math.max(64, Math.ceil(-((expectedItems * Math.log(fpr)) / (Math.LN2 * Math.LN2))))
  }

  private calculateHashCount(bitCount: number, expectedItems: number): number {
    return Math.max(1, Math.round((bitCount / expectedItems) * Math.LN2))
  }

  private hash(str: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }
}

interface TreeNode {
  filter: BloomFilter
  children: TreeNode[]
  isLeaf: boolean
  leafIndex: number
}

export class BloomFilterTree<T = string> {
  private _opts: Required<BloomFilterTreeOptions>
  private _root: TreeNode
  private _leaves: TreeNode[] = []
  private _size: number = 0
  private _leafCount: number = 0
  private _stats: BloomFilterTreeStatistics = {
    inserts: 0,
    removes: 0,
    queries: 0,
    leafCount: 0,
    estimatedMemory: 0,
  }

  constructor(options?: BloomFilterTreeOptions) {
    this._opts = { ...DEFAULT_BLOOM_FILTER_TREE_OPTIONS, ...options }
    this._root = this.createLeafNode()
    this._leaves = [this._root]
    this._leafCount = 1
    this.updateStats()
  }

  insert(item: T): void {
    const key = this.serialize(item)
    if (this._leaves.length === 0) {
      this._root = this.createLeafNode()
      this._leaves = [this._root]
      this._leafCount = 1
    }
    let targetLeaf = this._leaves[this._size % this._leaves.length]!
    if (targetLeaf.filter.size >= this._opts.expectedItemsPerLeaf) {
      const minLeaf = this._leaves.reduce((min, leaf) =>
        leaf.filter.size < min.filter.size ? leaf : min,
      )
      if (minLeaf.filter.size >= this._opts.expectedItemsPerLeaf) {
        this.splitLeaf(targetLeaf)
        targetLeaf = this._leaves[this._leaves.length - 1]!
      } else {
        targetLeaf = minLeaf
      }
    }
    targetLeaf.filter.add(key)
    this.updateAncestors(targetLeaf)
    this._size++
    this._stats.inserts++
    this.updateStats()
  }

  has(item: T): boolean {
    const key = this.serialize(item)
    this._stats.queries++
    return this._root.filter.has(key)
  }

  remove(item: T): boolean {
    const key = this.serialize(item)
    this._stats.queries++
    if (!this._root.filter.has(key)) {
      this._stats.removes++
      return false
    }
    let removed = false
    for (const leaf of this._leaves) {
      if (leaf.filter.has(key)) {
        leaf.filter.remove(key)
        removed = true
      }
    }
    if (removed) {
      this._size--
      this.rebuildInternalNodes(this._root)
    }
    this._stats.removes++
    this.updateStats()
    return removed
  }

  containsAll(items: T[]): boolean {
    for (const item of items) {
      if (!this.has(item)) return false
    }
    return true
  }

  containsAny(items: T[]): boolean {
    for (const item of items) {
      if (this.has(item)) return true
    }
    return false
  }

  get size(): number {
    return this._size
  }

  get leafCount(): number {
    return this._leafCount
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._root = this.createLeafNode()
    this._leaves = [this._root]
    this._leafCount = 1
    this._size = 0
    this._stats = {
      inserts: 0,
      removes: 0,
      queries: 0,
      leafCount: 1,
      estimatedMemory: 0,
    }
    this.updateStats()
  }

  getLeaf(index: number): { has(item: T): boolean; size: number; isEmpty: boolean } {
    if (index < 0 || index >= this._leaves.length) {
      throw new RangeError(`Leaf index ${index} out of range [0, ${this._leaves.length})`)
    }
    const leaf = this._leaves[index]!
    const leafFilter = leaf.filter
    const tree = this
    return {
      has(item: T): boolean {
        return leafFilter.has(tree.serialize(item))
      },
      get size(): number {
        return leafFilter.size
      },
      get isEmpty(): boolean {
        return leafFilter.isEmpty
      },
    }
  }

  forEachLeaf(callback: (leaf: { has(item: T): boolean; size: number; isEmpty: boolean }, index: number) => void): void {
    for (let i = 0; i < this._leaves.length; i++) {
      callback(this.getLeaf(i), i)
    }
  }

  getStatistics(): BloomFilterTreeStatistics {
    return { ...this._stats }
  }

  toJSON(): BloomFilterTreeJSON {
    return {
      options: { ...this._opts },
      size: this._size,
      root: this.nodeToJSON(this._root),
      leaves: this._leaves.map((l) => l.filter.toJSON()),
      statistics: { ...this._stats },
    }
  }

  static fromJSON<T = string>(data: BloomFilterTreeJSON): BloomFilterTree<T> {
    const tree = new BloomFilterTree<T>(data.options)
    tree._size = data.size
    tree._stats = { ...data.statistics }
    tree._root = tree.nodeFromJSON(data.root)
    tree._leaves = tree.collectLeaves(tree._root)
    tree._leafCount = tree._leaves.length
    return tree
  }

  private createLeafNode(): TreeNode {
    const filter = this.createFilter()
    const node: TreeNode = {
      filter,
      children: [],
      isLeaf: true,
      leafIndex: -1,
    }
    node.leafIndex = this._leaves.length
    return node
  }

  private createFilter(): BloomFilter {
    return new BloomFilter(
      this._opts.expectedItemsPerLeaf,
      this._opts.falsePositiveRate,
    )
  }

  private createInternalNode(children: TreeNode[]): TreeNode {
    const filter = this.createFilter()
    const node: TreeNode = {
      filter,
      children,
      isLeaf: false,
      leafIndex: -1,
    }
    for (const child of children) {
      child.filter.unionInto(node.filter)
    }
    return node
  }

  private splitLeaf(leaf: TreeNode): void {
    const newLeaf = this.createLeafNode()
    this._leaves.push(newLeaf)
    newLeaf.leafIndex = this._leaves.length - 1
    this._leafCount = this._leaves.length
    if (this._root === leaf) {
      this._root = this.createInternalNode([leaf, newLeaf])
      leaf.leafIndex = 0
      newLeaf.leafIndex = 1
    } else {
      const parent = this.findParent(this._root, leaf)
      if (parent) {
        const childIdx = parent.children.indexOf(leaf)
        if (childIdx !== -1) {
          parent.children.splice(childIdx, 1, leaf, newLeaf)
          if (parent.children.length > this._opts.branchingFactor) {
            this.splitInternalNode(parent)
          }
          this.rebuildFilter(parent)
        }
      }
    }
    this.updateStats()
  }

  private splitInternalNode(node: TreeNode): void {
    if (node === this._root) {
      const mid = Math.floor(node.children.length / 2)
      const leftChildren = node.children.slice(0, mid)
      const rightChildren = node.children.slice(mid)
      const leftNode = this.createInternalNode(leftChildren)
      const rightNode = this.createInternalNode(rightChildren)
      leftNode.children = leftChildren
      rightNode.children = rightChildren
      this._root = this.createInternalNode([leftNode, rightNode])
    }
  }

  private findParent(root: TreeNode, target: TreeNode): TreeNode | null {
    for (const child of root.children) {
      if (child === target) return root
      if (!child.isLeaf) {
        const found = this.findParent(child, target)
        if (found) return found
      }
    }
    return null
  }

  private rebuildFilter(node: TreeNode): void {
    if (node.isLeaf) return
    const filter = this.createFilter()
    for (const child of node.children) {
      child.filter.unionInto(filter)
    }
    node.filter = filter
  }

  private updateAncestors(node: TreeNode): void {
    const parent = this.findParent(this._root, node)
    if (parent) {
      parent.filter.clear()
      for (const child of parent.children) {
        child.filter.unionInto(parent.filter)
      }
      this.updateAncestors(parent)
    }
  }

  private rebuildInternalNodes(node: TreeNode): void {
    if (node.isLeaf) return
    for (const child of node.children) {
      this.rebuildInternalNodes(child)
    }
    node.filter = this.createFilter()
    for (const child of node.children) {
      child.filter.unionInto(node.filter)
    }
  }

  private collectLeaves(node: TreeNode): TreeNode[] {
    if (node.isLeaf) return [node]
    const leaves: TreeNode[] = []
    for (const child of node.children) {
      leaves.push(...this.collectLeaves(child))
    }
    return leaves
  }

  private nodeToJSON(node: TreeNode): TreeNodeJSON {
    const result: TreeNodeJSON = {
      isLeaf: node.isLeaf,
    }
    if (node.isLeaf) {
      result.filter = node.filter.toJSON()
      result.leafIndex = node.leafIndex
    } else {
      result.children = node.children.map((c) => this.nodeToJSON(c))
      result.filter = node.filter.toJSON()
    }
    return result
  }

  private nodeFromJSON(data: TreeNodeJSON): TreeNode {
    const node: TreeNode = {
      filter: data.filter ? BloomFilter.fromJSON(data.filter) : new BloomFilter(this._opts.expectedItemsPerLeaf, this._opts.falsePositiveRate),
      children: [],
      isLeaf: data.isLeaf,
      leafIndex: data.leafIndex ?? -1,
    }
    if (data.children) {
      node.children = data.children.map((c) => this.nodeFromJSON(c))
    }
    return node
  }

  private updateStats(): void {
    this._stats.leafCount = this._leafCount
    let mem = 0
    const countNodes = (node: TreeNode): void => {
      mem += node.filter.bitCount
      for (const child of node.children) {
        countNodes(child)
      }
    }
    countNodes(this._root)
    this._stats.estimatedMemory = mem
  }

  private serialize(item: T): string {
    return JSON.stringify(item)
  }
}

export { DEFAULT_BLOOM_FILTER_TREE_OPTIONS } from './types.js'
export type { BloomFilterTreeOptions, BloomFilterTreeJSON, BloomFilterTreeStatistics, BloomFilterJSON, TreeNodeJSON } from './types.js'
