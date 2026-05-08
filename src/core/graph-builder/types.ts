export interface GraphEdge {
  from: string
  to: string
  weight?: number
  label?: string
}

export interface GraphNode {
  id: string
  edges: GraphEdge[]
  metadata?: Record<string, unknown>
}

export type GraphType = 'directed' | 'undirected'

export interface GraphOptions {
  type: GraphType
  allowSelfLoops: boolean
  maxNodes: number
}

export interface TraversalResult {
  nodeId: string
  depth: number
  parent: string | null
}

export interface CycleResult {
  hasCycle: boolean
  cycle: string[]
}

export interface GraphStats {
  nodeCount: number
  edgeCount: number
  isDirected: boolean
  averageDegree: number
  isConnected: boolean
}

export const DEFAULT_GRAPH_OPTIONS: GraphOptions = {
  type: 'directed',
  allowSelfLoops: false,
  maxNodes: 10000,
}
