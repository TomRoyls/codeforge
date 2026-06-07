export class HuffmanCoder {
  encode(data: string): { encoded: string; tree: HuffmanNode | null } {
    if (data.length === 0) return { encoded: '', tree: null }
    const freq = new Map<string, number>()
    for (const ch of data) {
      freq.set(ch, (freq.get(ch) ?? 0) + 1)
    }
    const tree = this.buildTree(freq)
    if (!tree) return { encoded: '', tree: null }
    const codes = new Map<string, string>()
    if (!tree.left && !tree.right) {
      codes.set(tree.char!, '0')
    } else {
      this.buildCodes(tree, '', codes)
    }
    let encoded = ''
    for (const ch of data) {
      encoded += codes.get(ch) ?? ''
    }
    return { encoded, tree }
  }

  decode(encoded: string, tree: HuffmanNode | null): string {
    if (!tree || encoded.length === 0) return ''
    if (!tree.left && !tree.right) {
      return tree.char!.repeat(encoded.length)
    }
    let result = ''
    let node = tree
    for (const bit of encoded) {
      node = bit === '0' ? node.left! : node.right!
      if (!node.left && !node.right) {
        result += node.char!
        node = tree
      }
    }
    return result
  }

  private buildTree(freq: Map<string, number>): HuffmanNode | null {
    if (freq.size === 0) return null
    const nodes: HuffmanNode[] = []
    for (const [char, count] of freq) {
      nodes.push({ char, freq: count, left: null, right: null })
    }
    nodes.sort((a, b) => a.freq - b.freq)
    let _qi = 0
    while (nodes.length - _qi > 1) {
      const left = nodes[_qi++]!
      const right = nodes[_qi++]!
      const merged: HuffmanNode = { char: null, freq: left.freq + right.freq, left, right }
      let insertPos = nodes.length
      while (insertPos > _qi && nodes[insertPos - 1]!.freq > merged.freq) {
        insertPos--
      }
      nodes.splice(insertPos, 0, merged)
    }
    return nodes[_qi] ?? null
  }

  private buildCodes(node: HuffmanNode, prefix: string, codes: Map<string, string>): void {
    if (!node.left && !node.right) {
      codes.set(node.char!, prefix)
      return
    }
    if (node.left) this.buildCodes(node.left, prefix + '0', codes)
    if (node.right) this.buildCodes(node.right, prefix + '1', codes)
  }

  toString(): string {
    return `HuffmanCoder()`
  }

  toJSON(): unknown {
    return {}
  }

  clone(): HuffmanCoder {
    return new HuffmanCoder()
  }

  equals(other: unknown): boolean {
    return other instanceof HuffmanCoder
  }
}

interface HuffmanNode {
  char: string | null
  freq: number
  left: HuffmanNode | null
  right: HuffmanNode | null
}
