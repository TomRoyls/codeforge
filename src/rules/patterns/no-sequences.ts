import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noSequencesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      SequenceExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
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
