export interface SuffixArrayOptions {
  caseSensitive: boolean
}

export interface MatchResult {
  index: number
  length: number
}

export const DEFAULT_SUFFIX_ARRAY_OPTIONS: SuffixArrayOptions = {
  caseSensitive: true,
}
