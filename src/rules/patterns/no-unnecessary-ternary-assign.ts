import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryTernaryAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ConditionalExpression') return

        const nn = n as Record<string, unknown>
        const consequent = nn.consequent
        const alternate = nn.alternate

        if (
          consequent &&
          typeof consequent === 'object' &&
          alternate &&
          typeof alternate === 'object'
        ) {
          const c = consequent as Record<string, unknown>
          const a = alternate as Record<string, unknown>

          if (
            c.type === 'Literal' &&
            c.value === true &&
            a.type === 'Literal' &&
            a.value === false
          ) {
            context.report({
              loc: extractLocation(n),
              message: 'Unnecessary ternary: condition ? true : false can be simplified to the condition itself.',
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
      description: 'Disallow unnecessary ternary expressions with boolean literals',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-ternary-assign',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTernaryAssignRule
