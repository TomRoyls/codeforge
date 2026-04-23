import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isUnaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'UnaryExpression'
}

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'BinaryExpression'
}

const RELATIONAL_OPERATORS = new Set(['in', 'instanceof'])

export const noUnsafeNegationRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        if (!isUnaryExpression(node)) return
        const n = node as Record<string, unknown>
        if (n.operator !== '!') return
        if (isBinaryExpression(n.argument)) {
          const arg = n.argument as Record<string, unknown>
          if (RELATIONAL_OPERATORS.has(arg.operator as string)) {
            context.report({
              loc: extractLocation(node),
              message: `Unexpected negating the left operand of '${arg.operator}' operator.`,
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow negating the left operand of relational operators.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnsafeNegationRule
