import type { BinaryTrieNode, BinaryTrieOptions, BinaryTrieStats } from './types.js'
import { DEFAULT_BINARY_TRIE_OPTIONS } from './types.js'

export class BinaryTrie<T = unknown> {
  private root: BinaryTrieNode<T>
  private bitDepth: number
  private _size: number = 0

  constructor(options?: Partial<BinaryTrieOptions>) {
    const opts: BinaryTrieOptions = { ...DEFAULT_BINARY_TRIE_OPTIONS, ...options }
    this.bitDepth = opts.bitDepth
    this.root = this._createNode()
  }

  private _createNode(): BinaryTrieNode<T> {
    return { children: [null, null], isEnd: false }
  }

  private _getChild(node: BinaryTrieNode<T>, bit: number): BinaryTrieNode<T> | null {
    return bit === 0 ? node.children[0] : node.children[1]
  }

  private _setChild(node: BinaryTrieNode<T>, bit: number, child: BinaryTrieNode<T> | null): void {
    if (bit === 0) {
      node.children[0] = child
    } else {
      node.children[1] = child
    }
  }

  insert(key: number, value?: T): void {
    let node = this.root
    for (let i = this.bitDepth - 1; i >= 0; i--) {
      const bit = (key >>> i) & 1
      if (this._getChild(node, bit) === null) {
        this._setChild(node, bit, this._createNode())
      }
      node = this._getChild(node, bit)!
    }
    if (!node.isEnd) {
      this._size++
    }
    node.isEnd = true
    node.key = key
    node.value = value
  }

  delete(key: number): boolean {
    return this._deleteRecursive(this.root, key, this.bitDepth - 1)
  }

  private _deleteRecursive(node: BinaryTrieNode<T>, key: number, bitIndex: number): boolean {
    if (bitIndex < 0) {
      if (!node.isEnd) return false
      node.isEnd = false
      node.key = undefined
      node.value = undefined
      this._size--
      return true
    }

    const bit = (key >>> bitIndex) & 1
    const child = this._getChild(node, bit)
    if (child === null) return false

    const deleted = this._deleteRecursive(child, key, bitIndex - 1)
    if (!deleted) return false

    if (!child.isEnd && this._getChild(child, 0) === null && this._getChild(child, 1) === null) {
      this._setChild(node, bit, null)
    }

    return true
  }

  has(key: number): boolean {
    const node = this._findNode(key)
    return node !== null && node.isEnd
  }

  get(key: number): T | undefined {
    const node = this._findNode(key)
    if (node === null || !node.isEnd) return undefined
    return node.value
  }

  private _findNode(key: number): BinaryTrieNode<T> | null {
    let node: BinaryTrieNode<T> | null = this.root
    for (let i = this.bitDepth - 1; i >= 0; i--) {
      if (node === null) return null
      const bit = (key >>> i) & 1
      const child = this._getChild(node, bit)
      if (child === null) return null
      node = child
    }
    return node
  }

  min(): number | undefined {
    if (this._size === 0) return undefined
    return this._findMinKey(this.root, this.bitDepth)
  }

  max(): number | undefined {
    if (this._size === 0) return undefined
    return this._findMaxKey(this.root, this.bitDepth)
  }

  private _findMinKey(node: BinaryTrieNode<T>, remainingLevels: number): number {
    let current = node
    for (let i = 0; i < remainingLevels; i++) {
      if (current.children[0] !== null) {
        current = current.children[0]!
      } else {
        current = current.children[1]!
      }
    }
    return current.key!
  }

  private _findMaxKey(node: BinaryTrieNode<T>, remainingLevels: number): number {
    let current = node
    for (let i = 0; i < remainingLevels; i++) {
      if (current.children[1] !== null) {
        current = current.children[1]!
      } else {
        current = current.children[0]!
      }
    }
    return current.key!
  }

  successor(key: number): number | undefined {
    let node = this.root
    let result: number | undefined = undefined

    for (let i = this.bitDepth - 1; i >= 0; i--) {
      const bit = (key >>> i) & 1

      if (bit === 0 && this._getChild(node, 1) !== null) {
        result = this._findMinKey(this._getChild(node, 1)!, i)
      }

      const child = this._getChild(node, bit)
      if (child === null) {
        return result
      }
      node = child
    }

    if (node.children[1] !== null) {
      return this._findMinKey(node.children[1]!, 0)
    }

    return result
  }

  predecessor(key: number): number | undefined {
    let node = this.root
    let result: number | undefined = undefined

    for (let i = this.bitDepth - 1; i >= 0; i--) {
      const bit = (key >>> i) & 1

      if (bit === 1 && this._getChild(node, 0) !== null) {
        result = this._findMaxKey(this._getChild(node, 0)!, i)
      }

      const child = this._getChild(node, bit)
      if (child === null) {
        return result
      }
      node = child
    }

    if (node.children[0] !== null) {
      return this._findMaxKey(node.children[0]!, 0)
    }

    return result
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = this._createNode()
    this._size = 0
  }

  forEach(callback: (value: T | undefined, key: number, trie: BinaryTrie<T>) => void): void {
    const entries = this._collectInOrder()
    for (const [key, value] of entries) {
      callback(value, key, this)
    }
  }

  keys(): number[] {
    const entries = this._collectInOrder()
    return entries.map(([key]) => key)
  }

  values(): Array<T | undefined> {
    const entries = this._collectInOrder()
    return entries.map(([, value]) => value)
  }

  entries(): Array<[number, T | undefined]> {
    return this._collectInOrder()
  }

  [Symbol.iterator](): IterableIterator<[number, T | undefined]> {
    const entries = this._collectInOrder()
    let index = 0
    return {
      next: () => {
        if (index < entries.length) {
          return { value: entries[index++]!, done: false }
        }
        return { value: undefined, done: true }
      },
      [Symbol.iterator]() {
        return this
      },
    }
  }

  private _collectInOrder(): Array<[number, T | undefined]> {
    const result: Array<[number, T | undefined]> = []
    this._collectInOrderRecursive(this.root, this.bitDepth, result)
    return result
  }

  private _collectInOrderRecursive(
    node: BinaryTrieNode<T>,
    remainingLevels: number,
    result: Array<[number, T | undefined]>,
  ): void {
    if (remainingLevels === 0) {
      if (node.isEnd) {
        result.push([node.key!, node.value])
      }
      return
    }
    if (node.children[0] !== null) {
      this._collectInOrderRecursive(node.children[0]!, remainingLevels - 1, result)
    }
    if (node.children[1] !== null) {
      this._collectInOrderRecursive(node.children[1]!, remainingLevels - 1, result)
    }
  }

  stats(): BinaryTrieStats {
    let nodeCount = 0
    let height = 0

    const traverse = (node: BinaryTrieNode<T>, depth: number): void => {
      nodeCount++
      if (depth > height) height = depth
      if (node.children[0] !== null) traverse(node.children[0]!, depth + 1)
      if (node.children[1] !== null) traverse(node.children[1]!, depth + 1)
    }

    traverse(this.root, 0)

    return { size: this._size, nodeCount, height }
  }
}

export { DEFAULT_BINARY_TRIE_OPTIONS } from './types.js'
export type { BinaryTrieNode, BinaryTrieOptions, BinaryTrieStats } from './types.js'
