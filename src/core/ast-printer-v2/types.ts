export type PrintFormat = 'compact' | 'pretty' | 'json' | 'lisp'

export interface PrintOptions {
  format: PrintFormat
  indent: number
  maxDepth: number
  showLocation: boolean
  showType: boolean
  colorize: boolean
}

export interface ASTNode {
  type: string
  children: ASTNode[]
  value: unknown
  location?: { line: number; column: number }
  properties: Record<string, unknown>
}

export interface PrintResult {
  output: string
  nodeCount: number
  depth: number
  truncated: boolean
}

export interface TreeStatistics {
  nodeCount: number
  maxDepth: number
  types: Record<string, number>
}

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  format: 'pretty',
  indent: 2,
  maxDepth: -1,
  showLocation: false,
  showType: false,
  colorize: false,
}
