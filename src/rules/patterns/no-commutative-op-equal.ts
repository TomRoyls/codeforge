import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const COMMUTATIVE_OPS = new Set(['+', '*', '==', '===', '!=', '!==', '&', '|', '^'])

export const noCommutativeOpEqualRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const op = (n as { operator?: string }).operator
        if (!op || !COMMUTATIVE_OPS.has(op)) return

        const left = toASTNode(n.left)
        const right = toASTNode(n.right)
        if (!left || !right) return

        if (left.type !== 'Literal' || right.type !== 'Literal') return

        const leftVal = (left as { value?: unknown }).value
        const rightVal = (right as { value?: unknown }).value

        if (leftVal === rightVal && typeof leftVal !== 'undefined') {
          context.report({
            loc: extractLocation(node),
            message: `Both sides of the "${op}" expression are identical ("${String(leftVal)}"). This is likely a mistake.`,
            node,
          })
          return
        }

        if (
          typeof leftVal === 'string' &&
          typeof rightVal === 'string' &&
          leftVal.length > 1 &&
          rightVal.length > 1
        ) {
          const sortedLeft = leftVal.split('').sort().join('')
          const sortedRight = rightVal.split('').sort().join('')
          if (sortedLeft === sortedRight) {
            context.report({
              loc: extractLocation(node),
              message: `Possible typo: "${leftVal}" and "${rightVal}" are anagrams in a commutative "${op}" expression.`,
              node,
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
        'Detect suspicious identical operands in commutative operations',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-commutative-op-equal',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noCommutativeOpEqualRule
