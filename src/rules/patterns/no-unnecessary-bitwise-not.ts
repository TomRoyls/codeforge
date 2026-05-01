import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryBitwiseNotRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'UnaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== '~') return

        const argument = nn.argument
        if (!argument || typeof argument !== 'object') return

        const inner = toASTNode(argument)
        if (!inner) return

        const i = inner as Record<string, unknown>
        if (i.type === 'UnaryExpression' && i.operator === '~') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary double bitwise NOT (~~). Use Math.trunc() for integer truncation.',
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
        'Disallow unnecessary double bitwise NOT (~~) for integer truncation.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-bitwise-not.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryBitwiseNotRule
