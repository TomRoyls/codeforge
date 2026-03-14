import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isBinaryExpression, isIdentifier } from '../../utils/ast-helpers.js'

function isMemberExpression(node: unknown, objectName: string, propertyName: string): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  if (n.type !== 'MemberExpression') {
    return false
  }
  const obj = n.object as Record<string, unknown> | undefined
  const prop = n.property as Record<string, unknown> | undefined

  if (!obj || !prop) {
    return false
  }

  return (
    obj.type === 'Identifier' &&
    obj.name === objectName &&
    prop.type === 'Identifier' &&
    prop.name === propertyName
  )
}

function isEqualityOperator(operator: string | undefined): boolean {
  return operator === '===' || operator === '==' || operator === '!==' || operator === '!='
}

function isNanComparison(node: unknown): { isNegative: boolean; operand: unknown } | null {
  if (!isBinaryExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const operator = n.operator as string | undefined

  if (!isEqualityOperator(operator)) {
    return null
  }

  const left = n.left as unknown
  const right = n.right as unknown

  if (isIdentifier(left, 'NaN') || isMemberExpression(left, 'Number', 'NaN')) {
    return { isNegative: operator === '!==' || operator === '!=', operand: right }
  }

  if (isIdentifier(right, 'NaN') || isMemberExpression(right, 'Number', 'NaN')) {
    return { isNegative: operator === '!==' || operator === '!=', operand: left }
  }

  return null
}

function isInfinityComparison(node: unknown): { isNegative: boolean; operand: unknown } | null {
  if (!isBinaryExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const operator = n.operator as string | undefined

  if (!isEqualityOperator(operator)) {
    return null
  }

  const left = n.left as unknown
  const right = n.right as unknown

  if (
    isIdentifier(left, 'Infinity') ||
    isMemberExpression(left, 'Number', 'POSITIVE_INFINITY') ||
    isMemberExpression(left, 'Number', 'NEGATIVE_INFINITY')
  ) {
    return { isNegative: operator === '!==' || operator === '!=', operand: right }
  }

  if (
    isIdentifier(right, 'Infinity') ||
    isMemberExpression(right, 'Number', 'POSITIVE_INFINITY') ||
    isMemberExpression(right, 'Number', 'NEGATIVE_INFINITY')
  ) {
    return { isNegative: operator === '!==' || operator === '!=', operand: left }
  }

  return null
}

export const preferNumberPropertiesRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer Number.isNaN() and Number.isFinite() over isNaN(), isFinite(), and direct NaN/Infinity comparisons. The global isNaN() coerces values, while Number.isNaN() does not. Direct comparisons with NaN always return false.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-number-properties',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const location = extractLocation(node)

        const nanComparison = isNanComparison(node)
        if (nanComparison) {
          if (nanComparison.isNegative) {
            context.report({
              message:
                "Use !Number.isNaN(x) instead of x !== NaN. NaN comparisons always return false, so this check doesn't work as expected.",
              loc: location,
            })
          } else {
            context.report({
              message:
                "Use Number.isNaN(x) instead of x === NaN. NaN comparisons always return false, so this check doesn't work as expected.",
              loc: location,
            })
          }
          return
        }

        const infinityComparison = isInfinityComparison(node)
        if (infinityComparison) {
          if (infinityComparison.isNegative) {
            context.report({
              message:
                'Use !Number.isFinite(x) instead of x !== Infinity. Consider using Number.isFinite() for proper infinity and NaN checks.',
              loc: location,
            })
          } else {
            context.report({
              message:
                'Use Number.isFinite(x) or explicit checks instead of x === Infinity. Consider using Number.isFinite() for proper infinity and NaN checks.',
              loc: location,
            })
          }
        }
      },
    }
  },
}

export default preferNumberPropertiesRule
