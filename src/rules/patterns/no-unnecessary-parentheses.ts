import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryParenthesesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SequenceExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'SequenceExpression') return

        const nn = n as Record<string, unknown>
        const expressions = nn.expressions
        if (Array.isArray(expressions) && expressions.length === 1) {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary parentheses wrapping a single expression.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary parentheses around single expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-parentheses',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryParenthesesRule
