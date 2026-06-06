import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isBinaryExpression, toASTNode } from '../../utils/ast-helpers.js'

const RELATIONAL_OPERATORS = new Set(['in', 'instanceof'])

export const noUnsafeNegationRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'UnaryExpression' || n.operator !== '!') return
        if (isBinaryExpression(n.argument)) {
          const arg = toASTNode(n.argument)
          if (arg?.operator && RELATIONAL_OPERATORS.has(arg.operator)) {
            context.report({
              loc: extractLocation(node),
              message: `Unexpected negating the left operand of '${arg.operator}' operator.`,
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow negating the left operand of relational operators.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-unsafe-negation.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnsafeNegationRule
