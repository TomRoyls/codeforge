export interface ASTLocation {
  startLine: number
  startCol: number
  endLine: number
  endCol: number
}

export interface ASTNode {
  type: string
  value?: string
  children: ASTNode[]
  properties: Record<string, unknown>
  location: ASTLocation
  parent?: ASTNode
}

export interface AttributeSelector {
  name: string
  operator: '=' | '!=' | '~=' | '^=' | '$=' | '*=' | 'exists'
  value?: string
}

export interface PseudoSelector {
  name: string
  argument?: string | number
}

export interface CombinatorSelector {
  type: 'descendant' | 'child' | 'sibling' | 'adjacent'
}

export interface QuerySelector {
  nodeType: string
  attributes: AttributeSelector[]
  pseudoClasses: PseudoSelector[]
  combinator?: CombinatorSelector
  child?: QuerySelector
}

export interface QueryMatch {
  node: ASTNode
  ancestors: ASTNode[]
  score: number
}

export interface QueryResult {
  matches: QueryMatch[]
  query: string
  executionTime: number
}

export interface ParseError {
  position: number
  message: string
}

export interface Token {
  type: 'type' | 'attribute' | 'pseudo' | 'combinator' | 'universal' | 'group'
  value: string
}

export interface ASTVisitor {
  enter?: (node: ASTNode, ancestors: ASTNode[]) => boolean | void
  exit?: (node: ASTNode) => void
}
