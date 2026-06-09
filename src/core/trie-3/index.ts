class TrieNode {
  children: Map<string, TrieNode>
  isWord: boolean
  wordCount: number

  constructor() {
    this.children = new Map()
    this.isWord = false
    this.wordCount = 0
  }
}

export class Trie3 {
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
      node.wordCount++
    }
    if (!node.isWord) {
      node.isWord = true
      this._size++
    }
  }

  remove(word: string): boolean {
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
      childNode.wordCount--
      if (childNode.wordCount === 0 && !childNode.isWord) {
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
    return node.wordCount > 0
  }

  contains(word: string): boolean {
    return this.search(word)
  }

  countWordsStartingWith(prefix: string): number {
    if (prefix.length === 0) {
      return this._size
    }
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return 0
      }
      node = node.children.get(char)!
    }
    return node.wordCount
  }

  getAllWords(prefix: string = ""): string[] {
    const result: string[] = []
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return result
      }
      node = node.children.get(char)!
    }
    this.collectWords(node, prefix, result)
    return result
  }

  private collectWords(node: TrieNode, current: string, result: string[]): void {
    if (node.isWord) {
      result.push(current)
    }
    for (const [char, child] of node.children) {
      this.collectWords(child, current + char, result)
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

  forEach(callback: (word: string) => void): void {
    const words = this.getAllWords()
    for (const word of words) {
      callback(word)
    }
  }

  longestCommonPrefix(): string {
    if (this.isEmpty) {
      return ""
    }
    let node = this.root
    const prefix: string[] = []
    while (node.children.size === 1 && !node.isWord) {
      const entry = node.children.entries().next().value
      if (!entry) break
      const [char, child] = entry
      prefix.push(char)
      node = child
    }
    return prefix.join("")
  }

  longestPrefixOf(word: string): string {
    if (word.length === 0) {
      return ""
    }
    let node = this.root
    let longestWord = ""
    let currentPrefix = ""
    for (const char of word) {
      if (!node.children.has(char)) {
        break
      }
      node = node.children.get(char)!
      currentPrefix += char
      if (node.isWord) {
        longestWord = currentPrefix
      }
    }
    return longestWord
  }

  hasWord(word: string): boolean {
    return this.search(word)
  }

  *[Symbol.iterator]() {
    yield* this.getAllWords()
  }

  toArray() {
    return this.getAllWords()
  }
}
