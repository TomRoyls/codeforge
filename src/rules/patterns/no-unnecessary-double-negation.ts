import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryDoubleNegationRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'UnaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== '!') return

        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const arg = argument as Record<string, unknown>
        if (arg.type === 'UnaryExpression' && arg.operator === '!') {
          context.report({
            loc: extractLocation(n),
            message: 'Unnecessary double negation (!!). Use Boolean() or explicit cast.',
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary double negation (!!x)',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-double-negation',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryDoubleNegationRule
