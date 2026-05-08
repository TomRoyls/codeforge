export type ScopeKind =
  | 'module'
  | 'function'
  | 'block'
  | 'class'
  | 'loop'
  | 'catch'
  | 'global'

export type BindingKind =
  | 'var'
  | 'let'
  | 'const'
  | 'function'
  | 'class'
  | 'parameter'
  | 'import'

export interface SourceLocation {
  line: number
  column: number
}

export interface Binding {
  name: string
  kind: BindingKind
  declaredAt: SourceLocation
  references: SourceLocation[]
  isUsed: boolean
}

export interface ScopeNode {
  kind: ScopeKind
  bindings: Map<string, Binding>
  children: ScopeNode[]
  parent: ScopeNode | null
  range: { start: SourceLocation; end: SourceLocation }
}

export interface ShadowedBinding {
  name: string
  outerKind: BindingKind
  innerKind: BindingKind
  outerScope: ScopeKind
  innerScope: ScopeKind
}

export interface ScopeAnalysisResult {
  scopes: ScopeNode[]
  allBindings: Binding[]
  unusedBindings: Binding[]
  shadowedBindings: ShadowedBinding[]
}

export interface ScopeStatistics {
  totalScopes: number
  totalBindings: number
  usedBindings: number
  unusedBindings: number
  shadowedBindings: number
  scopeDepth: number
}
