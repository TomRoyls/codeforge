import type { BitwiseTrieNode, BitwiseTrieOptions } from './types.js'
import { DEFAULT_BITWISE_TRIE_OPTIONS } from './types.js'

export class BitwiseTrie<T> {
  private root: BitwiseTrieNode<T>
  private bitDepth: number
  private _size: number = 0

  constructor(options?: Partial<BitwiseTrieOptions>) {
    const opts: BitwiseTrieOptions = { ...DEFAULT_BITWISE_TRIE_OPTIONS, ...options }
    this.bitDepth = opts.bitDepth
    this.root = this._createNode()
  }

  private _createNode(): BitwiseTrieNode<T> {
    return { children: [null, null], isEnd: false }
  }

  private _getChild(node: BitwiseTrieNode<T>, bit: number): BitwiseTrieNode<T> | null {
    return bit === 0 ? node.children[0] : node.children[1]
  }

  private _setChild(node: BitwiseTrieNode<T>, bit: number, child: BitwiseTrieNode<T> | null): void {
    if (bit === 0) {
      node.children[0] = child
    } else {
      node.children[1] = child
    }
  }

  insert(key: number, value: T): void {
    let node = this.root
    for (let i = this.bitDepth - 1; i >= 0; i--) {
      const bit = (key >>> i) & 1
      const child = this._getChild(node, bit)
      if (child === null) {
        const newNode = this._createNode()
        this._setChild(node, bit, newNode)
        node = newNode
      } else {
        node = child
      }
    }
    if (!node.isEnd) {
      this._size++
    }
    node.isEnd = true
    node.value = value
  }

  search(key: number): T | undefined {
    const node = this._findNode(key)
    if (node === null || !node.isEnd) return undefined
    return node.value
  }

  private _findNode(key: number): BitwiseTrieNode<T> | null {
    let node: BitwiseTrieNode<T> | null = this.root
    for (let i = this.bitDepth - 1; i >= 0; i--) {
      if (node === null) return null
      const bit = (key >>> i) & 1
      const child = this._getChild(node, bit)
      if (child === null) return null
      node = child
    }
    return node
  }

  delete(key: number): boolean {
    return this._deleteRecursive(this.root, key, this.bitDepth - 1)
  }

  private _deleteRecursive(node: BitwiseTrieNode<T>, key: number, bitIndex: number): boolean {
    if (bitIndex < 0) {
      if (!node.isEnd) return false
      node.isEnd = false
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

  longestPrefixMatch(key: number, prefixLength: number): T | undefined {
    let node: BitwiseTrieNode<T> | null = this.root
    let lastMatch: T | undefined = undefined
    let foundMatch = false

    for (let i = this.bitDepth - 1; i >= 0; i--) {
      if (node === null) break
      if (node.isEnd) {
        lastMatch = node.value
        foundMatch = true
      }
      const bit = (key >>> i) & 1
      const child = this._getChild(node, bit)
      if (child === null) break
      node = child
    }

    if (node !== null && node.isEnd) {
      lastMatch = node.value
      foundMatch = true
    }

    if (!foundMatch) return undefined

    const bitsTraversed = this.bitDepth
    if (bitsTraversed >= prefixLength) return lastMatch

    return undefined
  }

  insertPrefix(prefix: number, prefixLength: number, value: T): void {
    let node = this.root
    for (let i = this.bitDepth - 1; i >= this.bitDepth - prefixLength; i--) {
      const bit = (prefix >>> i) & 1
      const child = this._getChild(node, bit)
      if (child === null) {
        const newNode = this._createNode()
        this._setChild(node, bit, newNode)
        node = newNode
      } else {
        node = child
      }
    }
    if (!node.isEnd) {
      this._size++
    }
    node.isEnd = true
    node.value = value
  }

  enumeratePrefix(prefix: number, prefixLength: number): Array<{ key: number; value: T }> {
    let node: BitwiseTrieNode<T> | null = this.root

    for (let i = this.bitDepth - 1; i >= this.bitDepth - prefixLength; i--) {
      if (node === null) return []
      const bit = (prefix >>> i) & 1
      const child = this._getChild(node, bit)
      if (child === null) return []
      node = child
    }

    const results: Array<{ key: number; value: T }> = []
    const baseKey = (prefix >>> (this.bitDepth - prefixLength)) << (this.bitDepth - prefixLength)
    if (node !== null) {
      this._collectAll(node, baseKey, this.bitDepth - prefixLength, results)
    }
    return results
  }

  private _collectAll(
    node: BitwiseTrieNode<T>,
    currentKey: number,
    remainingBits: number,
    results: Array<{ key: number; value: T }>,
  ): void {
    if (node.isEnd && node.value !== undefined) {
      results.push({ key: currentKey, value: node.value })
    }
    if (remainingBits <= 0) return

    const child0 = this._getChild(node, 0)
    if (child0 !== null) {
      this._collectAll(child0, currentKey, remainingBits - 1, results)
    }
    const child1 = this._getChild(node, 1)
    if (child1 !== null) {
      this._collectAll(child1, currentKey | (1 << (remainingBits - 1)), remainingBits - 1, results)
    }
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = this._createNode()
    this._size = 0
  }

  countNodes(): number {
    return this._countNodesRecursive(this.root)
  }

  private _countNodesRecursive(node: BitwiseTrieNode<T>): number {
    let count = 1
    const child0 = this._getChild(node, 0)
    if (child0 !== null) {
      count += this._countNodesRecursive(child0)
    }
    const child1 = this._getChild(node, 1)
    if (child1 !== null) {
      count += this._countNodesRecursive(child1)
    }
    return count
  }
}

export { DEFAULT_BITWISE_TRIE_OPTIONS } from './types.js'
export type { BitwiseTrieNode, BitwiseTrieOptions } from './types.js'
