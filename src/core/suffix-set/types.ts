export interface TrieNode {
  children: Map<string, TrieNode>
  endOfWord: boolean
  wordCount: number
}

export interface SuffixSetStats {
  size: number
  totalNodes: number
  avgWordLength: number
  maxWordLength: number
  minWordLength: number
}
