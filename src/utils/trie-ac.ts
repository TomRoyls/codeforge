export class TrieAC {
  private root: TrieNode = { children: new Map(), fail: null, output: [], isEnd: false }

  addPattern(pattern: string): void {
    let node = this.root
    for (const ch of pattern) {
      const child = node.children.get(ch) ?? { children: new Map(), fail: null, output: [], isEnd: false }
      node.children.set(ch, child)
      node = child
    }
    node.isEnd = true
    node.output.push(pattern)
  }

  buildFailure(): void {
    const queue: TrieNode[] = []
    for (const child of this.root.children.values()) {
      child.fail = this.root
      queue.push(child)
    }
    while (queue.length > 0) {
      const node = queue.shift()!
      for (const [ch, child] of node.children) {
        let fail = node.fail
        while (fail && !fail.children.has(ch)) fail = fail.fail
        child.fail = fail?.children.get(ch) ?? this.root
        child.output = [...child.output, ...child.fail.output]
        queue.push(child)
      }
    }
  }

  search(text: string): Array<{ pattern: string; index: number }> {
    const results: Array<{ pattern: string; index: number }> = []
    let node = this.root
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]!
      while (node !== this.root && !node.children.has(ch)) node = node.fail!
      node = node.children.get(ch) ?? this.root
      for (const pattern of node.output) results.push({ pattern, index: i - pattern.length + 1 })
    }
    return results
  }

  get patterns(): string[] { return this.collectPatterns(this.root) }

  private collectPatterns(node: TrieNode): string[] {
    const result = [...node.output]
    for (const child of node.children.values()) result.push(...this.collectPatterns(child))
    return [...new Set(result)]
  }

  get size(): number { return this.patterns.length }
  get isEmpty(): boolean { return this.patterns.length === 0 }

  clear(): void { this.root = { children: new Map(), fail: null, output: [], isEnd: false } }

  toArray(): string[] { return this.patterns }
  toString(): string { return JSON.stringify({ patterns: this.patterns.length }) }
  toJSON(): Record<string, number> { return { patterns: this.patterns.length } }

  clone(): TrieAC {
    const c = new TrieAC()
    for (const p of this.patterns) c.addPattern(p)
    c.buildFailure()
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TrieAC)) return false
    return this.size === other.size
  }
}

interface TrieNode { children: Map<string, TrieNode>; fail: TrieNode | null; output: string[]; isEnd: boolean }
