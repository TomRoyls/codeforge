import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isPromiseWithoutRejectCatch(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'NewExpression') {
    return false
  }

  const callee = n.callee as Record<string, unknown>
  if (!callee || callee.type !== 'Identifier' || callee.name !== 'Promise') {
    return false
  }

  const args = n.arguments as unknown[]
  if (!Array.isArray(args) || args.length === 0) {
    return false
  }

  const executor = args[0] as Record<string, unknown>
  if (!executor || executor.type !== 'FunctionExpression') {
    return false
  }

  const params = executor.params as unknown[]
  if (!Array.isArray(params)) {
    return false
  }

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
