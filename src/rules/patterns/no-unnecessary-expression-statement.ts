import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryExpressionStatementRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExpressionStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ExpressionStatement') return

        const nn = n as Record<string, unknown>
        const expression = nn.expression
        if (!expression || typeof expression !== 'object') return

        const exprNode = toASTNode(expression)
        if (!exprNode) return

        const e = exprNode as Record<string, unknown>

        if (e.type === 'Literal' && typeof e.value === 'string') {
          context.report({
            loc: extractLocation(exprNode),
            message:
              'Unnecessary string literal as statement. This is likely a mistake or missing assignment.',
            node: exprNode,
          })
        } else if (e.type === 'Literal' && typeof e.value === 'number') {
          context.report({
            loc: extractLocation(exprNode),
            message:
              'Unnecessary numeric literal as statement. This is likely a mistake or missing assignment.',
            node: exprNode,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary expression statements with literal values.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-expression-statement.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryExpressionStatementRule
