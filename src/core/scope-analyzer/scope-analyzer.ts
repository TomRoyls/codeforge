import type {
  ScopeNode,
  ScopeKind,
  Binding,
  BindingKind,
  SourceLocation,
  ScopeAnalysisResult,
  ScopeStatistics,
  ShadowedBinding,
} from './types.js'

interface SimpleASTNode {
  type: string
  body?: SimpleASTNode[]
  declarations?: SimpleASTDeclaration[]
  params?: SimpleASTNode[]
  id?: SimpleASTNode
  name?: string
  kind?: string
  loc?: { start: SourceLocation; end: SourceLocation }
  param?: SimpleASTNode
  specifiers?: SimpleASTNode[]
  local?: SimpleASTNode
  [key: string]: unknown
}

interface SimpleASTDeclaration {
  id?: SimpleASTNode
  init?: SimpleASTNode
}

export class ScopeAnalyzer {
  analyze(ast: SimpleASTNode): ScopeAnalysisResult {
    const rootScope = this.createScope('module', null, this.getRange(ast))
    this.processNode(ast, rootScope)
    const allScopes = this.collectAllScopes(rootScope)
    const allBindings = this.collectAllBindings(allScopes)
    const unusedBindings = this.getUnusedBindingsFromList(allBindings)
    const shadowedBindings = this.detectShadowsAll(allScopes)
    return {
      scopes: allScopes,
      allBindings,
      unusedBindings,
      shadowedBindings,
    }
  }

  getStatistics(result: ScopeAnalysisResult): ScopeStatistics {
    const scopeDepths = result.scopes.map((s) => this.getScopeDepth(s))
    return {
      totalScopes: result.scopes.length,
      totalBindings: result.allBindings.length,
      usedBindings: result.allBindings.filter((b) => b.isUsed).length,
      unusedBindings: result.unusedBindings.length,
      shadowedBindings: result.shadowedBindings.length,
      scopeDepth: scopeDepths.length > 0 ? Math.max(...scopeDepths) : 0,
    }
  }

  findBinding(name: string, scope: ScopeNode): Binding | undefined {
    let current: ScopeNode | null = scope
    while (current !== null) {
      const binding = current.bindings.get(name)
      if (binding !== undefined) {
        return binding
      }
      current = current.parent
    }
    return undefined
  }

  findScopeAt(location: SourceLocation, scopes: ScopeNode[]): ScopeNode | undefined {
    let innermost: ScopeNode | undefined
    for (const scope of scopes) {
      if (this.scopeContains(scope, location)) {
        if (innermost === undefined || this.getScopeDepth(scope) > this.getScopeDepth(innermost)) {
          innermost = scope
        }
      }
    }
    return innermost
  }

  getScopeChain(scope: ScopeNode): ScopeNode[] {
    const chain: ScopeNode[] = []
    let current: ScopeNode | null = scope
    while (current !== null) {
      chain.unshift(current)
      current = current.parent
    }
    return chain
  }

  getUnusedBindingsFromList(bindings: Binding[]): Binding[] {
    return bindings.filter((b) => !b.isUsed)
  }

  getShadowedBindings(result: ScopeAnalysisResult): ShadowedBinding[] {
    return result.shadowedBindings
  }

  detectShadows(scope: ScopeNode): ShadowedBinding[] {
    const shadows: ShadowedBinding[] = []
    this.detectShadowsRecursive(scope, shadows)
    return shadows
  }

  addBinding(scope: ScopeNode, binding: Binding): void {
    scope.bindings.set(binding.name, binding)
  }

  resolveReference(name: string, scope: ScopeNode): Binding | undefined {
    return this.findBinding(name, scope)
  }

  private createScope(
    kind: ScopeKind,
    parent: ScopeNode | null,
    range: { start: SourceLocation; end: SourceLocation },
  ): ScopeNode {
    const scope: ScopeNode = {
      kind,
      bindings: new Map<string, Binding>(),
      children: [],
      parent,
      range,
    }
    if (parent !== null) {
      parent.children.push(scope)
    }
    return scope
  }

  private processNode(node: SimpleASTNode, currentScope: ScopeNode): void {
    if (node.type === 'Program') {
      const body = node.body ?? []
      for (const child of body) {
        this.processNode(child, currentScope)
      }
    } else if (node.type === 'FunctionDeclaration') {
      if (node.id?.name !== undefined) {
        const parentScope = currentScope.parent ?? currentScope
        this.addBinding(parentScope, {
          name: node.id.name,
          kind: 'function',
          declaredAt: node.id.loc?.start ?? { line: 0, column: 0 },
          references: [],
          isUsed: true,
        })
      }
      const funcScope = this.createScope('function', currentScope, this.getRange(node))
      if (node.params !== undefined) {
        for (const param of node.params) {
          if (param.name !== undefined) {
            this.addBinding(funcScope, {
              name: param.name,
              kind: 'parameter',
              declaredAt: param.loc?.start ?? { line: 0, column: 0 },
              references: [],
              isUsed: false,
            })
          }
        }
      }
      if (node.body !== undefined && !Array.isArray(node.body)) {
        const bodyNode = node.body as SimpleASTNode
        if (bodyNode.body !== undefined) {
          for (const child of bodyNode.body) {
            this.processNode(child, funcScope)
          }
        }
      }
    } else if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      const funcScope = this.createScope('function', currentScope, this.getRange(node))
      if (node.params !== undefined) {
        for (const param of node.params) {
          if (param.name !== undefined) {
            this.addBinding(funcScope, {
              name: param.name,
              kind: 'parameter',
              declaredAt: param.loc?.start ?? { line: 0, column: 0 },
              references: [],
              isUsed: false,
            })
          }
        }
      }
      if (node.body !== undefined && !Array.isArray(node.body)) {
        const bodyNode = node.body as SimpleASTNode
        if (bodyNode.body !== undefined) {
          for (const child of bodyNode.body) {
            this.processNode(child, funcScope)
          }
        }
      }
    } else if (node.type === 'BlockStatement') {
      const blockScope = this.createScope('block', currentScope, this.getRange(node))
      const body = node.body ?? []
      for (const child of body) {
        this.processNode(child, blockScope)
      }
    } else if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      if (node.id?.name !== undefined) {
        const parentScope = currentScope.parent ?? currentScope
        if (node.type === 'ClassDeclaration') {
          this.addBinding(parentScope, {
            name: node.id.name,
            kind: 'class',
            declaredAt: node.id.loc?.start ?? { line: 0, column: 0 },
            references: [],
            isUsed: true,
          })
        }
      }
      const classScope = this.createScope('class', currentScope, this.getRange(node))
      if (node.body !== undefined && !Array.isArray(node.body)) {
        const bodyNode = node.body as SimpleASTNode
        if (bodyNode.body !== undefined) {
          for (const child of bodyNode.body) {
            this.processNode(child as SimpleASTNode, classScope)
          }
        }
      }
    } else if (node.type === 'VariableDeclaration') {
      const kind = this.getBindingKind(node.kind)
      const declarations = node.declarations ?? []
      for (const decl of declarations) {
        if (decl.id?.name !== undefined) {
          this.addBinding(currentScope, {
            name: decl.id.name,
            kind,
            declaredAt: decl.id.loc?.start ?? { line: 0, column: 0 },
            references: [],
            isUsed: false,
          })
        }
        if (decl.init !== undefined && this.isASTNode(decl.init)) {
          this.processNode(decl.init, currentScope)
        }
      }
    } else if (node.type === 'Identifier') {
      if (node.name !== undefined) {
        const binding = this.findBinding(node.name, currentScope)
        if (binding !== undefined) {
          binding.references.push(node.loc?.start ?? { line: 0, column: 0 })
          binding.isUsed = true
        }
      }
    } else if (node.type === 'ForStatement' || node.type === 'ForInStatement' || node.type === 'ForOfStatement' || node.type === 'WhileStatement' || node.type === 'DoWhileStatement') {
      const loopScope = this.createScope('loop', currentScope, this.getRange(node))
      this.processChildren(node, loopScope)
    } else if (node.type === 'CatchClause') {
      const catchScope = this.createScope('catch', currentScope, this.getRange(node))
      if (node.param?.name !== undefined) {
        this.addBinding(catchScope, {
          name: node.param.name,
          kind: 'parameter',
          declaredAt: node.param.loc?.start ?? { line: 0, column: 0 },
          references: [],
          isUsed: false,
        })
      }
      this.processChildren(node, catchScope)
    } else if (node.type === 'ImportDeclaration') {
      const specifiers = (node.specifiers ?? []) as SimpleASTNode[]
      for (const spec of specifiers) {
        if (spec.local?.name !== undefined) {
          this.addBinding(currentScope, {
            name: spec.local.name,
            kind: 'import',
            declaredAt: spec.local.loc?.start ?? { line: 0, column: 0 },
            references: [],
            isUsed: false,
          })
        }
      }
    } else {
      this.processChildren(node, currentScope)
    }
  }

  private processChildren(node: SimpleASTNode, scope: ScopeNode): void {
    const keys = Object.keys(node)
    for (const key of keys) {
      if (key === 'type' || key === 'loc' || key === 'kind' || key === 'parent') continue
      const value = node[key]
      if (Array.isArray(value)) {
        for (const item of value) {
          if (this.isASTNode(item)) {
            this.processNode(item, scope)
          }
        }
      } else if (this.isASTNode(value)) {
        this.processNode(value, scope)
      }
    }
  }

  private isASTNode(value: unknown): value is SimpleASTNode {
    return (
      typeof value === 'object' &&
      value !== null &&
      'type' in value &&
      typeof (value as SimpleASTNode).type === 'string'
    )
  }

  private getBindingKind(kind: string | undefined): BindingKind {
    if (kind === 'var') return 'var'
    if (kind === 'let') return 'let'
    if (kind === 'const') return 'const'
    return 'let'
  }

  private getRange(
    node: SimpleASTNode,
  ): { start: SourceLocation; end: SourceLocation } {
    if (node.loc !== undefined) {
      return node.loc
    }
    return { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
  }

  private collectAllScopes(scope: ScopeNode): ScopeNode[] {
    const result: ScopeNode[] = [scope]
    for (const child of scope.children) {
      const childScopes = this.collectAllScopes(child)
      result.push(...childScopes)
    }
    return result
  }

  private collectAllBindings(scopes: ScopeNode[]): Binding[] {
    const bindings: Binding[] = []
    for (const scope of scopes) {
      for (const binding of scope.bindings.values()) {
        bindings.push(binding)
      }
    }
    return bindings
  }

  private detectShadowsAll(scopes: ScopeNode[]): ShadowedBinding[] {
    const shadows: ShadowedBinding[] = []
    for (const scope of scopes) {
      this.detectShadowsInScope(scope, shadows)
    }
    return shadows
  }

  private detectShadowsRecursive(scope: ScopeNode, shadows: ShadowedBinding[]): void {
    this.detectShadowsInScope(scope, shadows)
    for (const child of scope.children) {
      this.detectShadowsRecursive(child, shadows)
    }
  }

  private detectShadowsInScope(scope: ScopeNode, shadows: ShadowedBinding[]): void {
    let current: ScopeNode | null = scope.parent
    while (current !== null) {
      for (const [name, innerBinding] of scope.bindings) {
        const outerBinding = current.bindings.get(name)
        if (outerBinding !== undefined) {
          const alreadyExists = shadows.some(
            (s) =>
              s.name === name &&
              s.innerKind === innerBinding.kind &&
              s.outerKind === outerBinding.kind &&
              s.innerScope === scope.kind &&
              s.outerScope === current!.kind,
          )
          if (!alreadyExists) {
            shadows.push({
              name,
              outerKind: outerBinding.kind,
              innerKind: innerBinding.kind,
              outerScope: current.kind,
              innerScope: scope.kind,
            })
          }
        }
      }
      current = current.parent
    }
  }

  private scopeContains(scope: ScopeNode, location: SourceLocation): boolean {
    const { start, end } = scope.range
    if (location.line < start.line || location.line > end.line) return false
    if (location.line === start.line && location.column < start.column) return false
    if (location.line === end.line && location.column > end.column) return false
    return true
  }

  private getScopeDepth(scope: ScopeNode): number {
    let depth = 0
    let current: ScopeNode | null = scope.parent
    while (current !== null) {
      depth++
      current = current.parent
    }
    return depth
  }
}
