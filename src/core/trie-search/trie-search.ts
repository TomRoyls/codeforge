import type { TrieSearchNode, TrieSearchOptions } from './types.js'
import { DEFAULT_TRIE_SEARCH_OPTIONS } from './types.js'

export class TrieSearch<T = unknown> {
  private root: TrieSearchNode<T>
  private _count: number
  private options: TrieSearchOptions

  constructor(options?: Partial<TrieSearchOptions>) {
    this.options = { ...DEFAULT_TRIE_SEARCH_OPTIONS, ...options }
    this.root = { label: '', children: new Map(), isEnd: false }
    this._count = 0
  }

  private normalize(word: string): string {
    return this.options.caseSensitive ? word : word.toLowerCase()
  }

  insert(word: string, value?: T): void {
    const w = this.normalize(word)

    if (w === '') {
      if (!this.root.isEnd) this._count++
      this.root.isEnd = true
      if (value !== undefined) this.root.value = value
      return
    }

    let current = this.root
    let i = 0

    while (i < w.length) {
      const ch = w[i]!
      const child = current.children.get(ch)

      if (child === undefined) {
        current.children.set(ch, {
          label: w.slice(i),
          children: new Map(),
          isEnd: true,
          value,
        })
        this._count++
        return
      }

      const cl = this.commonPrefixLen(w, i, child.label)

      if (cl === child.label.length) {
        current = child
        i += cl
      } else if (cl === w.length - i) {
        const splitNode: TrieSearchNode<T> = {
          label: child.label.slice(0, cl),
          children: new Map(),
          isEnd: true,
          value,
        }
        child.label = child.label.slice(cl)
        splitNode.children.set(child.label[0]!, child)
        current.children.set(ch, splitNode)
        this._count++
        return
      } else {
        const splitNode: TrieSearchNode<T> = {
          label: child.label.slice(0, cl),
          children: new Map(),
          isEnd: false,
        }
        child.label = child.label.slice(cl)
        splitNode.children.set(child.label[0]!, child)

        const remaining = w.slice(i + cl)
        splitNode.children.set(remaining[0]!, {
          label: remaining,
          children: new Map(),
          isEnd: true,
          value,
        })

        current.children.set(ch, splitNode)
        this._count++
        return
      }
    }

    if (!current.isEnd) this._count++
    current.isEnd = true
    if (value !== undefined) current.value = value
  }

  search(word: string): boolean {
    const node = this.findExactNode(this.normalize(word))
    return node !== undefined && node.isEnd
  }

  delete(word: string): boolean {
    const w = this.normalize(word)

    if (w === '') {
      if (!this.root.isEnd) return false
      this.root.isEnd = false
      this.root.value = undefined
      this._count--
      return true
    }

    const path: Array<{ parent: TrieSearchNode<T>; key: string; node: TrieSearchNode<T> }> = []
    let current = this.root
    let i = 0

    while (i < w.length) {
      const ch = w[i]!
      const child = current.children.get(ch)
      if (child === undefined) return false
      if (!this.matchLabel(w, i, child.label)) return false

      path.push({ parent: current, key: ch, node: child })
      i += child.label.length
      current = child
    }

    if (!current.isEnd) return false

    current.isEnd = false
    current.value = undefined
    this._count--

    for (let j = path.length - 1; j >= 0; j--) {
      const entry = path[j]!
      const node = entry.node

      if (node.children.size === 0 && !node.isEnd) {
        entry.parent.children.delete(entry.key)
      } else if (node.children.size === 1 && !node.isEnd) {
        const grandchild = node.children.values().next().value!
        node.label += grandchild.label
        node.isEnd = grandchild.isEnd
        node.value = grandchild.value
        node.children = grandchild.children
      }
    }

    return true
  }

  startsWith(prefix: string): boolean {
    const p = this.normalize(prefix)
    if (p === '') return this._count > 0

    let current = this.root
    let i = 0

    while (i < p.length) {
      const ch = p[i]!
      const child = current.children.get(ch)
      if (child === undefined) return false

      const label = child.label
      let j = 0
      while (j < label.length && i + j < p.length && label[j] === p[i + j]) j++

      if (i + j === p.length) return true
      if (j < label.length) return false

      i += label.length
      current = child
    }

    return true
  }

  wordsWithPrefix(prefix: string, limit?: number): string[] {
    const p = this.normalize(prefix)
    const results: string[] = []

    if (p === '') {
      this.collectWords(this.root, '', results, limit)
      return results
    }

    let current = this.root
    let i = 0
    let accumulated = ''

    while (i < p.length) {
      const ch = p[i]!
      const child = current.children.get(ch)
      if (child === undefined) return []

      const label = child.label
      let j = 0
      while (j < label.length && i + j < p.length && label[j] === p[i + j]) j++

      if (i + j === p.length) {
        this.collectWords(child, accumulated + label, results, limit)
        return results
      }

      if (j < label.length) return []

      accumulated += label
      i += label.length
      current = child
    }

    this.collectWords(current, p, results, limit)
    return results
  }

  longestPrefixOf(query: string): string {
    const q = this.normalize(query)
    let longest = ''
    let current = this.root
    let i = 0

    while (i < q.length) {
      const ch = q[i]!
      const child = current.children.get(ch)
      if (child === undefined) break

      const label = child.label
      if (i + label.length > q.length) break
      if (!this.matchLabel(q, i, label)) break

      i += label.length
      current = child

      if (current.isEnd) longest = q.slice(0, i)
    }

    return longest
  }

  countWords(): number {
    return this._count
  }

  isEmpty(): boolean {
    return this._count === 0
  }

  autocomplete(prefix: string, limit?: number): string[] {
    return this.wordsWithPrefix(prefix, limit)
  }

  containsSubstring(str: string): boolean {
    const s = this.normalize(str)
    if (s === '') return this._count > 0
    for (const word of this) {
      if (word.includes(s)) return true
    }
    return false
  }

  getAllWords(): string[] {
    const results: string[] = []
    this.collectWords(this.root, '', results)
    return results
  }

  clear(): void {
    this.root = { label: '', children: new Map(), isEnd: false }
    this._count = 0
  }

  clone(): TrieSearch<T> {
    const copy = new TrieSearch<T>(this.options)
    copy._count = this._count
    copy.root = this.cloneNode(this.root)
    return copy
  }

  getValue(word: string): T | undefined {
    const node = this.findExactNode(this.normalize(word))
    if (!node || !node.isEnd) return undefined
    return node.value
  }

  *[Symbol.iterator](): IterableIterator<string> {
    yield* this.getAllWords()
  }

  private findExactNode(word: string): TrieSearchNode<T> | undefined {
    let current = this.root
    let i = 0

    while (i < word.length) {
      const ch = word[i]!
      const child = current.children.get(ch)
      if (child === undefined) return undefined

      if (!this.matchLabel(word, i, child.label)) return undefined

      i += child.label.length
      current = child
    }

    return current
  }

  private commonPrefixLen(a: string, startA: number, b: string): number {
    let i = 0
    while (startA + i < a.length && i < b.length && a[startA + i] === b[i]) i++
    return i
  }

  private matchLabel(str: string, start: number, label: string): boolean {
    if (str.length - start < label.length) return false
    for (let i = 0; i < label.length; i++) {
      if (str[start + i] !== label[i]) return false
    }
    return true
  }

  private collectWords(
    node: TrieSearchNode<T>,
    prefix: string,
    results: string[],
    limit?: number,
  ): void {
    if (limit !== undefined && results.length >= limit) return
    if (node.isEnd) results.push(prefix)
    for (const child of node.children.values()) {
      this.collectWords(child, prefix + child.label, results, limit)
      if (limit !== undefined && results.length >= limit) return
    }
  }

  private cloneNode(node: TrieSearchNode<T>): TrieSearchNode<T> {
    const copy: TrieSearchNode<T> = {
      label: node.label,
      children: new Map(),
      isEnd: node.isEnd,
      value: node.value,
    }
    for (const [key, child] of node.children) {
      copy.children.set(key, this.cloneNode(child))
    }
    return copy
  }
}

export { DEFAULT_TRIE_SEARCH_OPTIONS } from './types.js'
export type { TrieSearchNode, TrieSearchOptions } from './types.js'
