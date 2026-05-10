import type {
  PathCompressedTrieOptions,
  PathCompressedTrieStatistics,
  TrieNode,
} from './types.js'
import { DEFAULT_PATH_COMPRESSED_TRIE_OPTIONS } from './types.js'

export class PathCompressedTrie {
  private root: TrieNode
  private options: PathCompressedTrieOptions
  private _size: number
  private stats: PathCompressedTrieStatistics

  constructor(options?: Partial<PathCompressedTrieOptions>) {
    this.options = { ...DEFAULT_PATH_COMPRESSED_TRIE_OPTIONS, ...options }
    this.root = this.createNode('')
    this._size = 0
    this.stats = { inserts: 0, deletes: 0, searches: 0, nodesCreated: 1, pathCompressions: 0 }
  }

  private createNode(key: string): TrieNode {
    return { key, value: undefined, children: new Map<string, TrieNode>(), isEnd: false }
  }

  private normalize(word: string): string {
    return this.options.caseSensitive ? word : word.toLowerCase()
  }

  private commonPrefixLength(a: string, b: string): number {
    const len = Math.min(a.length, b.length)
    let i = 0
    while (i < len && a[i] === b[i]) {
      i++
    }
    return i
  }

  insert(word: string): void {
    const w = this.normalize(word)
    this.stats.inserts++
    this.insertRecursive(this.root, w, word)
  }

  private insertRecursive(node: TrieNode, remaining: string, original: string): void {
    if (remaining === '') {
      if (!node.isEnd) {
        this._size++
      }
      node.isEnd = true
      node.value = original
      return
    }

    const firstChar = remaining[0]!
    const child = node.children.get(firstChar)

    if (!child) {
      const newChild = this.createNode(remaining)
      newChild.isEnd = true
      newChild.value = original
      this._size++
      this.stats.nodesCreated++
      node.children.set(firstChar, newChild)
      return
    }

    const cpl = this.commonPrefixLength(remaining, child.key)

    if (cpl === child.key.length) {
      this.insertRecursive(child, remaining.slice(cpl), original)
      return
    }

    const splitNode = this.createNode(child.key.slice(0, cpl))
    this.stats.nodesCreated++

    child.key = child.key.slice(cpl)
    splitNode.children.set(child.key[0]!, child)

    node.children.set(firstChar, splitNode)

    const afterSplit = remaining.slice(cpl)
    if (afterSplit === '') {
      if (!splitNode.isEnd) {
        this._size++
      }
      splitNode.isEnd = true
      splitNode.value = original
      this.stats.pathCompressions++
      return
    }

    const newChild = this.createNode(afterSplit)
    newChild.isEnd = true
    newChild.value = original
    this._size++
    this.stats.nodesCreated++
    splitNode.children.set(afterSplit[0]!, newChild)
  }

  delete(word: string): boolean {
    const w = this.normalize(word)
    this.stats.deletes++
    const result = this.deleteRecursive(this.root, w, '')
    return result
  }

  private deleteRecursive(node: TrieNode, remaining: string, parentKey: string): boolean {
    if (remaining === '') {
      if (!node.isEnd) return false
      node.isEnd = false
      node.value = undefined
      this._size--
      this.mergeIfNeeded(node, parentKey)
      return true
    }

    const firstChar = remaining[0]!
    const child = node.children.get(firstChar)
    if (!child) return false

    if (!remaining.startsWith(child.key)) return false

    const result = this.deleteRecursive(child, remaining.slice(child.key.length), child.key)
    if (result) {
      this.mergeIfNeeded(child, firstChar)
      this.mergeChildIntoParent(node, child, firstChar)
    }
    return result
  }

  private mergeIfNeeded(node: TrieNode, _edgeKey: string): void {
    if (node === this.root) return
    if (node.isEnd) return
    if (node.children.size === 1) {
      this.stats.pathCompressions++
    }
  }

  private mergeChildIntoParent(parent: TrieNode, child: TrieNode, edgeKey: string): void {
    if (!child.isEnd && child.children.size === 0) {
      parent.children.delete(edgeKey)
      this.stats.nodesCreated--
    }
  }

  search(word: string): boolean {
    const w = this.normalize(word)
    this.stats.searches++
    return this.searchNode(this.root, w)
  }

  private searchNode(node: TrieNode, remaining: string): boolean {
    if (remaining === '') {
      return node.isEnd
    }

    const firstChar = remaining[0]!
    const child = node.children.get(firstChar)
    if (!child) return false

    if (!remaining.startsWith(child.key)) return false

    return this.searchNode(child, remaining.slice(child.key.length))
  }

  startsWith(prefix: string): boolean {
    const p = this.normalize(prefix)
    return this.findPrefixNode(p) !== undefined
  }

  private findPrefixNode(prefix: string): TrieNode | undefined {
    let node = this.root
    let remaining = prefix

    while (remaining !== '') {
      const firstChar = remaining[0]!
      const child = node.children.get(firstChar)
      if (!child) return undefined

      if (remaining.startsWith(child.key)) {
        remaining = remaining.slice(child.key.length)
        node = child
      } else if (child.key.startsWith(remaining)) {
        return child
      } else {
        return undefined
      }
    }

    return node
  }

  wordsWithPrefix(prefix: string): string[] {
    const p = this.normalize(prefix)
    const results: string[] = []
    const node = this.findPrefixNode(p)
    if (node === undefined) return results

    if (p === '') {
      this.collectWords(node, '', results)
    } else {
      const reconstructed = this.reconstructFullPrefix(p)
      this.collectWords(node, reconstructed, results)
    }
    return results
  }

  private reconstructFullPrefix(prefix: string): string {
    let node = this.root
    let remaining = prefix
    let fullPath = ''

    while (remaining !== '') {
      const firstChar = remaining[0]!
      const child = node.children.get(firstChar)
      if (!child) break

      if (remaining.startsWith(child.key)) {
        fullPath += child.key
        remaining = remaining.slice(child.key.length)
        node = child
      } else if (child.key.startsWith(remaining)) {
        fullPath += remaining
        remaining = ''
      } else {
        break
      }
    }

    return fullPath
  }

  longestCommonPrefix(): string {
    if (this._size === 0) return ''

    let prefix = ''
    let node = this.root

    while (node.children.size === 1 && !node.isEnd) {
      const child = node.children.values().next().value!
      prefix += child.key
      node = child
    }

    return prefix
  }

  autocomplete(prefix: string, max?: number): string[] {
    const p = this.normalize(prefix)
    const results: string[] = []
    const node = this.findPrefixNode(p)
    if (node === undefined) return results

    if (p === '') {
      this.collectWords(node, '', results, max)
    } else {
      const reconstructed = this.reconstructFullPrefix(p)
      this.collectWords(node, reconstructed, results, max)
    }
    return results
  }

  private collectWords(node: TrieNode, currentPrefix: string, results: string[], max?: number): void {
    if (max !== undefined && results.length >= max) return

    if (node.isEnd && node.value !== undefined) {
      results.push(node.value)
    }

    for (const child of node.children.values()) {
      this.collectWords(child, currentPrefix + child.key, results, max)
      if (max !== undefined && results.length >= max) return
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = this.createNode('')
    this._size = 0
    this.stats.nodesCreated = 1
  }

  toArray(): string[] {
    const results: string[] = []
    this.collectWords(this.root, '', results)
    return results
  }

  forEach(callback: (word: string, index: number) => void): void {
    const words = this.toArray()
    words.forEach((word, index) => callback(word, index))
  }

  *[Symbol.iterator](): Iterator<string> {
    const words = this.toArray()
    for (const word of words) {
      yield word
    }
  }

  getHeight(): number {
    return this.computeHeight(this.root)
  }

  private computeHeight(node: TrieNode): number {
    if (node.children.size === 0) return 0
    let maxChildHeight = 0
    for (const child of node.children.values()) {
      const h = this.computeHeight(child)
      if (h > maxChildHeight) maxChildHeight = h
    }
    return maxChildHeight + 1
  }

  getNodeCount(): number {
    return this.countNodes(this.root)
  }

  private countNodes(node: TrieNode): number {
    let count = 1
    for (const child of node.children.values()) {
      count += this.countNodes(child)
    }
    return count
  }

  getStatistics(): PathCompressedTrieStatistics {
    return { ...this.stats }
  }
}

export { DEFAULT_PATH_COMPRESSED_TRIE_OPTIONS } from './types.js'
export type { PathCompressedTrieOptions, PathCompressedTrieStatistics, TrieNode } from './types.js'
