import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function containsAwait(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>

  if (n.type === 'AwaitExpression') return true
  if (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression' || n.type === 'FunctionDeclaration') {
    return false
  }

  for (const value of Object.values(n)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsAwait(item)) return true
      }
    } else if (value && typeof value === 'object') {
      if (containsAwait(value)) return true
    }
  }

  return false
}

export const noUnnecessaryAsyncRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      FunctionDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'FunctionDeclaration') return

        const isAsync = (n as { async?: boolean }).async
        if (!isAsync) return

        const body = (n as { body?: unknown }).body
        if (!body) return

        if (!containsAwait(body)) {
          context.report({
            loc: extractLocation(n),
            message: 'Async function does not contain any await expressions. Remove the async keyword to avoid unnecessary promise wrapping.',
            node: n,
          })
        }
      },
      ArrowFunctionExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ArrowFunctionExpression') return

        const isAsync = (n as { async?: boolean }).async
        if (!isAsync) return

        const body = (n as { body?: unknown }).body
        if (!body) return

        if (!containsAwait(body)) {
          context.report({
            loc: extractLocation(n),
            message: 'Async arrow function does not contain any await expressions. Remove the async keyword to avoid unnecessary promise wrapping.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description: 'Disallow async functions that do not use await',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-async',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryAsyncRule
