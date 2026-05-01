import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noDoubleNegationRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'IfStatement') return

        const test = toASTNode((n as { test?: unknown }).test)
        if (!test) return

        if (test.type === 'UnaryExpression') {
          const op = (test as { operator?: string }).operator
          if (op === '!') {
            const inner = toASTNode(test.argument)
            if (inner && inner.type === 'UnaryExpression') {
              const innerOp = (inner as { operator?: string }).operator
              if (innerOp === '!') {
                context.report({
                  loc: extractLocation(test),
                  message:
                    'Redundant double negation in if condition. `if (!!x)` is equivalent to `if (x)`. Remove the !! for clarity.',
                  node: test,
                })
              }
            }
          }
        }
      },

      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ConditionalExpression') return

        const test = toASTNode((n as { test?: unknown }).test)
        if (!test) return

        if (test.type === 'UnaryExpression') {
          const op = (test as { operator?: string }).operator
          if (op === '!') {
            const inner = toASTNode(test.argument)
            if (inner && inner.type === 'UnaryExpression') {
              const innerOp = (inner as { operator?: string }).operator
              if (innerOp === '!') {
                context.report({
                  loc: extractLocation(test),
                  message:
                    'Redundant double negation in ternary condition. `!!x ? a : b` is equivalent to `x ? a : b`. Remove the !! for clarity.',
                  node: test,
                })
              }
            }
          }
        }
      },

      WhileStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'WhileStatement') return

        const test = toASTNode((n as { test?: unknown }).test)
        if (!test) return

        if (test.type === 'UnaryExpression') {
          const op = (test as { operator?: string }).operator
          if (op === '!') {
            const inner = toASTNode(test.argument)
            if (inner && inner.type === 'UnaryExpression') {
              const innerOp = (inner as { operator?: string }).operator
              if (innerOp === '!') {
                context.report({
                  loc: extractLocation(test),
                  message:
                    'Redundant double negation in while condition. `while (!!x)` is equivalent to `while (x)`. Remove the !! for clarity.',
                  node: test,
                })
              }
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow redundant double negation (!!) in boolean contexts',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-double-negation',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noDoubleNegationRule
