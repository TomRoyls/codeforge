export class TrieNode2 {
  children = new Map<string, TrieNode2>()
  isEnd = false
  value: unknown = undefined
}

export class Trie2<V = undefined> {
  private root = new TrieNode2()
  private _size = 0

  insert(word: string, value?: V): void {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode2())
      node = node.children.get(char)!
    }
    if (!node.isEnd) this._size++
    node.isEnd = true
    node.value = value
  }

  search(word: string): V | undefined {
    const node = this.findNode(word)
    return node?.isEnd ? node.value : undefined
  }

  has(word: string): boolean {
    const node = this.findNode(word)
    return node?.isEnd ?? false
  }

  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== undefined
  }

  private findNode(str: string): TrieNode2 | undefined {
    let node = this.root
    for (const char of str) {
      node = node.children.get(char)
      if (!node) return undefined
    }
    return node
  }

  delete(word: string): boolean {
    const node = this.findNode(word)
    if (!node || !node.isEnd) return false
    node.isEnd = false
    node.value = undefined
    this._size--
    return true
  }

  getWordsWithPrefix(prefix: string): string[] {
    const node = this.findNode(prefix)
    if (!node) return []
    const words: string[] = []
    const dfs = (n: TrieNode2, current: string) => {
      if (n.isEnd) words.push(current)
      for (const [char, child] of n.children) dfs(child, current + char)
    }
    dfs(node, prefix)
    return words
  }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }

  clear(): void { this.root = new TrieNode2(); this._size = 0 }

  toArray(): string[] {
    const words: string[] = []
    const dfs = (n: TrieNode2, current: string) => {
      if (n.isEnd) words.push(current)
      for (const [char, child] of n.children) dfs(child, current + char)
    }
    dfs(this.root, '')
    return words
  }

  toString(): string { return JSON.stringify({ size: this._size }) }
  toJSON(): Record<string, number> { return { size: this._size } }

  clone(): Trie2<V> {
    const c = new Trie2<V>()
    const words = this.toArray()
    for (const w of words) c.insert(w, this.search(w))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Trie2)) return false
    return this._size === other._size
  }
}
