import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

interface VariableInfo {
  name: string
  declared: boolean
  used: boolean
  location: SourceLocation
  kind: 'var' | 'let' | 'const' | 'function' | 'parameter' | 'import'
}

class Scope {
  private variables: Map<string, VariableInfo> = new Map()
  private parent: Scope | null

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
          currentScope().declare(n.id.name, extractLocation(node), 'function')
        }
        pushScope()
        const params = n.params as unknown[]
        if (Array.isArray(params)) {
          for (const param of params) {
            if (isIdentifier(param)) {
              currentScope().declare(param.name, extractLocation(param), 'parameter')
            }
          }
        }
      },

      'FunctionDeclaration:exit'(): void {
        popScope()
      },

      FunctionExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        pushScope()
        const n = node as Record<string, unknown>
        const params = n.params as unknown[]
        if (Array.isArray(params)) {
          for (const param of params) {
            if (isIdentifier(param)) {
              currentScope().declare(param.name, extractLocation(param), 'parameter')
            }
          }
        }
      },

      'FunctionExpression:exit'(): void {
        popScope()
      },

      ArrowFunctionExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        pushScope()
        const n = node as Record<string, unknown>
        const params = n.params as unknown[]
        if (Array.isArray(params)) {
          for (const param of params) {
            if (isIdentifier(param)) {
              currentScope().declare(param.name, extractLocation(param), 'parameter')
            }
          }
        }
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
          currentScope().declare(n.id.name, extractLocation(n.id), kind)
        }
      },

      Identifier(node: unknown): void {
        if (!isIdentifier(node)) {
          return
        }
        currentScope().use(node.name)
      },
    }
  },
}

export default noUnusedVarsRule
