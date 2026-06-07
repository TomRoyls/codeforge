import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isBinaryExpression, toASTNode } from '../../utils/ast-helpers.js'

function isLiteralWithValue(node: unknown, value: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'Literal' && n.value === value
}

function isNegativeZero(node: unknown): boolean {
  if (isLiteralWithValue(node, 0)) return true

  const n = toASTNode(node)
  if (n?.type === 'UnaryExpression' && n.operator === '-' && isLiteralWithValue(n.argument, 0)) {
    return true
  }

  return false
}

function isEqualityOperator(operator: string | undefined): boolean {
  return operator === '===' || operator === '==' || operator === '!==' || operator === '!='
}

export const noCompareNegZeroRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) return

        const n = toASTNode(node)
        if (!n) return

        const {operator} = n

        if (!isEqualityOperator(operator)) return

        const isLeftNegZero = isNegativeZero(n.left)
        const isRightNegZero = isNegativeZero(n.right)

        if (!isLeftNegZero && !isRightNegZero) return

        const location = extractLocation(node)

        if (operator === '===' || operator === '==') {
          context.report({
            loc: location,
            message: "Comparing against -0 with '" + operator + "' will return true for both 0 and -0. Use Object.is(x, -0) to distinguish -0 from 0.",
          })
        } else {
          context.report({
            loc: location,
            message: "Comparing against -0 with '" + operator + "' will return false for both 0 and -0. Use !Object.is(x, -0) to check for non-negative-zero.",
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow comparing against -0. The comparison x === -0 (or x == -0) returns true for both 0 and -0 because JavaScript treats them as equal. Use Object.is(x, -0) to distinguish -0 from 0.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-compare-neg-zero',
    },
    fixable: false,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noCompareNegZeroRule
