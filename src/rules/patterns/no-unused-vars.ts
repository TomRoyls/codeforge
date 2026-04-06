import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'

interface VariableInfo {
  name: string
  declared: boolean
  used: boolean
  location: SourceLocation
  kind: 'var' | 'let' | 'const' | 'function' | 'parameter' | 'import'
}

function getEndKey(node: unknown): string | undefined {
  if (!node || typeof node !== 'object') return undefined
  const n = node as Record<string, unknown>
  if (Array.isArray(n.range) && typeof n.range[1] === 'number') {
    return String(n.range[1])
  }
  return undefined
}

class Scope {
  private variables: Map<string, VariableInfo> = new Map()
  private parent: Scope | null
  private declarationEnds: Map<string, Set<string>> = new Map()

  constructor(parent: Scope | null = null) {
    this.parent = parent
  }

  declare(name: string, location: SourceLocation, kind: VariableInfo['kind']): void {
    this.variables.set(name, {
      name,
      declared: true,
      used: false,
      location,
      kind,
    })
  }

  declareWithRange(
    name: string,
    location: SourceLocation,
    kind: VariableInfo['kind'],
    identifierNode: unknown,
  ): void {
    this.declare(name, location, kind)
    const endKey = getEndKey(identifierNode)
    if (endKey) {
      let ends = this.declarationEnds.get(name)
      if (!ends) {
        ends = new Set()
        this.declarationEnds.set(name, ends)
      }
      ends.add(endKey)
    }
  }

  isDeclarationSite(name: string, endKey: string | undefined): boolean {
    if (!endKey) return false
    const ends = this.declarationEnds.get(name)
    if (ends?.has(endKey)) return true
    return this.parent?.isDeclarationSite(name, endKey) ?? false
  }

  use(name: string): void {
    const variable = this.variables.get(name)
    if (variable) {
      variable.used = true
    } else if (this.parent) {
      this.parent.use(name)
    }
  }

  getUnusedVariables(): VariableInfo[] {
    const unused: VariableInfo[] = []
    for (const variable of this.variables.values()) {
      if (!variable.used) {
        unused.push(variable)
      }
    }
    return unused
  }
}

function isIdentifier(node: unknown): node is { type: 'Identifier'; name: string } {
  return (
    node !== null &&
    typeof node === 'object' &&
    (node as Record<string, unknown>).type === 'Identifier'
  )
}

function extractParamInfo(param: unknown): { name: string; idNode: unknown } | null {
  if (!param || typeof param !== 'object') return null
  const p = param as Record<string, unknown>
  if (p.type === 'Identifier' && typeof p.name === 'string') {
    return { name: p.name, idNode: param }
  }
  if (p.type === 'Parameter' && p.name && typeof p.name === 'object') {
    const inner = p.name as Record<string, unknown>
    if (inner.type === 'Identifier' && typeof inner.name === 'string') {
      return { name: inner.name, idNode: p.name }
    }
  }
  return null
}

export const noUnusedVarsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow unused variables. Variables that are declared but never used may indicate incomplete code or refactoring leftovers.',
      category: 'variables',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unused-vars',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const scopeStack: Scope[] = [new Scope()]

    function currentScope(): Scope {
      return scopeStack[scopeStack.length - 1]!
    }

    function pushScope(): void {
      scopeStack.push(new Scope(currentScope()))
    }

    function popScope(): void {
      const scope = scopeStack.pop()
      if (scope) {
        for (const variable of scope.getUnusedVariables()) {
          if (variable.name.startsWith('_')) {
            continue
          }
          context.report({
            message: `'${variable.name}' is declared but never used.`,
            loc: variable.location,
          })
        }
      }
    }

    function declareParams(params: unknown): void {
      if (!Array.isArray(params)) return
      for (const param of params) {
        const info = extractParamInfo(param)
        if (info) {
          currentScope().declareWithRange(
            info.name,
            extractLocation(param),
            'parameter',
            info.idNode,
          )
        }
      }
    }

    return {
      Program(): void {
        pushScope()
      },

      'Program:exit'(): void {
        popScope()
      },

      FunctionDeclaration(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        if (isIdentifier(n.id)) {
          currentScope().declareWithRange(n.id.name, extractLocation(node), 'function', n.id)
        }
        pushScope()
        declareParams(n.params)
      },

      'FunctionDeclaration:exit'(): void {
        popScope()
      },

      FunctionExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        pushScope()
        declareParams((node as Record<string, unknown>).params)
      },

      'FunctionExpression:exit'(): void {
        popScope()
      },

      ArrowFunctionExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        pushScope()
        declareParams((node as Record<string, unknown>).params)
      },

      'ArrowFunctionExpression:exit'(): void {
        popScope()
      },

      VariableDeclarator(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        const n = node as Record<string, unknown>
        if (isIdentifier(n.id)) {
          const parent = n.parent as Record<string, unknown> | undefined
          const kind = (parent?.kind as VariableInfo['kind']) || 'let'
          currentScope().declareWithRange(n.id.name, extractLocation(n.id), kind, n.id)
        }
      },

      Identifier(node: unknown): void {
        if (!isIdentifier(node)) {
          return
        }
        const endKey = getEndKey(node)
        if (currentScope().isDeclarationSite(node.name, endKey)) {
          return
        }
        currentScope().use(node.name)
      },
    }
  },
}

export default noUnusedVarsRule
