import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

export const preferArrowCallbackRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Prefer arrow functions over regular function expressions for callbacks',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-arrow-callback',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      FunctionExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>

        if (n.type === 'FunctionExpression') {
          const location = extractLocation(node)
          context.report({
            message: 'Use arrow function for callback',
            loc: location,
          })
        }
      },
    }
  },
}

export default preferArrowCallbackRule
