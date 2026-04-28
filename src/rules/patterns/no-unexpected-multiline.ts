import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnexpectedMultilineRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return
        if ((n.operator === '+' || n.operator === '-') && (toASTNode(n.left)?.type === 'TemplateLiteral' || toASTNode(n.right)?.type === 'TemplateLiteral')) {
            context.report({
              loc: extractLocation(node),
              message: 'Unexpected multiline expression.',
            })
          }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow confusing multiline expressions.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnexpectedMultilineRule
