import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isTruncationPattern(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'BinaryExpression') return false

  if (!n.left || typeof n.left !== 'object' || !n.right || typeof n.right !== 'object') return false

  const rightNode = toASTNode(n.right)

  if (n.operator === '|') {
    return rightNode?.type === 'Literal' && rightNode.value === 0
  }

  if (n.operator === '>>') {
    return rightNode?.type === 'Literal' && rightNode.value === 0
  }

  return false
}

export const preferMathTruncRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isTruncationPattern(node)) {
          return
        }

        const n = toASTNode(node)
        if (!n) return

        const {operator} = n

        context.report({
          loc: extractLocation(node),
          message: `Prefer Math.trunc() over ${operator === '|' ? '| 0' : '>> 0'} for truncating numbers. Math.trunc() is more readable and handles large numbers correctly.`,
          node,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'performance',
      description:
        'Prefer Math.trunc() over bitwise operations (| 0, >> 0) for truncating numbers. Math.trunc() is more readable, handles large numbers correctly, and is explicit about intent.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-math-trunc',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferMathTruncRule
