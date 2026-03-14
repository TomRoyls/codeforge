import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isNewExpression, isIdentifier } from '../../utils/ast-helpers.js'

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
  const args = n.arguments as unknown[] | undefined

  if (!args || args.length === 0) {
    return null
  }

  return args[0]
}

export const noAsyncPromiseExecutorRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow async functions as Promise executors. Async functions already return Promises, so wrapping them in new Promise() is redundant and can cause unhandled rejections.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-async-promise-executor',
    },
    schema: [],
    fixable: 'code',
  },

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
            message:
              'Promise executor functions should not be async. Async functions already return Promises - use the async function directly or refactor the executor.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noAsyncPromiseExecutorRule
