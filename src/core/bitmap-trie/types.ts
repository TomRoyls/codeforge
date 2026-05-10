export interface BitmapTrieNode<V = unknown> {
  bitmap: number
  children: BitmapTrieNode<V>[]
  value: V | undefined
  isEnd: boolean
}

export interface BitmapTrieOptions {}

export const DEFAULT_BITMAP_TRIE_OPTIONS: BitmapTrieOptions = {}
