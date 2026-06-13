export class DigitTrie {
  private root: DTNode = { children: new Map(), count: 0 }

  insert(num: number): void {
    const digits = String(Math.abs(num)).split('')
    let node = this.root
    for (const d of digits) {
      const child = node.children.get(d) ?? { children: new Map(), count: 0 }
      node.children.set(d, child)
      node = child
    }
    node.count++
    this.root.count++
  }

  has(num: number): boolean {
    let node = this.root
    for (const d of String(Math.abs(num))) {
      node = node.children.get(d)
      if (!node) return false
    }
    return node.count > 0
  }

  longestCommonPrefix(num: number): string {
    let node = this.root
    let prefix = ''
    for (const d of String(Math.abs(num))) {
      node = node.children.get(d)
      if (!node) break
      prefix += d
    }
    return prefix
  }

  get size(): number { return this.root.count }
  get isEmpty(): boolean { return this.root.count === 0 }

  clear(): void { this.root = { children: new Map(), count: 0 } }

  toArray(): number[] {
    const result: number[] = []
    this._collect(this.root, '', result)
    return result
  }

  private _collect(node: DTNode, prefix: string, result: number[]): void {
    if (node.count > 0) result.push(parseInt(prefix))
    for (const [d, child] of node.children) {
      this._collect(child, prefix + d, result)
    }
  }

  toString(): string { return JSON.stringify({ count: this.root.count }) }
  toJSON(): Record<string, number> { return { count: this.root.count } }

  clone(): DigitTrie {
    const c = new DigitTrie()
    for (const n of this.toArray()) c.insert(n)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DigitTrie)) return false
    return this.size === other.size
  }
}

interface DTNode { children: Map<string, DTNode>; count: number }
