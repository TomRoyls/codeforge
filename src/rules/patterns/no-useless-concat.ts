import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isBinaryExpression } from '../../utils/ast-helpers.js'

function isEmptyStringLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'Literal' && typeof n.value === 'string' && n.value === ''
}

export const noUselessConcatRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow useless string concatenation with empty strings. Concatenating with an empty string is unnecessary and can be removed.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-useless-concat',
    },
    schema: [],
    fixable: undefined,
  },

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

        const left = n.left
        const right = n.right

        if (isEmptyStringLiteral(left) || isEmptyStringLiteral(right)) {
          const location = extractLocation(node)
          context.report({
            message: 'Unexpected useless string concatenation with empty string.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noUselessConcatRule
