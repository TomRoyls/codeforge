import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnnecessaryNullishCoalescingRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'BinaryExpression') return

        const nn = n as Record<string, unknown>
        if (nn.operator !== '??') return

        const right = nn.right
        if (!right || typeof right !== 'object') return

        const rightNode = toASTNode(right)
        if (!rightNode) return

        const r = rightNode as Record<string, unknown>
        if (r.type === 'Identifier' && (r.name === 'null' || r.name === 'undefined')) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary nullish coalescing with null or undefined. The right side of ?? should be a meaningful fallback value.',
            node: n,
          })
        } else if (r.type === 'NullLiteral') {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary nullish coalescing with null. The right side of ?? should be a meaningful fallback value.',
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
        'Disallow unnecessary nullish coalescing with null or undefined as fallback.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-nullish-coalescing.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNullishCoalescingRule
