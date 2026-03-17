import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow negating the left operand of relational operators.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
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
              message: `Unexpected negating the left operand of '${arg.operator}' operator.`,
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noUnsafeNegationRule
