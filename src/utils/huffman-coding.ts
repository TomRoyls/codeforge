export class HuffmanCoding {
  static encode(data: string): { encoded: string; tree: HuffmanNode | null } {
    if (data.length === 0) return { encoded: '', tree: null }
    const freq = new Map<string, number>()
    for (const ch of data) freq.set(ch, (freq.get(ch) ?? 0) + 1)
    if (freq.size === 1) {
      const ch = freq.keys().next().value!
      const node: HuffmanNode = { char: ch, freq: freq.get(ch)!, left: null, right: null }
      return { encoded: '0'.repeat(data.length), tree: node }
    }
    const nodes: HuffmanNode[] = [...freq.entries()].map(([char, freq]) => ({ char, freq, left: null, right: null }))
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.freq - b.freq)
      const left = nodes.shift()!
      const right = nodes.shift()!
      nodes.push({ char: '', freq: left.freq + right.freq, left, right })
    }
    const tree = nodes[0]!
    const codes = new Map<string, string>()
    function buildCodes(node: HuffmanNode, code: string) {
      if (node.char !== '') codes.set(node.char, code)
      if (node.left) buildCodes(node.left, code + '0')
      if (node.right) buildCodes(node.right, code + '1')
    }
    buildCodes(tree, '')
    let encoded = ''
    for (const ch of data) encoded += codes.get(ch)!
    return { encoded, tree }
  }

  static decode(encoded: string, tree: HuffmanNode | null): string {
    if (!tree || encoded.length === 0) return ''
    if (!tree.left && !tree.right) return tree.char!.repeat(encoded.length)
    let result = ''
    let node = tree
    for (const bit of encoded) {
      node = bit === '0' ? node.left! : node.right!
      if (node.char !== '') {
        result += node.char
        node = tree
      }
    }
    return result
  }

  static compressionRatio(data: string): number {
    if (data.length === 0) return 1
    const { encoded } = HuffmanCoding.encode(data)
    const originalBits = data.length * 8
    return encoded.length / originalBits
  }

  static buildFrequencyTable(data: string): Map<string, number> {
    const freq = new Map<string, number>()
    for (const ch of data) freq.set(ch, (freq.get(ch) ?? 0) + 1)
    return freq
  }
}

export interface HuffmanNode {
  char: string
  freq: number
  left: HuffmanNode | null
  right: HuffmanNode | null
}
