export interface GraphNode {
  id: string
  label: string
  type: 'internal' | 'external' | 'builtin'
  path?: string
  metadata: Record<string, unknown>
}

export interface GraphEdge {
  from: string
  to: string
  type: 'import' | 'reexport' | 'dynamic' | 'type'
  importedNames: string[]
  isTypeOnly: boolean
}

export interface DependencyGraph {
  nodes: Map<string, GraphNode>
  edges: GraphEdge[]
  root: string
}

export interface CyclePath {
  nodes: string[]
  length: number
  severity: 'low' | 'medium' | 'high'
}

export interface GraphMetrics {
  totalNodes: number
  totalEdges: number
  avgDegree: number
  maxInDegree: { node: string; degree: number }
  maxOutDegree: { node: string; degree: number }
  density: number
  cycles: number
  orphans: string[]
}

export interface TopologicalOrder {
  order: string[]
  levels: Map<string, number>
  isValid: boolean
}
