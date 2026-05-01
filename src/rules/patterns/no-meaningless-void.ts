/**
 * @module rules/patterns/no-meaningless-void
 * Disallows void operators that do not produce useful behavior.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noMeaninglessVoidRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'UnaryExpression') return

        if ((n as { operator?: string }).operator !== 'void') return

        const parent = (n as { _parent?: unknown })._parent
        if (!parent) return

        const parentNode = toASTNode(parent)
        if (!parentNode) return

        if (
          parentNode.type === 'ExpressionStatement' ||
          parentNode.type === 'SequenceExpression'
        ) {
          return
        }

        context.report({
          loc: extractLocation(n),
          message: "Unexpected 'void' operator. This void expression serves no purpose in this context.",
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow void operators that do not produce useful behavior',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-meaningless-void',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMeaninglessVoidRule
