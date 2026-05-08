export interface VizNode {
  id: string
  label: string
  group?: string
  metadata?: Record<string, unknown>
}

export interface VizEdge {
  from: string
  to: string
  label?: string
  weight?: number
  style?: 'solid' | 'dashed' | 'dotted'
}

export interface VizGraph {
  nodes: VizNode[]
  edges: VizEdge[]
  directed: boolean
  label?: string
}

export interface RenderOptions {
  direction: 'TB' | 'LR' | 'RL' | 'BT'
  maxWidth: number
  maxDepth: number
  showLabels: boolean
  showWeights: boolean
  nodePrefix: string
  indent: string
  colors: boolean
}

export interface TreeLayout {
  root: string
  children: Map<string, string[]>
  depths: Map<string, number>
  order: string[]
}

export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  direction: 'TB',
  maxWidth: 80,
  maxDepth: 10,
  showLabels: true,
  showWeights: false,
  nodePrefix: '',
  indent: '  ',
  colors: false,
}
