import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const NEGATABLE_OPERATORS = new Set([
  '===',
  '!==',
  '==',
  '!=',
  '<',
  '>',
  '<=',
  '>=',
])

export const noNegatedConditionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'UnaryExpression') return

        if ((n as { operator?: string }).operator !== '!') return

        const argument = toASTNode((n as { argument?: unknown }).argument)
        if (!argument) return

        if (argument.type !== 'BinaryExpression') return

        const op = (argument as { operator?: string }).operator
        if (!op || !NEGATABLE_OPERATORS.has(op)) return

        context.report({
          loc: extractLocation(n),
          message: `Unexpected negated comparison. Use the opposite operator instead of negating \`${op}\`.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow negated comparison operators where the opposite operator exists',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-negated-condition',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noNegatedConditionRule
