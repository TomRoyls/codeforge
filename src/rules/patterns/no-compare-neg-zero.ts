import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isBinaryExpression } from '../../utils/ast-helpers.js'

function isLiteralWithValue(node: unknown, value: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === value
}

function isUnaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'UnaryExpression'
}

function isNegativeZero(node: unknown): boolean {
  if (isLiteralWithValue(node, 0)) {
    return true
  }

  if (isUnaryExpression(node)) {
    const n = node as Record<string, unknown>
    const operator = n.operator as string | undefined
    const argument = n.argument as unknown

    if (operator === '-' && isLiteralWithValue(argument, 0)) {
      return true
    }
  }

  return false
}

function isEqualityOperator(operator: string | undefined): boolean {
  return operator === '===' || operator === '==' || operator === '!==' || operator === '!='
}

export const noCompareNegZeroRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow comparing against -0. The comparison x === -0 (or x == -0) returns true for both 0 and -0 because JavaScript treats them as equal. Use Object.is(x, -0) to distinguish -0 from 0.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-compare-neg-zero',
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
        const operator = n.operator as string | undefined

        if (!isEqualityOperator(operator)) {
          return
        }

        const left = n.left as unknown
        const right = n.right as unknown

        const isLeftNegZero = isNegativeZero(left)
        const isRightNegZero = isNegativeZero(right)

        if (!isLeftNegZero && !isRightNegZero) {
          return
        }

        const location = extractLocation(node)

        if (operator === '===' || operator === '==') {
          context.report({
            message:
              "Comparing against -0 with '" +
              operator +
              "' will return true for both 0 and -0. Use Object.is(x, -0) to distinguish -0 from 0.",
            loc: location,
          })
        } else {
          context.report({
            message:
              "Comparing against -0 with '" +
              operator +
              "' will return false for both 0 and -0. Use !Object.is(x, -0) to check for non-negative-zero.",
            loc: location,
          })
        }
      },
    }
  },
}

export default noCompareNegZeroRule
