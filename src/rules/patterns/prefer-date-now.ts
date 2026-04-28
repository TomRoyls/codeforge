import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isCallExpression, isIdentifier, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

function isDateGetTimeCall(node: unknown): boolean {
  if (!isCallExpression(node)) return false
  const n = toASTNode(node)
  const callee = toASTNode(n?.callee)
  if (!callee || !isMemberExpression(n?.callee)) return false

  const property = toASTNode(callee.property)
  if (property?.type !== 'Identifier' || property.name !== 'getTime') return false

  const object = toASTNode(callee.object)
  if (object?.type !== 'NewExpression') return false

  const newCallee = toASTNode(object.callee)
  if (!newCallee || !isIdentifier(object.callee, 'Date')) return false

  const args = object.arguments
  if (Array.isArray(args) && args.length > 0) return false

  return true
}

export const preferDateNowRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isDateGetTimeCall(node)) return
        const n = toASTNode(node)
        const range = n?.range
        const location = extractLocation(node)

        context.report({
          fix: range ? { range, text: 'Date.now()' } : undefined,
          loc: location,
          message: 'Use Date.now() instead of new Date().getTime().',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer Date.now() over new Date().getTime(). Date.now() is more concise and avoids creating an unnecessary Date object.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-date-now',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferDateNowRule
