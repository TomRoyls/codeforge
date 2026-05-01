/**
 * @module rules/patterns/no-multi-assign
 * Disallows multiple assignment chains like a = b = c.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noMultiAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'AssignmentExpression') return

        const right = (n as { right?: unknown }).right
        if (!right || typeof right !== 'object') return

        const rightNode = right as Record<string, unknown>
        if (rightNode.type !== 'AssignmentExpression') return

        context.report({
          loc: extractLocation(n),
          message: 'Unexpected chained assignment. Split into separate statements.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow multiple assignment chains',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-multi-assign',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMultiAssignRule
