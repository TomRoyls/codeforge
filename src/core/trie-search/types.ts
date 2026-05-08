export interface TrieNode<T = unknown> {
  char: string
  children: Map<string, TrieNode<T>>
  isEnd: boolean
  value?: T
  count: number
}

export interface TrieSearchOptions {
  caseSensitive: boolean
  maxSuggestions: number
  fuzzyThreshold: number
}

export interface TrieSearchResult<T = unknown> {
  key: string
  value?: T
  score: number
  depth: number
}

export const DEFAULT_TRIE_SEARCH_OPTIONS: TrieSearchOptions = {
  caseSensitive: false,
  maxSuggestions: 10,
  fuzzyThreshold: 0.6,
}
