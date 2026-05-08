export interface DependencyNode {
  id: string
  dependencies: string[]
  metadata: Record<string, unknown>
}

export interface ResolutionOrder {
  nodes: string[]
  cycles: string[][]
}

export interface ResolverConfig {
  allowCycles: boolean
  maxDepth: number
  onCycle: 'error' | 'warn' | 'ignore'
}

export interface ResolverError {
  type: 'cycle' | 'missing' | 'max-depth'
  message: string
  path: string[]
}
