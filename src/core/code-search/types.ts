export interface SearchQuery {
  pattern: string
  isRegex: boolean
  caseSensitive: boolean
  wholeWord: boolean
  filePattern?: string
  maxResults: number
}

export interface SearchMatch {
  filePath: string
  lineNumber: number
  columnStart: number
  columnEnd: number
  line: string
  match: string
  context?: string
}

export interface SearchResult {
  query: SearchQuery
  matches: SearchMatch[]
  totalMatches: number
  filesSearched: number
  filesWithMatches: number
  duration: number
}

export interface SearchIndex {
  files: Map<string, string[]>
  builtAt: number
}

export interface ReplaceOptions {
  replacement: string
  all: boolean
}

export interface ReplaceResult {
  filePath: string
  replacements: number
  original: string
  modified: string
}

export const DEFAULT_SEARCH_QUERY: SearchQuery = {
  pattern: '',
  isRegex: false,
  caseSensitive: false,
  wholeWord: false,
  maxResults: 1000,
}

export const DEFAULT_REPLACE_OPTIONS: ReplaceOptions = {
  replacement: '',
  all: false,
}
