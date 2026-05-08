export interface ASTNode {
  type: string
  children?: ASTNode[]
  value?: string
  properties?: Record<string, unknown>
  range?: { start: number; end: number }
  loc?: { line: number; column: number }
}

export interface PrintOptions {
  indentStyle: 'space' | 'tab'
  indentSize: number
  maxWidth: number
  semicolons: boolean
  singleQuotes: boolean
  trailingNewline: boolean
  compress: boolean
}

export interface PrintResult {
  code: string
  lines: number
  mapping: Array<{ nodeType: string; line: number; column: number }>
}

export interface SerializedNode {
  type: string
  text: string
  children: SerializedNode[]
  depth: number
  meta: Record<string, string>
}

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  indentStyle: 'space',
  indentSize: 2,
  maxWidth: 80,
  semicolons: true,
  singleQuotes: true,
  trailingNewline: true,
  compress: false,
}
