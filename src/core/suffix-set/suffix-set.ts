import type { TrieNode, SuffixSetStats } from './types.js'

export class SuffixSet {
  private forwardRoot: TrieNode
  private reverseRoot: TrieNode
  private wordSet: Set<string>
  private totalLength: number
  private maxLen: number
  private minLen: number

  constructor(words?: Iterable<string>) {
    this.forwardRoot = this.createNode()
    this.reverseRoot = this.createNode()
    this.wordSet = new Set()
    this.totalLength = 0
    this.maxLen = 0
    this.minLen = Infinity
    if (words) {
      for (const w of words) {
        this.add(w)
      }
    }
  }

  private createNode(): TrieNode {
    return {
      children: new Map<string, TrieNode>(),
      endOfWord: false,
      wordCount: 0,
    }
  }

  add(word: string): boolean {
    if (this.wordSet.has(word)) return false
    this.wordSet.add(word)
    this.totalLength += word.length
    if (word.length > this.maxLen) this.maxLen = word.length
    if (word.length < this.minLen) this.minLen = word.length

    let node = this.forwardRoot
    node.wordCount++
    for (let i = 0; i < word.length; i++) {
      const ch = word[i]!
      let child = node.children.get(ch)
      if (!child) {
        child = this.createNode()
        node.children.set(ch, child)
      }
      node = child
      node.wordCount++
    }
    node.endOfWord = true

    const reversed = this.reverseString(word)
    node = this.reverseRoot
    node.wordCount++
    for (let i = 0; i < reversed.length; i++) {
      const ch = reversed[i]!
      let child = node.children.get(ch)
      if (!child) {
        child = this.createNode()
        node.children.set(ch, child)
      }
      node = child
      node.wordCount++
    }
    node.endOfWord = true

    return true
  }

  delete(word: string): boolean {
    if (!this.wordSet.has(word)) return false
    this.wordSet.delete(word)
    this.totalLength -= word.length

    this.removeFromTrie(this.forwardRoot, word, 0)

    const reversed = this.reverseString(word)
    this.removeFromTrie(this.reverseRoot, reversed, 0)

    this.recalcLengths()
    return true
  }

  private removeFromTrie(node: TrieNode, str: string, depth: number): boolean {
    if (depth === str.length) {
      node.endOfWord = false
      node.wordCount--
      return node.children.size === 0 && !node.endOfWord
    }
    const ch = str[depth]!
    const child = node.children.get(ch)
    if (!child) return false
    const shouldDelete = this.removeFromTrie(child, str, depth + 1)
    if (shouldDelete) {
      node.children.delete(ch)
    }
    node.wordCount--
    return node.children.size === 0 && !node.endOfWord
  }

  private recalcLengths(): void {
    this.totalLength = 0
    this.maxLen = 0
    this.minLen = Infinity
    for (const w of this.wordSet) {
      this.totalLength += w.length
      if (w.length > this.maxLen) this.maxLen = w.length
      if (w.length < this.minLen) this.minLen = w.length
    }
  }

  has(word: string): boolean {
    return this.wordSet.has(word)
  }

  hasPrefix(prefix: string): boolean {
    if (prefix.length === 0) return this.wordSet.size > 0
    let node = this.forwardRoot
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i]!
      const child = node.children.get(ch)
      if (!child) return false
      node = child
    }
    return true
  }

  hasSuffix(suffix: string): boolean {
    if (suffix.length === 0) return this.wordSet.size > 0
    const reversed = this.reverseString(suffix)
    let node = this.reverseRoot
    for (let i = 0; i < reversed.length; i++) {
      const ch = reversed[i]!
      const child = node.children.get(ch)
      if (!child) return false
      node = child
    }
    return true
  }

  hasSubstring(substring: string): boolean {
    if (substring.length === 0) return this.wordSet.size > 0
    for (const word of this.wordSet) {
      if (word.includes(substring)) return true
    }
    return false
  }

  wordsWithPrefix(prefix: string): string[] {
    const result: string[] = []
    if (prefix.length === 0) {
      return this.toArray()
    }
    let node = this.forwardRoot
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i]!
      const child = node.children.get(ch)
      if (!child) return result
      node = child
    }
    this.collectWords(node, prefix, result)
    return result
  }

  private collectWords(node: TrieNode, prefix: string, result: string[]): void {
    if (node.endOfWord) {
      result.push(prefix)
    }
    for (const [ch, child] of node.children) {
      this.collectWords(child, prefix + ch, result)
    }
  }

  wordsWithSuffix(suffix: string): string[] {
    const result: string[] = []
    if (suffix.length === 0) {
      return this.toArray()
    }
    for (const word of this.wordSet) {
      if (word.endsWith(suffix)) {
        result.push(word)
      }
    }
    return result
  }

  wordsContaining(substring: string): string[] {
    const result: string[] = []
    if (substring.length === 0) {
      return this.toArray()
    }
    for (const word of this.wordSet) {
      if (word.includes(substring)) {
        result.push(word)
      }
    }
    return result
  }

  get size(): number {
    return this.wordSet.size
  }

  isEmpty(): boolean {
    return this.wordSet.size === 0
  }

  clear(): void {
    this.forwardRoot = this.createNode()
    this.reverseRoot = this.createNode()
    this.wordSet.clear()
    this.totalLength = 0
    this.maxLen = 0
    this.minLen = Infinity
  }

  toArray(): string[] {
    return Array.from(this.wordSet)
  }

  forEach(callback: (word: string, index: number) => void): void {
    let index = 0
    for (const word of this.wordSet) {
      callback(word, index++)
    }
  }

  clone(): SuffixSet {
    return new SuffixSet(this.wordSet)
  }

  static from(words: Iterable<string>): SuffixSet {
    return new SuffixSet(words)
  }

  longestCommonPrefix(): string {
    if (this.wordSet.size === 0) return ''
    if (this.wordSet.size === 1) return this.toArray()[0]!

    const sorted = Array.from(this.wordSet).sort()
    const first = sorted[0]!
    const last = sorted[sorted.length - 1]!

    let i = 0
    while (i < first.length && i < last.length && first[i] === last[i]) {
      i++
    }
    return first.substring(0, i)
  }

  stats(): SuffixSetStats {
    const sz = this.wordSet.size
    return {
      size: sz,
      totalNodes: this.countNodes(this.forwardRoot) + this.countNodes(this.reverseRoot),
      avgWordLength: sz > 0 ? this.totalLength / sz : 0,
      maxWordLength: sz > 0 ? this.maxLen : 0,
      minWordLength: sz > 0 ? this.minLen : 0,
    }
  }

  private countNodes(node: TrieNode): number {
    let count = 1
    for (const child of node.children.values()) {
      count += this.countNodes(child)
    }
    return count
  }

  private reverseString(s: string): string {
    let result = ''
    for (let i = s.length - 1; i >= 0; i--) {
      result += s[i]
    }
    return result
  }
}

export type { TrieNode, SuffixSetStats } from './types.js'
