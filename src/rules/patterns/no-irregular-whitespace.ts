import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

/* eslint-disable no-control-regex */
const IRREGULAR_WHITESPACE =
  /[\u000B\u000C\u00A0\u0085\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF]/
/* eslint-enable no-control-regex */

export const noIrregularWhitespaceRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return
        if (typeof n.value !== 'string') return
        if (IRREGULAR_WHITESPACE.test(n.value as string)) {
          context.report({
            loc: extractLocation(node),
            message: 'Irregular whitespace found.',
          })
        }
      },
      TemplateLiteral(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'TemplateLiteral') return
        const {quasis} = n
        if (!quasis) return
        for (const quasi of quasis) {
          const q = toASTNode(quasi)
          if (!q) continue
          const value = toASTNode(q.value)
          if (!value) continue
          const {raw} = value
          if (raw && IRREGULAR_WHITESPACE.test(raw)) {
            context.report({
              loc: extractLocation(quasi),
              message: 'Irregular whitespace found.',
            })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow irregular whitespace characters.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-irregular-whitespace.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noIrregularWhitespaceRule
