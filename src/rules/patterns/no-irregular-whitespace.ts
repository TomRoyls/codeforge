import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
/* eslint-disable no-control-regex */
const IRREGULAR_WHITESPACE =
  /[\u000B\u000C\u00A0\u0085\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF]/
/* eslint-enable no-control-regex */
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
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!isLiteral(node)) return
        const n = node as Record<string, unknown>
        if (typeof n.value !== 'string') return
        if (IRREGULAR_WHITESPACE.test(n.value as string)) {
          context.report({
            loc: extractLocation(node),
            message: 'Irregular whitespace found.',
          })
        }
      },
      TemplateLiteral(node: unknown): void {
        if (!isTemplateLiteral(node)) return
        const n = node as Record<string, unknown>
        const quasis = n.quasis as undefined | unknown[]
        if (!quasis) return
        for (const quasi of quasis) {
          const q = quasi as Record<string, unknown>
          const value = q.value as Record<string, unknown> | undefined
          if (!value) continue
          const raw = value.raw as string | undefined
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
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noIrregularWhitespaceRule
