export type NodeType = 'internal' | 'external' | 'builtin'

export type EdgeType = 'import' | 're-export' | 'dynamic-import' | 'type-import'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  filePath?: string
  metadata?: Record<string, unknown>
}

export interface GraphEdge {
  from: string
  to: string
  type: EdgeType
  importedNames: string[]
}

export interface DependencyGraph {
  nodes: Map<string, GraphNode>
  edges: GraphEdge[]
}

export interface CycleInfo {
  cycle: string[]
  length: number
  severity: 'low' | 'medium' | 'high'
}

export interface TopologicalOrder {
  order: string[]
  levels: Map<string, number>
}

export interface GraphMetrics {
  totalNodes: number
  totalEdges: number
  avgDegree: number
  maxDepth: number
  cycleCount: number
  orphanCount: number
}
