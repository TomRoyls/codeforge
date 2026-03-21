import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  getRange,
  getNodeSource,
  extractLocation,
  isBinaryExpression,
} from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

function isNullLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === null
}

function isNullNullComparison(left: unknown, right: unknown): boolean {
  return isNullLiteral(left) && isNullLiteral(right)
}

export const eqEqEqRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Require strict equality operators (=== and !==) instead of loose equality operators (== and !=). Loose equality can lead to unexpected type coercion.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/eq-eq-eq',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (operator !== '==' && operator !== '!=') {
          return
        }

        if (isNullNullComparison(n.left, n.right)) {
          return
        }

        const location = extractLocation(node)
        const expectedOperator = operator === '==' ? '===' : '!=='

        const range = getRange(node)
        const leftSource = getNodeSource(context, n.left)
        const rightSource = getNodeSource(context, n.right)

        context.report({
          message: `Expected '${expectedOperator}' and instead saw '${operator}'. ${RULE_SUGGESTIONS.useStrictEquality}`,
          loc: location,
          fix: range
            ? {
                range,
                text: `${leftSource} ${expectedOperator} ${rightSource}`,
              }
            : undefined,
        })
      },
    }
  },
}

export default eqEqEqRule
