export interface FormatOptions {
  indentSize: number
  useTabs: boolean
  semicolons: boolean
  singleQuotes: boolean
  trailingComma: 'all' | 'none' | 'es5'
  printWidth: number
  bracketSpacing: boolean
  arrowParens: 'always' | 'avoid'
  endOfLine: 'lf' | 'crlf'
}

export interface FormatResult {
  formatted: string
  changed: boolean
  errors: FormatError[]
}

export interface FormatError {
  line: number
  column: number
  message: string
}

export interface FormatRange {
  startLine: number
  endLine: number
}

export type IndentStyle = 'tab' | 'spaces'

export interface ChangeDescription {
  line: number
  column: number
  type: string
  message: string
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  indentSize: 2,
  useTabs: false,
  semicolons: true,
  singleQuotes: true,
  trailingComma: 'all',
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
}
