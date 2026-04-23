import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function hasNonoctalDecimalEscape(value: string): boolean {
  return /\\[89]/.test(value)
}

export const noNonoctalDecimalEscapeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!isLiteral(node)) return
        const n = node as Record<string, unknown>
        if (typeof n.value === 'string' && typeof n.raw === 'string' && hasNonoctalDecimalEscape(n.raw)) {
            context.report({
              loc: extractLocation(node),
              message: String.raw`Invalid escape sequence '\8' or '\9' in string literal.`,
            })
          }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: String.raw`Disallow \8 and \9 escape sequences in string literals.`,
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noNonoctalDecimalEscapeRule
