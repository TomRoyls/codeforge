import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getLiteralValue(n: ReturnType<typeof toASTNode>): boolean | null {
  if (!n) return null
  if (n.type === 'BooleanLiteral' || (n.type === 'Literal' && typeof n.value === 'boolean')) return n.value as boolean
  return null
}

export const noRedundantBooleanRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const op = n.operator
        if (op !== '===' && op !== '!==' && op !== '==' && op !== '!=') return

        const left = toASTNode(n.left)
        const right = toASTNode(n.right)

        const leftBool = getLiteralValue(left)
        const rightBool = getLiteralValue(right)

        if (rightBool !== null && leftBool === null) {
          const isNegated = op === '!==' || op === '!='

          if (rightBool === true) {
            context.report({
              loc: extractLocation(node),
              message: isNegated
                ? `Unexpected strict comparison to true. Use a negation operator (!) instead of ${op} true.`
                : `Unexpected comparison to true. Remove the ${op} true comparison and use the expression directly.`,
            })
          } else {
            context.report({
              loc: extractLocation(node),
              message: isNegated
                ? `Unexpected comparison to false. Use the expression directly instead of ${op} false.`
                : `Unexpected comparison to false. Use a negation operator (!) instead of ${op} false.`,
            })
          }

          return
        }

        if (leftBool !== null && rightBool === null) {
          const isNegated = op === '!==' || op === '!='

          if (leftBool === true) {
            context.report({
              loc: extractLocation(node),
              message: isNegated
                ? `Unexpected strict comparison. Use a negation operator (!) instead of true ${op}.`
                : `Unexpected comparison. Use the right-hand expression directly instead of true ${op}.`,
            })
          } else {
            context.report({
              loc: extractLocation(node),
              message: isNegated
                ? `Unexpected comparison. Use the right-hand expression directly instead of false ${op}.`
                : `Unexpected comparison. Use a negation operator (!) instead of false ${op}.`,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow redundant boolean comparisons (x === true, x === false). Use the expression directly or with negation.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-redundant-boolean',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noRedundantBooleanRule
