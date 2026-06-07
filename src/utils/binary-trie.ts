export class BinaryTrieNode {
  children: [BinaryTrieNode | null, BinaryTrieNode | null] = [null, null]
  count = 0
}

export class BinaryTrie {
  private root: BinaryTrieNode
  private bits: number

  constructor(bits: number = 32) {
    this.root = new BinaryTrieNode()
    this.bits = bits
  }

  insert(value: number): void {
    let node = this.root
    node.count++
    for (let i = this.bits - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1
      if (!node.children[bit]) node.children[bit] = new BinaryTrieNode()
      node = node.children[bit]!
      node.count++
    }
  }

  find(value: number): boolean {
    let node: BinaryTrieNode | null = this.root
    for (let i = this.bits - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1
      node = node.children[bit] ?? null
      if (!node) return false
    }
    return node.count > 0
  }

  remove(value: number): boolean {
    if (!this.find(value)) return false
    let node = this.root
    node.count--
    for (let i = this.bits - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1
      node = node.children[bit]!
      node.count--
    }
    return true
  }

  maxXor(value: number): number {
    let node: BinaryTrieNode | null = this.root
    let result = 0
    for (let i = this.bits - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1
      const desired = 1 - bit
      if (node!.children[desired] && node!.children[desired]!.count > 0) {
        result |= (1 << i)
        node = node!.children[desired]
      } else {
        node = node!.children[bit] ?? null
      }
    }
    return result
  }

  get size(): number {
    return this.root.count
  }

  toString(): string {
    return `BinaryTrie(bits=${this.bits}, size=${this.size})`
  }

  toJSON(): unknown {
    return {
      bits: this.bits,
      values: this._collectValues(),
    }
  }

  clone(): this {
    const c = new BinaryTrie(this.bits)
    for (const v of this._collectValues()) {
      c.insert(v)
    }
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BinaryTrie)) return false
    if (this.bits !== other.bits) return false
    if (this.size !== other.size) return false
    const a = this._collectValues().sort((x, y) => x - y)
    const b = other._collectValues().sort((x, y) => x - y)
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  private _collectValues(): number[] {
    const values: number[] = []
    const walk = (node: BinaryTrieNode, value: number, bitIndex: number): void => {
      if (bitIndex < 0) {
        if (node.count > 0) values.push(value)
        return
      }
      for (let b = 0; b < 2; b++) {
        const child = node.children[b]
        if (child && child.count > 0) {
          walk(child, value | (b << bitIndex), bitIndex - 1)
        }
      }
    }
    walk(this.root, 0, this.bits - 1)
    return values
  }
}
