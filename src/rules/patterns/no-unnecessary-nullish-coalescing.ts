import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

// ESTree encodes null as `{ type: 'Literal', value: null }`; Babel/Flow use `{ type: 'NullLiteral' }`.
// Both must be accepted so the rule is parser-agnostic.
function isNullValue(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type === 'NullLiteral') return true
  if (n.type === 'Literal' && (n as Record<string, unknown>).value === null) return true
  if (n.type === 'Identifier' && (n as Record<string, unknown>).name === 'null') return true
  return false
}

// ESTree has no undefined literal — `undefined` parses as Identifier{name:'undefined'}.
// Babel occasionally emits `UndefinedLiteral`; accept both.
function isUndefinedValue(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type === 'UndefinedLiteral') return true
  if (n.type === 'Identifier' && (n as Record<string, unknown>).name === 'undefined') return true
  return false
}

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

        if (isNullValue(right)) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary nullish coalescing with null or undefined: the right-hand side of `??` is always swallowed. Use a meaningful fallback value or remove the `??`.',
            node: n,
          })
          return
        }

        if (isUndefinedValue(right)) {
          context.report({
            loc: extractLocation(n),
            message:
              'Unnecessary nullish coalescing with null or undefined: the right-hand side of `??` is always swallowed. Use a meaningful fallback value or remove the `??`.',
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
        'Disallow unnecessary nullish coalescing where the right-hand side is `null` or `undefined`. `x ?? null` collapses to `x` because `??` already short-circuits on null/undefined, making the fallback useless.',
      recommended: false,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-nullish-coalescing.md',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryNullishCoalescingRule
