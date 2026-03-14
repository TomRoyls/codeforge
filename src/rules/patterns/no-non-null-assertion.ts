import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange, getNodeSource } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow the use of non-null assertion operator (!). Using this operator can lead to runtime errors if the value is actually null or undefined.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-non-null-assertion',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      TSNonNullExpression(node: unknown): void {
        if (!hasNonNullAssertion(node)) {
          return
        }

        const location = extractLocation(node)
        const n = node as Record<string, unknown>
        const expression = n.expression
        const range = getRange(node)
        const expressionSource = expression ? getNodeSource(context, expression) : ''

        context.report({
          message: "Unexpected use of non-null assertion operator '!'.",
          loc: location,
          fix:
            range && expressionSource
              ? {
                  range,
                  text: expressionSource,
                }
              : undefined,
        })
      },
    }
  },
}

export default noNonNullAssertionRule
