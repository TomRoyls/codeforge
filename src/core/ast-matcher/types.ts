export interface ASTNode {
  type: string
  value?: string
  children?: ASTNode[]
  properties: Record<string, string>
  loc?: { line: number; column: number }
}

export interface MatchPattern {
  type: string
  value?: string
  properties?: Record<string, string>
  children?: MatchPattern[]
  captureName?: string
}

export interface MatchResult {
  node: ASTNode
  captures: Map<string, ASTNode[]>
  depth: number
}

export interface MatchConfig {
  maxDepth: number
  caseSensitive: boolean
}

export const DEFAULT_CONFIG: MatchConfig = {
  maxDepth: 100,
  caseSensitive: true,
}
