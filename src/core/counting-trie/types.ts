export interface CountingTrieNode {
  char: string
  count: number
  endCount: number
  children: Map<string, CountingTrieNode>
}

export interface CountingTrieOptions {
  caseSensitive: boolean
}

export const DEFAULT_COUNTING_TRIE_OPTIONS: CountingTrieOptions = {
  caseSensitive: true,
}

export interface CountingTrieStats {
  totalWords: number
  totalNodes: number
  avgDepth: number
  maxDepth: number
}
