export interface ASTDiffNode {
  type: string
  value?: string
  children?: ASTDiffNode[]
}

export interface DiffOperation {
  type: 'add' | 'remove' | 'modify' | 'move'
  path: string
  oldValue?: string
  newValue?: string
}

export interface DiffResult {
  operations: DiffOperation[]
  stats: {
    added: number
    removed: number
    modified: number
    unchanged: number
  }
}

export interface DifferConfig {
  maxDepth: number
  ignoreOrder: boolean
  ignoreValues: boolean
}

export const DEFAULT_DIFFER_CONFIG: DifferConfig = {
  maxDepth: Infinity,
  ignoreOrder: false,
  ignoreValues: false,
}
