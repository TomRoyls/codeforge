import type { TrieNode, TrieSearchOptions, TrieSearchResult } from './types.js'
import { DEFAULT_TRIE_SEARCH_OPTIONS } from './types.js'

export class TrieSearch<T = unknown> {
  private root: TrieNode<T>
  private _count: number
  private options: TrieSearchOptions

  constructor(options?: Partial<TrieSearchOptions>) {
    this.options = { ...DEFAULT_TRIE_SEARCH_OPTIONS, ...options }
    this.root = this.createNode('')
    this._count = 0
  }

  private createNode(char: string): TrieNode<T> {
    return {
      char,
      children: new Map<string, TrieNode<T>>(),
      isEnd: false,
      count: 0,
    }
  }

  private normalize(key: string): string {
    return this.options.caseSensitive ? key : key.toLowerCase()
  }

  insert(key: string, value?: T): void {
    const normalizedKey = this.normalize(key)
    let node = this.root
    for (const char of normalizedKey) {
      let child = node.children.get(char)
      if (!child) {
        child = this.createNode(char)
        node.children.set(char, child)
      }
      node = child
    }
    const isNew = !node.isEnd
    node.isEnd = true
    node.value = value
    if (isNew) {
      this._count++
      let current = this.root
      current.count++
      for (const char of normalizedKey) {
        current = current.children.get(char)!
        current.count++
      }
    }
  }

  search(prefix: string): TrieSearchResult<T>[] {
    const normalizedPrefix = this.normalize(prefix)
    const node = this.findNode(normalizedPrefix)
    if (!node) return []
    const results: TrieSearchResult<T>[] = []
    this.collectResults(node, normalizedPrefix, normalizedPrefix, results)
    return results
  }

  has(key: string): boolean {
    const normalizedKey = this.normalize(key)
    const node = this.findNode(normalizedKey)
    return node !== undefined && node.isEnd
  }

  startsWith(prefix: string): string[] {
    const normalizedPrefix = this.normalize(prefix)
    const node = this.findNode(normalizedPrefix)
    if (!node) return []
    const results: string[] = []
    this.collectKeys(node, normalizedPrefix, results)
    return results
  }

  delete(key: string): boolean {
    const normalizedKey = this.normalize(key)
    const path: TrieNode<T>[] = [this.root]
    let node = this.root
    for (const char of normalizedKey) {
      const child = node.children.get(char)
      if (!child) return false
      path.push(child)
      node = child
    }
    if (!node.isEnd) return false
    node.isEnd = false
    node.value = undefined
    this._count--
    for (const pathNode of path) {
      pathNode.count--
    }
    for (let i = path.length - 1; i >= 1; i--) {
      const current = path[i]!
      if (current.children.size === 0 && !current.isEnd) {
        const parent = path[i - 1]!
        parent.children.delete(current.char)
      }
    }
    return true
  }

  autocomplete(prefix: string, maxResults?: number): string[] {
    const normalizedPrefix = this.normalize(prefix)
    const node = this.findNode(normalizedPrefix)
    if (!node) return []
    const limit = maxResults ?? this.options.maxSuggestions
    const results: string[] = []
    this.collectKeys(node, normalizedPrefix, results, limit)
    return results
  }

  fuzzySearch(query: string, maxDistance: number = 2): TrieSearchResult<T>[] {
    const normalizedQuery = this.normalize(query)
    const results: TrieSearchResult<T>[] = []
    const initialRow: number[] = []
    for (let i = 0; i <= normalizedQuery.length; i++) {
      initialRow.push(i)
    }
    if (this.root.isEnd && normalizedQuery.length <= maxDistance) {
      results.push({
        key: '',
        value: this.root.value,
        score: 1 / (1 + normalizedQuery.length),
        depth: 0,
      })
    }
    for (const [char, child] of this.root.children) {
      this.fuzzySearchRecursive(child, char, normalizedQuery, initialRow, maxDistance, results)
    }
    return results.sort((a, b) => b.score - a.score)
  }

  private fuzzySearchRecursive(
    node: TrieNode<T>,
    prefix: string,
    query: string,
    previousRow: number[],
    maxDistance: number,
    results: TrieSearchResult<T>[]
  ): void {
    const columns = query.length + 1
    const currentRow: number[] = []
    currentRow.push(previousRow[0]! + 1)
    for (let i = 1; i < columns; i++) {
      const insertCost = currentRow[i - 1]! + 1
      const deleteCost = previousRow[i]! + 1
      const replaceCost = previousRow[i - 1]! + (node.char === query[i - 1] ? 0 : 1)
      currentRow.push(Math.min(insertCost, deleteCost, replaceCost))
    }
    const lastVal = currentRow[columns - 1]!
    if (lastVal <= maxDistance && node.isEnd) {
      results.push({
        key: prefix,
        value: node.value,
        score: 1 / (1 + lastVal),
        depth: prefix.length,
      })
    }
    let minVal = currentRow[0]!
    for (let i = 1; i < currentRow.length; i++) {
      const val = currentRow[i]!
      if (val < minVal) minVal = val
    }
    if (minVal <= maxDistance) {
      for (const [char, child] of node.children) {
        this.fuzzySearchRecursive(child, prefix + char, query, currentRow, maxDistance, results)
      }
    }
  }

  getCount(): number {
    return this._count
  }

  clear(): void {
    this.root = this.createNode('')
    this._count = 0
  }

  getNode(key: string): TrieNode<T> | undefined {
    const normalizedKey = this.normalize(key)
    return this.findNode(normalizedKey)
  }

  private findNode(key: string): TrieNode<T> | undefined {
    let node = this.root
    for (const char of key) {
      const child = node.children.get(char)
      if (!child) return undefined
      node = child
    }
    return node
  }

  private collectKeys(node: TrieNode<T>, prefix: string, results: string[], maxResults?: number): void {
    if (maxResults !== undefined && results.length >= maxResults) return
    if (node.isEnd) {
      results.push(prefix)
    }
    for (const [char, child] of node.children) {
      this.collectKeys(child, prefix + char, results, maxResults)
    }
  }

  private collectResults(
    node: TrieNode<T>,
    prefix: string,
    originalPrefix: string,
    results: TrieSearchResult<T>[]
  ): void {
    if (node.isEnd) {
      const score = prefix === originalPrefix ? 1 : 1 / (1 + prefix.length - originalPrefix.length)
      results.push({
        key: prefix,
        value: node.value,
        score,
        depth: prefix.length,
      })
    }
    for (const [char, child] of node.children) {
      this.collectResults(child, prefix + char, originalPrefix, results)
    }
  }

  toJSON(): Record<string, unknown> {
    return this.nodeToJSON(this.root)
  }

  private nodeToJSON(node: TrieNode<T>): Record<string, unknown> {
    const children: Record<string, unknown> = {}
    for (const [key, child] of node.children) {
      children[key] = this.nodeToJSON(child)
    }
    return {
      char: node.char,
      children,
      isEnd: node.isEnd,
      value: node.value,
      count: node.count,
    }
  }
}

export { DEFAULT_TRIE_SEARCH_OPTIONS } from './types.js'
export type { TrieNode, TrieSearchOptions, TrieSearchResult } from './types.js'
