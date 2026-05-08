import type {
  Scope,
  Binding,
  ScopeType,
  BindingKind,
  ScopeConfig,
  ResolutionResult,
} from './types.js'
import { DEFAULT_SCOPE_CONFIG } from './types.js'

export type {
  Scope,
  Binding,
  ScopeType,
  BindingKind,
  ScopeNode,
  ResolutionResult,
  ScopeConfig,
} from './types.js'
export { DEFAULT_SCOPE_CONFIG }

export class ScopeResolver {
  private scopeStack: Scope[] = []
  private allScopes: Scope[] = []
  private config: ScopeConfig

  constructor(config?: Partial<ScopeConfig>) {
    this.config =
      config !== undefined
        ? { ...DEFAULT_SCOPE_CONFIG, ...config }
        : { ...DEFAULT_SCOPE_CONFIG }
  }

  pushScope(name: string, type: ScopeType): Scope {
    if (this.scopeStack.length >= this.config.maxScopeDepth) {
      throw new Error(
        `Maximum scope depth of ${this.config.maxScopeDepth} exceeded`,
      )
    }
    const scope: Scope = {
      name,
      type,
      children: [],
      bindings: new Map<string, Binding>(),
    }
    if (this.scopeStack.length > 0) {
      const parent = this.scopeStack[this.scopeStack.length - 1]!
      scope.parent = parent
      parent.children.push(scope)
    }
    this.scopeStack.push(scope)
    this.allScopes.push(scope)
    return scope
  }

  popScope(): Scope | undefined {
    return this.scopeStack.pop()
  }

  currentScope(): Scope | undefined {
    if (this.scopeStack.length === 0) {
      return undefined
    }
    return this.scopeStack[this.scopeStack.length - 1]!
  }

  declare(name: string, kind: BindingKind, initialized = false): Binding {
    const scope = this.currentScope()
    if (scope === undefined) {
      throw new Error('No current scope')
    }
    if (!this.config.allowRedeclare) {
      const existing = scope.bindings.get(name)
      if (existing !== undefined) {
        throw new Error(
          `Variable '${name}' is already declared in scope '${scope.name}'`,
        )
      }
    }
    const binding: Binding = { name, kind, scope, initialized }
    scope.bindings.set(name, binding)
    return binding
  }

  resolve(name: string): ResolutionResult {
    let distance = 0
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      const scope = this.scopeStack[i]!
      const binding = scope.bindings.get(name)
      if (binding !== undefined) {
        return { found: true, binding, scope, distance }
      }
      distance++
    }
    return { found: false }
  }

  getScope(name: string): Scope | undefined {
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      const scope = this.scopeStack[i]!
      if (scope.name === name) {
        return scope
      }
    }
    return undefined
  }

  getBinding(name: string, scope?: Scope): Binding | undefined {
    const targetScope = scope ?? this.currentScope()
    if (targetScope === undefined) {
      return undefined
    }
    return targetScope.bindings.get(name)
  }

  findShadowing(name: string): Binding[] {
    const results: Binding[] = []
    let foundInnermost = false
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      const scope = this.scopeStack[i]!
      const binding = scope.bindings.get(name)
      if (binding !== undefined) {
        if (foundInnermost) {
          results.push(binding)
        }
        foundInnermost = true
      }
    }
    return results
  }

  getScopeChain(): Scope[] {
    return [...this.scopeStack]
  }

  getBindings(scope?: Scope): Map<string, Binding> {
    const targetScope = scope ?? this.currentScope()
    if (targetScope === undefined) {
      return new Map<string, Binding>()
    }
    return new Map(targetScope.bindings)
  }

  getAllBindings(): Binding[] {
    const bindings: Binding[] = []
    for (const scope of this.allScopes) {
      for (const binding of scope.bindings.values()) {
        bindings.push(binding)
      }
    }
    return bindings
  }

  getStatistics(): {
    totalScopes: number
    totalBindings: number
    initializedBindings: number
    uninitializedBindings: number
    currentDepth: number
    scopeTypes: Record<string, number>
  } {
    const bindings = this.getAllBindings()
    const initialized = bindings.filter((b) => b.initialized).length
    const scopeTypes: Record<string, number> = {}
    for (const scope of this.allScopes) {
      const count = scopeTypes[scope.type]
      if (count !== undefined) {
        scopeTypes[scope.type] = count + 1
      } else {
        scopeTypes[scope.type] = 1
      }
    }
    return {
      totalScopes: this.allScopes.length,
      totalBindings: bindings.length,
      initializedBindings: initialized,
      uninitializedBindings: bindings.length - initialized,
      currentDepth: this.scopeStack.length,
      scopeTypes,
    }
  }

  clear(): void {
    for (const scope of this.allScopes) {
      scope.bindings.clear()
      scope.children.length = 0
      scope.parent = undefined
    }
    this.scopeStack = []
    this.allScopes = []
  }
}
