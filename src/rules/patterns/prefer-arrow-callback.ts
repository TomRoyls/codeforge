import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

export const preferArrowCallbackRule: RuleDefinition = {
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
            loc: location,
            message: 'Use arrow function for callback',
          })
        }
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
