export interface TrieNode {
  children: Map<string, TrieNode>
  isEnd: boolean
}
