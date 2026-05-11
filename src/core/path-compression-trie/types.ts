export interface TrieNode<T> {
  label: string
  value: T | undefined
  hasValue: boolean
  children: Map<string, TrieNode<T>>
}

export interface TrieEntry<T> {
  key: string
  value: T
}
