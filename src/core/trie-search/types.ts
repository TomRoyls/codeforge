export interface TrieSearchNode<T = unknown> {
  label: string
  children: Map<string, TrieSearchNode<T>>
  isEnd: boolean
  value?: T
}

export interface TrieSearchOptions {
  caseSensitive: boolean
}

export const DEFAULT_TRIE_SEARCH_OPTIONS: TrieSearchOptions = {
  caseSensitive: false,
}
