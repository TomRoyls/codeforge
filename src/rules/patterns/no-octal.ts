import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function isOctalLiteral(raw: string): boolean {
  return /^0[0-7]+$/.test(raw)
}

export const noOctalRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!isLiteral(node)) return
        const n = node as Record<string, unknown>
        if (typeof n.value === 'number' && typeof n.raw === 'string' && isOctalLiteral(n.raw)) {
            context.report({
              loc: extractLocation(node),
              message: 'Octal literals should not be used.',
            })
          }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow octal literals.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noOctalRule
