import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isAsyncFunction(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  const type = n.type

  if (
    type === 'FunctionDeclaration' ||
    type === 'FunctionExpression' ||
    type === 'ArrowFunctionExpression'
  ) {
    return n.async === true
  }

  return false
}

function isThrowStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'ThrowStatement'
}

export const noThrowSyncRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow throwing synchronous errors in async functions. Use Promise.reject() or return a rejected Promise for consistent async error handling.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-throw-sync',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    let asyncDepth = 0

    return {
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

      ThrowStatement(node: unknown): void {
        if (!isThrowStatement(node)) {
          return
        }

        if (asyncDepth > 0) {
          const location = extractLocation(node)

          context.report({
            message:
              'Unexpected throw statement in async function. Use Promise.reject() or return a rejected Promise for consistent async error handling.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noThrowSyncRule
