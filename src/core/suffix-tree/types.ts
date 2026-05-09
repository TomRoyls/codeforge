export interface SuffixTreeNode {
  children: Map<string, SuffixTreeNode>
  start: number
  end: number
  suffixLink: SuffixTreeNode | null
  isLeaf: boolean
  suffixIndex: number
}

export interface SuffixTreeOptions {
  terminator: string
}

export const DEFAULT_SUFFIXTREE_OPTIONS: SuffixTreeOptions = {
  terminator: '$',
}
