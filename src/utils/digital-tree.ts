export class DigitalTree {
  private children: Map<string, DigitalTree> = new Map()
  private isEnd = false
  private _count = 0

  insert(word: string): void {
    let node: DigitalTree = this
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new DigitalTree())
      node = node.children.get(ch)!
    }
    if (!node.isEnd) {
      node.isEnd = true
      this._count++
    }
  }

  search(word: string): boolean {
    let node: DigitalTree = this
    for (const ch of word) {
      if (!node.children.has(ch)) return false
      node = node.children.get(ch)!
    }
    return node.isEnd
  }

  startsWith(prefix: string): boolean {
    let node: DigitalTree = this
    for (const ch of prefix) {
      if (!node.children.has(ch)) return false
      node = node.children.get(ch)!
    }
    return true
  }

  remove(word: string): boolean {
    const path: [string, DigitalTree][] = []
    let node: DigitalTree = this
    for (const ch of word) {
      if (!node.children.has(ch)) return false
      path.push([ch, node])
      node = node.children.get(ch)!
    }
    if (!node.isEnd) return false
    node.isEnd = false
    this._count--
    for (let i = path.length - 1; i >= 0; i--) {
      const [ch, parent] = path[i]!
      const child = parent.children.get(ch)!
      if (child.children.size === 0 && !child.isEnd) {
        parent.children.delete(ch)
      } else {
        break
      }
    }
    return true
  }

  get count(): number { return this._count }

  toString(): string {
    return `DigitalTree(${this._count} words)`
  }

  toJSON(): string[] {
    const result: string[] = []
    const collect = (node: DigitalTree, prefix: string) => {
      if (node.isEnd) result.push(prefix)
      node.children.forEach((child, ch) => collect(child, prefix + ch))
    }
    collect(this, '')
    return result
  }

  clone(): DigitalTree {
    const copy = new DigitalTree()
    for (const word of this.toJSON()) {
      copy.insert(word)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DigitalTree)) return false
    return this._count === other._count
  }
}
