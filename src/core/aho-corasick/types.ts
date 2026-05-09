export interface AhoCorasickMatch {
  pattern: string
  startIndex: number
  endIndex: number
}

export interface AhoCorasickOptions {
  caseSensitive: boolean
}

export const DEFAULT_AHO_CORASICK_OPTIONS: AhoCorasickOptions = {
  caseSensitive: true,
}
