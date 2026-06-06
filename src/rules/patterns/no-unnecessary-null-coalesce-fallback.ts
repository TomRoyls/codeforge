import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function getLiteralValue(node: Record<string, unknown>): unknown {
  const t = node.type as string
  if (t === 'BooleanLiteral') return node.value
  if (t === 'NullLiteral') return null
  if (t === 'Literal') return node.value
  return undefined
}

export const noUnnecessaryNullCoalesceFallbackRule: RuleDefinition = {
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
        const val = getLiteralValue(r)

        if (val === '' || val === 0 || val === false || val === null) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary nullish coalescing fallback. Using a falsy value like empty string, 0, false, or null defeats the purpose of ?? (which only coalesces null/undefined).',
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
        'Disallow nullish coalescing with falsy literal fallbacks that defeat the purpose of ??.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-null-coalesce-fallback.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNullCoalesceFallbackRule
