export interface ASTNode {
  type: string
  children?: ASTNode[]
  value?: string
  range?: { start: number; end: number }
  properties?: Record<string, unknown>
}

export interface WalkVisitor {
  enter?: (node: ASTNode, depth: number, path: ASTNode[]) => void | boolean
  exit?: (node: ASTNode, depth: number, path: ASTNode[]) => void
}

export interface WalkOptions {
  order: 'pre' | 'post' | 'breadth-first'
  maxDepth?: number
  filter?: (node: ASTNode, depth: number) => boolean
}

export interface WalkResult {
  visited: number
  skipped: number
  depth: number
}

export interface TreeStatistics {
  totalNodes: number
  maxDepth: number
  typeCounts: Record<string, number>
  leafNodes: number
  branchNodes: number
}

export const DEFAULT_WALK_CONFIG: WalkOptions = {
  order: 'pre',
}
