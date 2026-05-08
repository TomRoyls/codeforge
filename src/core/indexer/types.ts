export interface SymbolEntry {
  name: string
  kind: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'const' | 'enum'
  filePath: string
  line: number
  column: number
  exported: boolean
  documentation?: string
  children: SymbolEntry[]
}

export interface FileIndexData {
  filePath: string
  hash: string
  lastModified: number
  symbols: SymbolEntry[]
  imports: string[]
  exports: string[]
  size: number
  language: string
}

export interface SearchResult {
  filePath: string
  line: number
  column: number
  match: string
  context: string
  score: number
}

export interface SearchOptions {
  fuzzy: boolean
  maxResults: number
  filePattern?: string
  symbolKind?: SymbolEntry['kind']
  caseSensitive: boolean
}

export interface IndexStats {
  totalFiles: number
  totalSymbols: number
  indexSize: number
  lastUpdated: number
  byKind: Map<string, number>
}
