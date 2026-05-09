export interface BinaryTrieNode<T = unknown> {
  key?: number
  value?: T
  children: [BinaryTrieNode<T> | null, BinaryTrieNode<T> | null]
  isEnd: boolean
}

export interface BinaryTrieOptions {
  bitDepth: number
}

export interface BinaryTrieStats {
  size: number
  nodeCount: number
  height: number
}

export const DEFAULT_BINARY_TRIE_OPTIONS: BinaryTrieOptions = {
  bitDepth: 32,
}
