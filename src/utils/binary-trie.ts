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
}
