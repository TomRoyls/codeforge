import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function isOctalLiteral(raw: string): boolean {
  return /^0[0-7]+$/.test(raw)
}

export const noOctalRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow octal literals.',
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
        if (typeof n.value === 'number' && typeof n.raw === 'string') {
          if (isOctalLiteral(n.raw)) {
            context.report({
              message: 'Octal literals should not be used.',
              loc: extractLocation(node),
            })
          }
        }
      },
    }
  },
}
export default noOctalRule
