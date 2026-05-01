import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const BOOLEAN_COMPARISON_OPS = new Set(['===', '==', '!==', '!='])

export const noUnnecessaryBooleanComparisonRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const operator = (n as { operator?: string }).operator
        if (!operator || !BOOLEAN_COMPARISON_OPS.has(operator)) return

        const left = (n as { left?: unknown }).left
        const right = (n as { right?: unknown }).right
        if (!left || !right) return

        const leftType = (left as { type?: string }).type
        const rightType = (right as { type?: string }).type

        const isBooleanLiteral = (t: string | undefined): boolean => {
          return t === 'BooleanLiteral'
        }

        if (isBooleanLiteral(leftType) || isBooleanLiteral(rightType)) {
          const booleanSide = isBooleanLiteral(leftType) ? left : right
          const booleanValue = (booleanSide as { value?: boolean }).value
          const isNegated = operator === '!==' || operator === '!='

          const suggestion = isNegated
            ? (booleanValue ? 'Use the negated variable directly' : 'Use double negation (!!variable) for clarity')
            : (booleanValue ? 'Use the variable directly (it is already a boolean)' : 'Use negation (!variable) for clarity')

          context.report({
            loc: extractLocation(n),
            message: `Unnecessary comparison with boolean literal. ${suggestion}.`,
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary comparisons with boolean literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-boolean-comparison',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryBooleanComparisonRule
