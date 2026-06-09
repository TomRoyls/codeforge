import { levenshteinDistance } from '../../utils/string-similarity.js'

interface RadixTree2Node {
  children: Map<string, RadixTree2Node>
  isEndOfWord: boolean
}

export class RadixTree2 {
  private root: RadixTree2Node
  private _size: number

  constructor() {
    this.root = { children: new Map(), isEndOfWord: false }
    this._size = 0
  }

  insert(word: string): void {
    if (word.length === 0) return
    let node = this.root
    let i = 0

    while (i < word.length) {
      let found = false
      for (const [edge, child] of node.children) {
        const commonPrefix = this.getCommonPrefix(word.slice(i), edge)

        if (commonPrefix.length > 0) {
          found = true

          if (commonPrefix.length === edge.length) {
            i += edge.length
            node = child
            break
          }

          const splitEdge = edge.slice(commonPrefix.length)
          const newNode: RadixTree2Node = {
            children: new Map(),
            isEndOfWord: false
          }

          newNode.children.set(splitEdge, child)
          node.children.delete(edge)
          node.children.set(commonPrefix, newNode)

          if (commonPrefix.length === word.length - i) {
            newNode.isEndOfWord = true
            this._size++
            return
          }

          i += commonPrefix.length
          node = newNode
          break
        }
      }

      if (!found) {
        node.children.set(word.slice(i), {
          children: new Map(),
          isEndOfWord: true
        })
        this._size++
        return
      }
    }

    if (!node.isEndOfWord) {
      node.isEndOfWord = true
      this._size++
    }
  }

  delete(word: string): boolean {
    if (word.length === 0) return false
    const path: Array<{ node: RadixTree2Node; edge: string; parent: RadixTree2Node | null }> = []
    let node = this.root
    let i = 0

    while (i < word.length) {
      let found = false
      for (const [edge, child] of node.children) {
        const commonPrefix = this.getCommonPrefix(word.slice(i), edge)

        if (commonPrefix.length > 0 && commonPrefix.length === edge.length) {
          path.push({ node, edge, parent: path.length > 0 ? path[path.length - 1]!.node : null })
          i += edge.length
          node = child
          found = true
          break
        }
      }

      if (!found) return false
    }

    if (!node.isEndOfWord) return false

    node.isEndOfWord = false
    this._size--

    if (node.children.size === 0 && path.length > 0) {
      const last = path[path.length - 1]
      if (!last) return true
      last.node.children.delete(last.edge)

      if (last.node.children.size === 1 && !last.node.isEndOfWord) {
        const [siblingEntry] = Array.from(last.node.children.entries())
        if (siblingEntry) {
          const [siblingEdge, siblingNode] = siblingEntry
          if (path.length > 1) {
            const parent = path[path.length - 2]
            if (!parent) return true
            parent.node.children.delete(parent.edge)
            parent.node.children.set(parent.edge + siblingEdge, siblingNode)
          }
        }
      }
    } else if (node.children.size === 1 && path.length > 0) {
      const [childEntry] = Array.from(node.children.entries())
      if (childEntry) {
        const [childEdge, childNode] = childEntry
        const last = path[path.length - 1]
        if (!last) return true
        last.node.children.delete(last.edge)
        last.node.children.set(last.edge + childEdge, childNode)
      }
    }

    return true
  }

  search(word: string): boolean {
    if (word.length === 0) return false
    const node = this.findNode(word)
    return node !== null && node.isEndOfWord
  }

  contains(word: string): boolean {
    return this.search(word)
  }

  startsWith(prefix: string): boolean {
    if (prefix.length === 0) return true
    return this.startsWithHelper(prefix, this.root, 0)
  }

  private startsWithHelper(prefix: string, node: RadixTree2Node, startIndex: number): boolean {
    if (startIndex >= prefix.length) return true

    for (const [edge, child] of node.children) {
      if (edge.startsWith(prefix.slice(startIndex))) {
        return true
      }
      if (prefix.slice(startIndex).startsWith(edge)) {
        return this.startsWithHelper(prefix, child, startIndex + edge.length)
      }
    }

    return false
  }

  toArray(): string[] {
    const result: string[] = []
    this.collectWords(this.root, '', result)
    return result
  }

  private collectWords(node: RadixTree2Node, prefix: string, result: string[]): void {
    if (node.isEndOfWord) {
      result.push(prefix)
    }
    for (const [edge, child] of node.children) {
      this.collectWords(child, prefix + edge, result)
    }
  }

  longestCommonPrefix(): string {
    if (this._size === 0) return ''
    if (this._size === 1) return this.toArray()[0] ?? ''

    const words = this.toArray()
    let lcp = words[0] ?? ''

    for (let i = 1; i < words.length; i++) {
      const currentWord = words[i]
      if (currentWord === undefined) break
      lcp = this.getCommonPrefix(lcp, currentWord)
      if (lcp.length === 0) break
    }

    return lcp
  }

  fuzzySearch(pattern: string, maxDistance: number): string[] {
    if (pattern.length === 0) {
      return this.toArray()
    }

    const effectiveMaxDist = maxDistance === Infinity ? Math.floor(pattern.length / 2) + 1 : maxDistance
    const allWords = this.toArray()
    const result: string[] = []

    for (const word of allWords) {
      const dist = this.levenshteinDistance(pattern, word)
      if (dist <= effectiveMaxDist) {
        result.push(word)
      }
    }

    return result
  }

  private levenshteinDistance(str1: string, str2: string): number {
    return levenshteinDistance(str1, str2)
  }

  bulkInsert(words: string[]): void {
    for (const word of words) {
      this.insert(word)
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = { children: new Map(), isEndOfWord: false }
    this._size = 0
  }

  getTimeComplexity(): Record<string, string> {
    const complexities: Record<string, string> = {
      insert: 'O(m)',
      delete: 'O(m)',
      search: 'O(m)',
      contains: 'O(m)',
      startsWith: 'O(m)',
      toArray: 'O(n)',
      longestCommonPrefix: 'O(n * m)',
      fuzzySearch: 'O(n * m^2)',
      bulkInsert: 'O(k * m)',
      size: 'O(1)',
      isEmpty: 'O(1)',
      clear: 'O(1)'
    }
    return complexities
  }

  private findNode(word: string): RadixTree2Node | null {
    let node = this.root
    let i = 0

    while (i < word.length) {
      let found = false
      for (const [edge, child] of node.children) {
        if (word.slice(i).startsWith(edge)) {
          i += edge.length
          node = child
          found = true
          break
        }
      }
      if (!found) return null
    }

    return node
  }

  private getCommonPrefix(str1: string, str2: string): string {
    let i = 0
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++
    }
    return str1.slice(0, i)
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  has(word: string): boolean {
    return this.contains(word)
  }

  static from(items: any[]): RadixTree2 {
    const instance = new RadixTree2()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  toString(): string {
    return `RadixTree2({ size: ${this.size} })`
  }

  forEach(callback: (item: unknown, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }
}
