import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isPromiseWithoutRejectCatch(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'NewExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'Identifier' || callee.name !== 'Promise') return false

  const args = n.arguments as unknown[]
  if (!Array.isArray(args) || args.length === 0) return false

  const executor = toASTNode(args[0])
  if (!executor || executor.type !== 'FunctionExpression') return false

  const params = executor.params as unknown[]
  if (!Array.isArray(params)) return false

  return params.length < 2
}

export const preferPromiseRejectErrorsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (isPromiseWithoutRejectCatch(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Promise executor should handle errors with reject().',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer using reject() in Promise executors to handle errors properly. Executors with only resolve() may swallow errors.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-promise-reject-errors',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferPromiseRejectErrorsRule
