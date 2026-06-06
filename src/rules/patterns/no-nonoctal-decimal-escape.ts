import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasNonoctalDecimalEscape(value: string): boolean {
  return /\\[89]/.test(value)
}

export const noNonoctalDecimalEscapeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return
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
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-nonoctal-decimal-escape.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noNonoctalDecimalEscapeRule
