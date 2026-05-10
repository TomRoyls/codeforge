export type NodeType = 'node4' | 'node16' | 'node48' | 'node256'

export interface AdaptiveTrieOptions {
  pathCompression?: boolean
}

export interface AdaptiveTrieNode<T> {
  type: NodeType
  prefix: number[]
  prefixLen: number
  value: T | undefined
  hasValue: boolean
  childCount: number
  children: Map<number, AdaptiveTrieNode<T>>
}

export const DEFAULT_ADAPTIVE_TRIE_OPTIONS: Required<AdaptiveTrieOptions> = {
  pathCompression: true,
}
