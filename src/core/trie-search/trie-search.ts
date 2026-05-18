import type { TrieNode, TrieSearchOptions, TrieSearchResult } from './types.js'
import { DEFAULT_TRIE_SEARCH_OPTIONS } from './types.js'
import { levenshteinDistance } from '../../utils/string-similarity.js'

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
    return { char, children: new Map(), isEnd: false, count: 0 }
  }

  private normalize(word: string): string {
    return this.options.caseSensitive ? word : word.toLowerCase()
  }

  insert(word: string, value?: T): void {
    const w = this.normalize(word)

    if (w === '') {
      if (!this.root.isEnd) {
        this._count++
        this.root.count++
      }
      this.root.isEnd = true
      if (value !== undefined) this.root.value = value
      return
    }

    let current = this.root
    for (let i = 0; i < w.length; i++) {
      const ch = w[i]!
      let child = current.children.get(ch)
      if (child === undefined) {
        child = this.createNode(ch)
        current.children.set(ch, child)
      }
      current = child
    }

    if (!current.isEnd) {
      this._count++
      let node: TrieNode<T> | undefined = this.root
      const path = w
      for (let i = 0; i <= path.length; i++) {
        if (node) node.count++
        if (i < path.length) node = node!.children.get(path[i]!)
      }
    }

    current.isEnd = true
    if (value !== undefined) current.value = value
  }

  search(query: string): TrieSearchResult<T>[] {
    const q = this.normalize(query)
    const results: TrieSearchResult<T>[] = []

    if (q === '') {
      this.collectResults(this.root, '', 0, results)
      return results
    }

    let current: TrieNode<T> | undefined = this.root
    for (let i = 0; i < q.length; i++) {
      current = current.children.get(q[i]!)
      if (current === undefined) return results
    }

    this.collectResults(current, q, q.length, results)
    return results
  }

  private collectResults(
    node: TrieNode<T>,
    prefix: string,
    queryLen: number,
    results: TrieSearchResult<T>[],
  ): void {
    if (node.isEnd) {
      const score = queryLen === 0 ? 1 : queryLen / prefix.length
      results.push({
        key: prefix,
        score,
        value: node.value,
        depth: prefix.length,
      })
    }
    for (const child of node.children.values()) {
      this.collectResults(child, prefix + child.char, queryLen, results)
    }
  }

  has(word: string): boolean {
    const w = this.normalize(word)
    const node = this.findNode(w)
    return node !== undefined && node.isEnd
  }

  getCount(word?: string): number {
    if (word === undefined) return this._count
    return this.has(word) ? 1 : 0
  }

  getNode(word: string): TrieNode<T> | undefined {
    const w = this.normalize(word)
    if (w === '') return this.root
    return this.findNode(w)
  }

  private findNode(word: string): TrieNode<T> | undefined {
    let current: TrieNode<T> | undefined = this.root
    for (let i = 0; i < word.length; i++) {
      current = current.children.get(word[i]!)
      if (current === undefined) return undefined
    }
    return current
  }

  delete(word: string): boolean {
    const w = this.normalize(word)

    if (w === '') {
      if (!this.root.isEnd) return false
      this.root.isEnd = false
      this.root.value = undefined
      this.root.count--
      this._count--
      return true
    }

    const path: Array<{ parent: TrieNode<T>; char: string; node: TrieNode<T> }> = []
    let current: TrieNode<T> = this.root

    for (let i = 0; i < w.length; i++) {
      const ch = w[i]!
      const child = current.children.get(ch)
      if (child === undefined) return false
      path.push({ parent: current, char: ch, node: child })
      current = child
    }

    if (!current.isEnd) return false

    current.isEnd = false
    current.value = undefined
    this._count--

    for (let i = 0; i <= w.length; i++) {
      const node = i === 0 ? this.root : path[i - 1]!.node
      node.count--
    }

    for (let i = path.length - 1; i >= 0; i--) {
      const entry = path[i]!
      if (entry.node.children.size === 0 && !entry.node.isEnd) {
        entry.parent.children.delete(entry.char)
      }
    }

    return true
  }

  startsWith(prefix: string): string[] {
    const p = this.normalize(prefix)
    const results: string[] = []

    if (p === '') {
      this.collectWords(this.root, '', results)
      return results
    }

    const node = this.findNode(p)
    if (node === undefined) return results

    this.collectWords(node, p, results)
    return results
  }

  private collectWords(node: TrieNode<T>, prefix: string, results: string[]): void {
    if (node.isEnd) results.push(prefix)
    for (const child of node.children.values()) {
      this.collectWords(child, prefix + child.char, results)
    }
  }

  autocomplete(prefix: string, maxResults?: number): string[] {
    const limit = maxResults ?? this.options.maxSuggestions
    const p = this.normalize(prefix)
    const results: string[] = []

    if (p === '') {
      this.collectWordsLimited(this.root, '', results, limit)
      return results
    }

    const node = this.findNode(p)
    if (node === undefined) return results

    this.collectWordsLimited(node, p, results, limit)
    return results
  }

  private collectWordsLimited(node: TrieNode<T>, prefix: string, results: string[], limit: number): void {
    if (results.length >= limit) return
    if (node.isEnd) results.push(prefix)
    for (const child of node.children.values()) {
      if (results.length >= limit) return
      this.collectWordsLimited(child, prefix + child.char, results, limit)
    }
  }

  wordsWithPrefix(prefix: string, limit?: number): string[] {
    const p = this.normalize(prefix)
    const results: string[] = []

    if (p === '') {
      this.collectWordsLimited(this.root, '', results, limit ?? Infinity)
      return results
    }

    const node = this.findNode(p)
    if (node === undefined) return results

    this.collectWordsLimited(node, p, results, limit ?? Infinity)
    return results
  }

  fuzzySearch(word: string, maxDistance: number = 1): TrieSearchResult<T>[] {
    const w = this.normalize(word)
    const results: TrieSearchResult<T>[] = []

    if (w === '') {
      this.collectFuzzy(this.root, '', w, maxDistance, results)
      return results
    }

    this.collectFuzzy(this.root, '', w, maxDistance, results)
    results.sort((a, b) => b.score - a.score)
    return results
  }

  private collectFuzzy(
    node: TrieNode<T>,
    prefix: string,
    query: string,
    maxDistance: number,
    results: TrieSearchResult<T>[],
  ): void {
    if (node.isEnd) {
      const dist = this.levenshtein(prefix, query)
      if (dist <= maxDistance) {
        const maxLen = Math.max(prefix.length, query.length)
        const score = maxLen === 0 ? 1 : 1 - dist / maxLen
        results.push({ key: prefix, score, value: node.value, depth: prefix.length })
      }
    }
    for (const child of node.children.values()) {
      this.collectFuzzy(child, prefix + child.char, query, maxDistance, results)
    }
  }

  private levenshtein(a: string, b: string): number {
    return levenshteinDistance(a, b)
  }

  clear(): void {
    this.root = this.createNode('')
    this._count = 0
  }

  toJSON(): object {
    return this.serializeNode(this.root)
  }

  private serializeNode(node: TrieNode<T>): Record<string, unknown> {
    const children: Record<string, unknown> = {}
    for (const [key, child] of node.children) {
      children[key] = this.serializeNode(child)
    }
    return {
      char: node.char,
      children,
      isEnd: node.isEnd,
      count: node.count,
      ...(node.value !== undefined ? { value: node.value } : {}),
    }
  }
}

export { DEFAULT_TRIE_SEARCH_OPTIONS } from './types.js'
export type { TrieNode, TrieSearchOptions, TrieSearchResult } from './types.js'
