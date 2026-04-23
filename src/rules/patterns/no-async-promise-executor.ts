import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, isNewExpression } from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

function isAsyncFunction(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression'
}

function hasAsyncModifier(node: unknown): boolean {
  if (!isAsyncFunction(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  return n.async === true
}

function getFirstArgument(node: unknown): unknown {
  if (!isNewExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const args = n.arguments as undefined | unknown[]

  if (!args || args.length === 0) {
    return null
  }

  return args[0]
}

export const noAsyncPromiseExecutorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (!isNewExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const callee = n.callee as Record<string, unknown> | undefined

        if (!callee || !isIdentifier(callee, 'Promise')) {
          return
        }

        const executor = getFirstArgument(node)
        if (!executor) {
          return
        }

        if (hasAsyncModifier(executor)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              'Promise executor functions should not be async. Async functions already return Promises - use the async function directly or refactor the executor.' +
              RULE_SUGGESTIONS.noAsyncPromiseExecutor,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow async functions as Promise executors. Async functions already return Promises, so wrapping them in new Promise() is redundant and can cause unhandled rejections.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-async-promise-executor',
    },
    fixable: 'code',
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noAsyncPromiseExecutorRule
