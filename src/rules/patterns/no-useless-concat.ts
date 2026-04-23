import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isBinaryExpression } from '../../utils/ast-helpers.js'

function isEmptyStringLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && typeof n.value === 'string' && n.value === ''
}

export const noUselessConcatRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (operator !== '+') {
          return
        }

        const {left} = n
        const {right} = n

        if (isEmptyStringLiteral(left) || isEmptyStringLiteral(right)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Unexpected useless string concatenation with empty string.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow useless string concatenation with empty strings. Concatenating with an empty string is unnecessary and can be removed.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-useless-concat',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noUselessConcatRule
