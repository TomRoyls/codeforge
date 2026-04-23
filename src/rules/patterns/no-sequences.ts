import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

export const noSequencesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SequenceExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const expressions = n.expressions as undefined | unknown[]

        if (expressions && expressions.length > 1) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: 'Unexpected use of the comma operator in sequence expressions.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow the use of the comma operator. Sequence expressions using the comma operator can be confusing and lead to subtle bugs.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-sequences',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noSequencesRule
