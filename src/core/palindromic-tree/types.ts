export interface PalindromicTreeNode {
  length: number
  link: number
  next: Map<string, number>
  count: number
  num: number
  start: number
}

export interface PalindromicTreeOptions {
  caseSensitive: boolean
}

export const DEFAULT_PALINDROMIC_TREE_OPTIONS: PalindromicTreeOptions = {
  caseSensitive: true,
}
