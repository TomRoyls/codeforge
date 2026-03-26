import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function hasFunctionExpressionValue(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'Property') {
    return false
  }

  const shorthand = n.shorthand as boolean | undefined
  if (shorthand === true) {
    return false
  }

  const method = n.method as boolean | undefined
  if (method === true) {
    return false
  }

  const kind = n.kind as string | undefined
  if (kind === 'get' || kind === 'set') {
    return false
  }

  const value = n.value as Record<string, unknown> | undefined
  if (!value || typeof value !== 'object') {
    return false
  }

  return value.type === 'FunctionExpression'
}

export const objectShorthandRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Require object literal shorthand for methods. Instead of { method: function() {} }, use { method() { } } for cleaner, more concise code.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/object-shorthand',
    },
    schema: [],
  },

  create(context: RuleContext): RuleVisitor {
    return {
      Property(node: unknown): void {
        if (!hasFunctionExpressionValue(node)) {
          return
        }

        const location = extractLocation(node)

        context.report({
          message: 'Expected property shorthand.',
          loc: location,
        })
      },
    }
  },
}

export default objectShorthandRule
