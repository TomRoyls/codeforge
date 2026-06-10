class TrieNode {
  children: Map<string, TrieNode>
  isWord: boolean

  constructor() {
    this.children = new Map()
    this.isWord = false
  }
}

export class Trie4 {
  private root: TrieNode
  private _size: number

  constructor() {
    this.root = new TrieNode()
    this._size = 0
  }

  insert(word: string): void {
    if (word.length === 0) {
      return
    }
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode())
      }
      node = node.children.get(char)!
    }
    if (!node.isWord) {
      node.isWord = true
      this._size++
    }
  }

  delete(word: string): boolean {
    if (word.length === 0) {
      return false
    }
    const nodes: TrieNode[] = []
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) {
        return false
      }
      nodes.push(node)
      node = node.children.get(char)!
    }
    if (!node.isWord) {
      return false
    }
    node.isWord = false
    this._size--
    for (let i = word.length - 1; i >= 0; i--) {
      const char: string = word[i]!
      const parentNode = nodes[i]!
      const childNode = parentNode.children.get(char)!
      if (childNode.children.size === 0 && !childNode.isWord) {
        parentNode.children.delete(char)
      } else {
        break
      }
    }
    return true
  }

  search(word: string): boolean {
    if (word.length === 0) {
      return false
    }
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) {
        return false
      }
      node = node.children.get(char)!
    }
    return node.isWord
  }

  contains(word: string): boolean {
    return this.search(word)
  }

  startsWith(prefix: string): boolean {
    if (prefix.length === 0) {
      return true
    }
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return false
      }
      node = node.children.get(char)!
    }
    return true
  }

  toArray(): string[] {
    const result: string[] = []
    this.collectWords(this.root, '', result)
    return result.sort()
  }

  private collectWords(node: TrieNode, current: string, result: string[]): void {
    if (node.isWord) {
      result.push(current)
    }
    node.children.forEach((child, char) => {
      this.collectWords(child, current + char, result)
    })
  }

  autocomplete(prefix: string, maxResults: number = Infinity): string[] {
    if (prefix.length === 0) {
      const allWords = this.toArray()
      return allWords.slice(0, maxResults)
    }
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return []
      }
      node = node.children.get(char)!
    }
    const result: string[] = []
    this.collectWords(node, prefix, result)
    return result.sort().slice(0, maxResults)
  }

  wildcardSearch(pattern: string): string[] {
    const result: string[] = []
    this.wildcardSearchHelper(this.root, '', pattern, 0, result)
    return result.sort()
  }

  private wildcardSearchHelper(node: TrieNode, current: string, pattern: string, patternIndex: number, result: string[]): void {
    if (patternIndex === pattern.length) {
      if (node.isWord) {
        result.push(current)
      }
      return
    }

    const char = pattern[patternIndex]

    if (char === undefined) {
      return
    }

    if (char === '*') {
      this.collectWords(node, current, result)
      return
    }

    if (char === '?') {
      for (const entry of node.children.entries()) {
        const childChar = entry[0]
        const childNode = entry[1]
        this.wildcardSearchHelper(childNode, current + childChar, pattern, patternIndex + 1, result)
      }
      return
    }

    if (node.children.has(char)) {
      this.wildcardSearchHelper(node.children.get(char)!, current + char, pattern, patternIndex + 1, result)
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = new TrieNode()
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
      autocomplete: 'O(m + k)',
      wildcardSearch: 'O(n * m)',
      size: 'O(1)',
      isEmpty: 'O(1)',
      clear: 'O(1)'
    }
    return complexities
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

  static from(items: any[]): Trie4 {
    const instance = new Trie4()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  clone(): Trie4 {
    return Trie4.from(this.toArray())
  }

  toJSON() {
    return { type: 'Trie4', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `Trie4({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'Trie4'
  }

  includes(word: string): boolean {
    return this.contains(word)
  }

  nonEmpty(): boolean {
    return !this.isEmpty
  }
}
