export class PrefixTreeSet {
  private children: Map<string, PrefixTreeSet> = new Map()
  private isEnd = false
  private _size = 0

  add(word: string): void {
    let node: PrefixTreeSet = this
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new PrefixTreeSet())
      node = node.children.get(ch)!
    }
    if (!node.isEnd) { node.isEnd = true; this._size++ }
  }

  has(word: string): boolean {
    let node: PrefixTreeSet | undefined = this
    for (const ch of word) { node = node.children.get(ch); if (!node) return false }
    return node.isEnd
  }

  hasPrefix(prefix: string): boolean {
    let node: PrefixTreeSet | undefined = this
    for (const ch of prefix) { node = node.children.get(ch); if (!node) return false }
    return true
  }

  delete(word: string): boolean { return this.deleteHelper(word, 0) }

  private deleteHelper(word: string, idx: number): boolean {
    if (idx === word.length) {
      if (!this.isEnd) return false
      this.isEnd = false; this._size--; return true
    }
    const child = this.children.get(word[idx]!)
    if (!child) return false
    const deleted = child.deleteHelper(word, idx + 1)
    if (deleted && child.children.size === 0 && !child.isEnd) this.children.delete(word[idx]!)
    return deleted
  }

  wordsWithPrefix(prefix: string): string[] {
    let node: PrefixTreeSet | undefined = this
    for (const ch of prefix) { node = node.children.get(ch); if (!node) return [] }
    const results: string[] = []
    node.collect(prefix, results)
    return results
  }

  private collect(prefix: string, results: string[]): void {
    if (this.isEnd) results.push(prefix)
    for (const [ch, child] of this.children) child.collect(prefix + ch, results)
  }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }
  clear(): void { this.children.clear(); this.isEnd = false; this._size = 0 }

  toArray(): string[] { return this.wordsWithPrefix('') }
  toString(): string { return JSON.stringify({ size: this._size }) }
  toJSON(): Record<string, number> { return { size: this._size } }

  clone(): PrefixTreeSet {
    const t = new PrefixTreeSet()
    for (const w of this.toArray()) t.add(w)
    return t
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PrefixTreeSet)) return false
    return this._size === other._size
  }
}
