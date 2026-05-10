export interface AdaptiveHuffmanNode {
  weight: number
  symbol: string | null
  parent: AdaptiveHuffmanNode | null
  left: AdaptiveHuffmanNode | null
  right: AdaptiveHuffmanNode | null
  order: number
}

export const NYT_SYMBOL: unique symbol = Symbol('NYT')

export interface AdaptiveHuffmanStats {
  nodeCount: number
  uniqueSymbols: number
  totalBitsEncoded: number
  totalSymbolsDecoded: number
  rootWeight: number
  treeHeight: number
}
