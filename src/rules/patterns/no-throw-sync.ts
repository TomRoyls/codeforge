import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isAsyncFunction(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  const {type} = n
  if (
    type === 'FunctionDeclaration' ||
    type === 'FunctionExpression' ||
    type === 'ArrowFunctionExpression'
  ) {
    return n.async === true
  }

  return false
}

export const noThrowSyncRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    let asyncDepth = 0

    return {
      ArrowFunctionExpression(node: unknown): void {
        if (isAsyncFunction(node)) {
          asyncDepth++
        }
      },

      ArrowFunctionExpression_exit(node: unknown): void {
        if (isAsyncFunction(node)) {
          asyncDepth--
        }
      },

      FunctionDeclaration(node: unknown): void {
        if (isAsyncFunction(node)) {
          asyncDepth++
        }
      },

      FunctionDeclaration_exit(node: unknown): void {
        if (isAsyncFunction(node)) {
          asyncDepth--
        }
      },

      FunctionExpression(node: unknown): void {
        if (isAsyncFunction(node)) {
          asyncDepth++
        }
      },

      FunctionExpression_exit(node: unknown): void {
        if (isAsyncFunction(node)) {
          asyncDepth--
        }
      },

      ThrowStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ThrowStatement') return

        if (asyncDepth > 0) {
          const location = extractLocation(node)

          context.report({
            loc: location,
            message:
              'Unexpected throw statement in async function. Use Promise.reject() or return a rejected Promise for consistent async error handling.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow throwing synchronous errors in async functions. Use Promise.reject() or return a rejected Promise for consistent async error handling.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-throw-sync',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noThrowSyncRule
