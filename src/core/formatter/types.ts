export interface FormatterConfig {
  indentStyle: 'space' | 'tab'
  indentSize: number
  maxLineLength: number
  insertFinalNewline: boolean
  trimTrailingWhitespace: boolean
  sortImports: boolean
  importGroupOrder: ('builtin' | 'external' | 'internal' | 'relative' | 'type')[]
  braceStyle: 'same-line' | 'next-line'
  semicolons: boolean
  singleQuotes: boolean
  trailingComma: 'none' | 'es5' | 'all'
}

export interface FormatResult {
  source: string
  changed: boolean
  changes: FormatChange[]
}

export interface FormatChange {
  line: number
  type: 'indent' | 'whitespace' | 'import-sort' | 'line-length' | 'newline' | 'quote' | 'semicolon' | 'trailing-comma'
  description: string
}

export interface ImportGroup {
  type: 'builtin' | 'external' | 'internal' | 'relative' | 'type'
  imports: ImportStatement[]
}

export interface ImportStatement {
  raw: string
  module: string
  names: string[]
  isTypeOnly: boolean
  startIndex: number
}

export const DEFAULT_FORMATTER_CONFIG: FormatterConfig = {
  indentStyle: 'space',
  indentSize: 2,
  maxLineLength: 120,
  insertFinalNewline: true,
  trimTrailingWhitespace: true,
  sortImports: true,
  importGroupOrder: ['builtin', 'external', 'internal', 'relative', 'type'],
  braceStyle: 'same-line',
  semicolons: true,
  singleQuotes: true,
  trailingComma: 'all',
}
