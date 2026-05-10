export interface PathCompressedTrieOptions {
  caseSensitive?: boolean
}

export interface PathCompressedTrieStatistics {
  inserts: number
  deletes: number
  searches: number
  nodesCreated: number
  pathCompressions: number
}

export interface TrieNode {
  key: string
  value: string | undefined
  children: Map<string, TrieNode>
  isEnd: boolean
}

export const DEFAULT_PATH_COMPRESSED_TRIE_OPTIONS: PathCompressedTrieOptions = {
  caseSensitive: true,
}
