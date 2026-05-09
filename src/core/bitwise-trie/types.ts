export interface BitwiseTrieNode<T = unknown> {
  children: [BitwiseTrieNode<T> | null, BitwiseTrieNode<T> | null]
  value?: T
  isEnd: boolean
}

export interface BitwiseTrieOptions {
  bitDepth: number
}

export const DEFAULT_BITWISE_TRIE_OPTIONS: BitwiseTrieOptions = {
  bitDepth: 32,
}
