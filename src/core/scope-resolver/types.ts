export type ScopeType = 'global' | 'module' | 'function' | 'block' | 'loop'

export type BindingKind = 'var' | 'let' | 'const' | 'function' | 'class' | 'param'

export interface Scope {
  name: string
  type: ScopeType
  parent?: Scope
  children: Scope[]
  bindings: Map<string, Binding>
}

export interface Binding {
  name: string
  kind: BindingKind
  scope: Scope
  initialized: boolean
}

export interface ScopeNode {
  type: string
  name?: string
  scopeType: ScopeType
}

export interface ResolutionResult {
  found: boolean
  binding?: Binding
  scope?: Scope
  distance?: number
}

export interface ScopeConfig {
  allowRedeclare: boolean
  maxScopeDepth: number
  trackInitialized: boolean
}

export const DEFAULT_SCOPE_CONFIG: ScopeConfig = {
  allowRedeclare: false,
  maxScopeDepth: 100,
  trackInitialized: true,
}
