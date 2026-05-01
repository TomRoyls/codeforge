import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryVoidRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'UnaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== 'void') return

        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const arg = argument as Record<string, unknown>
        if (arg.type === 'Literal' && arg.value === undefined) {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary void undefined. Use undefined directly.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary void undefined expressions',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-void',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryVoidRule
