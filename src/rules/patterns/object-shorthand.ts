import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

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
  create(context: RuleContext): RuleVisitor {
    return {
      Property(node: unknown): void {
        if (!hasFunctionExpressionValue(node)) {
          return
        }

        const location = extractLocation(node)

        context.report({
          loc: location,
          message: 'Expected property shorthand.',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Require object literal shorthand for methods. Instead of { method: function() {} }, use { method() { } } for cleaner, more concise code.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/object-shorthand',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default objectShorthandRule
