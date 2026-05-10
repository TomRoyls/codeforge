export interface TrieCountMinOptions {
  width: number
  depth: number
  seed?: number
}

export interface TrieCountMinNode {
  children: Map<string, TrieCountMinNode>
  isEnd: boolean
  counters: number[]
}

export const DEFAULT_TRIECOUNTMIN_OPTIONS: TrieCountMinOptions = {
  width: 1000,
  depth: 5,
  seed: 0,
}
