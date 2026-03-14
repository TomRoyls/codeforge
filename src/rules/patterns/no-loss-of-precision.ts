import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, isBinaryExpression, isLiteral } from '../../utils/ast-helpers.js'

function getLiteralValue(node: unknown): unknown {
  if (!isLiteral(node)) {
    return undefined
  }
  const n = node as Record<string, unknown>
  return n.value
}

function isFloatLiteral(node: unknown): boolean {
  if (!isLiteral(node)) {
    return false
  }
  const value = getLiteralValue(node)
  if (typeof value !== 'number') {
    return false
  }
  return value % 1 !== 0
}

function isIntegerLiteral(node: unknown): boolean {
  if (!isLiteral(node)) {
    return false
  }
  const value = getLiteralValue(node)
  if (typeof value !== 'number') {
    return false
  }
  return Number.isInteger(value)
}

function isPowerOfTwo(value: number): boolean {
  if (value <= 0) return false
  return (value & (value - 1)) === 0
}

function isSafeDivision(divisor: number): boolean {
  return isPowerOfTwo(divisor) && divisor >= 1
}

export const noLossOfPrecisionRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow floating-point arithmetic that may lose precision. JavaScript uses IEEE 754 floating-point numbers, which can produce unexpected results (e.g., 0.1 + 0.2 !== 0.3). Consider using integer arithmetic, a precision library, or rounding.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-loss-of-precision',
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
        const operator = n.operator as string | undefined

        if (operator !== '+' && operator !== '-' && operator !== '*' && operator !== '/') {
          return
        }

        const left = n.left as unknown
        const right = n.right as unknown

        const leftIsFloat = isFloatLiteral(left)
        const rightIsFloat = isFloatLiteral(right)

        if (!leftIsFloat && !rightIsFloat) {
          return
        }

        const leftValue = getLiteralValue(left)
        const rightValue = getLiteralValue(right)

        if (operator === '/') {
          if (typeof rightValue === 'number' && isSafeDivision(rightValue)) {
            return
          }
        }

        if (operator === '*') {
          if (typeof rightValue === 'number' && isIntegerLiteral(right) && !isFloatLiteral(left)) {
            return
          }
          if (typeof leftValue === 'number' && isIntegerLiteral(left) && !isFloatLiteral(right)) {
            return
          }
        }

        const location = extractLocation(node)

        let operandDesc: string
        if (leftIsFloat && rightIsFloat) {
          operandDesc = `${leftValue} ${operator} ${rightValue}`
        } else if (leftIsFloat) {
          operandDesc = `${leftValue} ${operator} ...`
        } else {
          operandDesc = `... ${operator} ${rightValue}`
        }

        context.report({
          message: `Floating-point arithmetic with ${operandDesc} may lose precision due to IEEE 754 representation. Consider using integer arithmetic (multiply by 100, 1000, etc.), a decimal library, or Math.round() for expected results.`,
          loc: location,
        })
      },
    }
  },
}

export default noLossOfPrecisionRule
