import type { TrieNode } from './types.js'

export type { TrieNode } from './types.js'

function createNode(): TrieNode {
  return { children: new Map(), isEnd: false }
}

export class TrieSet implements Iterable<string> {
  private root: TrieNode
  private _size: number

  constructor() {
    this.root = createNode()
    this._size = 0
  }

  add(word: string): boolean {
    let node = this.root
    for (let i = 0; i < word.length; i++) {
      const ch = word[i]!
      let child = node.children.get(ch)
      if (child === undefined) {
        child = createNode()
        node.children.set(ch, child)
      }
      node = child
    }
    if (node.isEnd) return false
    node.isEnd = true
    this._size++
    return true
  }

  delete(word: string): boolean {
    return this.deleteRec(this.root, word, 0)
  }

  private deleteRec(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) {
      if (!node.isEnd) return false
      node.isEnd = false
      this._size--
      return true
    }
    const ch = word[depth]!
    const child = node.children.get(ch)
    if (child === undefined) return false
    const deleted = this.deleteRec(child, word, depth + 1)
    if (deleted && !child.isEnd && child.children.size === 0) {
      node.children.delete(ch)
    }
    return deleted
  }

  has(word: string): boolean {
    let node = this.root
    for (let i = 0; i < word.length; i++) {
      const ch = word[i]!
      const child = node.children.get(ch)
      if (child === undefined) return false
      node = child
    }
    return node.isEnd
  }

  startsWith(prefix: string): boolean {
    if (this._size === 0) return false
    let node = this.root
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i]!
      const child = node.children.get(ch)
      if (child === undefined) return false
      node = child
    }
    return true
  }

  wordsWithPrefix(prefix: string): string[] {
    let node = this.root
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i]!
      const child = node.children.get(ch)
      if (child === undefined) return []
      node = child
    }
    const result: string[] = []
    this.collectWords(node, prefix, result)
    return result
  }

  private collectWords(node: TrieNode, prefix: string, result: string[]): void {
    if (node.isEnd) result.push(prefix)
    for (const [ch, child] of node.children) {
      this.collectWords(child, prefix + ch, result)
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = createNode()
    this._size = 0
  }

  toArray(): string[] {
    const result: string[] = []
    this.collectWords(this.root, '', result)
    return result
  }

  forEach(callback: (word: string) => void): void {
    this.collectWordsCallback(this.root, '', callback)
  }

  private collectWordsCallback(node: TrieNode, prefix: string, callback: (word: string) => void): void {
    if (node.isEnd) callback(prefix)
    for (const [ch, child] of node.children) {
      this.collectWordsCallback(child, prefix + ch, callback)
    }
  }

  [Symbol.iterator](): Iterator<string> {
    const words = this.toArray()
    let index = 0
    return {
      next(): IteratorResult<string> {
        if (index < words.length) {
          return { value: words[index++]!, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  }

  clone(): TrieSet {
    const cloned = new TrieSet()
    cloned.root = this.cloneNode(this.root)
    cloned._size = this._size
    return cloned
  }

  private cloneNode(node: TrieNode): TrieNode {
    const copy = createNode()
    copy.isEnd = node.isEnd
    for (const [ch, child] of node.children) {
      copy.children.set(ch, this.cloneNode(child))
    }
    return copy
  }

  static fromArray(words: string[]): TrieSet {
    const trie = new TrieSet()
    for (const word of words) {
      trie.add(word)
    }
    return trie
  }

  longestCommonPrefix(): string {
    let prefix = ''
    let node = this.root
    while (node.children.size === 1 && !node.isEnd) {
      const [ch, child] = node.children.entries().next().value! as [string, TrieNode]
      prefix += ch
      node = child
    }
    return prefix
  }

  longestPrefixOf(word: string): string {
    let node = this.root
    let longest = ''
    let prefix = ''
    for (let i = 0; i < word.length; i++) {
      const ch = word[i]!
      const child = node.children.get(ch)
      if (child === undefined) break
      prefix += ch
      node = child
      if (node.isEnd) longest = prefix
    }
    return longest
  }

  autocomplete(prefix: string, limit?: number): string[] {
    const matches = this.wordsWithPrefix(prefix)
    if (limit !== undefined && limit >= 0) {
      return matches.slice(0, limit)
    }
    return matches
  }

  removePrefix(prefix: string): number {
    let node = this.root
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i]!
      const child = node.children.get(ch)
      if (child === undefined) return 0
      node = child
    }
    const count = this.countEndings(node)
    this.removeAllEndings(node)
    node.children.clear()
    node.isEnd = false
    this._size -= count
    this.cleanupPath(this.root, prefix, 0)
    return count
  }

  private countEndings(node: TrieNode): number {
    let count = node.isEnd ? 1 : 0
    for (const [, child] of node.children) {
      count += this.countEndings(child)
    }
    return count
  }

  private removeAllEndings(node: TrieNode): void {
    node.isEnd = false
    for (const [, child] of node.children) {
      this.removeAllEndings(child)
    }
  }

  private cleanupPath(node: TrieNode, prefix: string, depth: number): void {
    if (depth >= prefix.length) return
    const ch = prefix[depth]!
    const child = node.children.get(ch)
    if (child === undefined) return
    this.cleanupPath(child, prefix, depth + 1)
    if (!child.isEnd && child.children.size === 0) {
      node.children.delete(ch)
    }
  }

  containsPrefix(prefix: string): boolean {
    if (this._size === 0) return false
    let node = this.root
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i]!
      const child = node.children.get(ch)
      if (child === undefined) return false
      node = child
    }
    return true
  }

  countWordsWithPrefix(prefix: string): number {
    let node = this.root
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i]!
      const child = node.children.get(ch)
      if (child === undefined) return 0
      node = child
    }
    return this.countEndings(node)
  }

  forEachPrefix(prefix: string, callback: (word: string) => void): void {
    let node = this.root
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i]!
      const child = node.children.get(ch)
      if (child === undefined) return
      node = child
    }
    this.collectWordsCallbackSimple(node, prefix, callback)
  }

  private collectWordsCallbackSimple(node: TrieNode, prefix: string, callback: (word: string) => void): void {
    if (node.isEnd) callback(prefix)
    for (const [ch, child] of node.children) {
      this.collectWordsCallbackSimple(child, prefix + ch, callback)
    }
  }

  *words(): Generator<string> {
    yield* this.collectWordsGen(this.root, '')
  }

  private *collectWordsGen(node: TrieNode, prefix: string): Generator<string> {
    if (node.isEnd) yield prefix
    for (const [ch, child] of node.children) {
      yield* this.collectWordsGen(child, prefix + ch)
    }
  }

  get sizeBytes(): number {
    return this.calculateSize(this.root)
  }

  private calculateSize(node: TrieNode): number {
    let bytes = 56
    for (const [, child] of node.children) {
      bytes += 16
      bytes += this.calculateSize(child)
    }
    return bytes
  }

  toJSON() {
    return { type: 'TrieSet', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `TrieSet({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'TrieSet'
  }
}
