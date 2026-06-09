export interface BurstTrieNode {
  children: Map<string, BurstTrieNode>
  values: string[]
  isBucket: boolean
}

export class BurstTrie2 {
  private root: BurstTrieNode
  private count: number
  private readonly bucketLimit: number

  constructor(bucketLimit: number = 32) {
    this.root = this.createNode()
    this.count = 0
    this.bucketLimit = bucketLimit
  }

  private createNode(): BurstTrieNode {
    return { children: new Map(), values: [], isBucket: true }
  }

  insert(word: string): void {
    let node = this.root
    for (let i = 0; i < word.length; i++) {
      const char = word[i]!
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode())
      }
      node = node.children.get(char)!
    }
    node.values.push(word)
    this.count++

    if (node.isBucket && node.values.length > this.bucketLimit) {
      this.burst(node)
    }
  }

  private burst(node: BurstTrieNode): void {
    node.isBucket = false
    const oldValues = [...node.values]
    node.values = []

    for (const val of oldValues) {
      let cur = node
      for (let i = 0; i < val.length; i++) {
        const char = val[i]!
        if (!cur.children.has(char)) {
          cur.children.set(char, this.createNode())
        }
        cur = cur.children.get(char)!
      }
      cur.values.push(val)
    }
  }

  contains(word: string): boolean {
    let node = this.root
    for (let i = 0; i < word.length; i++) {
      const char = word[i]!
      if (!node.children.has(char)) return false
      node = node.children.get(char)!
    }
    return this.containsInSubtree(node, word)
  }

  private containsInSubtree(node: BurstTrieNode, word: string): boolean {
    if (node.values.includes(word)) return true
    for (const child of node.children.values()) {
      if (this.containsInSubtree(child, word)) return true
    }
    return false
  }

  remove(word: string): boolean {
    let node = this.root
    for (let i = 0; i < word.length; i++) {
      const char = word[i]!
      if (!node.children.has(char)) return false
      node = node.children.get(char)!
    }
    return this.removeFromSubtree(node, word)
  }

  private removeFromSubtree(node: BurstTrieNode, word: string): boolean {
    const idx = node.values.indexOf(word)
    if (idx !== -1) {
      node.values.splice(idx, 1)
      this.count--
      return true
    }
    for (const child of node.children.values()) {
      if (this.removeFromSubtree(child, word)) return true
    }
    return false
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  getAll(): string[] {
    const result: string[] = []
    this.collect(this.root, result)
    return result.sort()
  }

  private collect(node: BurstTrieNode, result: string[]): void {
    result.push(...node.values)
    for (const child of node.children.values()) {
      this.collect(child, result)
    }
  }

  startsWith(prefix: string): string[] {
    let node = this.root
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i]!
      if (!node.children.has(char)) return []
      node = node.children.get(char)!
    }
    const result: string[] = []
    this.collect(node, result)
    return result.sort()
  }

  clear(): void {
    this.root = this.createNode()
    this.count = 0
  }

  getNodeCount(): number {
    let count = 0
    const stack: BurstTrieNode[] = [this.root]
    while (stack.length > 0) {
      const node = stack.pop()!
      count++
      for (const child of node.children.values()) {
        stack.push(child)
      }
    }
    return count
  }
  *[Symbol.iterator]() {
    yield* this.getAll()
  }

  toArray() {
    return this.getAll()
  }

  toString(): string {
    return `${BurstTrie2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: unknown, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  static from(items: any[]): BurstTrie2 {
    const instance = new BurstTrie2()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  clone(): BurstTrie2 {
    return BurstTrie2.from(this.toArray())
  }

  toJSON() {
    return { type: 'BurstTrie2', items: this.toArray() }
  }
}
