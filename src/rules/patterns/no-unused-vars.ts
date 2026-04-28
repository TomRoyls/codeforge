import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

interface VariableInfo {
  declared: boolean
  kind: 'const' | 'function' | 'import' | 'let' | 'parameter' | 'var'
  location: SourceLocation
  name: string
  used: boolean
}

function getEndKey(node: unknown): string | undefined {
  const n = toASTNode(node)
  if (!n) return undefined
  if (Array.isArray(n.range) && typeof n.range[1] === 'number') {
    return String(n.range[1])
  }

  return undefined
}

class Scope {
  private declarationEnds: Map<string, Set<string>> = new Map()
  private parent: null | Scope
  private variables: Map<string, VariableInfo> = new Map()

  constructor(parent: null | Scope = null) {
    this.parent = parent
  }

  declare(name: string, location: SourceLocation, kind: VariableInfo['kind']): void {
    this.variables.set(name, {
      declared: true,
      kind,
      location,
      name,
      used: false,
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

  getUnusedVariables(): VariableInfo[] {
    const unused: VariableInfo[] = []
    for (const variable of this.variables.values()) {
      if (!variable.used) {
        unused.push(variable)
      }
    }

    return unused
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
}

function isIdentifier(node: unknown): node is { name: string; type: 'Identifier'; } {
  const n = toASTNode(node)
  return n !== null && n.type === 'Identifier'
}

function extractParamInfo(param: unknown): null | { idNode: unknown; name: string; } {
  const p = toASTNode(param)
  if (!p) return null
  if (p.type === 'Identifier' && typeof p.name === 'string') {
    return { idNode: param, name: p.name }
  }

  if (p.type === 'Parameter' && p.name && typeof p.name === 'object') {
    const inner = toASTNode(p.name)
    if (inner?.type === 'Identifier' && typeof inner.name === 'string') {
      return { idNode: p.name, name: inner.name }
    }
  }

  return null
}

export const noUnusedVarsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const scopeStack: Scope[] = [new Scope()]

    function currentScope(): Scope {
      return scopeStack.at(-1)!
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
            loc: variable.location,
            message: `'${variable.name}' is declared but never used.`,
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
      ArrowFunctionExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        pushScope()
        declareParams(n.params)
      },

      'ArrowFunctionExpression:exit'(): void {
        popScope()
      },

      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

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
        const n = toASTNode(node)
        if (!n) return

        pushScope()
        declareParams(n.params)
      },

      'FunctionExpression:exit'(): void {
        popScope()
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

      Program(): void {
        pushScope()
      },

      'Program:exit'(): void {
        popScope()
      },

      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (isIdentifier(n.id)) {
          const parent = toASTNode(n.parent)
          const kind = (parent?.kind as VariableInfo['kind']) || 'let'
          currentScope().declareWithRange(n.id.name, extractLocation(n.id), kind, n.id)
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'variables',
      description:
        'Disallow unused variables. Variables that are declared but never used may indicate incomplete code or refactoring leftovers.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unused-vars',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noUnusedVarsRule
