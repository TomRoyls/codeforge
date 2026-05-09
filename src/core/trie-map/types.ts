export interface TrieMapNode<T = unknown> {
  children: Map<string, TrieMapNode<T>>
  value: T | undefined
  isEnd: boolean
}

export interface TrieMapOptions {}

export const DEFAULT_TRIEMAP_OPTIONS: TrieMapOptions = {}
