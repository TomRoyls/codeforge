import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noSelfCompareRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const op = (n as { operator?: string }).operator
        if (op !== '===' && op !== '!==' && op !== '==' && op !== '!=') return

        const left = toASTNode((n as { left?: unknown }).left)
        const right = toASTNode((n as { right?: unknown }).right)
        if (!left || !right) return

        if (left.type !== 'Identifier' || right.type !== 'Identifier') return

        const leftName = (left as { name?: string }).name
        const rightName = (right as { name?: string }).name

        if (leftName !== undefined && rightName !== undefined && leftName === rightName) {
          context.report({
            loc: extractLocation(n),
            message: `Unexpected comparison of \`${leftName}\` to itself. This always evaluates to \`${op === '!==' || op === '!=' ? 'false' : 'true'}\`.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow comparisons where both sides are the same variable',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-self-compare',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noSelfCompareRule
