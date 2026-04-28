import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getNodeSource, getRange, isBinaryExpression, toASTNode } from '../../utils/ast-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

function isNullLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'Literal' && n.value === null
}

function isNullNullComparison(left: unknown, right: unknown): boolean {
  return isNullLiteral(left) && isNullLiteral(right)
}

export const eqEqEqRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = toASTNode(node)
        if (!n) return
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
          fix: range
            ? {
                range,
                text: `${leftSource} ${expectedOperator} ${rightSource}`,
              }
            : undefined,
          loc: location,
          message: `Expected '${expectedOperator}' and instead saw '${operator}'. ${RULE_SUGGESTIONS.useStrictEquality}`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Require strict equality operators (=== and !==) instead of loose equality operators (== and !=). Loose equality can lead to unexpected type coercion.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/eq-eq-eq',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default eqEqEqRule
