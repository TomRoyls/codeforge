export interface ASTNode {
  type: string
  value?: string
  children?: ASTNode[]
  properties: Record<string, string>
  loc?: { line: number; column: number }
}

export type TransformAction = 'replace' | 'remove' | 'insert-before' | 'insert-after' | 'wrap'

export interface TransformRule {
  match: (node: ASTNode) => boolean
  action: TransformAction
  replacement?: ASTNode | ((node: ASTNode) => ASTNode)
}

export interface TransformChange {
  action: TransformAction
  nodeType: string
  path: string[]
}

export interface TransformResult {
  root: ASTNode
  changesApplied: number
  changes: TransformChange[]
}

export interface TransformConfig {
  maxDepth: number
  maxChanges: number
}

export const DEFAULT_TRANSFORM_CONFIG: TransformConfig = {
  maxDepth: 100,
  maxChanges: 1000,
}
