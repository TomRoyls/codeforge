import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function hasNonoctalDecimalEscape(value: string): boolean {
  return /\\[89]/.test(value)
}

export const noNonoctalDecimalEscapeRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow \\8 and \\9 escape sequences in string literals.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!isLiteral(node)) return
        const n = node as Record<string, unknown>
        if (typeof n.value === 'string' && typeof n.raw === 'string') {
          if (hasNonoctalDecimalEscape(n.raw)) {
            context.report({
              message: "Invalid escape sequence '\\8' or '\\9' in string literal.",
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noNonoctalDecimalEscapeRule
