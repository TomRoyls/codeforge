import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const preferArrowCallbackRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      FunctionExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'FunctionExpression') return

        const location = extractLocation(node)
        context.report({
          loc: location,
          message: 'Use arrow function for callback',
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Prefer arrow functions over regular function expressions for callbacks',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-arrow-callback',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferArrowCallbackRule
