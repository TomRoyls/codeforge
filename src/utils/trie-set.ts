export class TrieSet {
  private children = new Map<string, TrieSet>()
  private _isEnd = false
  private _count = 0

  add(word: string): void {
    let node: TrieSet = this
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieSet())
      }
      node = node.children.get(ch)!
    }
    if (!node._isEnd) {
      node._isEnd = true
      this._count++
    }
  }

  has(word: string): boolean {
    let node: TrieSet | undefined = this
    for (const ch of word) {
      node = node.children.get(ch)
      if (!node) return false
    }
    return node._isEnd
  }

  hasPrefix(prefix: string): boolean {
    let node: TrieSet | undefined = this
    for (const ch of prefix) {
      node = node.children.get(ch)
      if (!node) return false
    }
    return true
  }

  delete(word: string): boolean {
    const wasPresent = this.has(word)
    if (!wasPresent) return false
    this.deleteHelper(word, 0)
    this._count--
    return true
  }

  get size(): number {
    return this._count
  }

  wordsWithPrefix(prefix: string): string[] {
    let node: TrieSet | undefined = this
    for (const ch of prefix) {
      node = node.children.get(ch)
      if (!node) return []
    }
    const result: string[] = []
    node.collectWords(prefix, result)
    return result
  }

  allWords(): string[] {
    const result: string[] = []
    this.collectWords('', result)
    return result
  }

  clear(): void {
    this.children.clear()
    this._count = 0
    this._isEnd = false
  }

  toArray(): string[] {
    return this.allWords()
  }

  toString(): string {
    return JSON.stringify(this.allWords())
  }

  toJSON(): string[] {
    return this.allWords()
  }

  clone(): TrieSet {
    const copy = new TrieSet()
    for (const word of this.allWords()) {
      copy.add(word)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TrieSet)) return false
    const a = this.allWords().sort()
    const b = other.allWords().sort()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  private collectWords(prefix: string, result: string[]): void {
    if (this._isEnd) result.push(prefix)
    for (const [ch, child] of this.children) {
      child.collectWords(prefix + ch, result)
    }
  }

  private deleteHelper(word: string, index: number): boolean {
    if (index === word.length) {
      if (!this._isEnd) return false
      this._isEnd = false
      return true
    }
    const ch = word[index]!
    const child = this.children.get(ch)
    if (!child) return false
    const deleted = child.deleteHelper(word, index + 1)
    if (deleted && child.children.size === 0 && !child._isEnd) {
      this.children.delete(ch)
    }
    return deleted
  }
}
