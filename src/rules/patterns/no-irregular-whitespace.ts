import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'
const IRREGULAR_WHITESPACE = /[\u000B\u000C\u00A0\u0085\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF]/
function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}
function isTemplateLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'TemplateLiteral'
}
export const noIrregularWhitespaceRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow irregular whitespace characters.',
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
        if (typeof n.value !== 'string') return
        if (IRREGULAR_WHITESPACE.test(n.value as string)) {
          context.report({
            message: 'Irregular whitespace found.',
            loc: extractLocation(node),
          })
        }
      },
      TemplateLiteral(node: unknown): void {
        if (!isTemplateLiteral(node)) return
        const n = node as Record<string, unknown>
        const quasis = n.quasis as unknown[] | undefined
        if (!quasis) return
        for (const quasi of quasis) {
          const q = quasi as Record<string, unknown>
          const value = q.value as Record<string, unknown> | undefined
          if (!value) continue
          const raw = value.raw as string | undefined
          if (raw && IRREGULAR_WHITESPACE.test(raw)) {
            context.report({
              message: 'Irregular whitespace found.',
              loc: extractLocation(quasi),
            })
          }
        }
      },
    }
  },
}
export default noIrregularWhitespaceRule
