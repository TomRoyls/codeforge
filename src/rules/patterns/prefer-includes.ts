import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'BinaryExpression'
}

function isIndexOfCall(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return false
  }

  const callee = n.callee as Record<string, unknown> | undefined
  if (!callee || callee.type !== 'MemberExpression') {
    return false
  }

  const property = callee.property as Record<string, unknown> | undefined
  if (!property || property.type !== 'Identifier') {
    return false
  }

  return property.name === 'indexOf'
}

function isLiteralZero(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === 0
}

function isLiteralMinusOne(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Literal' && n.value === -1
}

export const preferIncludesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const operator = n.operator as string
        const {left} = n
        const {right} = n

        const isLeftIndexOf = isIndexOfCall(left)
        const isRightIndexOf = isIndexOfCall(right)

        if (!isLeftIndexOf && !isRightIndexOf) {
          return
        }

        if (operator === '>=' || operator === '!==' || operator === '==') {
          const checkNode = isLeftIndexOf ? right : left
          if (isLiteralZero(checkNode) || isLiteralMinusOne(checkNode)) {
            const location = extractLocation(node)
            context.report({
              loc: location,
              message: `Prefer .includes() over .indexOf() ${operator} for more readable code.`,
            })
          }
        }

        if (operator === '>' || operator === '!=') {
          const checkNode = isLeftIndexOf ? right : left
          if (isLiteralMinusOne(checkNode)) {
            const location = extractLocation(node)
            context.report({
              loc: location,
              message: `Prefer .includes() over .indexOf() ${operator} for more readable code.`,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer .includes() over .indexOf() comparisons for better readability. Use array.includes(x) instead of array.indexOf(x) >= 0.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-includes',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferIncludesRule
