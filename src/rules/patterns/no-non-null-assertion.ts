import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getNodeSource, getRange } from '../../utils/ast-helpers.js'

function hasNonNullAssertion(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type === 'TSNonNullExpression') {
    return true
  }

  return false
}

export const noNonNullAssertionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSNonNullExpression(node: unknown): void {
        if (!hasNonNullAssertion(node)) {
          return
        }

        const location = extractLocation(node)
        const n = node as Record<string, unknown>
        const {expression} = n
        const range = getRange(node)
        const expressionSource = expression ? getNodeSource(context, expression) : ''

        context.report({
          fix:
            range && expressionSource
              ? {
                  range,
                  text: expressionSource,
                }
              : undefined,
          loc: location,
          message: "Unexpected use of non-null assertion operator '!'.",
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow the use of non-null assertion operator (!). Using this operator can lead to runtime errors if the value is actually null or undefined.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-non-null-assertion',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noNonNullAssertionRule
