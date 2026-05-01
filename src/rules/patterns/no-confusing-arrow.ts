import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noConfusingArrowRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'VariableDeclarator') return

        const init = toASTNode((n as { init?: unknown }).init)
        if (!init || init.type !== 'ArrowFunctionExpression') return

        const body = toASTNode((init as { body?: unknown }).body)
        if (!body) return

        if (body.type === 'ConditionalExpression') {
          context.report({
            loc: extractLocation(node),
            message:
              'Avoid arrow functions that immediately return a conditional expression. Use a regular function with an if/else for clarity, or wrap the conditional in parens.',
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow confusing arrow functions that directly return conditional expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-confusing-arrow',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noConfusingArrowRule
