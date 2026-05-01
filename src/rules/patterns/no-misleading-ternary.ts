import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noMisleadingTernaryRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ExpressionStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ExpressionStatement') return

        const nn = n as Record<string, unknown>
        const expression = nn.expression
        if (!expression || typeof expression !== 'object') return

        const expr = expression as Record<string, unknown>
        if (expr.type !== 'ConditionalExpression') return

        context.report({
          loc: extractLocation(expr),
          message:
            'Do not use a ternary operator as a statement. Use an if/else statement instead.',
          node: expr,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow ternary operators used as statements instead of if/else.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-misleading-ternary.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noMisleadingTernaryRule
