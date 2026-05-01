import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryTernaryRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ConditionalExpression') return

        const consequent = toASTNode((n as { consequent?: unknown }).consequent)
        const alternate = toASTNode((n as { alternate?: unknown }).alternate)
        if (!consequent || !alternate) return

        if (consequent.type !== 'Literal' || alternate.type !== 'Literal') return

        const cVal = (consequent as { value?: unknown }).value
        const aVal = (alternate as { value?: unknown }).value

        if (typeof cVal === 'boolean' && typeof aVal === 'boolean') {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary use of boolean literals in ternary. Simplify to a direct boolean expression or logical operator.',
            node: n,
          })
          return
        }

        if (consequent.type === 'Literal' && alternate.type === 'Literal') {
          if (cVal === null && aVal === null) {
            context.report({
              loc: extractLocation(n),
              message: 'Unnecessary ternary with identical null branches. Both branches evaluate to null.',
              node: n,
            })
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary ternary expressions with literal branches',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-ternary',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTernaryRule
