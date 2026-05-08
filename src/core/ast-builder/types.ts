export interface BuilderNode {
  id: string
  type: string
  value?: string
  children?: BuilderNode[]
  properties?: Record<string, string>
  range?: { start: number; end: number }
  parent?: BuilderNode
}

export interface BuilderOptions {
  idPrefix: string
  trackParents: boolean
  autoRange: boolean
}

export const DEFAULT_BUILDER_OPTIONS: BuilderOptions = {
  idPrefix: 'node',
  trackParents: false,
  autoRange: false,
}
