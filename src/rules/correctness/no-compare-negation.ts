import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noCompareNegationRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        const operator = nn.operator

        if (
          operator !== '===' &&
          operator !== '!==' &&
          operator !== '==' &&
          operator !== '!='
        ) {
          return
        }

        const left = toASTNode(nn.left)
        if (!left || left.type !== 'UnaryExpression') return

        const leftNode = left as Record<string, unknown>
        if (leftNode.operator !== '!') return

        context.report({
          loc: extractLocation(left),
          message: `Unexpected negation in the left operand of "${operator as string}". Use "!(${(leftNode.argument as Record<string, unknown>)?.type ?? 'expression'} ${operator as string} right)" instead.`,
          node: left,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow negation in the left operand of a comparison operator',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/correctness/no-compare-negation.md',
    },
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noCompareNegationRule
