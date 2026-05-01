/**
 * @module rules/patterns/no-mixed-operators
 * Disallows mixing different operators without parentheses.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const MIXABLE_GROUPS: Record<string, string[]> = {
  arithmetic: ['+', '-', '*', '/', '%'],
  bitwise: ['&', '|', '^', '~', '<<', '>>', '>>>'],
  comparison: ['==', '!=', '===', '!==', '<', '>', '<=', '>='],
  logical: ['&&', '||', '??'],
}

export const noMixedOperatorsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const left = (n as { left?: unknown }).left
        const right = (n as { right?: unknown }).right
        const operator = (n as { operator?: unknown }).operator

        if (typeof operator !== 'string') return

        const leftNode = toASTNode(left)
        const rightNode = toASTNode(right)
        if (!leftNode || !rightNode) return

        const operatorGroup = Object.entries(MIXABLE_GROUPS).find(([, ops]) =>
          ops.includes(operator),
        )?.[0]

        if (!operatorGroup) return

        if (leftNode.type === 'BinaryExpression') {
          const leftOp = (leftNode as { operator?: unknown }).operator
          if (typeof leftOp === 'string') {
            const leftGroup = Object.entries(MIXABLE_GROUPS).find(([, ops]) =>
              ops.includes(leftOp),
            )?.[0]
            if (leftGroup && leftGroup !== operatorGroup) {
              context.report({
                loc: extractLocation(n),
                message: 'Unexpected mix of different operators without parentheses.',
                node: n,
              })
            }
          }
        }

        if (rightNode.type === 'BinaryExpression') {
          const rightOp = (rightNode as { operator?: unknown }).operator
          if (typeof rightOp === 'string') {
            const rightGroup = Object.entries(MIXABLE_GROUPS).find(([, ops]) =>
              ops.includes(rightOp),
            )?.[0]
            if (rightGroup && rightGroup !== operatorGroup) {
              context.report({
                loc: extractLocation(n),
                message: 'Unexpected mix of different operators without parentheses.',
                node: n,
              })
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow mixing different operators without parentheses',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-mixed-operators',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMixedOperatorsRule
