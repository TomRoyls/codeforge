import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isOctalLiteral(raw: string): boolean {
  return /^0[0-7]+$/.test(raw)
}

export const noOctalRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return
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
