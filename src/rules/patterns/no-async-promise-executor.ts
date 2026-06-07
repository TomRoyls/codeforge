import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getArguments, isIdentifier, isNewExpression, toASTNode } from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

function hasAsyncModifier(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'FunctionExpression' && n?.type !== 'ArrowFunctionExpression') return false
  return n.async === true
}

export const noAsyncPromiseExecutorRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (!isNewExpression(node)) return

        const callee = toASTNode(toASTNode(node)?.callee)
        if (!callee || !isIdentifier(callee, 'Promise')) return

        const args = getArguments(node)
        if (args.length === 0) return

        const executor = args[0]
        if (!hasAsyncModifier(executor)) return

        const location = extractLocation(node)
        context.report({
          loc: location,
          message:
            'Promise executor functions should not be async. Async functions already return Promises - use the async function directly or refactor the executor.' +
            RULE_SUGGESTIONS.noAsyncPromiseExecutor,
        })
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
