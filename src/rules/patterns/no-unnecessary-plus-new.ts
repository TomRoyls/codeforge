import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryPlusNewRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'UnaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== '+') return

        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const arg = toASTNode(argument)
        if (!arg) return

        const a = arg as Record<string, unknown>
        if (a.type === 'Literal' && typeof a.value === 'number') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary unary plus on a number literal.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary unary plus on number literals.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-plus-new.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryPlusNewRule
