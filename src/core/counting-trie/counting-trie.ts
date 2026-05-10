import type { CountingTrieNode, CountingTrieOptions, CountingTrieStats } from './types.js'
import { DEFAULT_COUNTING_TRIE_OPTIONS } from './types.js'

export class CountingTrie {
  private root: CountingTrieNode
  private options: CountingTrieOptions

  constructor(options?: Partial<CountingTrieOptions>) {
    this.options = { ...DEFAULT_COUNTING_TRIE_OPTIONS, ...options }
    this.root = this.createNode('')
  }

  private createNode(char: string): CountingTrieNode {
    return {
      char,
      count: 0,
      endCount: 0,
      children: new Map<string, CountingTrieNode>(),
    }
  }

  private normalize(word: string): string {
    return this.options.caseSensitive ? word : word.toLowerCase()
  }

  insert(word: string): void {
    const w = this.normalize(word)
    let node = this.root
    for (const char of w) {
      let child = node.children.get(char)
      if (!child) {
        child = this.createNode(char)
        node.children.set(char, child)
      }
      child.count++
      node = child
    }
    node.endCount++
  }

  remove(word: string): boolean {
    const w = this.normalize(word)
    const path: Array<{ parent: CountingTrieNode; char: string; node: CountingTrieNode }> = []
    let node = this.root
    for (const char of w) {
      const child = node.children.get(char)
      if (!child) return false
      path.push({ parent: node, char, node: child })
      node = child
    }
    if (node.endCount === 0) return false
    node.endCount--
    for (let i = path.length - 1; i >= 0; i--) {
      const entry = path[i]!
      entry.node.count--
      if (entry.node.count === 0 && entry.node.endCount === 0) {
        entry.parent.children.delete(entry.char)
      }
    }
    return true
  }

  contains(word: string): boolean {
    const node = this.findNode(this.normalize(word))
    return node !== undefined && node.endCount > 0
  }

  count(word: string): number {
    const node = this.findNode(this.normalize(word))
    if (!node) return 0
    return node.endCount
  }

  prefixCount(prefix: string): number {
    const p = this.normalize(prefix)
    if (p === '') return this.totalWords
    const node = this.findNode(p)
    if (!node) return 0
    return node.count
  }

  charFrequency(position?: number, char?: string): number {
    if (position === undefined && char === undefined) {
      return this.totalWords
    }
    if (position === undefined) {
      return this.charFrequencyGlobal(char!)
    }
    if (char === undefined) {
      return this.positionTotal(position)
    }
    return this.charFrequencyAt(position, char)
  }

  charFrequencies(position?: number): Map<string, number> {
    const result = new Map<string, number>()
    if (position === undefined) {
      this.collectGlobalFrequencies(this.root, result, 0)
      return result
    }
    this.collectPositionFrequencies(this.root, result, position, 0)
    return result
  }

  get totalWords(): number {
    return this.root.children.size === 0 && this.root.endCount === 0
      ? this.root.endCount
      : this.computeTotalWords(this.root)
  }

  get totalNodes(): number {
    return this.countNodes(this.root) - 1
  }

  autocomplete(prefix: string, limit?: number): string[] {
    const p = this.normalize(prefix)
    const results: string[] = []
    if (p === '') {
      this.collectWords(this.root, '', results, limit)
      return results
    }
    const node = this.findNode(p)
    if (!node) return []
    this.collectWords(node, p, results, limit)
    return results
  }

  get longestCommonPrefix(): string {
    if (this.totalWords === 0) return ''
    let prefix = ''
    let node = this.root
    while (node.children.size === 1 && node.endCount === 0) {
      const [char, child] = node.children.entries().next().value!
      prefix += char
      node = child
    }
    return prefix
  }

  clear(): void {
    this.root = this.createNode('')
  }

  get isEmpty(): boolean {
    return this.root.children.size === 0 && this.root.endCount === 0
  }

  get size(): number {
    return this.totalWords
  }

  get stats(): CountingTrieStats {
    const tw = this.totalWords
    const tn = this.totalNodes
    const { avgDepth, maxDepth } = this.computeDepths()
    return {
      totalWords: tw,
      totalNodes: tn,
      avgDepth,
      maxDepth,
    }
  }

  private findNode(word: string): CountingTrieNode | undefined {
    let node = this.root
    for (const char of word) {
      const child = node.children.get(char)
      if (!child) return undefined
      node = child
    }
    return node
  }

  private collectWords(
    node: CountingTrieNode,
    prefix: string,
    results: string[],
    limit?: number,
  ): void {
    if (limit !== undefined && results.length >= limit) return
    if (node.endCount > 0) {
      results.push(prefix)
    }
    for (const [char, child] of node.children) {
      this.collectWords(child, prefix + char, results, limit)
      if (limit !== undefined && results.length >= limit) return
    }
  }

  private computeTotalWords(node: CountingTrieNode): number {
    let total = node.endCount
    for (const child of node.children.values()) {
      total += this.computeTotalWords(child)
    }
    return total
  }

  private countNodes(node: CountingTrieNode): number {
    let total = 1
    for (const child of node.children.values()) {
      total += this.countNodes(child)
    }
    return total
  }

  private charFrequencyAt(position: number, char: string): number {
    const c = this.normalize(char)
    return this.frequencyAtPosition(this.root, position, c, 0)
  }

  private frequencyAtPosition(
    node: CountingTrieNode,
    targetPos: number,
    targetChar: string,
    currentPos: number,
  ): number {
    let total = 0
    for (const [char, child] of node.children) {
      if (currentPos === targetPos && char === targetChar) {
        total += child.count
      } else if (currentPos < targetPos) {
        total += this.frequencyAtPosition(child, targetPos, targetChar, currentPos + 1)
      }
    }
    return total
  }

  private positionTotal(position: number): number {
    return this.sumAtPosition(this.root, position, 0)
  }

  private sumAtPosition(node: CountingTrieNode, targetPos: number, currentPos: number): number {
    let total = 0
    for (const child of node.children.values()) {
      if (currentPos === targetPos) {
        total += child.count
      } else if (currentPos < targetPos) {
        total += this.sumAtPosition(child, targetPos, currentPos + 1)
      }
    }
    return total
  }

  private charFrequencyGlobal(char: string): number {
    const c = this.normalize(char)
    return this.globalCharCount(this.root, c)
  }

  private globalCharCount(node: CountingTrieNode, targetChar: string): number {
    let total = 0
    for (const [char, child] of node.children) {
      if (char === targetChar) {
        total += child.count
      }
      total += this.globalCharCount(child, targetChar)
    }
    return total
  }

  private collectGlobalFrequencies(
    node: CountingTrieNode,
    result: Map<string, number>,
    depth: number,
  ): void {
    for (const [char, child] of node.children) {
      const existing = result.get(char) ?? 0
      result.set(char, existing + child.count)
      this.collectGlobalFrequencies(child, result, depth + 1)
    }
  }

  private collectPositionFrequencies(
    node: CountingTrieNode,
    result: Map<string, number>,
    targetPos: number,
    currentPos: number,
  ): void {
    for (const [char, child] of node.children) {
      if (currentPos === targetPos) {
        const existing = result.get(char) ?? 0
        result.set(char, existing + child.count)
      } else if (currentPos < targetPos) {
        this.collectPositionFrequencies(child, result, targetPos, currentPos + 1)
      }
    }
  }

  private computeDepths(): { avgDepth: number; maxDepth: number } {
    const depths: number[] = []
    this.collectDepths(this.root, 0, depths)
    if (depths.length === 0) return { avgDepth: 0, maxDepth: 0 }
    const maxDepth = Math.max(...depths)
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length
    return { avgDepth, maxDepth }
  }

  private collectDepths(node: CountingTrieNode, depth: number, result: number[]): void {
    if (node.endCount > 0) {
      for (let i = 0; i < node.endCount; i++) {
        result.push(depth)
      }
    }
    for (const child of node.children.values()) {
      this.collectDepths(child, depth + 1, result)
    }
  }
}

export { DEFAULT_COUNTING_TRIE_OPTIONS } from './types.js'
export type { CountingTrieNode, CountingTrieOptions, CountingTrieStats } from './types.js'
