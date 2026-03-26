import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

export const noSequencesRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow the use of the comma operator. Sequence expressions using the comma operator can be confusing and lead to subtle bugs.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-sequences',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      SequenceExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const expressions = n.expressions as unknown[] | undefined

        if (expressions && expressions.length > 1) {
          const location = extractLocation(node)
          context.report({
            message: 'Unexpected use of the comma operator in sequence expressions.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noSequencesRule
