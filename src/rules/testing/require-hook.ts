import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isDescribeCall, toASTNode } from '../../utils/ast-helpers.js'
import { HOOK_FUNCTIONS } from '../../utils/constants.js'

function getHookName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (
    callee.type === 'Identifier' &&
    typeof callee.name === 'string' &&
    HOOK_FUNCTIONS.has(callee.name)
  ) {
    return callee.name
  }

  return null
}

interface ScopeState {
  blockingDepth: number
}

function enterBlocking(scopeStack: ScopeState[]): void {
  const scope = scopeStack.at(-1)
  if (scope) scope.blockingDepth++
}

function exitBlocking(scopeStack: ScopeState[]): void {
  const scope = scopeStack.at(-1)
  if (scope) scope.blockingDepth--
}

export const requireHookRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const scopeStack: ScopeState[] = []

    return {
      CallExpression(node: unknown): void {
        if (isDescribeCall(node) !== null) {
          scopeStack.push({ blockingDepth: 0 })
          return
        }

        const hookName = getHookName(node)
        if (hookName === null) return

        if (scopeStack.length === 0) return

        const currentScope = scopeStack.at(-1)
        if (currentScope && currentScope.blockingDepth > 0) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected '${hookName}' hook inside conditional or nested structure. Hooks should be at the top level of a describe block.`,
            node,
          })
        }
      },

      'CallExpression:exit'(node: unknown): void {
        if (isDescribeCall(node) !== null) {
          scopeStack.pop()
        }
      },

      DoWhileStatement(): void {
        enterBlocking(scopeStack)
      },
      'DoWhileStatement:exit'(): void {
        exitBlocking(scopeStack)
      },
      ForInStatement(): void {
        enterBlocking(scopeStack)
      },
      'ForInStatement:exit'(): void {
        exitBlocking(scopeStack)
      },
      ForOfStatement(): void {
        enterBlocking(scopeStack)
      },
      'ForOfStatement:exit'(): void {
        exitBlocking(scopeStack)
      },
      ForStatement(): void {
        enterBlocking(scopeStack)
      },
      'ForStatement:exit'(): void {
        exitBlocking(scopeStack)
      },
      IfStatement(): void {
        enterBlocking(scopeStack)
      },
      'IfStatement:exit'(): void {
        exitBlocking(scopeStack)
      },
      SwitchStatement(): void {
        enterBlocking(scopeStack)
      },
      'SwitchStatement:exit'(): void {
        exitBlocking(scopeStack)
      },
      TryStatement(): void {
        enterBlocking(scopeStack)
      },
      'TryStatement:exit'(): void {
        exitBlocking(scopeStack)
      },
      WhileStatement(): void {
        enterBlocking(scopeStack)
      },
      'WhileStatement:exit'(): void {
        exitBlocking(scopeStack)
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Require setup and teardown hooks to be at the top level of a describe block, not inside conditionals or loops',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/testing/require-hook.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default requireHookRule
