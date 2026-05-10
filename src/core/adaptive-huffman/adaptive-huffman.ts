import type { AdaptiveHuffmanNode, AdaptiveHuffmanStats } from './types.js'

const SYMBOL_BITS = 8
const MAX_ORDER = 512

function charToBits(ch: string): number[] {
  const code = ch.charCodeAt(0)
  const bits: number[] = []
  for (let i = SYMBOL_BITS - 1; i >= 0; i--) {
    bits.push((code >> i) & 1)
  }
  return bits
}

function bitsToChar(bits: number[]): string {
  let code = 0
  for (let i = 0; i < SYMBOL_BITS; i++) {
    code = (code << 1) | (bits[i] ?? 0)
  }
  return String.fromCharCode(code)
}

export class AdaptiveHuffman {
  private nodes: (AdaptiveHuffmanNode | null)[]
  private root: AdaptiveHuffmanNode
  private nytNode: AdaptiveHuffmanNode
  private symbolMap: Map<string, AdaptiveHuffmanNode>
  private nextOrder: number
  private totalBitsEncoded: number
  private totalSymbolsDecoded: number

  constructor() {
    this.nodes = new Array(MAX_ORDER + 1).fill(null)
    this.symbolMap = new Map()
    this.nextOrder = MAX_ORDER
    this.totalBitsEncoded = 0
    this.totalSymbolsDecoded = 0
    this.root = this.makeNode(0, null, null)
    this.nytNode = this.root
  }

  private makeNode(weight: number, symbol: string | null, parent: AdaptiveHuffmanNode | null): AdaptiveHuffmanNode {
    const node: AdaptiveHuffmanNode = {
      weight,
      symbol,
      parent,
      left: null,
      right: null,
      order: this.nextOrder,
    }
    this.nodes[this.nextOrder] = node
    this.nextOrder--
    return node
  }

  private isNyt(node: AdaptiveHuffmanNode): boolean {
    return node === this.nytNode
  }

  private getCode(node: AdaptiveHuffmanNode): number[] {
    const bits: number[] = []
    let current: AdaptiveHuffmanNode = node
    while (current.parent !== null) {
      const p: AdaptiveHuffmanNode = current.parent
      if (p.left === current) {
        bits.push(0)
      } else {
        bits.push(1)
      }
      current = p
    }
    bits.reverse()
    return bits
  }

  private isAncestorOf(ancestor: AdaptiveHuffmanNode, descendant: AdaptiveHuffmanNode): boolean {
    let current: AdaptiveHuffmanNode | null = descendant
    while (current !== null) {
      if (current === ancestor) return true
      current = current.parent
    }
    return false
  }

  private findLeader(node: AdaptiveHuffmanNode): AdaptiveHuffmanNode | null {
    let leader: AdaptiveHuffmanNode | null = null
    for (let i = node.order + 1; i <= MAX_ORDER; i++) {
      const candidate = this.nodes[i]
      if (candidate !== null && candidate !== undefined && candidate.weight === node.weight) {
        if (!this.isAncestorOf(candidate!, node)) {
          leader = candidate!
        }
      }
    }
    return leader
  }

  private swapNodes(a: AdaptiveHuffmanNode, b: AdaptiveHuffmanNode): void {
    const aParent = a.parent
    const bParent = b.parent

    if (aParent !== null) {
      if (aParent.left === a) {
        aParent.left = b
      } else {
        aParent.right = b
      }
    }
    if (bParent !== null) {
      if (bParent.left === b) {
        bParent.left = a
      } else {
        bParent.right = a
      }
    }

    a.parent = bParent
    b.parent = aParent

    const tempOrder = a.order
    a.order = b.order
    b.order = tempOrder

    this.nodes[a.order] = a
    this.nodes[b.order] = b

    if (this.root === a) {
      this.root = b
    } else if (this.root === b) {
      this.root = a
    }
  }

  private updateTree(startNode: AdaptiveHuffmanNode): void {
    let current: AdaptiveHuffmanNode | null = startNode
    while (current !== null) {
      const leader = this.findLeader(current)
      if (leader !== null) {
        this.swapNodes(current, leader)
      }
      current.weight++
      current = current.parent
    }
  }

  update(symbol: string): void {
    const node = this.symbolMap.get(symbol)
    if (node !== undefined) {
      this.updateTree(node)
    } else {
      const oldNyt = this.nytNode
      oldNyt.symbol = undefined as unknown as string | null

      const newNyt = this.makeNode(0, null, oldNyt)
      const leaf = this.makeNode(0, symbol, oldNyt)

      oldNyt.left = newNyt
      oldNyt.right = leaf

      this.symbolMap.set(symbol, leaf)
      this.nytNode = newNyt

      this.updateTree(leaf)
    }
  }

  encode(data: string): number[] {
    const result: number[] = []
    for (let i = 0; i < data.length; i++) {
      const symbol = data[i]!
      const node = this.symbolMap.get(symbol)
      if (node !== undefined) {
        const code = this.getCode(node)
        result.push(...code)
      } else {
        const nytCode = this.getCode(this.nytNode)
        result.push(...nytCode)
        const symbolBits = charToBits(symbol)
        result.push(...symbolBits)
      }
      this.update(symbol)
    }
    this.totalBitsEncoded += result.length
    return result
  }

  decode(bits: number[]): string {
    const result: string[] = []
    let bitIndex = 0
    while (bitIndex < bits.length) {
      let node = this.root
      while (node.left !== null || node.right !== null) {
        if (bitIndex >= bits.length) {
          return result.join('')
        }
        const bit = bits[bitIndex]!
        bitIndex++
        if (bit === 0) {
          node = node.left!
        } else {
          node = node.right!
        }
      }
      if (this.isNyt(node)) {
        if (bitIndex + SYMBOL_BITS > bits.length) {
          return result.join('')
        }
        const symbolBits = bits.slice(bitIndex, bitIndex + SYMBOL_BITS)
        bitIndex += SYMBOL_BITS
        const symbol = bitsToChar(symbolBits)
        result.push(symbol)
        this.update(symbol)
      } else {
        const symbol = node.symbol!
        result.push(symbol)
        this.update(symbol)
      }
    }
    this.totalSymbolsDecoded += result.length
    return result.join('')
  }

  getNodeCount(): number {
    return this.countNodes(this.root)
  }

  private countNodes(node: AdaptiveHuffmanNode | null): number {
    if (node === null) return 0
    return 1 + this.countNodes(node.left) + this.countNodes(node.right)
  }

  getSymbolWeight(symbol: string): number | undefined {
    const node = this.symbolMap.get(symbol)
    if (node === undefined) return undefined
    return node.weight
  }

  contains(symbol: string): boolean {
    return this.symbolMap.has(symbol)
  }

  reset(): void {
    this.nodes = new Array(MAX_ORDER + 1).fill(null)
    this.symbolMap.clear()
    this.nextOrder = MAX_ORDER
    this.totalBitsEncoded = 0
    this.totalSymbolsDecoded = 0
    this.root = this.makeNode(0, null, null)
    this.nytNode = this.root
  }

  getTree(): AdaptiveHuffmanNode {
    return this.root
  }

  private computeHeight(node: AdaptiveHuffmanNode | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  stats(): AdaptiveHuffmanStats {
    return {
      nodeCount: this.getNodeCount(),
      uniqueSymbols: this.symbolMap.size,
      totalBitsEncoded: this.totalBitsEncoded,
      totalSymbolsDecoded: this.totalSymbolsDecoded,
      rootWeight: this.root.weight,
      treeHeight: this.computeHeight(this.root),
    }
  }
}

export type { AdaptiveHuffmanNode, AdaptiveHuffmanStats } from './types.js'
